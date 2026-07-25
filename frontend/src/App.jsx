import React, { useState } from 'react';
import Home from './pages/Home';
import ReportForm from './pages/ReportForm';
import Login from './pages/Login';
import MyPage from './pages/MyPage';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const requireLogin = (page) => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      setCurrentPage('login');
    } else {
      setCurrentPage(page);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home changePage={setCurrentPage} requireLogin={requireLogin} />;
      case 'report':
        return <ReportForm setCurrentPage={setCurrentPage} />;
      case 'login':
        return <Login setIsLoggedIn={setIsLoggedIn} setCurrentPage={setCurrentPage} />;
      case 'mypage':
        return <MyPage />;
      
      // 분실물 목록
      case 'lost-list':
        return (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: 'black' }}>
            <h2 style={{ color: 'black', fontSize: '28px', fontWeight: 'bold', marginBottom: '15px' }}>분실물 목록</h2>
            <p style={{ color: 'black', fontSize: '16px', fontWeight: '500' }}>추후 등록된 모든 분실물 목록을 보여주는 페이지가 구현될 예정입니다.</p>
          </div>
        );
      
      // 습득물 목록
      case 'found-list':
        return (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: 'black' }}>
            <h2 style={{ color: 'black', fontSize: '28px', fontWeight: 'bold', marginBottom: '15px' }}>습득물 목록</h2>
            <p style={{ color: 'black', fontSize: '16px', fontWeight: '500' }}>추후 등록된 모든 습득물 목록을 보여주는 페이지가 구현될 예정입니다.</p>
          </div>
        );

      default:
        return <Home changePage={setCurrentPage} requireLogin={requireLogin} />;
    }
  };

  const navItemStyle = {
    cursor: 'pointer',
    marginLeft: '20px',
    fontWeight: '500',
    color: 'black'
  };

  const reportButtonStyle = {
    cursor: 'pointer',
    marginLeft: '20px',
    padding: '8px 16px',
    backgroundColor: '#fff',
    color: '#000',
    border: '2px solid #000',
    borderRadius: '4px',
    fontWeight: 'bold',
    boxShadow: '2px 2px 0px #000'
  };

  return (
    <div style={{ color: 'black', backgroundColor: 'white', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', borderBottom: '1px solid #eee', backgroundColor: 'white' }}>
        <h1 
          style={{ cursor: 'pointer', fontSize: '24px', margin: 0, color: 'black', fontWeight: 'bold' }} 
          onClick={() => setCurrentPage('home')}
        >
          FindU
        </h1>
        <nav style={{ display: 'flex', alignItems: 'center' }}>
          <span style={navItemStyle} onClick={() => setCurrentPage('home')}>홈</span>
          <span style={navItemStyle} onClick={() => setCurrentPage('lost-list')}>분실물 목록</span>
          <span style={navItemStyle} onClick={() => setCurrentPage('found-list')}>습득물 목록</span>
          <span style={reportButtonStyle} onClick={() => requireLogin('report')}>신고하기</span>
          <span style={navItemStyle} onClick={() => alert('실시간 알림 기능은 준비 중입니다. (추후 드롭다운 구현 예정)')}>알림</span>
          <span style={navItemStyle} onClick={() => requireLogin('mypage')}>마이페이지</span>
        </nav>
      </header>

      {/* 메인 영역 */}
      <main style={{ backgroundColor: 'white' }}>
        {renderPage()}
      </main>
    </div>
  );
};

export default App;