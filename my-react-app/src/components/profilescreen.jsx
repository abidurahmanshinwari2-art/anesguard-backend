import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './sidebar';
import { User, Mail, Phone, Building, Calendar, Lock, Edit2, Save, X, Camera, Trash2, Upload } from 'lucide-react';
import { auth, updateProfile, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from '../firebase/config';
import { getMe, updateMe } from '../api/users';

const ProfileScreen = ({ onNavigate }) => {
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    employeeId: '',
    photoURL: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...userData });

  // New: loading/error/saving state for the real backend profile fetch & save.
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Load the real profile from the backend on mount. The profile picture
  // still comes from localStorage (see note below the profile card) since
  // there's no image storage backend yet — everything else is real.
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMe();
        const savedPhoto = localStorage.getItem('profilePhoto');
        const loaded = {
          fullName: data.displayName || '',
          email: data.email || '',
          phone: data.phone || '',
          department: data.department || '',
          employeeId: data.employeeId || '',
          photoURL: savedPhoto || data.photoURL || '',
        };
        setUserData(loaded);
        setEditForm(loaded);
      } catch (err) {
        console.error('Failed to load profile:', err);
        setLoadError('Could not load your profile. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveError('');
    try {
      // Saves the real fields to MongoDB via the backend.
      const updated = await updateMe({
        displayName: editForm.fullName,
        phone: editForm.phone,
        department: editForm.department,
        employeeId: editForm.employeeId,
      });

      // Also keep Firebase's own displayName in sync (used elsewhere in the app).
      if (auth.currentUser && editForm.fullName !== userData.fullName) {
        try {
          await updateProfile(auth.currentUser, { displayName: editForm.fullName });
        } catch (fbErr) {
          console.error('Firebase displayName sync failed (non-critical):', fbErr);
        }
      }

      const merged = {
        fullName: updated.displayName || '',
        email: updated.email || '',
        phone: updated.phone || '',
        department: updated.department || '',
        employeeId: updated.employeeId || '',
        photoURL: userData.photoURL, // photo stays local, untouched by this save
      };
      setUserData(merged);
      setEditForm(merged);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setSaveError('Could not save your changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({ ...userData });
    setSaveError('');
    setIsEditing(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  // Now does a REAL Firebase password change. Firebase requires a recent
  // login for sensitive actions like this, so we first "reauthenticate"
  // (silently confirm the current password is correct) before changing it.
  const handleUpdatePassword = async () => {
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (!passwordData.newPassword) {
      setPasswordError('New password is required');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');

    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('No logged-in user found.');

      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordData.newPassword);

      setPasswordSuccess('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error) {
      console.error('Password update error:', error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setPasswordError('Current password is incorrect.');
      } else if (error.code === 'auth/too-many-requests') {
        setPasswordError('Too many attempts. Please try again later.');
      } else {
        setPasswordError('Failed to update password. Please try again.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── Profile Picture Functions (still localStorage — no image storage backend yet) ──
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB (localStorage limit)');
      return;
    }

    setPhotoLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const base64String = event.target.result;
        localStorage.setItem('profilePhoto', base64String);

        const updatedUserData = { ...userData, photoURL: base64String };
        setUserData(updatedUserData);
        setEditForm(updatedUserData);

        setPhotoLoading(false);

        const toast = document.getElementById('photoToast');
        if (toast) {
          toast.style.display = 'block';
          setTimeout(() => {
            toast.style.display = 'none';
          }, 3000);
        }
      } catch (error) {
        console.error('Error saving image:', error);
        setPhotoLoading(false);
        alert('Failed to save image. The file might be too large.');
      }
    };

    reader.onerror = () => {
      setPhotoLoading(false);
      alert('Failed to read image file. Please try again.');
    };

    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    if (!userData.photoURL) return;
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;

    localStorage.removeItem('profilePhoto');
    const updatedUserData = { ...userData, photoURL: '' };
    setUserData(updatedUserData);
    setEditForm(updatedUserData);

    alert('Profile picture removed successfully');
  };

  const getDepartmentName = (deptKey) => {
    const departments = {
      cardiology: 'Cardiology',
      neurology: 'Neurology',
      pediatrics: 'Pediatrics',
      orthopedics: 'Orthopedics',
      radiology: 'Radiology',
      emergency: 'Emergency Medicine',
      surgery: 'Surgery',
    };
    return departments[deptKey] || deptKey || 'Not specified';
  };

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '16px 0',
      borderBottom: '1px solid #f1f5f9',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        backgroundColor: '#eff6ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '16px',
      }}>
        <Icon size={20} color="#2563eb" />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{label}</p>
        <p style={{ margin: '4px 0 0', fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{value || 'Not provided'}</p>
      </div>
    </div>
  );

  const EditInputRow = ({ icon: Icon, label, name, value, type = 'text', placeholder }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '16px 0',
      borderBottom: '1px solid #f1f5f9',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        backgroundColor: '#eff6ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '16px',
      }}>
        <Icon size={20} color="#2563eb" />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{label}</p>
        {name === 'department' ? (
          <select
            name={name}
            value={value}
            onChange={handleEditChange}
            style={{
              width: '100%',
              marginTop: '4px',
              padding: '8px 12px',
              border: '1.5px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1e293b',
              backgroundColor: '#fff',
              outline: 'none',
              fontFamily: 'inherit',
            }}
            onFocus={e => e.target.style.borderColor = '#2563eb'}
            onBlur={e => e.target.style.borderColor = '#d1d5db'}
          >
            <option value="">Select Department</option>
            <option value="cardiology">Cardiology</option>
            <option value="neurology">Neurology</option>
            <option value="pediatrics">Pediatrics</option>
            <option value="orthopedics">Orthopedics</option>
            <option value="radiology">Radiology</option>
            <option value="emergency">Emergency Medicine</option>
            <option value="surgery">Surgery</option>
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={handleEditChange}
            placeholder={placeholder}
            style={{
              width: '100%',
              marginTop: '4px',
              padding: '8px 12px',
              border: '1.5px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1e293b',
              outline: 'none',
              fontFamily: 'inherit',
            }}
            onFocus={e => e.target.style.borderColor = '#2563eb'}
            onBlur={e => e.target.style.borderColor = '#d1d5db'}
          />
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9' }}>
        <Sidebar activeLabel="Profile" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#64748b' }}>Loading your profile...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f1f5f9' }}>
      <Sidebar activeLabel="Profile" onNavigate={onNavigate} onLogout={() => onNavigate && onNavigate('login')} />

      {/* Toast for photo upload success */}
      <div
        id="photoToast"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '12px 24px',
          borderRadius: '10px',
          backgroundColor: '#16a34a',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'none',
        }}
      >
        ✅ Profile picture updated successfully!
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '16px', padding: '28px',
            width: '420px', maxWidth: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Change Password</h3>
              <button onClick={() => { setShowPasswordModal(false); setPasswordError(''); setPasswordSuccess(''); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Current Password</label>
              <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange}
                placeholder="Enter current password"
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>New Password</label>
              <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange}
                placeholder="Minimum 8 characters"
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Confirm New Password</label>
              <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange}
                placeholder="Confirm new password"
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </div>

            {passwordError && (
              <div style={{ marginBottom: '16px', padding: '8px 12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#dc2626' }}>{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div style={{ marginBottom: '16px', padding: '8px 12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#16a34a' }}>{passwordSuccess}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowPasswordModal(false); setPasswordError(''); setPasswordSuccess(''); }}
                style={{ padding: '8px 20px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleUpdatePassword} disabled={passwordLoading}
                style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: passwordLoading ? 'not-allowed' : 'pointer', opacity: passwordLoading ? 0.7 : 1 }}>
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: '0 0 2px', fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>My Profile</h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>View and manage your account information</p>
          </div>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 3px 10px rgba(37,99,235,0.3)' }}
              onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg,#1d4ed8,#1e40af)'}
              onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(135deg,#2563eb,#1d4ed8)'}>
              <Edit2 size={16} /> Edit Profile
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleCancelEdit} disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '14px', fontWeight: '600', color: '#374151', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
                <X size={16} /> Cancel
              </button>
              <button onClick={handleSaveProfile} disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.75 : 1, boxShadow: '0 3px 10px rgba(22,163,74,0.3)' }}
                onMouseOver={e => { if (!saving) e.currentTarget.style.background = 'linear-gradient(135deg,#15803d,#166534)'; }}
                onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(135deg,#16a34a,#15803d)'}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {saveError && (
          <div style={{ padding: '12px 16px', marginBottom: '16px', backgroundColor: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '10px', maxWidth: '700px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#dc2626', fontWeight: '600' }}>{saveError}</p>
          </div>
        )}

        {loadError && (
          <div style={{ padding: '12px 16px', marginBottom: '16px', backgroundColor: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '10px', maxWidth: '700px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#dc2626', fontWeight: '600' }}>{loadError}</p>
          </div>
        )}

        {/* Profile Card */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '20px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          maxWidth: '700px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg,#1e3a8a,#2563eb)',
            padding: '32px 32px 60px 32px',
            position: 'relative',
          }}>
            {/* Profile Picture with Upload */}
            <div style={{
              position: 'relative',
              display: 'inline-block',
              marginBottom: '16px',
            }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '3px solid rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {userData.photoURL ? (
                  <img src={userData.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={36} color="#fff" />
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />

              {/* Remove Photo Button */}
              {userData.photoURL && (
                <button
                  onClick={handleRemovePhoto}
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '2px solid #fff',
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    transition: 'transform 0.2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Trash2 size={14} />
                </button>
              )}

              {/* Loading Spinner */}
              {photoLoading && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      border: '3px solid #2563eb',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Photo Upload Hint */}
            <div style={{ marginTop: '-8px', marginBottom: '8px' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '20px',
                  padding: '4px 14px',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                <Upload size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Change Photo
              </button>
              {userData.photoURL && (
                <span style={{
                  marginLeft: '8px',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '11px',
                }}>
                  • Click photo to change
                </span>
              )}
            </div>

            <h2 style={{ margin: '0', fontSize: '22px', fontWeight: '700', color: '#fff' }}>
              {userData.fullName || 'User'}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
              {getDepartmentName(userData.department)}
            </p>
          </div>

          <div style={{ padding: '24px 32px' }}>
            {!isEditing ? (
              <>
                <InfoRow icon={User} label="Full Name" value={userData.fullName} />
                <InfoRow icon={Mail} label="Email Address" value={userData.email} />
                <InfoRow icon={Phone} label="Phone Number" value={userData.phone} />
                <InfoRow icon={Building} label="Department" value={getDepartmentName(userData.department)} />
                <InfoRow icon={Calendar} label="Employee ID" value={userData.employeeId} />

                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <button onClick={() => setShowPasswordModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #d1d5db', background: '#fff', fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#374151'; }}>
                    <Lock size={16} /> Change Password
                  </button>
                </div>
              </>
            ) : (
              <>
                <EditInputRow icon={User} label="Full Name" name="fullName" value={editForm.fullName} placeholder="Enter full name" />
                <InfoRow icon={Mail} label="Email Address (cannot be changed here)" value={editForm.email} />
                <EditInputRow icon={Phone} label="Phone Number" name="phone" value={editForm.phone} type="tel" placeholder="+1 234 567 8900" />
                <EditInputRow icon={Building} label="Department" name="department" value={editForm.department} placeholder="Select department" />
                <EditInputRow icon={Calendar} label="Employee ID" name="employeeId" value={editForm.employeeId} placeholder="EMP123456" />

                {/* Photo upload in edit mode */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px 0',
                  borderBottom: '1px solid #f1f5f9',
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px',
                  }}>
                    <Camera size={20} color="#2563eb" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Profile Picture</p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          padding: '6px 16px',
                          borderRadius: '6px',
                          border: '1.5px solid #2563eb',
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        Upload New
                      </button>
                      {userData.photoURL && (
                        <button
                          onClick={handleRemovePhoto}
                          style={{
                            padding: '6px 16px',
                            borderRadius: '6px',
                            border: '1.5px solid #ef4444',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{
          marginTop: '24px',
          padding: '12px 16px',
          backgroundColor: '#eff6ff',
          borderRadius: '10px',
          border: '1px solid #bfdbfe',
          maxWidth: '700px',
        }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#1d4ed8' }}>
            ℹ️ Your profile picture is stored locally in your browser. Everything else here is saved to your account.
          </p>
        </div>

      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProfileScreen;