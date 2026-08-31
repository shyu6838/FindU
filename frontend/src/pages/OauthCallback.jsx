import { useEffect, useRef } from 'react';

export default function OAuthCallback({
    setIsLoggedIn,
    setCurrentPage,
}) {
    const processed = useRef(false);

    useEffect(() => {

        // 이미 처리했다면 다시 실행하지 않음
        if (processed.current) {
            return;
        }

        processed.current = true;

        const params = new URLSearchParams(
            window.location.search
        );

        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');
        const userId = params.get('userId');
        const email = params.get('email');

        console.log(
            'OAuthCallback accessToken:',
            accessToken
        );

        console.log(
            'OAuthCallback refreshToken:',
            refreshToken
        );

        console.log(
            'OAuthCallback userId:',
            userId
        );

        console.log(
            'OAuthCallback email:',
            email
        );

        // 토큰이 없는 경우
        if (!accessToken || !refreshToken) {

            // 이미 로그인 정보가 있다면
            // 로그인 실패로 처리하지 않고 홈으로 이동
            const savedAccessToken =
                localStorage.getItem('accessToken');

            if (savedAccessToken) {
                setIsLoggedIn(true);
                setCurrentPage('home');
                return;
            }

            alert('로그인에 실패했습니다.');
            setCurrentPage('login');
            return;
        }

        // Access Token 저장
        localStorage.setItem(
            'accessToken',
            accessToken
        );

        // Refresh Token 저장
        localStorage.setItem(
            'refreshToken',
            refreshToken
        );

        // User ID 저장
        if (userId) {
            localStorage.setItem(
                'userId',
                userId
            );
        }

        // 사용자 정보 저장
        localStorage.setItem(
            'user',
            JSON.stringify({
                userId,
                email,
            })
        );

        // 로그인 상태 변경
        setIsLoggedIn(true);

        // URL에서 토큰 제거
        window.history.replaceState(
            {},
            document.title,
            '/'
        );

        // 홈으로 이동
        setCurrentPage('home');

    }, [setIsLoggedIn, setCurrentPage]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                fontFamily: "'Pretendard', sans-serif"
            }}
        >
            <h2>로그인 처리 중...</h2>
            <p>잠시만 기다려주세요.</p>
        </div>
    );
}
