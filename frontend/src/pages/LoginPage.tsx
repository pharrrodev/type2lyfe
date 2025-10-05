import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login({ email, password });
      localStorage.setItem('token', response.data.token);
      // Force a page reload to trigger authentication check
      window.location.href = '/';
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background dark:bg-slate-900 px-4">
      <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-md space-y-4 bg-card dark:bg-slate-800 p-8 rounded-2xl shadow-card">
        <h2 className="text-3xl font-bold text-text-primary dark:text-slate-100 text-center mb-2">Login</h2>
        {error && <p className="text-danger dark:text-red-400 text-center text-sm">{error}</p>}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-background dark:bg-slate-700 text-text-primary dark:text-slate-100 rounded-lg border-2 border-border dark:border-slate-600 shadow-sm focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 p-3"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-text-primary dark:text-slate-100 mb-2">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-background dark:bg-slate-700 text-text-primary dark:text-slate-100 rounded-lg border-2 border-border dark:border-slate-600 shadow-sm focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary focus:ring-opacity-10 transition-all duration-300 p-3"
            required
          />
        </div>
        <button type="submit" className="w-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold py-3 rounded-lg hover:shadow-fab transition-all duration-300 mt-4">
          Login
        </button>
        <p className="text-text-secondary dark:text-slate-400 text-center mt-4">
          Don't have an account? <a href="/register" className="text-primary dark:text-primary-light font-semibold hover:underline">Register</a>
        </p>
        <div className="text-center mt-6 text-xs text-text-secondary dark:text-slate-500">
          <p>By logging in, you agree to our</p>
          <div className="mt-1 flex justify-center gap-2">
            <a href="/privacy.html" target="_blank" className="text-primary dark:text-primary hover:underline">Privacy Policy</a>
            <span>and</span>
            <a href="/terms.html" target="_blank" className="text-primary dark:text-primary hover:underline">Terms of Service</a>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;