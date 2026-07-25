import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, Mail, Phone, Building, Calendar } from 'lucide-react';

const SignupScreen = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    employeeId: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (authError) setAuthError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.department) newErrors.department = 'Please select a department';
    if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
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
      const response = await fetch('https://anesguard-backend.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          department: formData.department,
          employeeId: formData.employeeId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Registration successful! Please login.');
        setLoading(false);
        onSwitchToLogin();
      } else {
        setLoading(false);
        setAuthError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setLoading(false);
      setAuthError('Registration failed. Please try again.');
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f4f8',
      padding: '16px',
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1000px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        display: 'flex',
        minHeight: '580px'
      }}>
        <div style={{
          flex: '0 0 42%',
          background: 'linear-gradient(160deg,#e8f0fe 0%,#dce8fd 60%,#cddcfb 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px'
        }}>
          <div style={{ marginBottom: '14px' }}>
            <svg width="72" height="80" viewBox="0 0 72 80" fill="none">
              <path d="M36 2L6 14V38C6 56 20 71 36 76C52 71 66 56 66 38V14L36 2Z" fill="#2563eb" opacity="0.15" />
              <path d="M36 4L8 15.5V38C8 55 21.5 69.5 36 74.5C50.5 69.5 64 55 64 38V15.5L36 4Z"
                fill="none" stroke="#2563eb" strokeWidth="2.5" />
              <rect x="31" y="22" width="10" height="28" rx="2" fill="#2563eb" />
              <rect x="22" y="31" width="28" height="10" rx="2" fill="#2563eb" />
            </svg>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1e3a8a', margin: '0 0 6px', letterSpacing: '0.5px' }}>AnesGuard</h1>
          <p style={{ fontSize: '13px', color: '#374151', textAlign: 'center', fontWeight: '600', margin: '0 0 4px', lineHeight: '1.4' }}>
            Pre-Anesthesia Assessment<br />Learning System
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 32px' }}>Educational Use Only</p>
          <svg width="160" height="110" viewBox="0 0 160 110" fill="none">
            <rect x="48" y="30" width="76" height="52" rx="5" fill="#bfdbfe" stroke="#2563eb" strokeWidth="1.8" />
            <rect x="54" y="36" width="64" height="38" rx="3" fill="#eff6ff" />
            <polyline points="57,55 67,55 72,42 77,68 82,48 87,55 97,55 102,45 107,55 112,55"
              stroke="#2563eb" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="80" y="82" width="12" height="8" rx="1" fill="#93c5fd" />
            <rect x="70" y="89" width="32" height="4" rx="2" fill="#93c5fd" />
            <line x1="20" y1="18" x2="24" y2="28" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="38" y1="18" x2="34" y2="28" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M20 18 Q29 10 38 18" stroke="#2563eb" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M24 28 Q25 50 29 60 Q32 70 29 80" stroke="#2563eb" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M34 28 Q33 50 29 60" stroke="#2563eb" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="29" cy="83" r="7" fill="#2563eb" opacity="0.2" stroke="#2563eb" strokeWidth="2" />
            <circle cx="29" cy="83" r="3" fill="#2563eb" />
          </svg>
        </div>

        <div style={{ flex: 1, padding: '40px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px', textAlign: 'center' }}>Create Account</h2>
          <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', margin: '0 0 24px' }}>Register to access the system</p>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: errors.fullName ? '#ef4444' : '#9ca3af' }}>
                  <User size={16} />
                </span>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Dr. John Doe"
                  style={inputStyle('fullName')}
                  onFocus={e => e.target.style.borderColor = errors.fullName ? '#ef4444' : '#2563eb'}
                  onBlur={e => e.target.style.borderColor = errors.fullName ? '#ef4444' : '#d1d5db'}
                />
              </div>
              {errors.fullName && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.fullName}</p>}
            </div>

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
              {errors.email && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.email}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: errors.phone ? '#ef4444' : '#9ca3af' }}>
                  <Phone size={16} />
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                  style={inputStyle('phone')}
                  onFocus={e => e.target.style.borderColor = errors.phone ? '#ef4444' : '#2563eb'}
                  onBlur={e => e.target.style.borderColor = errors.phone ? '#ef4444' : '#d1d5db'}
                />
              </div>
              {errors.phone && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.phone}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Department</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: errors.department ? '#ef4444' : '#9ca3af' }}>
                    <Building size={16} />
                  </span>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    style={{ ...inputStyle('department'), appearance: 'auto', cursor: 'pointer', paddingLeft: '36px' }}
                    onFocus={e => e.target.style.borderColor = errors.department ? '#ef4444' : '#2563eb'}
                    onBlur={e => e.target.style.borderColor = errors.department ? '#ef4444' : '#d1d5db'}
                  >
                    <option value="">Select Department</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Emergency">Emergency Medicine</option>
                    <option value="Surgery">Surgery</option>
                  </select>
                </div>
                {errors.department && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.department}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Employee ID</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: errors.employeeId ? '#ef4444' : '#9ca3af' }}>
                    <Calendar size={16} />
                  </span>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    placeholder="EMP123456"
                    style={inputStyle('employeeId')}
                    onFocus={e => e.target.style.borderColor = errors.employeeId ? '#ef4444' : '#2563eb'}
                    onBlur={e => e.target.style.borderColor = errors.employeeId ? '#ef4444' : '#d1d5db'}
                  />
                </div>
                {errors.employeeId && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.employeeId}</p>}
              </div>
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
                  placeholder="Minimum 8 characters"
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
              {errors.password && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.password}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: errors.confirmPassword ? '#ef4444' : '#9ca3af' }}>
                  <Lock size={16} />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  style={{ ...inputStyle('confirmPassword'), paddingRight: '40px' }}
                  onFocus={e => e.target.style.borderColor = errors.confirmPassword ? '#ef4444' : '#2563eb'}
                  onBlur={e => e.target.style.borderColor = errors.confirmPassword ? '#ef4444' : '#d1d5db'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.confirmPassword}</p>}
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
                backgroundColor: '#2563eb',
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
                marginTop: '4px'
              }}
              onMouseOver={e => { if (!loading) e.currentTarget.style.backgroundColor = '#1d4ed8'; }}
              onMouseOut={e => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
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
                  Creating account...
                </>
              ) : 'Sign Up'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', margin: 0 }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
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
                Log In
              </button>
            </p>
          </form>

          <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '11px', color: '#9ca3af' }}>
            © 2026 AnesGuard. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupScreen;