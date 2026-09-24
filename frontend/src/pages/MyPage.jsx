// Mypage.jsx
// 사용자 마이페이지 화면 및 활동 내역(게시글, 채팅, 알림, 후기) 조회 컴포넌트

import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import ProfileEditModal from '../components/ProfileEditModal';

const MyPage = ({ onNavigate }) => {
  // 상태 관리
  const [userInfo, setUserInfo] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

  // 마이페이지 전체 데이터 조회 (사용자 정보, 게시글, 채팅방, 알림, 후기)
  const fetchMyPageData = useCallback(async () => {
    try {
      const userRes = await api.get('/api/users/me');
      const user = userRes.data;
      setUserInfo(user);

      const itemsRes = await api.get('/api/items');
      const allItems = itemsRes.data || [];

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
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    fetchMyPageData();
  }, [fetchMyPageData]);

  // 로딩 상태 처리
  if (loading) return <div style={styles.loading}>내 정보 불러오는 중...</div>;

  // 사용자 정보 및 게시글 상태별 분류
  const user = userInfo || { nickname: '정보 없음', email: '로그인이 필요합니다', trustScore: 0, profileImage: null };
  const activePosts = myPosts.filter(post => post.status !== 'RESOLVED');
  const resolvedPosts = myPosts.filter(post => post.status === 'RESOLVED');

  // 채팅 상대방 닉네임 추출
  const getPartnerName = (room) => {
    if (!userInfo?.id) return '상대방';
    return room.user1Id === userInfo.id ? room.user2Nickname : room.user1Nickname;
  };

  // 상세 페이지 및 채팅방 이동 핸들러
  const handleCardClick = (id) => {
    setModalType(null);
    if (onNavigate) onNavigate('post-detail', id);
  };

  const handleChatClick = (room) => {
    setModalType(null);
    if (onNavigate) onNavigate('chat-room', room);
  };

  // 카테고리별 전체보기 모달 렌더링
  const renderModal = () => {
    if (!modalType) return null;

    let title = '';
    let content = null;

    switch (modalType) {
      case 'ACTIVE_POSTS':
      case 'RESOLVED_POSTS':
        const targetPosts = modalType === 'ACTIVE_POSTS' ? activePosts : resolvedPosts;
        title = modalType === 'ACTIVE_POSTS' ? '내 전체 게시글' : '완료된 게시글';
        content = targetPosts.length === 0 ? (
          <div style={styles.emptyText}>게시글이 없습니다.</div>
        ) : (
          <div style={styles.modalGrid}>
            {targetPosts.map(post => (
              <div key={post.id} style={styles.modalCard} onClick={() => handleCardClick(post.id)}>
                <div style={styles.modalImageWrapper}>
                  <img src={post.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"} alt="미리보기" style={styles.modalImage} />
                  <span style={{ ...styles.badge, backgroundColor: post.type === 'LOST' ? '#ef4444' : '#10b981' }}>
                    {post.type === 'LOST' ? '분실' : '습득'}
                  </span>
                </div>
                <div style={styles.modalCardContent}>
                  <div style={styles.modalCardTitle}>{post.title}</div>
                  <div style={styles.modalCardDesc}>{post.location || '장소 미상'}</div>
                </div>
              </div>
            ))}
          </div>
        );
        break;
      case 'CHATS':
        title = '전체 채팅 목록';
        content = chatRooms.length === 0 ? (
          <div style={styles.emptyText}>참여 중인 채팅방이 없습니다.</div>
        ) : (
          <ul style={styles.modalListContainer}>
            {chatRooms.map(room => (
              <li key={room.id} style={styles.modalListItem} onClick={() => handleChatClick(room)}>
                <div style={{ fontWeight: 'bold', color: '#111827' }}>
                  [{room.itemType === 'LOST' ? '분실' : room.itemType === 'FOUND' ? '습득' : '알림'}] {getPartnerName(room)}님과의 대화
                </div>
                <div style={styles.modalCardDesc}>{room.itemTitle ? `관련 물품: ${room.itemTitle}` : '대화방'}</div>
              </li>
            ))}
          </ul>
        );
        break;
      case 'NOTIFICATIONS':
        title = '전체 알림 목록';
        content = notifications.length === 0 ? (
          <div style={styles.emptyText}>새 알림이 없습니다.</div>
        ) : (
          <ul style={styles.modalListContainer}>
            {notifications.map(noti => (
              <li key={noti.id} style={styles.modalListItem}>
                {noti.message}
              </li>
            ))}
          </ul>
        );
        break;
      case 'REVIEWS':
        title = '받은 후기 목록';
        content = reviews.length === 0 ? (
          <div style={styles.emptyText}>아직 받은 후기가 없습니다.</div>
        ) : (
          <ul style={styles.modalListContainer}>
            {reviews.map(review => (
              <li key={review.id} style={styles.modalListItem}>
                "{review.comment}"
              </li>
            ))}
          </ul>
        );
        break;
      default:
        return null;
    }

    return (
      <div style={styles.modalOverlay} onClick={() => setModalType(null)}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <h3 style={styles.modalTitleText}>{title}</h3>
            <button style={styles.closeBtn} onClick={() => setModalType(null)}>✕</button>
          </div>
          {content}
        </div>
      </div>
    );
  };

  // 요약 카드용 미리보기 리스트 렌더링 (최대 3개 노출)
  const renderPostPreviews = (posts) => {
    if (posts.length === 0) {
      return <li style={{ ...styles.listItem, cursor: 'default', color: '#9ca3af' }}>게시글이 없습니다.</li>;
    }
    return posts.slice(0, 3).map((post) => (
      <li key={post.id} style={styles.postPreviewItem} onClick={() => handleCardClick(post.id)}>
        <div style={styles.thumbnailWrapper}>
          <img src={post.imageUrl || "https://via.placeholder.com/150?text=No+Image"} alt="썸네일" style={styles.thumbnailImage} />
          <span style={{ ...styles.tinyBadge, backgroundColor: post.type === 'LOST' ? '#ef4444' : '#10b981' }}>
            {post.type === 'LOST' ? '분실' : '습득'}
          </span>
        </div>
        <div style={styles.previewTitle}>{post.title}</div>
      </li>
    ));
  };

  return (
    <div style={styles.page}>
      <div style={styles.title}>마이페이지</div>

      <div style={styles.gridContainer}>
        {/* 내 정보 요약 카드 */}
        <div style={styles.cardBox}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={styles.avatarStyle}>
              {user.profileImage ? <img src={user.profileImage} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : '👤'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={styles.cardTitle}>{user.nickname}</div>
                <button style={styles.editIconBtn} onClick={() => setIsProfileEditOpen(true)} title="내 정보 수정">⚙️</button>
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>{user.email}</div>
            </div>
          </div>
          <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '20px' }}>{user.trustScore}°C</div>
          <div style={styles.tempBar}>
            <div style={{ ...styles.tempFill, width: `${Math.min(user.trustScore, 100)}%` }}></div>
          </div>
        </div>

        {/* 내 게시글 (진행중) 카드 */}
        <div style={styles.cardBox}>
          <div style={styles.listHeader} onClick={() => setModalType('ACTIVE_POSTS')}>
            <div style={styles.listTitle}>내 게시글 ({activePosts.length})</div>
            <span style={styles.viewAllBtn}>전체보기 &gt;</span>
          </div>
          <ul style={styles.listContainer}>
            {renderPostPreviews(activePosts)}
          </ul>
        </div>

        {/* 완료된 게시글 카드 */}
        <div style={styles.cardBox}>
          <div style={styles.listHeader} onClick={() => setModalType('RESOLVED_POSTS')}>
            <div style={styles.listTitle}>완료된 게시글 ({resolvedPosts.length})</div>
            <span style={styles.viewAllBtn}>전체보기 &gt;</span>
          </div>
          <ul style={styles.listContainer}>
            {renderPostPreviews(resolvedPosts)}
          </ul>
        </div>

        {/* 채팅 목록 카드 */}
        <div style={styles.cardBox}>
          <div style={styles.listHeader} onClick={() => setModalType('CHATS')}>
            <div style={styles.listTitle}>채팅 목록 ({chatRooms.length})</div>
            <span style={styles.viewAllBtn}>전체보기 &gt;</span>
          </div>
          <ul style={styles.listContainer}>
            {chatRooms.length === 0 ? (
              <li style={{ ...styles.listItem, cursor: 'default', color: '#9ca3af' }}>참여 중인 채팅방이 없습니다.</li>
            ) : chatRooms.slice(0, 3).map((room) => (
              <li key={room.id} style={styles.listItem} onClick={() => handleChatClick(room)}>
                <strong>[{room.itemType === 'LOST' ? '분실' : room.itemType === 'FOUND' ? '습득' : '알림'}] {getPartnerName(room)}</strong>님과의 대화
              </li>
            ))}
          </ul>
        </div>

        {/* 받은 후기 카드 */}
        <div style={styles.cardBox}>
          <div style={styles.listHeader} onClick={() => setModalType('REVIEWS')}>
            <div style={styles.listTitle}>받은 후기 ({reviews.length})</div>
            <span style={styles.viewAllBtn}>전체보기 &gt;</span>
          </div>
          <ul style={styles.listContainer}>
            {reviews.length === 0 ? (
              <li style={{ ...styles.listItem, cursor: 'default', color: '#9ca3af' }}>아직 받은 후기가 없습니다.</li>
            ) : reviews.slice(0, 3).map((review) => (
              <li key={review.id} style={styles.listItem}>
                "{review.comment}"
              </li>
            ))}
          </ul>
        </div>

        {/* 알림 목록 카드 */}
        <div style={styles.cardBox}>
          <div style={styles.listHeader} onClick={() => setModalType('NOTIFICATIONS')}>
            <div style={styles.listTitle}>알림 목록 ({notifications.length})</div>
            <span style={styles.viewAllBtn}>전체보기 &gt;</span>
          </div>
          <ul style={styles.listContainer}>
            {notifications.length === 0 ? (
              <li style={{ ...styles.listItem, cursor: 'default', color: '#9ca3af' }}>새 알림이 없습니다.</li>
            ) : notifications.slice(0, 3).map((noti) => (
              <li key={noti.id} style={styles.listItem}>
                {noti.message}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {renderModal()}

      {/* 프로필 수정 모달 렌더링 */}
      <ProfileEditModal 
        isOpen={isProfileEditOpen} 
        onClose={() => setIsProfileEditOpen(false)} 
        currentUser={user} 
        onUpdateSuccess={fetchMyPageData}
      />
    </div>
  );
};

// 스타일 설정
const styles = {
  loading: { textAlign: 'center', padding: '100px', fontFamily: "'Pretendard', sans-serif" },
  page: { padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', color: '#1f2937', fontFamily: "'Pretendard', sans-serif" },
  title: { fontSize: '28px', fontWeight: 'bold', marginBottom: '30px', color: '#111827' },
  gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' },
  cardBox: { backgroundColor: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #f3f4f6', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', minHeight: '260px' },
  cardTitle: { fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' },
  editIconBtn: { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', padding: '0', color: '#6b7280' },
  listHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '12px', cursor: 'pointer' },
  listTitle: { fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: 0 },
  viewAllBtn: { fontSize: '13px', color: '#6b7280' },
  listContainer: { listStyle: 'none', padding: 0, margin: 0 },
  listItem: { padding: '12px 0', borderBottom: '1px solid #f9fafb', color: '#4b5563', fontSize: '14.5px', cursor: 'pointer', lineHeight: '1.4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  postPreviewItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #f9fafb', cursor: 'pointer' },
  thumbnailWrapper: { position: 'relative', width: '50px', height: '50px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f3f4f6' },
  thumbnailImage: { width: '100%', height: '100%', objectFit: 'cover' },
  tinyBadge: { position: 'absolute', top: '0', left: '0', color: '#ffffff', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold', borderBottomRightRadius: '8px' },
  previewTitle: { fontSize: '14.5px', color: '#374151', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  tempBar: { width: '100%', height: '14px', backgroundColor: '#f3f4f6', borderRadius: '10px', marginTop: '12px', overflow: 'hidden' },
  tempFill: { height: '100%', backgroundColor: '#f97316', borderRadius: '10px', transition: 'width 0.5s ease' },
  avatarStyle: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(3px)' },
  modalContent: { backgroundColor: '#fff', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #edf2f7', paddingBottom: '12px' },
  modalTitleText: { margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#111827' },
  closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#a0aec0' },
  modalGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' },
  modalCard: { backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', cursor: 'pointer', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column' },
  modalImageWrapper: { position: 'relative', width: '100%', height: '120px', backgroundColor: '#f3f4f6' },
  modalImage: { width: '100%', height: '100%', objectFit: 'cover' },
  badge: { position: 'absolute', top: '8px', left: '8px', color: '#ffffff', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
  modalCardContent: { padding: '12px' },
  modalCardTitle: { fontSize: '14px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  modalCardDesc: { fontSize: '12px', color: '#6b7280', margin: 0 },
  modalListContainer: { listStyle: 'none', padding: 0, margin: 0 },
  modalListItem: { padding: '16px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '6px' },
  emptyText: { textAlign: 'center', padding: '40px 0', color: '#6b7280' }
};

export default MyPage;