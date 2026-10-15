// ReviewModal.jsx

import { useEffect, useState } from 'react';
import api from '../api/axios';

// 이메일에서 아이디 추출 후 마스킹 처리
const maskUserId = (email) => {
  if (!email) return '';
  const idPart = email.split('@')[0];
  if (idPart.length <= 2) {
    return idPart[0] + '*'.repeat(Math.max(1, idPart.length - 1));
  }
  const visibleLen = Math.min(3, Math.floor(idPart.length / 2));
  return idPart.slice(0, visibleLen) + '*'.repeat(idPart.length - visibleLen);
};

// 닉네임과 마스킹된 아이디 조합 문자열 생성
const formatUserDisplay = (nickname, email) => {
  const maskedId = maskUserId(email);
  const rawId = email ? email.split('@')[0] : '';
  const validNickname = nickname && nickname !== rawId ? nickname : null;

  if (validNickname && maskedId) {
    return `${validNickname}(${maskedId})`;
  }
  if (validNickname) {
    return validNickname;
  }
  if (maskedId) {
    return `사용자(${maskedId})`;
  }
  return '상대방';
};

// 거래 완료 및 상대방 후기 작성 모달 컴포넌트
export default function ReviewModal({ isOpen, onClose, onResolve, currentUserId, isAuthor = true, targetNickname = '상대방', targetUserId = null, itemId = null }) {
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rating, setRating] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // 현재 게시글과 연관된 채팅 상대 목록 조회
  useEffect(() => {
    if (!isOpen || !currentUserId || !isAuthor) return;

    api.get('/api/chat-rooms')
      .then(res => {
        const allRooms = res.data || [];

        const filteredRooms = itemId
          ? allRooms.filter(room => {
              const roomItemId = room.itemId ?? room.item?.id ?? room.postId;
              return String(roomItemId) === String(itemId);
            })
          : allRooms;

        const users = filteredRooms.map(room => {
          const isUser1 = room.user1Id === currentUserId;
          const partnerNickname = isUser1 ? room.user2Nickname : room.user1Nickname;
          const partnerEmail = isUser1 ? room.user2Email : room.user1Email;

          return {
            id: isUser1 ? room.user2Id : room.user1Id,
            nickname: partnerNickname,
            email: partnerEmail,
            displayName: formatUserDisplay(partnerNickname, partnerEmail),
          };
        });

        const uniqueUsers = users.filter((user, index, arr) =>
          user.id && arr.findIndex(item => item.id === user.id) === index
        );

        setChatUsers(uniqueUsers);
        setSelectedUser(uniqueUsers[0] || null);
      })
      .catch(() => {
        setChatUsers([]);
        setSelectedUser(null);
      });
  }, [isOpen, currentUserId, isAuthor, itemId]);

  if (!isOpen) return null;

  // 후기 태그 선택 토글
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 평가 변경 시 선택된 태그 초기화
  const handleRatingChange = (newRating) => {
    setRating(newRating);
    setSelectedTags([]);
  };

  // 후기 제출 및 게시글 완료 처리
  const handleSubmit = async () => {
    const finalTargetId = isAuthor ? selectedUser?.id : targetUserId;
    if (isAuthor && !finalTargetId) return alert("후기를 남길 사용자를 확인해주세요.");
    if (!isAuthor && !finalTargetId) return alert("후기 대상자 정보를 찾을 수 없습니다.");
    if (!rating) return alert("평가를 필수로 선택해주세요.");

    const numericRating = rating === 'GOOD' ? 5 : 1;

    try {
      setSubmitting(true);

      const tagText = selectedTags.join(', ');
      const finalComment = itemId ? `${tagText} [#${itemId}]`.trim() : tagText;

      await api.post('/api/reviews', {
        itemId: itemId, 
        revieweeId: finalTargetId,
        rating: numericRating,
        comment: finalComment,
      });
      await onResolve();
      alert(`${isAuthor ? (selectedUser.displayName || '상대방') : targetNickname}님에게 후기가 전달되었습니다.`);
      setSelectedTags([]);
      setRating(null);
      onClose();
    } catch {
      alert('후기 등록 또는 완료 처리에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const goodTags = ['시간 약속을 잘 지켜요', '친절하고 매너가 좋아요', '응답이 빨라요'];
  const badTags = ['시간 약속을 안 지켜요', '불친절해요', '응답이 느려요'];
  const currentTags = rating === 'BAD' ? badTags : goodTags;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>완료 및 후기 남기기</h3>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {isAuthor ? (
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>1. 후기를 남길 사용자를 선택하세요.</h4>
            <div style={styles.userList}>
              {chatUsers.length === 0 ? (
                <div style={{ color: '#9ca3af', fontSize: '14px' }}>후기를 남길 채팅 상대가 없습니다.</div>
              ) : chatUsers.map(user => (
                <div
                  key={user.id}
                  style={{
                    ...styles.userCard,
                    borderColor: selectedUser?.id === user.id ? '#2563eb' : '#e5e7eb',
                    backgroundColor: selectedUser?.id === user.id ? '#eff6ff' : '#fff'
                  }}
                  onClick={() => setSelectedUser(user)}
                >
                  <div style={styles.userAvatar}>Img</div>
                  <div>
                    <div style={styles.userNickname}>{user.displayName}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>진행 상대: {targetNickname}</h4>
          </div>
        )}

        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>{isAuthor ? '2' : '1'}. 진행 과정은 어떠셨나요? (필수)</h4>
          <div style={styles.ratingGroup}>
            <button
              style={{ ...styles.ratingBtn, backgroundColor: rating === 'GOOD' ? '#10b981' : '#f3f4f6', color: rating === 'GOOD' ? '#fff' : '#374151' }}
              onClick={() => handleRatingChange('GOOD')}
            >
              좋음
            </button>
            <button
              style={{ ...styles.ratingBtn, backgroundColor: rating === 'BAD' ? '#ef4444' : '#f3f4f6', color: rating === 'BAD' ? '#fff' : '#374151' }}
              onClick={() => handleRatingChange('BAD')}
            >
              나쁨
            </button>
          </div>
        </div>

        {rating && (
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>{isAuthor ? '3' : '2'}. 어떤 점이 {rating === 'BAD' ? '아쉬웠나요' : '좋았나요'}? (선택)</h4>
            <div style={styles.tagList}>
              {currentTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  style={{
                    ...styles.tagBtn,
                    backgroundColor: selectedTags.includes(tag) ? '#2563eb' : '#f3f4f6',
                    color: selectedTags.includes(tag) ? '#fff' : '#374151',
                    border: selectedTags.includes(tag) ? 'none' : '1px solid #e5e7eb'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        <button style={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
          {submitting ? '처리 중...' : (isAuthor ? '후기 보내고 완료 처리하기' : '후기 보내기')}
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' },
  modal: { backgroundColor: '#fff', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #edf2f7', paddingBottom: '12px' },
  title: { margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' },
  closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#a0aec0' },
  section: { marginBottom: '24px' },
  sectionTitle: { fontSize: '15px', fontWeight: 'bold', color: '#374151', marginBottom: '12px', marginTop: 0 },
  userList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  userCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', border: '2px solid', cursor: 'pointer', transition: 'all 0.2s' },
  userAvatar: { fontSize: '14px', backgroundColor: '#f3f4f6', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontWeight: 'bold' },
  userNickname: { fontWeight: 'bold', fontSize: '14px', color: '#111827' },
  userEmail: { fontSize: '12px', color: '#6b7280' },
  ratingGroup: { display: 'flex', gap: '12px' },
  ratingBtn: { flex: 1, padding: '12px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' },
  tagList: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  tagBtn: { padding: '8px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' },
  submitBtn: { width: '100%', padding: '14px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }
};