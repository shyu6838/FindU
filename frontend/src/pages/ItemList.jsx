import React, { useState } from 'react';

/**
 * [ItemList.jsx]
 * 분실물 및 습득물 목록을 보여주는 페이지 컴포넌트입니다.
 * - 주요 역할: 검색 및 카테고리 필터링, 목록 카드 형태로 출력, 신고하기/상세보기 페이지로 이동
 * - mode prop('lost' 또는 'found')에 따라 분실물/습득물 목록으로 동적으로 전환됩니다.
 */

// ---------------------------------------------------------
// 1. 임시 더미 데이터 및 상수 정의
// ---------------------------------------------------------
const MOCK_ITEMS = [
  { id: 1, type: 'LOST', title: '검은색 가죽 지갑', category: '지갑', location: '인문관 3층 복도', date: '2026-07-24', status: 'FINDING', image: 'https://via.placeholder.com/250x180?text=Wallet', description: '도서관 근처에서 분실했습니다.' },
  { id: 2, type: 'FOUND', title: '아이패드 에어 5세대', category: '전자기기', location: '중앙도서관 2층 열람실', date: '2026-07-25', status: 'KEEPING', image: 'https://via.placeholder.com/250x180?text=iPad', description: '열람실 책상 위에서 발견하여 학생회실에 보관 중입니다.' },
  { id: 3, type: 'LOST', title: '에어팟 프로 2세대', category: '전자기기', location: '공학관 식당', date: '2026-07-23', status: 'FINDING', image: 'https://via.placeholder.com/250x180?text=AirPods', description: '본체 분실했습니다.' },
  { id: 4, type: 'FOUND', title: '파란색 3단 우산', category: '기타', location: '학생회관 1층 입구', date: '2026-07-25', status: 'KEEPING', image: 'https://via.placeholder.com/250x180?text=Umbrella', description: '우산꽂이에 꽂혀있었습니다.' },
];

const CATEGORIES = ['전체', '전자기기', '지갑', '의류', '전공서적/도서', '기타'];

