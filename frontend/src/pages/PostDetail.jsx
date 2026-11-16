// PostDetail.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import ReportModal from '../components/ReportModal';
import VerifyModal from '../components/VerifyModal'; 
import SimilarItemsModal from '../components/SimilarItemsModal'; 
import ReviewModal from '../components/ReviewModal';

// 게시글 상세 정보 확인 및 권한별 기능 처리 컴포넌트
export default function PostDetail({ itemId, onNavigate }) {
  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [verification, setVerification] = useState(null);
  const [reviewError, setReviewError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const reviewState = verification?.itemId === itemId ? verification : null;
  const verifiedRoom = reviewState?.room;
  const isVerified = Boolean(verifiedRoom);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isSimilarModalOpen, setIsSimilarModalOpen] = useState(false); 
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // 게시글 정보 및 현재 로그인한 사용자 정보 조회
  useEffect(() => {
    if (!itemId) return;

    const token = localStorage.getItem('accessToken');
    if (token) {
      api.get('/api/users/me')
        .then(res => {
          setCurrentUserEmail(res.data.email);
          setCurrentUserId(res.data.id);
        })
        .catch(() => {});
    }

    api.get(`/api/items/${itemId}`)
      .then(res => {
        setPostData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [itemId]);

  useEffect(() => {
    if (!currentUserId || !postData || postData.type !== 'FOUND' || postData.id !== Number(itemId)) return;
    let active = true;
    const owner = postData.writerId === currentUserId;
    const direction = owner ? 'received' : 'sent';

    const load = () => {
      setReviewError('');
      Promise.all([
        api.get('/api/chat-requests/' + direction),
        owner ? Promise.resolve({ data: [] }) : api.get('/api/chat-rooms'),
      ]).then(([requests, rooms]) => {
        if (!active) return;
        const rows = requests.data.filter(request => request.itemId === postData.id);
        const room = rooms.data.find(entry => entry.itemId === postData.id);
        setVerification(previous => ({
          itemId,
          rows,
          room: room || (previous?.itemId === itemId ? previous.room : null),
        }));
      }).catch(() => {
        if (active) setReviewError('확인 요청을 불러오지 못했습니다.');
      });
    };

    load();
    window.addEventListener('focus', load);
    return () => {
      active = false;
      window.removeEventListener('focus', load);
    };
  }, [itemId, currentUserId, postData]);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>데이터를 불러오는 중입니다.</div>;
  if (!postData) return <div style={{ textAlign: 'center', padding: '50px' }}>게시물을 찾을 수 없습니다.</div>;

  const isLost = postData.type === 'LOST';
  const isResolved = postData.status === 'RESOLVED';
  const typeLabel = isLost ? '분실' : '습득';
  const typeBgColor = isLost ? '#ef4444' : '#10b981';
  const isMyPost = currentUserEmail && currentUserEmail === postData.writerEmail;

  // 로그인 상태 확인
  const checkLogin = () => {
    if (!localStorage.getItem('accessToken')) {
      alert("로그인이 필요한 서비스입니다.");
      return false;
    }
    return true;
  };

  // 게시글 삭제 처리
  const handleDelete = async () => {
    if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/api/items/${itemId}`);
      alert("게시글이 삭제되었습니다.");
      onNavigate(isLost ? 'lost-list' : 'found-list');
    } catch {
      alert("삭제 권한이 없거나 오류가 발생했습니다.");
    }
  };

  // 게시글 수정 이동
  const handleEdit = () => onNavigate('edit-item', postData);

  // 완료 상태 업데이트
  const handleResolve = async () => {
    try {
      await api.patch(`/api/items/${itemId}/status?status=RESOLVED`);
      setPostData(prev => ({ ...prev, status: 'RESOLVED' }));
    } catch {
      alert("완료 처리에 실패했습니다.");
    }
  };

  const handleVerifySubmit = async (answer) => {
    const response = await api.post('/api/chat-rooms', {
      userId: postData.writerId,
      itemId: postData.id,
      answer,
    });
    setVerification({ itemId, rows: reviewState?.rows || [], room: response.data });
    setIsVerifyOpen(false);
  };

  const handleReviewSubmit = async (evidence) => {
    const response = await api.post('/api/chat-requests/ownership-review', {
      itemId: postData.id,
      evidence,
    });
    setVerification({ itemId, rows: [response.data, ...(reviewState?.rows || [])] });
    setIsVerifyOpen(false);
  };

  const handleReviewDecision = async (requestId, decision) => {
    setProcessingId(requestId);
    setReviewError('');
    try {
      const response = await api.patch('/api/chat-requests/' + requestId + '/' + decision);
      setVerification(previous => ({
        ...previous,
        rows: previous.rows.map(row => row.id === requestId ? response.data : row),
      }));
    } catch {
      setReviewError('요청을 처리하지 못했습니다. 게시글 상태와 요청을 다시 확인해 주세요.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleChatClick = () => {
    if (isResolved || isMyPost || !checkLogin()) return;
    if (isLost) onNavigate('chat-room', postData);
    else if (verifiedRoom) onNavigate('chat-room', { room: verifiedRoom, post: postData });
  };

  const isChatDisabled = isResolved || (!isLost && !isVerified);
  const pendingReview = reviewState?.rows.some(request => request.status === 'PENDING');

  return (
    <div style={styles.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button style={styles.backButton} onClick={() => onNavigate(isLost ? 'lost-list' : 'found-list')}>
          ← 목록으로 돌아가기
        </button>

        {isMyPost && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isResolved && (
              <button style={styles.resolveBtn} onClick={() => setIsReviewOpen(true)}>완료 처리</button>
            )}
            <button style={styles.editBtn} onClick={handleEdit}>수정</button>
            <button style={styles.deleteBtn} onClick={handleDelete}>삭제</button>
          </div>
        )}
      </div>

      <div style={styles.contentWrapper}>
        <div style={styles.imageSection}>
          <img src={postData.imageUrl || "https://via.placeholder.com/600x400?text=No+Image"} alt="물품" style={styles.mainImage} />
        </div>

        <div style={styles.infoSection}>
          <div style={styles.badgeGroup}>
            <span style={{ ...styles.badge, backgroundColor: typeBgColor }}>{typeLabel}</span>
            <span style={styles.statusBadge}>{isResolved ? '완료' : '진행중'}</span>
            <span style={styles.categoryTag}>{postData.categoryName || '기타'}</span>
          </div>

          <h1 style={styles.title}>{postData.title}</h1>
          
          <div style={styles.metaInfo}>
            <span 
              style={{ cursor: 'pointer', color: '#ef4444', textDecoration: 'underline' }} 
              onClick={() => {
                if (checkLogin()) setIsReportOpen(true);
              }}
            >
              신고하기
            </span>
          </div>

          <div style={styles.detailBox}>
            <p style={styles.infoRow}><strong style={styles.infoLabel}>장소:</strong> {postData.location}</p>
            <p style={styles.infoRow}><strong style={styles.infoLabel}>일시:</strong> {postData.eventDate ? postData.eventDate.replace('T', ' ') : '날짜 미상'}</p>
          </div>

          <div style={styles.descBox}>
            <h3 style={{ marginTop: 0, fontSize: '16px' }}>상세 설명</h3>
            <p style={{ lineHeight: '1.6', color: '#4b5563', margin: 0, whiteSpace: 'pre-wrap' }}>{postData.content}</p>
          </div>

          <div style={styles.actionGroup}>
            {isLost ? (
              <button 
                style={{ 
                  ...styles.actionBtn, 
                  backgroundColor: (isMyPost && !isResolved) ? '#111827' : '#f3f4f6', 
                  color: (isMyPost && !isResolved) ? '#ffffff' : '#9ca3af',
                  cursor: (isMyPost && !isResolved) ? 'pointer' : 'not-allowed'
                }} 
                onClick={() => {
                  if (!isMyPost || isResolved) return;
                  setIsSimilarModalOpen(true);
                }}
                disabled={!isMyPost || isResolved}
              >
                {isMyPost ? '유사 습득물 찾기' : '유사 습득물 찾기 (작성자 전용)'}
              </button>
            ) : (
              <button 
                style={{
                  ...styles.actionBtn, 
                  backgroundColor: (isMyPost || isResolved) ? '#f3f4f6' : (isVerified ? '#10b981' : '#2563eb'), 
                  color: (isMyPost || isResolved) ? '#9ca3af' : '#ffffff',
                  cursor: (isMyPost || isResolved) ? 'not-allowed' : 'pointer'
                }} 
                onClick={() => { 
                  if (isMyPost || isResolved) return;
                  if (!checkLogin()) return;
                  if (isVerified) { 
                    alert("이미 본인 확인이 완료되었습니다."); 
                  } else { 
                    setIsVerifyOpen(true); 
                  } 
                }}
                disabled={isMyPost || isResolved}
              >
                {isMyPost ? '본인 확인 (작성자)' : (isResolved ? '본인 확인 마감' : (isVerified ? '본인 확인 완료' : '본인 확인 질문 답하기'))}
              </button>
            )}

            {isMyPost ? (
              <button style={{ ...styles.actionBtn, backgroundColor: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }} disabled>
                내가 작성한 게시글입니다
              </button>
            ) : (
              <button 
                style={{ 
                  ...styles.actionBtn, 
                  backgroundColor: isChatDisabled ? '#e5e7eb' : '#2563eb', 
                  color: isChatDisabled ? '#9ca3af' : '#ffffff', 
                  cursor: isChatDisabled ? 'not-allowed' : 'pointer' 
                }} 
                onClick={handleChatClick}
                disabled={isChatDisabled}
              >
                {isResolved ? '완료된 게시글입니다' : '작성자와 채팅하기'}
              </button>
            )}
          </div>
        </div>
      </div>

      {reviewError && <p role="alert">{reviewError}</p>}
      {!isLost && !isMyPost && pendingReview && <p role="status">습득자가 확인 요청을 검토 중입니다.</p>}
      {!isLost && !isMyPost && !pendingReview && !isVerified && reviewState?.rows[0]?.status === 'REJECTED' && (
        <p role="status">확인 요청이 거절됐습니다. 새로운 단서가 있으면 다시 요청할 수 있습니다.</p>
      )}
      {!isLost && isMyPost && reviewState?.rows.filter(request => request.status === 'PENDING').map(request => (
        <section key={request.id} style={{ padding: '16px', border: '1px solid #d1d5db', borderRadius: '12px', margin: '16px 0' }}>
          <h3>{request.requesterNickname}님의 분실물 확인 요청</h3>
          <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{request.evidence}</p>
          <button disabled={isResolved || processingId !== null} onClick={() => handleReviewDecision(request.id, 'accept')}>수락하고 채팅방 열기</button>{' '}
          <button disabled={processingId !== null} onClick={() => handleReviewDecision(request.id, 'reject')}>거절</button>
        </section>
      ))}

      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} targetType="게시글" targetTitle={postData.title} />
      
      {isVerifyOpen && (
        <VerifyModal isOpen={isVerifyOpen} onClose={() => setIsVerifyOpen(false)} question={postData.question} onVerify={handleVerifySubmit} onReview={handleReviewSubmit} pendingReview={pendingReview} />
      )}
      
      <SimilarItemsModal 
        isOpen={isSimilarModalOpen} 
        onClose={() => setIsSimilarModalOpen(false)} 
        baseItemTitle={postData.title}
        baseItemCategoryId={postData.categoryId} 
        onNavigate={onNavigate}
      />

      <ReviewModal 
        isOpen={isReviewOpen} 
        onClose={() => setIsReviewOpen(false)} 
        onResolve={handleResolve}
        currentUserId={currentUserId}
        itemId={postData.id}
      />
    </div>
  );
}

const styles = {
  page: { maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', fontFamily: "'Pretendard', sans-serif" },
  backButton: { background: 'none', border: 'none', color: '#4b5563', fontSize: '15px', cursor: 'pointer', padding: 0, fontWeight: 'bold' },
  resolveBtn: { padding: '6px 14px', backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  editBtn: { padding: '6px 14px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  deleteBtn: { padding: '6px 14px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  contentWrapper: { display: 'flex', gap: '40px', backgroundColor: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
  imageSection: { flex: '1', minWidth: '300px' },
  mainImage: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', maxHeight: '400px', backgroundColor: '#f3f4f6' },
  infoSection: { flex: '1', display: 'flex', flexDirection: 'column' },
  badgeGroup: { display: 'flex', gap: '8px', marginBottom: '12px' },
  badge: { padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', color: '#fff' },
  statusBadge: { backgroundColor: '#f3f4f6', color: '#374151', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' },
  categoryTag: { backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' },
  title: { fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: '0 0 16px 0' },
  metaInfo: { display: 'flex', justifyContent: 'flex-end', fontSize: '14px', color: '#6b7280', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb', marginBottom: '20px' },
  detailBox: { marginBottom: '24px' },
  infoRow: { margin: '0 0 12px 0', fontSize: '15px', color: '#111827' },
  infoLabel: { color: '#6b7280', display: 'inline-block', width: '50px' },
  descBox: { backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', marginBottom: '30px', flex: 1 },
  actionGroup: { display: 'flex', gap: '12px', marginTop: 'auto' },
  actionBtn: { flex: 1, padding: '16px', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }
};