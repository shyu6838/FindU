import React, { useState } from 'react';
import Home from './pages/Home';
import ReportForm from './pages/ReportForm';
import Login from './pages/Login';
import MyPage from './pages/MyPage';
import ItemList from './pages/ItemList';
import PostDetail from './pages/PostDetail'; 
import ChatRoom from './pages/ChatRoom';
import NotificationDropdown from './components/NotificationDropdown'; 

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleNavigate = (page, itemData = null) => {
    if (itemData) {
      setSelectedItem(itemData); 
    }
    setCurrentPage(page); 
  };

  const requireLogin = (page) => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      setCurrentPage('login');
    } else {
      handleNavigate(page);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home changePage={handleNavigate} requireLogin={requireLogin} />;
      
      case 'report':
        return <ReportForm setCurrentPage={handleNavigate} initialType="lost" />;
      
      case 'report-lost':
        return <ReportForm setCurrentPage={handleNavigate} initialType="lost" />;
      
      case 'report-found':
        return <ReportForm setCurrentPage={handleNavigate} initialType="found" />;

      case 'login':
        return <Login setIsLoggedIn={setIsLoggedIn} setCurrentPage={handleNavigate} />;
      
      case 'mypage':
        return <MyPage />;
      
      case 'lost-list':
        return (
          <ItemList 
            mode="lost" 
            onNavigate={handleNavigate} 
            isLoggedIn={isLoggedIn} 
          />
        );
      
      case 'found-list':
        return (
          <ItemList 
            mode="found" 
            onNavigate={handleNavigate} 
            isLoggedIn={isLoggedIn} 
          />
        );

      case 'detail':
        return (
          <PostDetail 
            item={selectedItem} 
            onNavigate={handleNavigate} 
          />
        );

      // 채팅방 라우팅
      case 'chat-room':
        return (
          <ChatRoom 
            changePage={handleNavigate} 
            postInfo={selectedItem} 
          />
        );

      default:
        return <Home changePage={handleNavigate} requireLogin={requireLogin} />;
    }
  };

  // 네비게이션 아이템 스타일
  const navItemStyle = {
    cursor: 'pointer',
    marginLeft: '24px',
    fontWeight: '500',
    color: '#374151',
    fontSize: '15px',
    transition: 'color 0.2s ease',
  };

  // 신고하기 버튼 스타일
  const reportButtonStyle = {
    cursor: 'pointer',
    marginLeft: '24px',
    padding: '9px 18px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '14px',
    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
    transition: 'background-color 0.2s ease',
  };

  return (
    <div style={{ color: '#111827', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: "'Pretendard', sans-serif" }}>
      {/*상단 헤더 / 네비게이션바 */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '16px 36px', 
        borderBottom: '1px solid #e5e7eb', 
        backgroundColor: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <h1 
          style={{ cursor: 'pointer', fontSize: '24px', margin: 0, color: '#111827', fontWeight: 'bold', letterSpacing: '-0.5px' }} 
          onClick={() => handleNavigate('home')}
        >
          FindU
        </h1>
        <nav style={{ display: 'flex', alignItems: 'center' }}>
          <span style={navItemStyle} onClick={() => handleNavigate('home')}>홈</span>
          <span style={navItemStyle} onClick={() => handleNavigate('lost-list')}>분실물 목록</span>
          <span style={navItemStyle} onClick={() => handleNavigate('found-list')}>습득물 목록</span>
          <span style={reportButtonStyle} onClick={() => requireLogin('report')}>신고하기</span>
          
          
<NotificationDropdown onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />          
          <span style={navItemStyle} onClick={() => requireLogin('mypage')}>마이페이지</span>
        </nav>
      </header>

      <main style={{ backgroundColor: '#ffffff' }}>
        {renderPage()}
      </main>
    </div>
  );
};

export default App;