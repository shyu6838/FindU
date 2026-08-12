import React from 'react';

/**
 * [PostDetail.jsx]
 * 게시물 상세 페이지 컴포넌트입니다.
 * - 주요 역할: 선택된 분실물 또는 습득물의 상세 정보(사진, 장소, 설명 등)를 보여줍니다.
 * - 특징: 하나의 파일로 '분실물 상세'와 '습득물 상세'를 모두 처리합니다. 
 * 데이터의 type('LOST' 또는 'FOUND')에 따라 라벨, 색상, 하단 버튼이 동적으로 바뀝니다.
 */

// ---------------------------------------------------------
// 1. 기본 데이터 (선택된 아이템 정보가 없을 경우)
// ---------------------------------------------------------
const DEFAULT_ITEM = {
  id: 1,
  type: 'LOST',
  title: '검은색 가죽 지갑',
  category: '지갑',
  location: '인문관 3층 복도',
  date: '2026-07-24',
  status: 'FINDING',
  image: 'https://via.placeholder.com/600x400?text=Black+Wallet',
  description: '도서관 근처에서 분실했습니다.',
  author: '익명_지갑주인',
  trustTemp: 36.5,
};

// ---------------------------------------------------------
// 2. 메인 컴포넌트
// ---------------------------------------------------------
export default function PostDetail({ item = DEFAULT_ITEM, onNavigate }) {
  // 넘겨받은 item 속성이 유효하면 사용하고, 없으면 기본값(DEFAULT_ITEM) 적용
  const postData = item || DEFAULT_ITEM;

  // [로직 분기] 게시물 타입이 분실물인지 습득물인지 판별
  const isLost = postData.type === 'LOST';
  const typeLabel = isLost ? '분실' : '습득';
  const typeBgColor = isLost ? '#ff4d4f' : '#52c41a';

  return (
    <div style={styles.container}>
      
      {/* 1. 상단: 뒤로가기 버튼 */}
      <button 
        onClick={() => onNavigate && onNavigate(isLost ? 'lost-list' : 'found-list')} 
        style={styles.backBtn}
      >
        ← 목록으로 돌아가기
      </button>

      {/* 2. 상단: 물품 이미지 영역 */}
      <div style={styles.imageContainer}>
        <img 
          src={postData.image || 'https://via.placeholder.com/600x400?text=No+Image'} 
          alt={postData.title} 
          style={styles.image} 
        />
      </div>

      {/* 3. 중단: 게시글 핵심 헤더 정보 (상태 뱃지, 카테고리, 제목, 작성자, 온도) */}
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

      {/* 4. 하단: 상세 텍스트 정보 (장소, 상세 설명) */}
      <div style={styles.detailSection}>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>{isLost ? '분실 장소:' : '습득 장소:'}</span>
          <span style={styles.infoValue}>{postData.location}</span>
        </div>
        
        <div style={styles.descBox}>
          <p style={styles.descText}>{postData.description}</p>
        </div>
      </div>

      {/* 5. 최하단: 액션 버튼 그룹 (분실/습득 여부에 따라 동적 렌더링) */}
      <div style={styles.actionSection}>
        {isLost ? (
          // 분실물일 경우 보여줄 버튼
          <button 
            style={{ ...styles.actionBtn, backgroundColor: '#8b5cf6' }}
            onClick={() => alert('유사 습득물을 매칭 중입니다...')}
          >
            유사 습득물 찾기
          </button>
        ) : (
          // 습득물일 경우 보여줄 버튼
          <button 
            style={{ ...styles.actionBtn, backgroundColor: '#2563eb' }}
            onClick={() => alert('본인 확인 질문 답변 페이지로 이동합니다.')}
          >
            ❓ 본인 확인 질문 답변하기
          </button>
        )}

        {/* 공통: 채팅하기 버튼 */}
        <button 
          style={{ ...styles.actionBtn, backgroundColor: '#1f2937' }}
          onClick={() => alert('작성자와의 채팅방이 열립니다.')}
        >
          💬 채팅하기
        </button>
      </div>
      
    </div>
  );
}

// ---------------------------------------------------------
// 3. UI 스타일 정의
// ---------------------------------------------------------
const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '30px 20px', fontFamily: "'Pretendard', sans-serif" },
  backBtn: { backgroundColor: 'transparent', border: 'none', color: '#4b5563', fontSize: '15px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' },
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
  actionBtn: { flex: 1, padding: '16px', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
};