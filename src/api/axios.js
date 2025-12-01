// src/api/axios.js
import axios from 'axios';

const BASE_URL = "https://ar-web.delightfulisland-8239f9f6.koreacentral.azurecontainerapps.io/api";

// 단순 요청용 (로그인, 회원가입 등 토큰 필요 없는 요청)
export const defaultApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// 인증이 필요한 요청용 (헤더에 토큰 자동 포함)
export const authApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// [Request Interceptor] 요청을 보내기 전, Access Token이 있다면 헤더에 추가
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // DRF는 보통 Bearer, JWT 등 prefix가 필요함. 여기서는 Bearer로 가정
  }
  return config;
});

// [Response Interceptor] 응답 처리 (토큰 만료 시 자동 갱신 로직)
authApi.interceptors.response.use(
  (response) => response, // 정상 응답은 그대로 반환
  async (error) => {
    const originalRequest = error.config;

    // 401 에러(권한 없음)이고, 아직 재시도하지 않은 요청이라면
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 무한 루프 방지
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          // Refresh Token으로 Access Token 재발급 요청
          const response = await defaultApi.post('/authentication/token/refresh/', {
            refresh: refreshToken,
          });

          // 새 토큰 저장
          const newAccessToken = response.data.access;
          localStorage.setItem('access_token', newAccessToken);

          // 실패했던 요청의 헤더를 새 토큰으로 교체하고 재요청
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return authApi(originalRequest);

        } catch (refreshError) {
          // 리프레시 토큰도 만료되었다면 로그아웃 처리
          console.error("Refresh token expired", refreshError);
          localStorage.clear();
          window.location.href = '/login'; // 로그인 페이지로 강제 이동
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);