import React from 'react';

/**
 * [MyPage.jsx]
 * 사용자의 개인 활동 내역을 한눈에 볼 수 있는 마이페이지 컴포넌트입니다.
 * - 주요 역할: 사용자 신뢰도(온도), 활동 통계(찾아준 물품, 후기) 및 내 게시글, 채팅, 알림 목록 제공
 * - 레이아웃: 2열 3행 (2x3) Grid 구조를 사용합니다.
 */

// ---------------------------------------------------------
// 1. 임시 더미 데이터
// ---------------------------------------------------------
const MOCK_DATA = {
  posts: [
    '[분실] 도서관에서 지갑 잃어버렸어요',
    '[습득] 학생회관 앞 에어팟 케이스',
    '[분실] 파란색 전공 서적 찾습니다'
  ],
  chats: [
    { sender: '놀란늑대', message: '학생회관 에어팟 주인입니다!' },
    { sender: '잠자는거북이', message: '지갑 색상이 어떻게 되나요?' }
  ],
  notifications: [
    '🔔 내 게시글과 유사한 습득물이 등록되었습니다.',
    "💬 '도서관 지갑' 게시글에서 새로운 채팅이 왔습니다."
  ]
};

// ---------------------------------------------------------
// 2. 메인 컴포넌트
// ---------------------------------------------------------
const MyPage = () => {
  return (
    <div style={styles.page}>
      <div style={styles.title}>마이페이지</div>

      {/* 2x3 Grid 배치 영역 컨테이너 */}
      <div style={styles.gridContainer}>
        
        {/* ================= Row 1 : 상단 3개 요약 카드 ================= */}
        
        {/* 1. 내 온도 (사용자 신뢰도 지표) */}
        <div style={styles.topCard}>
          <div style={styles.cardTitle}>내 온도</div>
          <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '20px' }}>36.5°C</div>
          <div style={styles.tempBar}>
            <div style={styles.tempFill}></div>
          </div>
        </div>

        {/* 2. 찾아준 물품 통계 */}
        <div style={styles.topCard}>
          <div style={styles.cardTitle}>찾아준 물품 7개</div>
          <p style={styles.subText}>최근 찾아준 물품: 검은색 가죽 지갑</p>
        </div>

        {/* 3. 받은 후기 요약 */}
        <div style={styles.topCard}>
          <div style={styles.cardTitle}>받은 후기 5개</div>
          <p style={styles.subText}>"정말 감사합니다!" 외 4건</p>
        </div>

        {/* ================= Row 2 : 하단 3개 리스트 카드 ================= */}
        
        {/* 4. 내 게시글 목록 */}
        <div style={styles.bottomCard}>
          <div style={styles.listTitle}>내 게시글</div>
          <ul style={styles.listContainer}>
            {MOCK_DATA.posts.map((post, index) => (
              <li key={index} style={styles.listItem}>{post}</li>
            ))}
          </ul>
        </div>

        {/* 5. 채팅 목록 */}
        <div style={styles.bottomCard}>
          <div style={styles.listTitle}>채팅 목록</div>
          <ul style={styles.listContainer}>
            {MOCK_DATA.chats.map((chat, index) => (
              <li key={index} style={styles.listItem}>
                <strong>{chat.sender}</strong> : {chat.message}
              </li>
            ))}
          </ul>
        </div>

        {/* 6. 알림 목록 */}
        <div style={styles.bottomCard}>
          <div style={styles.listTitle}>알림 목록</div>
          <ul style={styles.listContainer}>
            {MOCK_DATA.notifications.map((noti, index) => (
              <li key={index} style={styles.listItem}>{noti}</li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

// ---------------------------------------------------------
// 3. UI 스타일 정의
// ---------------------------------------------------------
const styles = {
  page: { padding: '40px 20px', maxWidth: '1100px', margin: '0 auto', color: '#1f2937', fontFamily: "'Pretendard', sans-serif" },
  title: { fontSize: '28px', fontWeight: 'bold', marginBottom: '30px', color: '#111827' },
  
  // Grid 컨테이너 설정 (3열씩 동일 비율)
  gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' },
  
  topCard: { backgroundColor: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #f3f4f6', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '140px' },
  bottomCard: { backgroundColor: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #f3f4f6', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', minHeight: '320px', display: 'flex', flexDirection: 'column' },
  
  cardTitle: { fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' },
  subText: { margin: 0, color: '#6b7280', fontSize: '14px' },
  
  listTitle: { fontSize: '18px', fontWeight: 'bold', color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '16px' },
  listContainer: { listStyle: 'none', padding: 0, margin: 0 },
  listItem: { padding: '12px 0', borderBottom: '1px solid #f9fafb', color: '#4b5563', fontSize: '14.5px', cursor: 'pointer', lineHeight: '1.4' },
  
  // 온도 바 스타일
  tempBar: { width: '100%', height: '14px', backgroundColor: '#f3f4f6', borderRadius: '10px', marginTop: '12px', overflow: 'hidden' },
  tempFill: { width: '65%', height: '100%', backgroundColor: '#f97316', borderRadius: '10px' }
};

export default MyPage;