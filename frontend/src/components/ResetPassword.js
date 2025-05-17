import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const token = params.get('access_token');
    if (token) {
      setToken(token);
    } else {
      setMessage('Invalid or missing token.');
    }
  }, []);

  const handleSubmit = async () => {
    try {
      await axios.post('/reset-password', {
        access_token: token,
        new_password: password,
      });
      setMessage('Password reset successful! You can now log in.');
    } catch (err) {
      console.log(err)
      setMessage(err.response?.data?.detail || 'Failed to reset password.');
    }
  };

  return (
    <div>
      <h2>Reset Your Password</h2>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
      />
      <button onClick={handleSubmit}>Reset Password</button>
      <p>{message}</p>
    </div>
  );
}
