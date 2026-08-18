import React, { useEffect, useState } from 'react';
import api from '../api/axios';

// 임시 데이터 (채팅, 알림)
const MOCK_DATA = {
  chats: [
    { sender: '놀란늑대', message: '학생회관 에어팟 주인입니다!' },
    { sender: '잠자는거북이', message: '지갑 색상이 어떻게 되나요?' }
  ],
  notifications: [
    '🔔 내 게시글과 유사한 습득물이 등록되었습니다.',
    "💬 '도서관 지갑' 게시글에서 새로운 채팅이 왔습니다."
  ]
};

const MyPage = ({ onNavigate }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [myPosts, setMyPosts] = useState([]); 
  const [loading, setLoading] = useState(true);

  // 사용자 정보 및 본인 게시글 데이터 로드
  useEffect(() => {
    const fetchMyPageData = async () => {
      try {
        const userRes = await api.get('/api/users/me');
        const user = userRes.data;
        setUserInfo(user);

        const itemsRes = await api.get('/api/items');
        const allItems = itemsRes.data || [];

        // 로그인한 사용자 본인의 게시글만 필터링
        if (user && user.email) {
          const filteredPosts = allItems.filter(item => item.writerEmail === user.email);
          setMyPosts(filteredPosts);
        }

      } catch (err) {
        console.error('마이페이지 데이터 로드 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPageData();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', fontFamily: "'Pretendard', sans-serif" }}>내 정보 불러오는 중...</div>;

  const user = userInfo || { nickname: '정보 없음', email: '로그인이 필요합니다', trustScore: 0, profileImage: null };

  return (
    <div style={styles.page}>
      <div style={styles.title}>마이페이지</div>

      <div style={styles.gridContainer}>
        {/* 내 정보 요약 */}
        <div style={styles.topCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={styles.avatarStyle}>
              {user.profileImage ? <img src={user.profileImage} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : '👤'}
            </div>
            <div>
              <div style={styles.cardTitle}>{user.nickname}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>{user.email}</div>
            </div>
          </div>
          <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '20px' }}>🔥 {user.trustScore}°C</div>
          <div style={styles.tempBar}>
            <div style={{ ...styles.tempFill, width: `${Math.min(user.trustScore, 100)}%` }}></div>
          </div>
        </div>

        {/* 활동 통계 (찾아준 물품) */}
        <div style={styles.topCard}>
          <div style={styles.cardTitle}>찾아준 물품 7개</div>
          <p style={styles.subText}>최근 찾아준 물품: 검은색 가죽 지갑</p>
        </div>

        {/* 활동 통계 (받은 후기) */}
        <div style={styles.topCard}>
          <div style={styles.cardTitle}>받은 후기 5개</div>
          <p style={styles.subText}>"정말 감사합니다!" 외 4건</p>
        </div>

        {/* 내 게시글 목록 */}
        <div style={styles.bottomCard}>
          <div style={styles.listTitle}>내 게시글 ({myPosts.length})</div>
          <ul style={styles.listContainer}>
            {myPosts.length === 0 ? (
              <li style={{ ...styles.listItem, cursor: 'default', color: '#9ca3af' }}>작성한 게시글이 없습니다.</li>
            ) : (
              myPosts.map((post) => (
                <li key={post.id} style={styles.listItem} onClick={() => onNavigate && onNavigate('post-detail', post.id)}>
                  [{post.type === 'LOST' ? '분실' : '습득'}] {post.title}
                </li>
              ))
            )}
          </ul>
        </div>

        {/* 채팅 목록 */}
        <div style={styles.bottomCard}>
          <div style={styles.listTitle}>채팅 목록</div>
          <ul style={styles.listContainer}>
            {MOCK_DATA.chats.map((chat, index) => (
              <li key={index} style={styles.listItem}><strong>{chat.sender}</strong> : {chat.message}</li>
            ))}
          </ul>
        </div>

        {/* 알림 목록 */}
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

const styles = {
  page: { padding: '40px 20px', maxWidth: '1100px', margin: '0 auto', color: '#1f2937', fontFamily: "'Pretendard', sans-serif" },
  title: { fontSize: '28px', fontWeight: 'bold', marginBottom: '30px', color: '#111827' },
  gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' },
  topCard: { backgroundColor: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #f3f4f6', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '140px' },
  bottomCard: { backgroundColor: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #f3f4f6', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', minHeight: '320px', display: 'flex', flexDirection: 'column' },
  cardTitle: { fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' },
  subText: { margin: 0, color: '#6b7280', fontSize: '14px' },
  listTitle: { fontSize: '18px', fontWeight: 'bold', color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '16px' },
  listContainer: { listStyle: 'none', padding: 0, margin: 0 },
  listItem: { padding: '12px 0', borderBottom: '1px solid #f9fafb', color: '#4b5563', fontSize: '14.5px', cursor: 'pointer', lineHeight: '1.4' },
  tempBar: { width: '100%', height: '14px', backgroundColor: '#f3f4f6', borderRadius: '10px', marginTop: '12px', overflow: 'hidden' },
  tempFill: { height: '100%', backgroundColor: '#f97316', borderRadius: '10px', transition: 'width 0.5s ease' },
  avatarStyle: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }
};

export default MyPage;