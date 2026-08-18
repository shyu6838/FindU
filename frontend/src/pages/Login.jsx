import React from 'react';

export default function Login() {

    const handleGoogleLogin = () => {
        window.location.href =
            `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`;
    };

    return (
        <div style={styles.container}>
            <div style={styles.box}>

                <h2 style={styles.logo}>
                    FindU
                </h2>

                <p style={styles.subText}>
                    신고하기 및 알림 기능을 사용하려면<br />
                    <strong style={{ color: '#111827' }}>
                        학교 구글 계정
                    </strong>
                    으로 로그인해주세요.
                </p>

                <button
                    onClick={handleGoogleLogin}
                    style={styles.googleButton}
                >
                    <span style={styles.googleIcon}>
                        G
                    </span>

                    Google 계정으로 로그인
                </button>

            </div>
        </div>
    );
}

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
        margin: 0
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
        cursor: 'pointer'
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