import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/axios'; // 경로 변경됨
import styles from './Home.module.css'; // 스타일 import

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
    } else {
      setUser({ name: '사용자' });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const testAuthRequest = async () => {
    try {
      await authApi.get('/some-test-endpoint'); // 예시
      alert("인증된 상태입니다. API 호출 가능!");
    } catch (error) {
      alert("API 호출 실패 (콘솔 확인)");
    }
  }

  return (
    <div className={styles.container}>
      <h1>메인 페이지</h1>
      <p>로그인에 성공하셨습니다.</p>

      <div className={styles.buttonGroup}>
        <button className={styles.primaryBtn} onClick={testAuthRequest}>API 테스트</button>
        <button className={styles.secondaryBtn} onClick={handleLogout}>로그아웃</button>
      </div>
    </div>
  );
};

export default Home;