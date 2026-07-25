const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
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
      onSwitchToLogin();
    } else {
      setAuthError(data.message || 'Registration failed');
    }
  } catch (error) {
    setAuthError('Registration failed. Please try again.');
  } finally {
    setLoading(false);
  }
};