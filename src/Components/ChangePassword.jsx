// import React, { useState } from "react";
// import axios from "axios";

// const ChangePassword = () => {
//   const [form, setForm] = useState({
//     username: localStorage.getItem("username") || "",
//     old_password: "",
//     new_password: ""
//   });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const res = await axios.post(
//         "/auth/change-password",
//         form
//       );

//       if (res.data.status === 1) {
//         alert("Password updated successfully");
//       } else {
//         alert(res.data.message);
//       }
//     } catch {
//       alert("Error");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h2>Change Password</h2>

//       <input
//         type="text"
//         name="username"
//         value={form.username}
//         readOnly
//       /><br /><br />

//       <input
//         type="password"
//         name="old_password"
//         placeholder="Old Password"
//         onChange={handleChange}
//         required
//       /><br /><br />

//       <input
//         type="password"
//         name="new_password"
//         placeholder="New Password"
//         onChange={handleChange}
//         required
//       /><br /><br />

//       <button type="submit">Update Password</button>
//     </form>
//   );
// };

// export default ChangePassword;