import { useState, useEffect } from 'react';

import Home from './pages/Home';
import ReportForm from './pages/ReportForm';
import Login from './pages/Login';
import OAuthCallback from './pages/OAuthCallback';
import MyPage from './pages/MyPage';
import ItemList from './pages/ItemList';
import PostDetail from './pages/PostDetail';
import ChatRoom from './pages/ChatRoom';
import NotificationDropdown from './components/NotificationDropdown';
import api from './api/axios';

// 최상위 라우팅 및 상태 관리 컴포넌트
const App = () => {
  const [currentPage, setCurrentPage] = useState(() => {
    if (window.location.pathname === '/auth/callback' || window.location.pathname === '/oauth/callback') {
      return 'oauth-callback';
    }
    return 'home';
  });
  
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));
  const [selectedItem, setSelectedItem] = useState(null);

  // 로그인 상태 및 브라우저 히스토리 초기화 처리
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) setIsLoggedIn(true);

    const params = new URLSearchParams(window.location.search);
    if (params.get('token') || params.get('accessToken') || window.location.pathname === '/auth/callback') {
      setCurrentPage('oauth-callback');
    }

    const handlePopState = (event) => {
      if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
        setSelectedItem(event.state.itemData || null);
      } else {
        setCurrentPage('home');
        setSelectedItem(null);
      }
    };
    
    window.addEventListener('popstate', handlePopState);

    if (!params.get('token') && !params.get('accessToken') && window.location.pathname !== '/auth/callback') {
      window.history.replaceState({ page: 'home', itemData: null }, '', window.location.pathname);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 페이지 전환 처리 및 히스토리 푸시
  const handleNavigate = (page, itemData = null) => {
    if (itemData !== null) {
      setSelectedItem(itemData); 
    }
    setCurrentPage(page); 
    
    window.history.pushState({ page, itemData }, '', `?page=${page}`);
  };

  // 로그인 권한 검증 라우팅 가드
  const requireLogin = (page, itemData = null) => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      handleNavigate('login');
    } else {
      handleNavigate(page, itemData);
    }
  };

  // 로그인 성공 콜백 핸들러
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    window.history.replaceState({ page: 'home', itemData: null }, document.title, '/');
    handleNavigate('home');
  };

  // 로그아웃 처리 핸들러 (API 호출 및 프론트엔드 상태 초기화 통합)
  const handleLogout = async () => {
    try {
      if (localStorage.getItem('accessToken')) {
        await api.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');

      setIsLoggedIn(false);
      alert('로그아웃 되었습니다.');
      handleNavigate('home');
    }
  };

  // 현재 상태에 따른 페이지 컴포넌트 렌더링
  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home changePage={handleNavigate} requireLogin={requireLogin} />;
      case 'report':
      case 'report-lost': return <ReportForm setCurrentPage={handleNavigate} initialType="lost" />;
      case 'report-found': return <ReportForm setCurrentPage={handleNavigate} initialType="found" />;
      case 'login': return <Login setIsLoggedIn={setIsLoggedIn} setCurrentPage={handleNavigate} />;
      case 'oauth-callback':
      case 'auth-callback': return <OAuthCallback onLoginSuccess={handleLoginSuccess} setIsLoggedIn={setIsLoggedIn} setCurrentPage={handleNavigate} />;
      case 'mypage': return <MyPage onNavigate={handleNavigate} />;
      case 'lost-list': return <ItemList mode="lost" onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />;
      case 'found-list': return <ItemList mode="found" onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />;
      case 'post-detail':
      case 'detail':
        return <PostDetail itemId={typeof selectedItem === 'object' ? selectedItem?.id : selectedItem} onNavigate={handleNavigate} />;
      case 'edit-item': return <ReportForm setCurrentPage={handleNavigate} editData={selectedItem} />;
      case 'chat-room': return <ChatRoom changePage={handleNavigate} postInfo={selectedItem} />;
      default: return <Home changePage={handleNavigate} requireLogin={requireLogin} />;
    }
  };

  // 공통 스타일 정의
  const navItemStyle = { cursor: 'pointer', marginLeft: '24px', fontWeight: '500', color: '#374151', fontSize: '15px', transition: 'color 0.2s ease' };
  const reportButtonStyle = { cursor: 'pointer', marginLeft: '24px', padding: '9px 18px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)', transition: 'background-color 0.2s ease' };

  return (
    <div style={{ color: '#111827', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: "'Pretendard', sans-serif" }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 36px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#ffffff', position: 'sticky', top: 0, zIndex: 100 }}>
        <h1 style={{ cursor: 'pointer', fontSize: '24px', margin: 0, color: '#111827', fontWeight: 'bold', letterSpacing: '-0.5px' }} onClick={() => handleNavigate('home')}>FindU</h1>
        <nav style={{ display: 'flex', alignItems: 'center' }}>
          <span style={navItemStyle} onClick={() => handleNavigate('home')}>홈</span>
          <span style={navItemStyle} onClick={() => handleNavigate('lost-list')}>분실물 목록</span>
          <span style={navItemStyle} onClick={() => handleNavigate('found-list')}>습득물 목록</span>
          <span style={reportButtonStyle} onClick={() => requireLogin('report')}>신고하기</span>
          <NotificationDropdown onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />          
          <span style={navItemStyle} onClick={() => requireLogin('mypage')}>마이페이지</span>
          {isLoggedIn ? (
            <span style={{ ...navItemStyle, color: '#ef4444', fontWeight: 'bold' }} onClick={handleLogout}>로그아웃</span>
          ) : (
            <span style={{ ...navItemStyle, color: '#2563eb', fontWeight: 'bold' }} onClick={() => handleNavigate('login')}>로그인</span>
          )}
        </nav>
      </header>
      <main style={{ backgroundColor: '#ffffff' }}>{renderPage()}</main>
    </div>
  );
};

export default App;
