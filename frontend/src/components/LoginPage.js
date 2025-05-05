import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    const endpoint = isSignup ? 'signup' : 'login';

    try {
      const response = await fetch(`${process.env.REACT_APP_PROD}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isSignup) {
          setInfoMessage(
            'Signup successful! Please check your email for a confirmation link. You must verify your email before logging in.'
          );
          setIsSignup(false);
          setEmail('');
          setPassword('');
        } else {
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          onLogin(data);
        }
      } else {
        setError(data.detail || 'Something went wrong');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    }
  };

  return (
    <div className='login-container'>
      <div className='login-form'>
        <h2>{isSignup ? 'Sign Up' : 'Login'}</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {infoMessage && <p style={{ color: 'green' }}>{infoMessage}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">{isSignup ? 'Sign Up' : 'Login'}</button>
        </form>
        <p className="toggle-mode">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span
            className="toggle-link"
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
              setInfoMessage('');
            }}
          >
            {isSignup ? 'Login here' : 'Sign up here'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
