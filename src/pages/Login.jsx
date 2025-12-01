import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { defaultApi } from '../api/axios'; // 위에서 만든 axios 가져오기

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // API 호출 (defaultApi 사용)
      const response = await defaultApi.post('/authentication/token/', formData);

      // 토큰 저장
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);

      alert('로그인 성공!');
      navigate('/'); // 메인 페이지로 이동
    } catch (error) {
      console.error(error);
      alert('로그인 실패: 아이디와 비밀번호를 확인하세요.');
    }
  };

  return (
    <div className="login-container">
      <h2>로그인</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          name="username"
          placeholder="아이디"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          onChange={handleChange}
          required
        />
        <button type="submit" className="btn-primary">로그인</button>
      </form>
    </div>
  );
};

export default Login;