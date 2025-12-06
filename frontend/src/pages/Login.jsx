import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    console.log("Sending login request to:", `${API_URL}/api/login`);
    const response = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    console.log("Response status:", response.status);
    const result = await response.json();
    console.log("Response data:", result);

    if (!response.ok) {
      console.error("Login failed:", result);
      throw new Error(result.error || 'Login failed');
    }

    // Store email for OTP verification and navigate to OTP page
    localStorage.setItem('pendingEmail', formData.email);
    navigate('/verify-otp', { state: { email: formData.email } });
  } catch (err) {
    console.error("Login error details:", err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
//
  return (
    <div style={{display: "flex", flexDirection: "column", maxWidth: "400px", margin: "0 auto", padding: "20px"}}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column"}}>
        
        <div>Email</div>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
          required
          style={{marginBottom: "15px"}}
        />

        <div>Password</div>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
          required
          style={{marginBottom: "15px"}}
        />

        {error && <div style={{marginBottom: "15px", color: "red"}}>Error: {error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Sending OTP..." : "Login"}
        </button>
      </form>

      <p style={{marginTop: "15px", textAlign: "center"}}>
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
};

export default Login;