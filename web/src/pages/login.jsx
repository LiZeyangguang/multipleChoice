import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { AuthContext } from "../contexts/AuthProvider"; 

export default function Login() {
  const nav = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await api.login({ email: form.email, password: form.password });
      setUser(user);   
      console.log('Login success, navigating to /home');
      nav('/home');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto" }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          style={{ width: "100%", padding: 8, marginBottom: 12 }}
        />
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={onChange}
          style={{ width: "100%", padding: 8, marginBottom: 12 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 10, cursor: loading ? 'default' : 'pointer' }}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      </form>

      {/* Add Sign Up Button */}
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <p>Don't have an account?</p>
        <button
          onClick={() => nav('/signUp')}
          style={{
            padding: '10px 20px',
            fontSize: 16,
            cursor: 'pointer',
            borderRadius: 6,
            border: 'none',
            backgroundColor: '#2196F3',
            color: 'white',
          }}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
