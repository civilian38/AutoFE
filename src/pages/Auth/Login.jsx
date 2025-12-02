import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { defaultApi } from '../../api/axios';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await defaultApi.post('/authentication/token/', formData);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.logoArea}>
        <h1 className={styles.pageTitle}>Sign in to AutoReact</h1>
      </div>

      <div className={styles.loginBox}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="username">Username</label>
            <input
              id="username"
              className={styles.input}
              name="username"
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="password">Password</label>
              <span className={styles.forgotPassword}>Forgot password?</span>
            </div>
            <input
              id="password"
              className={styles.input}
              type="password"
              name="password"
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>

      <p className={styles.footerText}>
        {/* 회원가입 페이지 이동 로직 추가 */}
        New to AutoReact? <span className={styles.link} onClick={() => navigate('/register')}>Create an account</span>.
      </p>
    </div>
  );
};

export default Login;