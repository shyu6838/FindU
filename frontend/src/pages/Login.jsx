import React from 'react';

/**
 * [Login.jsx]
 * 서비스의 로그인 화면 컴포넌트입니다.
 * - 주요 역할: 학교 구글 계정을 이용한 OAuth 2.0 로그인 UI 제공
 * - 현재는 백엔드 연동 전이므로 '가짜 로그인(Mock Login)'으로 동작합니다.
 */

// ---------------------------------------------------------
// 1. 메인 컴포넌트
// ---------------------------------------------------------
export default function Login({ setCurrentPage, setView, setIsLoggedIn }) {
  // Navigation 함수 (App.jsx의 라우팅 방식에 따라 대응)
  const navigate = setCurrentPage || setView;

  // [이벤트 핸들러] 가짜 로그인 처리
  // 백엔드 API 연동 전까지 UI 테스트를 위해 임시로 로그인 상태를 true로 만듭니다.
  const handleMockLogin = () => {
    alert('구글 계정으로 로그인되었습니다!');
    setIsLoggedIn(true);
    if (navigate) {
      navigate('home'); // 로그인 후 홈 화면으로 이동
    }
  };

  return (
    <div style={styles.container}>
      {/* 중앙 로그인 박스 */}
      <div style={styles.box}>
        <h2 style={styles.logo}>FindU</h2>

        <p style={styles.subText}>
          신고하기 및 알림 기능을 사용하려면<br />
          <strong style={{ color: '#111827' }}>학교 구글 계정</strong>으로 로그인해주세요.
        </p>
        
        {/* 구글 로그인 버튼 */}
        <button onClick={handleMockLogin} style={styles.googleButton}>
          {/* 구글 G 로고 아이콘 모방 */}
          <span style={styles.googleIcon}>G</span> 
          Google 계정으로 로그인
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// 2. UI 스타일 정의
// ---------------------------------------------------------
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    minHeight: '60vh',
    fontFamily: "'Pretendard', sans-serif"
  },
  box: {
    width: '100%',
    maxWidth: '400px',
    padding: '40px 32px',
    backgroundColor: '#ffffff',
    border: '1px solid #f3f4f6',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '28px',
    boxSizing: 'border-box'
  },
  logo: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
    letterSpacing: '-0.5px'
  },
  subText: {
    margin: 0,
    textAlign: 'center',
    lineHeight: '1.6',
    color: '#4b5563',
    fontSize: '15px'
  },
  googleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    height: '52px',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
    transition: 'background-color 0.2s, border-color 0.2s'
  },
  googleIcon: {
    fontSize: '18px',
    fontWeight: '900',
    color: '#4285F4',
    backgroundColor: '#f3f4f6',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};