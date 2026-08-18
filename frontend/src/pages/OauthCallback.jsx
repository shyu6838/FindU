import React, { useEffect } from 'react';

// 구글 OAuth 로그인 완료 후 토큰 처리 콜백 컴포넌트
export default function OAuthCallback({ onLoginSuccess }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('accessToken', token);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } else {
      if (!localStorage.getItem('accessToken')) {
        alert('로그인에 실패하였습니다.');
        window.location.href = '/';
      }
    }
  }, [onLoginSuccess]);

  return (
    <div style={{ textAlign: 'center', padding: '100px 20px', fontFamily: "'Pretendard', sans-serif" }}>
      <h2>로그인 처리 중입니다...</h2>
      <p style={{ color: '#6b7280' }}>잠시만 기다려주시면 메인 화면으로 이동합니다.</p>
    </div>
  );
}