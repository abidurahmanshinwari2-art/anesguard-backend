// Replace the handleSubmit function in LoginScreen.jsx
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
    const response = await fetch('https://anesguard-backend.onrender.com/api/auth/login', {
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
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
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