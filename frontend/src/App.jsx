// App.jsx

import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import ReportForm from './pages/ReportForm';
import Login from './pages/Login';
import MyPage from './pages/MyPage';
import ItemList from './pages/ItemList';
import PostDetail from './pages/PostDetail'; 
import ChatRoom from './pages/ChatRoom';
import NotificationDropdown from './components/NotificationDropdown'; 
import OAuthCallback from './pages/OAuthCallback';
import AdminDashboard from './pages/AdminDashboard';
import api from './api/axios';

const App = () => {
  const [currentPage, setCurrentPage] = useState(() => {
    if (window.location.pathname === '/auth/callback' || window.location.pathname === '/oauth/callback') {
      return 'oauth-callback';
    }
    return 'home';
  });
  
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
      api.get('/api/users/me')
        .then(res => {
          if (res.data && (res.data.role === 'ADMIN' || (res.data.auth && res.data.auth.includes('ADMIN')))) {
            setIsAdmin(true);
          }
        })
        .catch(err => console.error('권한 확인 실패:', err));
    }

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

  const handleNavigate = (page, itemData = null) => {
    if (itemData !== null) {
      setSelectedItem(itemData); 
    }
    setCurrentPage(page); 
    window.history.pushState({ page, itemData }, '', `?page=${page}`);
  };

  const requireLogin = (page, itemData = null) => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      handleNavigate('login');
    } else {
      handleNavigate(page, itemData);
    }
  };

  const requireAdmin = (page, itemData = null) => {
    if (!isAdmin) {
      alert("관리자만 접근할 수 있는 메뉴입니다.");
      handleNavigate('home');
    } else {
      handleNavigate(page, itemData);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    api.get('/api/users/me')
      .then(res => {
        if (res.data && (res.data.role === 'ADMIN' || (res.data.auth && res.data.auth.includes('ADMIN')))) {
          setIsAdmin(true);
        }
      })
      .catch(err => console.error('권한 확인 실패:', err));
      
    window.history.replaceState({ page: 'home', itemData: null }, document.title, '/');
    handleNavigate('home');
  };

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
      setIsAdmin(false);
      alert('로그아웃 되었습니다.');
      handleNavigate('home');
    }
  };

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
      case 'admin-dashboard': return <AdminDashboard/>;
      default: return <Home changePage={handleNavigate} requireLogin={requireLogin} />;
    }
  };

  // 💡 현재 페이지에 따라 네비게이션 아이템을 강조하는 함수
  const getNavStyle = (targetPage) => {
    // 현재 페이지이거나 관련된 하위 페이지인 경우(예: report-lost, report-found) 활성화 판단
    const isActive = currentPage === targetPage || (targetPage === 'report' && currentPage.startsWith('report'));
    
    return {
      cursor: 'pointer',
      marginLeft: '24px',
      fontWeight: isActive ? '800' : '500',
      color: isActive ? '#2563eb' : '#374151',
      fontSize: '15px',
      borderBottom: isActive ? '2px solid #2563eb' : 'none',
      paddingBottom: '4px',
      transition: 'all 0.2s ease',
    };
  };

  return (
    <div style={{ color: '#111827', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: "'Pretendard', sans-serif" }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 36px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#ffffff', position: 'sticky', top: 0, zIndex: 100 }}>
        <h1 style={{ cursor: 'pointer', fontSize: '24px', margin: 0, color: '#111827', fontWeight: 'bold', letterSpacing: '-0.5px' }} onClick={() => handleNavigate('home')}>FindU</h1>
        <nav style={{ display: 'flex', alignItems: 'center' }}>
          <span style={getNavStyle('home')} onClick={() => handleNavigate('home')}>홈</span>
          <span style={getNavStyle('lost-list')} onClick={() => handleNavigate('lost-list')}>분실물 목록</span>
          <span style={getNavStyle('found-list')} onClick={() => handleNavigate('found-list')}>습득물 목록</span>
          <span style={getNavStyle('report')} onClick={() => requireLogin('report')}>신고하기</span>
          <NotificationDropdown onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />          
          <span style={getNavStyle('mypage')} onClick={() => requireLogin('mypage')}>마이페이지</span>
          
          {isAdmin && (
            <span style={getNavStyle('admin-dashboard')} onClick={() => requireAdmin('admin-dashboard')}>
              관리
            </span>
          )}

          {isLoggedIn ? (
            <span style={{ cursor: 'pointer', marginLeft: '24px', fontWeight: 'bold', color: '#ef4444', fontSize: '15px' }} onClick={handleLogout}>로그아웃</span>
          ) : (
            <span style={{ cursor: 'pointer', marginLeft: '24px', fontWeight: 'bold', color: '#2563eb', fontSize: '15px' }} onClick={() => handleNavigate('login')}>로그인</span>
          )}
        </nav>
      </header>
      <main style={{ backgroundColor: '#ffffff' }}>{renderPage()}</main>
    </div>
  );
};

export default App;