// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Home from './pages/Home/Home';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      {/* 불필요한 header 태그와 div 태그 중첩을 제거합니다 */}
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;