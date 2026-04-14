import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/Login.css"; // reuse your existing login CSS

function ChangePassword() {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("authUser"));

    if (!user) {
      alert("User not found");
      return;
    }

    if (oldPassword !== user.password) {
      alert("Old password is incorrect");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // ✅ UPDATE PASSWORD (IMPORTANT PART)
    localStorage.setItem(
      "authUser",
      JSON.stringify({
        ...user,
        password: newPassword,
      })
    );

    alert("Password changed successfully");

    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <div className="login-wrap">
        <div className="login-right">
          <div className="login-card">

            <h2>Change Password</h2>

            <form onSubmit={handleChangePassword}>
              <input
                type="password"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />

              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <button type="submit">Update Password</button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;