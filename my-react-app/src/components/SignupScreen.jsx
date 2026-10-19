import React, { useState } from 'react';
import { Eye, EyeOff, UserRound, Lock, Mail, Phone, Stethoscope, IdCard } from 'lucide-react';
import { API_URL } from '../api/config';
import AuthShell from './AuthShell';

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
      const response = await fetch(`${API_URL}/auth/register`, {
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
        alert(data.message || 'Registration successful. Please log in.');
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
    <AuthShell>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px', textAlign: 'center' }}>Create Account</h2>
          <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', margin: '0 0 24px' }}>Register to access the system</p>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: errors.fullName ? '#ef4444' : '#9ca3af' }}>
                  <UserRound size={16} />
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
                    <Stethoscope size={16} />
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
                    <option value="Emergency Medicine">Emergency Medicine</option>
                    <option value="Surgery">Surgery</option>
                  </select>
                </div>
                {errors.department && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.department}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Employee ID</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: errors.employeeId ? '#ef4444' : '#9ca3af' }}>
                    <IdCard size={16} />
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
                marginTop: '4px'
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
    </AuthShell>
  );
};

export default SignupScreen;