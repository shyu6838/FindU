// ReviewModal.jsx

import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function ReviewModal({ isOpen, onClose, onResolve, currentUserId }) {
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !currentUserId) return;

    api.get('/api/chat-rooms')
      .then(res => {
        const users = (res.data || []).map(room => {
          const isUser1 = room.user1Id === currentUserId;
          return {
            id: isUser1 ? room.user2Id : room.user1Id,
            nickname: isUser1 ? room.user2Nickname : room.user1Nickname,
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
  }, [isOpen, currentUserId]);

  if (!isOpen) return null;

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUser?.id) return alert("후기를 남길 사용자를 확인할 수 없습니다.");
    if (selectedTags.length === 0) return alert("최소 1개 이상의 후기를 선택해주세요.");

    try {
      setSubmitting(true);
      await api.post('/api/reviews', {
        revieweeId: selectedUser.id,
        rating: 5,
        comment: selectedTags.join(', '),
      });
      await onResolve();
      alert(`${selectedUser.nickname || '상대방'}님에게 후기가 전달되었습니다. 게시글이 완료 처리됩니다!`);
      setSelectedTags([]);
      onClose();
    } catch {
      alert('후기 등록 또는 완료 처리에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>완료 및 후기 남기기</h3>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>후기를 남길 사용자를 선택하세요.</h4>
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
                <div style={styles.userAvatar}>👤</div>
                <div>
                  <div style={styles.userNickname}>{user.nickname || '상대방'}</div>
                  <div style={styles.userEmail}>사용자 #{user.id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>2. 어떤 점이 좋았나요? (다중 선택)</h4>
          <div style={styles.tagList}>
            {['시간 약속을 잘 지켜요 ⏰', '친절하고 매너가 좋아요 😊', '응답이 빨라요 ⚡'].map(tag => (
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

        <button style={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
          {submitting ? '처리 중...' : '후기 보내고 완료 처리하기'}
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
  userAvatar: { fontSize: '24px', backgroundColor: '#f3f4f6', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  userNickname: { fontWeight: 'bold', fontSize: '14px', color: '#111827' },
  userEmail: { fontSize: '12px', color: '#6b7280' },
  tagList: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  tagBtn: { padding: '8px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' },
  submitBtn: { width: '100%', padding: '14px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }
};
