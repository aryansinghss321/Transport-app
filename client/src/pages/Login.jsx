import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email)                        e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)                     e.password = 'Password is required';
    else if (form.password.length < 6)      e.password = 'Minimum 6 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e_ = validate();
    if (Object.keys(e_).length) { setErrors(e_); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const f = (field) => ({
    value: form[field],
    onChange: e => { setForm({ ...form, [field]: e.target.value }); setErrors({ ...errors, [field]: '' }); },
    className: `w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 ${errors[field] ? 'border-red-400 focus:ring-red-300' : 'focus:ring-blue-300'}`,
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-center">Sign In</h2>
        <p className="text-center text-gray-500 text-sm mb-6">Welcome back to TransportApp</p>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" placeholder="you@example.com" {...f('email')} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" placeholder="••••••••" {...f('password')} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-medium transition">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-sm text-center mt-4 text-gray-500">
          No account? <Link to="/register" className="text-blue-600 font-medium">Register</Link>
        </p>
      </div>
    </div>
  );
}