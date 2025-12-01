import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/axios'; // 인증이 필요한 API 클라이언트

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // 토큰이 없으면 로그인 페이지로 튕겨내기 (보호된 라우트)
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
    } else {
      // 토큰이 있다면 사용자 정보라고 가정하고 세팅 (실제로는 /me 같은 API를 호출해야 함)
      setUser({ name: '사용자' });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // 테스트를 위해 강제로 토큰이 필요한 API 요청을 날려보는 함수
  const testAuthRequest = async () => {
    try {
      // 실제 존재하는 아무 인증 필요 API 호출 (예시)
      // 만약 토큰이 만료되었다면 axios interceptor가 자동으로 갱신해줄 것임
      alert("인증된 상태입니다. API 호출 가능!");
    } catch (error) {
      alert("API 호출 실패");
    }
  }

  return (
    <div className="dashboard-container">
      <h1>메인 페이지</h1>
      <p>로그인에 성공하셨습니다.</p>

      <div className="button-group">
        <button className="btn-primary" onClick={testAuthRequest}>API 테스트</button>
        <button className="btn-secondary" onClick={handleLogout}>로그아웃</button>
      </div>
    </div>
  );
};

export default Home;