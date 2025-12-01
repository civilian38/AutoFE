import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { defaultApi } from '../../api/axios'; // 경로 변경됨
import styles from './Login.module.css'; // 스타일 import

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await defaultApi.post('/authentication/token/', formData);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      alert('로그인 성공!');
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('로그인 실패: 아이디와 비밀번호를 확인하세요.');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>로그인</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          className={styles.input}
          name="username"
          placeholder="아이디"
          onChange={handleChange}
          required
        />
        <input
          className={styles.input}
          type="password"
          name="password"
          placeholder="비밀번호"
          onChange={handleChange}
          required
        />
        <button type="submit" className={styles.button}>로그인</button>
      </form>
    </div>
  );
};

export default Login;