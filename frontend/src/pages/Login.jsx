import React from 'react';

export default function Login({ setView, setIsLoggedIn }) {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
  };

  const boxStyle = {
    width: '400px',
    padding: '40px',
    backgroundColor: 'white',
    border: '2px solid black',
    borderRadius: '8px',
    boxShadow: '4px 4px 0px black',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '30px',
    color: 'black',
  };

  const googleButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    height: '50px',
    backgroundColor: 'white',
    color: 'black',
    border: '2px solid black',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '2px 2px 0px black',
  };

  // 가짜 로그인 처리 함수
  const handleMockLogin = () => {
    alert('구글 계정으로 로그인되었습니다! (추후 백엔드 OAuth 연동 예정)');
    setIsLoggedIn(true); // 로그인 상태를 true로 변경
    setView('home');     // 로그인 후 홈 화면으로 이동
  };

  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        <p style={{ margin: 0, textAlign: 'center', lineHeight: '1.5' }}>
          신고하기 및 알림 기능을 사용하려면<br />학교 구글 계정으로 로그인해주세요.
        </p>
        
        <button onClick={handleMockLogin} style={googleButtonStyle}>
          <span style={{ fontSize: '20px' }}>G</span> 
          Google 계정으로 로그인
        </button>
      </div>
    </div>
  );
}