import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function SignUp() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // backend user creation endpoint is POST /api/user/
      await api.createUser({ email: form.email, password: form.password });   // THIS CREATES USER BY CALLING ON THE API
      nav("/login");
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
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
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 10, cursor: loading ? 'default' : 'pointer' }}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      </form>
    </div>
  );
}
