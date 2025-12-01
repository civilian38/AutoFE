import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// 변경된 경로로 import
import Login from './pages/Auth/Login';
import Home from './pages/Home/Home';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </header>
      </div>
    </BrowserRouter>
  );
}

export default App;