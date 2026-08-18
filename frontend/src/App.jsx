import React, { useState } from 'react';

import Home from './pages/Home';
import ReportForm from './pages/ReportForm';
import Login from './pages/Login';
import OAuthCallback from './pages/OAuthCallback';
import MyPage from './pages/MyPage';
import ItemList from './pages/ItemList';
import PostDetail from './pages/PostDetail';
import ChatRoom from './pages/ChatRoom';
import NotificationDropdown from './components/NotificationDropdown';

const App = () => {

    /*
     * OAuth 로그인 성공 후
     *
     * http://localhost:5173/auth/callback
     *
     * 으로 돌아오기 때문에
     * 처음 App이 실행될 때 현재 URL을 확인한다.
     */
    const [currentPage, setCurrentPage] = useState(() => {

        if (window.location.pathname === '/auth/callback') {
            return 'auth-callback';
        }

        return 'home';
    });

    /*
     * localStorage에 accessToken이 있으면
     * 로그인된 상태로 판단
     */
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem('accessToken')
    );

    const [selectedItem, setSelectedItem] = useState(null);

    /*
     * 페이지 이동
     */
    const handleNavigate = (
        page,
        itemData = null
    ) => {

        if (itemData) {
            setSelectedItem(itemData);
        }

        setCurrentPage(page);
    };

    /*
     * 로그인이 필요한 페이지 접근 처리
     */
    const requireLogin = (page) => {

        const token =
            localStorage.getItem('accessToken');

        if (!token) {

            alert(
                '로그인이 필요한 서비스입니다.'
            );

            setCurrentPage('login');

            return;
        }

        handleNavigate(page);
    };

    /*
     * 로그아웃
     *
     * 현재는 프론트에서 토큰 제거만 처리
     */
    const handleLogout = async () => {
        const accessToken = localStorage.getItem('accessToken');

        try {
            if (accessToken) {
                await fetch(
                    `${import.meta.env.VITE_API_URL}/api/auth/logout`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );
            }
        } catch (error) {
            console.error('로그아웃 API 호출 실패:', error);
        } finally {
            // 프론트 인증 정보 삭제
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('userId');

            // 로그인 상태 변경
            setIsLoggedIn(false);

            // 홈으로 이동
            setCurrentPage('home');
            setSelectedItem(null);
        }
    };

    const logoutButtonStyle = {
        cursor: 'pointer',
        marginLeft: '24px',
        fontWeight: '500',
        color: '#dc2626',
        fontSize: '15px',
    };

    /*
     * 현재 페이지에 맞는 컴포넌트 렌더링
     */
    const renderPage = () => {

        switch (currentPage) {

            case 'home':

                return (
                    <Home
                        changePage={handleNavigate}
                        requireLogin={requireLogin}
                    />
                );


            case 'report':

                return (
                    <ReportForm
                        setCurrentPage={
                            handleNavigate
                        }
                        initialType="lost"
                    />
                );


            case 'report-lost':

                return (
                    <ReportForm
                        setCurrentPage={
                            handleNavigate
                        }
                        initialType="lost"
                    />
                );


            case 'report-found':

                return (
                    <ReportForm
                        setCurrentPage={
                            handleNavigate
                        }
                        initialType="found"
                    />
                );


            case 'login':

                return (
                    <Login
                        setIsLoggedIn={
                            setIsLoggedIn
                        }
                        setCurrentPage={
                            handleNavigate
                        }
                    />
                );


            /*
             * Google OAuth 로그인 성공 후
             * React가 토큰을 처리하는 페이지
             */
            case 'auth-callback':

                return (
                    <OAuthCallback
                        setIsLoggedIn={
                            setIsLoggedIn
                        }
                        setCurrentPage={
                            handleNavigate
                        }
                    />
                );


            case 'mypage':

                return (
                    <MyPage />
                );


            case 'lost-list':

                return (
                    <ItemList
                        mode="lost"
                        onNavigate={
                            handleNavigate
                        }
                        isLoggedIn={
                            isLoggedIn
                        }
                    />
                );


            case 'found-list':

                return (
                    <ItemList
                        mode="found"
                        onNavigate={
                            handleNavigate
                        }
                        isLoggedIn={
                            isLoggedIn
                        }
                    />
                );


            case 'detail':

                return (
                    <PostDetail
                        item={selectedItem}
                        onNavigate={
                            handleNavigate
                        }
                    />
                );


            case 'chat-room':

                return (
                    <ChatRoom
                        changePage={
                            handleNavigate
                        }
                        postInfo={
                            selectedItem
                        }
                    />
                );


            default:

                return (
                    <Home
                        changePage={
                            handleNavigate
                        }
                        requireLogin={
                            requireLogin
                        }
                    />
                );
        }
    };


    /*
     * 네비게이션 스타일
     */
    const navItemStyle = {
        cursor: 'pointer',
        marginLeft: '24px',
        fontWeight: '500',
        color: '#374151',
        fontSize: '15px',
        transition: 'color 0.2s ease',
    };


    /*
     * 신고하기 버튼 스타일
     */
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
        boxShadow:
            '0 2px 6px rgba(37, 99, 235, 0.25)',
        transition:
            'background-color 0.2s ease',
    };


    return (
        <div
            style={{
                color: '#111827',
                backgroundColor: '#ffffff',
                minHeight: '100vh',
                fontFamily:
                    "'Pretendard', sans-serif"
            }}
        >

            {/* 상단 헤더 / 네비게이션 */}
            <header
                style={{
                    display: 'flex',
                    justifyContent:
                        'space-between',
                    alignItems: 'center',
                    padding: '16px 36px',
                    borderBottom:
                        '1px solid #e5e7eb',
                    backgroundColor:
                        '#ffffff',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100
                }}
            >

                <h1
                    style={{
                        cursor: 'pointer',
                        fontSize: '24px',
                        margin: 0,
                        color: '#111827',
                        fontWeight: 'bold',
                        letterSpacing:
                            '-0.5px'
                    }}
                    onClick={() =>
                        handleNavigate('home')
                    }
                >
                    FindU
                </h1>


                <nav
                    style={{
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >

                    <span
                        style={navItemStyle}
                        onClick={() =>
                            handleNavigate('home')
                        }
                    >
                        홈
                    </span>


                    <span
                        style={navItemStyle}
                        onClick={() =>
                            handleNavigate(
                                'lost-list'
                            )
                        }
                    >
                        분실물 목록
                    </span>


                    <span
                        style={navItemStyle}
                        onClick={() =>
                            handleNavigate(
                                'found-list'
                            )
                        }
                    >
                        습득물 목록
                    </span>


                    <span
                        style={reportButtonStyle}
                        onClick={() =>
                            requireLogin(
                                'report'
                            )
                        }
                    >
                        신고하기
                    </span>


                    <NotificationDropdown
                        onNavigate={
                            handleNavigate
                        }
                        isLoggedIn={
                            isLoggedIn
                        }
                    />


                    <span
                        style={navItemStyle}
                        onClick={() =>
                            requireLogin(
                                'mypage'
                            )
                        }
                    >
                        마이페이지
                    </span>
                    {isLoggedIn && (
                        <span
                            style={logoutButtonStyle}
                            onClick={handleLogout}
                        >
        로그아웃
    </span>
                    )}

                </nav>

            </header>


            <main
                style={{
                    backgroundColor:
                        '#ffffff'
                }}
            >
                {renderPage()}
            </main>

        </div>
    );
};

export default App;