import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/Login.css";

const LoginPage = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Auto redirect if already logged in
  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    if (isAuth === "true") {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = (event) => {
    event.preventDefault();

    const validUsername = "admin";
    const validPassword = "admin@123";

    if (!username.trim() || !password.trim()) {
      alert("Please enter Username and Password");
      return;
    }

    if (username === validUsername && password === validPassword) {
      localStorage.setItem("isAuthenticated", "true"); // ✅ Store session
      navigate("/dashboard");
    } else {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrap">
        <div className="login-left">
          <img
            src="/Murugan.jpg"
            alt="Shri Aandavar"
            className="login-left-img"
          />
        </div>

        <div className="login-right">
          <div className="login-card">
            <div className="login-logo">
              <img
                src="/AandavarLogo1.png"
                alt="Shri Aandavar"
                className="login-brand-logo"
              />
            </div>
            
            <div className="login-sub">ERP Management System</div>

            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary login-btn">
                Login
              </button>

              <div className="forgot-row">
                <button
                  type="button"
                  className="forgot-link"
                  aria-label="Forgot username or password"
                  onClick={() =>
                    alert(
                      "Please contact administrator to reset credentials"
                    )
                  }
                >
                  Forgot username or password?
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;