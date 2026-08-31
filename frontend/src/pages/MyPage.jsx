import { useEffect, useState } from 'react';
import api from '../api/axios';

const MyPage = ({ onNavigate }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [myPosts, setMyPosts] = useState([]); 
  const [chatRooms, setChatRooms] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reviews, setReviews] = useState([]);
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

        const [roomsRes, notificationsRes, reviewsRes] = await Promise.all([
          api.get('/api/chat-rooms'),
          api.get('/api/notifications'),
          user?.id ? api.get(`/api/reviews/users/${user.id}`) : Promise.resolve({ data: [] }),
        ]);

        setChatRooms(roomsRes.data || []);
        setNotifications(notificationsRes.data || []);
        setReviews(reviewsRes.data || []);

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
  const resolvedCount = myPosts.filter(post => post.status === 'RESOLVED').length;

  const getPartnerName = (room) => {
    if (!userInfo?.id) return '상대방';
    return room.user1Id === userInfo.id ? room.user2Nickname : room.user1Nickname;
  };

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
          <div style={styles.cardTitle}>완료된 게시글 {resolvedCount}개</div>
          <p style={styles.subText}>내가 완료 처리한 분실/습득 내역입니다.</p>
        </div>

        {/* 활동 통계 (받은 후기) */}
        <div style={styles.topCard}>
          <div style={styles.cardTitle}>받은 후기 {reviews.length}개</div>
          <p style={styles.subText}>{reviews[0]?.comment || '아직 받은 후기가 없습니다.'}</p>
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
          <div style={styles.listTitle}>채팅 목록 ({chatRooms.length})</div>
          <ul style={styles.listContainer}>
            {chatRooms.length === 0 ? (
              <li style={{ ...styles.listItem, cursor: 'default', color: '#9ca3af' }}>참여 중인 채팅방이 없습니다.</li>
            ) : chatRooms.map((room) => (
              <li key={room.id} style={styles.listItem} onClick={() => onNavigate && onNavigate('chat-room', room)}>
                <strong>{getPartnerName(room)}</strong>님과의 대화
              </li>
            ))}
          </ul>
        </div>

        {/* 알림 목록 */}
        <div style={styles.bottomCard}>
          <div style={styles.listTitle}>알림 목록 ({notifications.length})</div>
          <ul style={styles.listContainer}>
            {notifications.length === 0 ? (
              <li style={{ ...styles.listItem, cursor: 'default', color: '#9ca3af' }}>새 알림이 없습니다.</li>
            ) : notifications.map((noti) => (
              <li key={noti.id} style={styles.listItem}>
                {noti.message}
              </li>
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
