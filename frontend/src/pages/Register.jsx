import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { IoMail, IoLockClosed, IoPerson, IoCall } from 'react-icons/io5';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'attendee' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - var(--nav-height))' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 440, padding: 40, animation: 'scaleIn 0.3s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🚀</div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800 }}>Create Account</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Join EventHub and discover live events</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group">
            <label>Full Name</label>
            <div style={{ position: 'relative' }}>
              <IoPerson style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" name="name" className="input-field" placeholder="John Doe" value={form.name} onChange={handleChange} required style={{ paddingLeft: 36, width: '100%' }} />
            </div>
          </div>

          <div className="input-group">
            <label>Email</label>
            <div style={{ position: 'relative' }}>
              <IoMail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="email" name="email" className="input-field" placeholder="your@email.com" value={form.email} onChange={handleChange} required style={{ paddingLeft: 36, width: '100%' }} />
            </div>
          </div>

          <div className="input-group">
            <label>Phone</label>
            <div style={{ position: 'relative' }}>
              <IoCall style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="tel" name="phone" className="input-field" placeholder="+91 9876543210" value={form.phone} onChange={handleChange} style={{ paddingLeft: 36, width: '100%' }} />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <IoLockClosed style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="password" name="password" className="input-field" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required minLength={6} style={{ paddingLeft: 36, width: '100%' }} />
            </div>
          </div>

          <div className="input-group">
            <label>Account Type</label>
            <select name="role" className="input-field" value={form.role} onChange={handleChange}>
              <option value="attendee">🎧 Attendee - Book events</option>
              <option value="organizer">🎯 Organizer - Create events</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
