import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function onSubmit(e) {
    e.preventDefault();
    // TODO: call /api/auth/register 
    alert(`Sign-up submitted for ${form.email} (placeholder)`);
    nav("/login"); 
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto" }}>
      <h2>Create account</h2>
      <form onSubmit={onSubmit}>
        <label>Name</label>
        <input name="name" value={form.name} onChange={onChange} style={{ width: "100%", padding: 8, marginBottom: 12 }} />
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={onChange} style={{ width: "100%", padding: 8, marginBottom: 12 }} />
        <label>Password</label>
        <input type="password" name="password" value={form.password} onChange={onChange} style={{ width: "100%", padding: 8, marginBottom: 12 }} />
        <button type="submit" style={{ width: "100%", padding: 10, cursor: "pointer" }}>
          Sign Up
        </button>
      </form>
    </div>
  );
}
