import React, { useEffect } from 'react';

// 구글 OAuth 로그인 완료 후 토큰 및 유저 정보를 처리하는 콜백 컴포넌트
export default function OAuthCallback({ onLoginSuccess, setIsLoggedIn, setCurrentPage }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // 백엔드에서 전달한 파라미터 추출
    const accessToken = params.get('accessToken') || params.get('token');
    const refreshToken = params.get('refreshToken');
    const userId = params.get('userId');
    const email = params.get('email');

    if (accessToken) {
      // 1. 토큰 및 유저 정보를 로컬 스토리지에 저장
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      if (userId) localStorage.setItem('userId', userId);
      if (email) localStorage.setItem('user', JSON.stringify({ email }));

      if (setIsLoggedIn) setIsLoggedIn(true);
      
      // 2. 성공 처리 후 홈 화면으로 이동
      if (onLoginSuccess) {
        onLoginSuccess();
      } else if (setCurrentPage) {
        window.history.replaceState({ page: 'home', itemData: null }, document.title, '/');
        setCurrentPage('home');
      }
    } else {
      // 3. 토큰이 주소창에 없을 때의 예외 처리 (React StrictMode 중복 실행 방지 포함)
      if (!localStorage.getItem('accessToken')) {
        alert('로그인에 실패하였습니다.');
        if (setCurrentPage) setCurrentPage('home');
        else window.location.href = '/';
      }
    }
  }, [onLoginSuccess, setIsLoggedIn, setCurrentPage]);

  return (
    <div style={{ textAlign: 'center', padding: '100px 20px', fontFamily: "'Pretendard', sans-serif" }}>
      <h2>로그인 처리 중입니다... ⏳</h2>
      <p style={{ color: '#6b7280' }}>잠시만 기다려주시면 메인 화면으로 이동합니다.</p>
    </div>
  );
}