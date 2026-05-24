import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name.trim())                      e.name     = 'Name is required';
    if (!form.email)                            e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email    = 'Enter a valid email';
    if (!form.password)                         e.password = 'Password is required';
    else if (form.password.length < 6)          e.password = 'Minimum 6 characters';
    if (form.confirm !== form.password)         e.confirm  = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e_ = validate();
    if (Object.keys(e_).length) { setErrors(e_); return; }
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password);
      toast.success('Account created!');
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
        <h2 className="text-2xl font-bold mb-2 text-center">Create Account</h2>
        <p className="text-center text-gray-500 text-sm mb-6">Join TransportApp today</p>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {[
            { field: 'name',     label: 'Full Name',       type: 'text',     ph: 'John Doe' },
            { field: 'email',    label: 'Email',           type: 'email',    ph: 'you@example.com' },
            { field: 'password', label: 'Password',        type: 'password', ph: '••••••••' },
            { field: 'confirm',  label: 'Confirm Password',type: 'password', ph: '••••••••' },
          ].map(({ field, label, type, ph }) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <input type={type} placeholder={ph} {...f(field)} />
              {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50 font-medium transition">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="text-sm text-center mt-4 text-gray-500">
          Have an account? <Link to="/login" className="text-blue-600 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}