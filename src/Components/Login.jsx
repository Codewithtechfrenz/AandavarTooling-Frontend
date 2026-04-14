import React, { useState, useEffect } from "react";
import logo from "../Assets/AandavarLogo1.png";
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

    const validUsername = "AANDAVAR";
    const validPassword = "SATPRABU@2350";

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
            alt="Shree Aandavar Tooling"
            className="login-left-img"
          />
        </div>

        <div className="login-right">
          <div className="login-card">
            <div className="login-logo">
              <img
                src={logo}
                alt="Shree Aandavar Tooling"
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

// export default LoginPage;


// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const LoginPage = () => {
//   const navigate = useNavigate();

//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");

//   useEffect(() => {
//     const isAuth = localStorage.getItem("isAuthenticated");
//     if (isAuth === "true") {
//       navigate("/dashboard");
//     }
//   }, [navigate]);

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     try {
//       const res = await axios.post("/auth/login", {
//         username,
//         password
//       });

//       if (res.data.status === 1) {
//         localStorage.setItem("isAuthenticated", "true");
//         localStorage.setItem("username", username);
//         navigate("/dashboard");
//       } else {
//         alert(res.data.message);
//       }
//     } catch {
//       alert("Server error");
//     }
//   };

//   return (
//     <form onSubmit={handleLogin}>
//       <h2>Login</h2>

//       <input
//         type="text"
//         placeholder="Username"
//         onChange={(e) => setUsername(e.target.value)}
//         required
//       /><br /><br />

//       <input
//         type="password"
//         placeholder="Password"
//         onChange={(e) => setPassword(e.target.value)}
//         required
//       /><br /><br />

//       <button type="submit">Login</button>

//       <br /><br />

//       <button type="button" onClick={() => navigate("/change-password")}>
//         Change Password
//       </button>
//     </form>
//   );
// };

// export default LoginPage;