import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { API_URL } from '../api/config';
import { startSessionClock } from '../utils/sessionClock';
import AuthShell from './AuthShell';

const LoginScreen = ({ onSwitchToSignup, onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (authError) setAuthError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setAuthError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // ✅ Save token
        localStorage.setItem('token', data.token);
        startSessionClock(data.sessionTimeoutMinutes);
        
        // ✅ Save FULL user data for profile
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('anesguard_user_data', JSON.stringify(data.user));
        
        // ✅ If remember me, also save for persistence
        if (rememberMe) {
          localStorage.setItem('anesguard_user', JSON.stringify({
            uid: data.user.id,
            email: data.user.email,
            displayName: data.user.fullName
          }));
        }
        
        setTimeout(() => {
          setLoading(false);
          onLoginSuccess();
        }, 500);
      } else {
        setLoading(false);
        setAuthError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      setAuthError('Login failed. Please try again.');
    }
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '10px 12px 10px 36px',
    border: `1.5px solid ${errors[field] ? '#ef4444' : '#d1d5db'}`,
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  });

  return (
    <AuthShell>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px', textAlign: 'center' }}>Welcome</h2>
          <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', margin: '0 0 28px' }}>Login to continue</p>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: errors.email ? '#ef4444' : '#9ca3af' }}>
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="doctor@hospital.com"
                  style={inputStyle('email')}
                  onFocus={e => e.target.style.borderColor = errors.email ? '#ef4444' : '#2563eb'}
                  onBlur={e => e.target.style.borderColor = errors.email ? '#ef4444' : '#d1d5db'}
                />
              </div>
              {errors.email && <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#ef4444' }}>{errors.email}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: errors.password ? '#ef4444' : '#9ca3af' }}>
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  style={{ ...inputStyle('password'), paddingRight: '40px' }}
                  onFocus={e => e.target.style.borderColor = errors.password ? '#ef4444' : '#2563eb'}
                  onBlur={e => e.target.style.borderColor = errors.password ? '#ef4444' : '#d1d5db'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#ef4444' }}>{errors.password}</p>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#2563eb', width: '14px', height: '14px' }}
                />
                <span style={{ fontSize: '13px', color: '#374151' }}>Remember me</span>
              </label>
            </div>

            {authError && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                border: '1.5px solid #fecaca',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p style={{ margin: 0, fontSize: '13px', color: '#dc2626', fontWeight: '500' }}>{authError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                boxShadow: '0 8px 18px rgba(37,99,235,0.28)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.75 : 1,
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '2px'
              }}
              onMouseOver={e => { if (!loading) e.currentTarget.style.background = 'linear-gradient(135deg,#1d4ed8,#1e40af)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#2563eb,#1d4ed8)'; }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #fff',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite'
                  }} />
                  Logging in...
                </>
              ) : 'Login'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', margin: 0 }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToSignup}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '13px',
                  padding: 0
                }}
              >
                Sign up
              </button>
            </p>
          </form>

          <p style={{ marginTop: '28px', textAlign: 'center', fontSize: '11px', color: '#9ca3af' }}>
            © 2026 AnesGuard. All rights reserved.
          </p>
    </AuthShell>
  );
};

export default LoginScreen;