// ---------------------------------------------------------
// 2. 메인 컴포넌트
// ---------------------------------------------------------
export default function ItemList({ mode = 'lost', onNavigate, isLoggedIn }) {
  // [상태 관리] 검색어와 선택된 카테고리
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');

  // [로직 분기] mode 값에 따라 화면 텍스트 및 속성 설정
  const isLostMode = mode === 'lost';
  const pageTitle = isLostMode ? '분실물 목록' : '습득물 목록';
  const pageSubtitle = isLostMode
    ? '주인을 찾고 있는 분실물 정보 목록입니다.'
    : '보관 중인 습득물 정보 목록입니다.';
  const writeBtnText = isLostMode ? '분실물 신고하기' : '습득물 신고하기';

  // [데이터 필터링] 탭(분실/습득), 카테고리, 검색어 조건에 맞게 데이터 필터링
  const filteredItems = MOCK_ITEMS.filter((item) => {
    const targetType = isLostMode ? 'LOST' : 'FOUND';
    if (item.type !== targetType) return false;

    const matchesCategory = selectedCategory === '전체' || item.category === selectedCategory;
    const matchesSearch =
      item.title.includes(searchTerm) ||
      item.location.includes(searchTerm) ||
      item.description.includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  // [이벤트 핸들러] 신고하기 버튼 클릭 시 로그인 여부 체크 후 이동
  const handleWriteClick = () => {
    if (!isLoggedIn) {
      alert('글 작성은 로그인 후 이용할 수 있습니다.');
      if (onNavigate) onNavigate('login');
      return;
    }
    if (onNavigate) onNavigate(isLostMode ? 'report-lost' : 'report-found');
  };

  // [이벤트 핸들러] 아이템 카드 클릭 시 상세 페이지로 이동
  const handleCardClick = (item) => {
    if (onNavigate) {
      onNavigate('detail', item); 
    }
  };

  return (
    <div style={styles.container}>
      
      {/* 1. 상단: 페이지 타이틀 및 서브 타이틀 */}
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>{pageTitle}</h1>
        <p style={styles.pageSubtitle}>{pageSubtitle}</p>
      </div>

      {/* 2. 중단: 텍스트 검색 영역 */}
      <div style={styles.searchSection}>
        <div style={styles.searchBarContainer}>
          <input
            type="text"
            placeholder={
              isLostMode
                ? "예: '도서관에서 잃어버린 검정 지갑' 검색"
                : "예: '공학관 2층에서 주운 아이패드' 검색"
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <button style={styles.searchButton}>검색</button>
        </div>
      </div>

      {/* 3. 중단: 카테고리 필터 및 신고하기 버튼 */}
      <div style={styles.controlSection}>
        <div style={styles.categoryGroup}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                ...styles.categoryBtn,
                ...(selectedCategory === cat ? styles.categoryBtnActive : {}),
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <button onClick={handleWriteClick} style={styles.writeButton}>
          {writeBtnText}
        </button>
      </div>

      {/* 4. 하단: 필터링된 아이템 카드 그리드 목록 */}
      <div style={styles.gridSection}>
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div 
              key={item.id} 
              style={styles.card}
              onClick={() => handleCardClick(item)}
            >
              {/* 4-1. 카드 상단: 썸네일 이미지 및 분실/습득 뱃지 */}
              <div style={styles.imageWrapper}>
                <img src={item.image} alt={item.title} style={styles.cardImage} />
                <span
                  style={{
                    ...styles.badge,
                    backgroundColor: item.type === 'LOST' ? '#ff4d4f' : '#52c41a',
                  }}
                >
                  {item.type === 'LOST' ? '분실' : '습득'}
                </span>
              </div>

              {/* 4-2. 카드 하단: 상세 정보 텍스트 */}
              <div style={styles.cardContent}>
                <div style={styles.cardCategory}>{item.category}</div>
                <h3 style={styles.cardTitle}>{item.title}</h3>
                <p style={styles.cardInfo}>{item.location}</p>
                <p style={styles.cardInfo}>📅 {item.date}</p>
                <p style={styles.cardDesc}>{item.description}</p>

                <div style={styles.cardFooter}>
                  <span style={styles.statusText}>
                    {item.status === 'FINDING' ? '찾는 중' : '보관 중'}
                  </span>
                  <button style={styles.detailBtn}>상세보기</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.noData}>등록된 데이터가 없습니다. 🍃</div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// 3. UI 스타일 정의
// ---------------------------------------------------------
const styles = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', fontFamily: "'Pretendard', sans-serif" },
  header: { textAlign: 'center', marginBottom: '30px' },
  pageTitle: { fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' },
  pageSubtitle: { fontSize: '15px', color: '#6b7280' },
  searchSection: { marginBottom: '25px' },
  searchBarContainer: {
    display: 'flex', gap: '10px', backgroundColor: '#ffffff',
    border: '2px solid #1f2937', padding: '6px 12px', borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  searchInput: { flex: 1, border: 'none', outline: 'none', backgroundColor: '#ffffff', color: '#000000', padding: '10px 8px', fontSize: '15px' },
  searchButton: { backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 24px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  controlSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '30px' },
  categoryGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  categoryBtn: { padding: '8px 16px', borderRadius: '20px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#4b5563', fontSize: '14px', cursor: 'pointer' },
  categoryBtnActive: { backgroundColor: '#1f2937', color: '#fff', borderColor: '#1f2937', fontWeight: 'bold' },
  writeButton: { backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' },
  gridSection: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' },
  card: { backgroundColor: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #f3f4f6', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' },
  imageWrapper: { position: 'relative', width: '100%', height: '180px', backgroundColor: '#e5e7eb' },
  cardImage: { width: '100%', height: '100%', objectFit: 'cover' },
  badge: { position: 'absolute', top: '12px', left: '12px', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  cardContent: { padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 },
  cardCategory: { fontSize: '12px', color: '#2563eb', fontWeight: 'bold', marginBottom: '4px' },
  cardTitle: { fontSize: '16px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  cardInfo: { fontSize: '13px', color: '#4b5563', margin: '2px 0' },
  cardDesc: { fontSize: '12px', color: '#9ca3af', marginTop: '8px', marginBottom: '16px', lineHeight: '1.4', height: '34px', overflow: 'hidden' },
  cardFooter: { marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f3f4f6' },
  statusText: { fontSize: '12px', color: '#6b7280', fontWeight: 'bold' },
  detailBtn: { backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' },
  noData: { gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: '#9ca3af', fontSize: '16px' }
};