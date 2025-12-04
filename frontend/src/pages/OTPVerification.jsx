import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const OTPVerification = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from location state or localStorage
    const storedEmail = location.state?.email || localStorage.getItem('pendingEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      navigate('/login');
    }

    // Start 60-second countdown for resend
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [location, navigate]);

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/verify-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          otp: otpValue
        })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'OTP verification failed');

      login(result.data);
      localStorage.removeItem('pendingEmail');
      navigate("/");
    } catch (err) {
      setError(err.message);
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      // Focus first input
      const firstInput = document.getElementById('otp-0');
      if (firstInput) firstInput.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to resend OTP');

      //Restart countdown
      setCountdown(30);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{display: "flex", flexDirection: "column", maxWidth: "400px", margin: "0 auto", padding: "20px"}}>
      <h2>Verify Your Email</h2>
      <p>We've sent a 6-digit code to {email}</p>
      
      <form onSubmit={handleVerifyOTP} style={{display: "flex", flexDirection: "column"}}>
        <div style={{display: "flex", justifyContent: "space-between", marginBottom: "20px"}}>
          {otp.map((data, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={data}
              onChange={e => handleOtpChange(e.target, index)}
              onKeyDown={e => handleKeyDown(e, index)}
              onFocus={e => e.target.select()}
              disabled={loading}
              style={{
                width: "40px",
                height: "40px",
                textAlign: "center",
                fontSize: "18px",
                border: "1px solid #ccc",
                borderRadius: "4px"
              }}
            />
          ))}
        </div>

        {error && <div style={{marginBottom: "15px", color: "red"}}>Error: {error}</div>}

        <button 
          type="submit" 
          disabled={loading || otp.join('').length !== 6}
          style={{marginBottom: "15px", padding: "10px"}}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      <div style={{textAlign: "center"}}>
        <p>Didn't receive the code?</p>
        <button 
          onClick={handleResendOTP} 
          disabled={countdown > 0 || loading}
          style={{
            background: "none",
            border: "none",
            color: countdown > 0 ? "#999" : "#007bff",
            cursor: countdown > 0 ? "not-allowed" : "pointer",
            textDecoration: "underline"
          }}
        >
          {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
        </button>
      </div>

      <button 
        onClick={() => navigate('/login')}
        style={{
          marginTop: "15px",
          background: "none",
          border: "none",
          color: "#666",
          cursor: "pointer",
          textDecoration: "underline"
        }}
      >
        Back to Login
      </button>
    </div>
  );
};

export default OTPVerification;