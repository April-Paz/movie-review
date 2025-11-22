import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
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
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Registration failed');
      const result = await response.json();

      login(result.data);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{display: "flex", flexDirection: "column", maxWidth: "400px", margin: "0 auto", padding: "20px"}}>
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column"}}>
        
        <div>Username</div>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          disabled={loading}
          required
          style={{marginBottom: "15px"}}
        />

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

        {error && <div style={{marginBottom: "15px"}}>Error: {error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Register"}
        </button>
      </form>

      <p style={{marginTop: "15px", textAlign: "center"}}>
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
};

export default Register;