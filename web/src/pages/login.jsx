import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function onSubmit(e) {
    e.preventDefault();
    // TODO: call /api/auth/login later
    alert(`Login submitted for ${form.email} (placeholder)`);
    nav("/home"); 
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto" }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={onChange} style={{ width: "100%", padding: 8, marginBottom: 12 }} />
        <label>Password</label>
        <input type="password" name="password" value={form.password} onChange={onChange} style={{ width: "100%", padding: 8, marginBottom: 12 }} />
        <button type="submit" style={{ width: "100%", padding: 10, cursor: "pointer" }}>
          Log In
        </button>
      </form>
    </div>
  );
}
