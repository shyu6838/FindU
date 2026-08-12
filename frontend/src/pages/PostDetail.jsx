import React, { useState } from 'react';
import ReportModal from '../components/ReportModal';
import VerifyModal from '../components/VerifyModal'; // 💡 본인 확인 모달 추가

const DEFAULT_ITEM = {
  id: 1,
  type: 'FOUND', // 테스트를 위해 기본 타입을 습득(FOUND)으로 설정
  title: '검은색 가죽 지갑',
  category: '지갑',
  location: '인문관 3층 복도',
  date: '2026-07-24',
  status: 'KEEPING',
  image: 'https://via.placeholder.com/600x400?text=Black+Wallet',
  description: '도서관 3층 복도에서 습득하였습니다. 주인을 찾습니다.',
  author: '익명_습득자',
  trustTemp: 36.5,
  question: '지갑 안에 들어있는 신분증에 있는 이름을 써주세요.', // 💡 습득자가 작성했던 질문
};

export default function PostDetail({ item = DEFAULT_ITEM, onNavigate }) {
  const postData = item || DEFAULT_ITEM;

  const isLost = postData.type === 'LOST';
  const typeLabel = isLost ? '분실' : '습득';
  const typeBgColor = isLost ? '#ff4d4f' : '#52c41a';

  // 💡 상태 관리
  const [isReportOpen, setIsReportOpen] = useState(false); // 신고 모달 State
  const [isVerifyOpen, setIsVerifyOpen] = useState(false); // 본인확인 질문 모달 State
  const [isVerified, setIsVerified] = useState(false);     // 본인확인 통과 여부 State

  // 💡 채팅 기능 가능 여부 (분실물은 바로 가능 / 습득물은 본인확인 통과해야 가능)
  const canChat = isLost || isVerified;

  return (
    <div style={styles.container}>
      
      {/* 1. 상단: 뒤로가기 버튼 & 신고하기 버튼 */}
      <div style={styles.topBar}>
        <button 
          onClick={() => onNavigate && onNavigate(isLost ? 'lost-list' : 'found-list')} 
          style={styles.backBtn}
        >
          ← 목록으로 돌아가기
        </button>
        
        <button 
          onClick={() => setIsReportOpen(true)}
          style={styles.reportPostBtn}
        >
          🚨 게시글 신고
        </button>
      </div>

      {/* 2. 물품 이미지 */}
      <div style={styles.imageContainer}>
        <img 
          src={postData.image || 'https://via.placeholder.com/600x400?text=No+Image'} 
          alt={postData.title} 
          style={styles.image} 
        />
      </div>

      {/* 3. 게시글 정보 */}
      <div style={styles.headerSection}>
        <div style={styles.badgeGroup}>
          <span style={{ ...styles.badge, backgroundColor: typeBgColor }}>
            {typeLabel}
          </span>
          <span style={styles.statusBadge}>
            {postData.status === 'FINDING' ? '찾는 중' : postData.status === 'KEEPING' ? '보관 중' : '완료'}
          </span>
          <span style={styles.categoryTag}>{postData.category}</span>
        </div>

        <h1 style={styles.title}>{postData.title}</h1>

        <div style={styles.metaInfo}>
          <div>
            <strong>작성자:</strong> {postData.author || '익명'} 
            <span style={styles.tempSpan}>🔥 {postData.trustTemp || 36.5}°C</span>
          </div>
          <div>📅 {postData.date}</div>
        </div>
      </div>

      {/* 4. 상세 설명 */}
      <div style={styles.detailSection}>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>{isLost ? '분실 장소:' : '습득 장소:'}</span>
          <span style={styles.infoValue}>{postData.location}</span>
        </div>
        
        <div style={styles.descBox}>
          <p style={styles.descText}>{postData.description}</p>
        </div>
      </div>

      {/* 5. 최하단: 액션 버튼 그룹 */}
      <div style={styles.actionSection}>
        {isLost ? (
          <button 
            style={{ ...styles.actionBtn, backgroundColor: '#8b5cf6' }}
            onClick={() => alert('유사 습득물을 매칭 중입니다...')}
          >
            유사 습득물 찾기
          </button>
        ) : (
          /* 💡 습득물인 경우 : 본인 확인 질문 답변 버튼 */
          <button 
            style={{ 
              ...styles.actionBtn, 
              backgroundColor: isVerified ? '#059669' : '#2563eb' 
            }}
            onClick={() => setIsVerifyOpen(true)}
          >
            {isVerified ? '✅ 본인 확인 완료' : '❓ 본인 확인 질문 답변하기'}
          </button>
        )}

        {/* 💡 채팅하기 버튼 (비활성화 상태 및 호버 안내 툴팁 적용) */}
        <button 
          disabled={!canChat}
          title={!canChat ? "본인 확인 질문을 답변해야 활성화됩니다." : "작성자와 1:1 채팅하기"}
          style={{ 
            ...styles.actionBtn, 
            backgroundColor: canChat ? '#1f2937' : '#9ca3af',
            cursor: canChat ? 'pointer' : 'not-allowed',
            opacity: canChat ? 1 : 0.7
          }}
          onClick={() => canChat && onNavigate && onNavigate('chat-room', postData)}
        >
          💬 채팅하기
        </button>
      </div>

      {/* 💡 신고하기 모달 */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="게시글"
        targetTitle={postData.title}
      />

      {/* 💡 본인 확인 질문 모달 */}
      <VerifyModal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        question={postData.question}
        onSuccess={() => setIsVerified(true)}
      />
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '30px 20px', fontFamily: "'Pretendard', sans-serif" },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  backBtn: { backgroundColor: 'transparent', border: 'none', color: '#4b5563', fontSize: '15px', cursor: 'pointer', fontWeight: 'bold' },
  reportPostBtn: { backgroundColor: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  imageContainer: { width: '100%', height: '380px', backgroundColor: '#f3f4f6', borderRadius: '14px', overflow: 'hidden', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  headerSection: { paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' },
  badgeGroup: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' },
  badge: { color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' },
  statusBadge: { backgroundColor: '#e5e7eb', color: '#374151', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' },
  categoryTag: { backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' },
  title: { fontSize: '26px', fontWeight: 'bold', color: '#111827', margin: '0 0 16px 0' },
  metaInfo: { display: 'flex', justifyContent: 'space-between', color: '#6b7280', fontSize: '14px' },
  tempSpan: { color: '#f97316', marginLeft: '6px' },
  detailSection: { padding: '24px 0', borderBottom: '1px solid #e5e7eb' },
  infoRow: { fontSize: '16px', color: '#1f2937', marginBottom: '16px' },
  infoLabel: { fontWeight: 'bold', marginRight: '8px' },
  infoValue: { color: '#374151' },
  descBox: { backgroundColor: '#f9fafb', padding: '16px', borderRadius: '10px', border: '1px solid #f3f4f6' },
  descText: { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' },
  actionSection: { display: 'flex', gap: '14px', marginTop: '28px' },
  actionBtn: { flex: 1, padding: '16px', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', transition: 'all 0.2s ease' },
};