import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import './App.css'; // 기존 스타일 유지

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <Routes>
            {/* 기본 경로 접속 시 Home으로 */}
            <Route path="/" element={<Home />} />
            {/* 로그인 페이지 */}
            <Route path="/login" element={<Login />} />
            {/* 없는 페이지 접속 시 로그인으로 리다이렉트 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </header>
      </div>
    </BrowserRouter>
  );
}

export default App;