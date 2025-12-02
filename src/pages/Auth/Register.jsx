// src/pages/Auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { defaultApi } from '../../api/axios';
import styles from './Register.module.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nickname: '',
    email: '',
    bio: '',
    gemini_key_encrypted: 'None' // Default value as per sample
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 회원가입 요청 (POST)
      await defaultApi.post('/authentication/register/', formData);
      alert('Registration successful! Please sign in.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      // 에러 메시지 처리 (서버 응답에 따라 구체화 가능)
      alert('Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.logoArea}>
        <h1 className={styles.pageTitle}>Create an account</h1>
      </div>

      <div className={styles.registerBox}>
        <form onSubmit={handleSubmit} className={styles.form}>

          {/* Username */}
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="username">Username</label>
            <input
              id="username"
              className={styles.input}
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              className={styles.input}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Nickname */}
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="nickname">Nickname</label>
            <input
              id="nickname"
              className={styles.input}
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              className={styles.input}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Bio */}
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              className={`${styles.input} ${styles.textarea}`}
              name="bio"
              value={formData.bio}
              onChange={handleChange}
            />
          </div>

          {/* Gemini Key (Optional/Advanced) */}
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="gemini_key_encrypted">Gemini Key (Optional)</label>
            <input
              id="gemini_key_encrypted"
              className={styles.input}
              name="gemini_key_encrypted"
              value={formData.gemini_key_encrypted}
              onChange={handleChange}
              placeholder="None"
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>

      <p className={styles.footerText}>
        Already have an account? <span className={styles.link} onClick={() => navigate('/login')}>Sign in</span>.
      </p>
    </div>
  );
};

export default Register;