import { useState, useEffect } from 'react';
import api from '../api/axios';

// 카테고리 목록
const CATEGORIES = [
  { id: 'ALL', name: '전체' },
  { id: 1, name: '카드/신분증' },
  { id: 2, name: '이어폰/헤드폰' },
  { id: 3, name: '스마트폰/노트북/태블릿' },
  { id: 4, name: '지갑' },
  { id: 5, name: '책/노트/필기구' },
  { id: 6, name: '가방/파우치' },
  { id: 7, name: '의류/모자' },
  { id: 8, name: '기타 전자기기' },
  { id: 9, name: '기타' }
];

// 카테고리 매핑
const CATEGORY_MAP = {
  1: '카드/신분증',
  2: '이어폰/헤드폰',
  3: '스마트폰/노트북/태블릿',
  4: '지갑',
  5: '책/노트/필기구',
  6: '가방/파우치',
  7: '의류/모자',
  8: '기타 전자기기',
  9: '기타'
};

// 목록 컴포넌트
export default function ItemList({ mode = 'lost', onNavigate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // 데이터 로드
  useEffect(() => {
    setLoading(true);
    const itemType = mode.toUpperCase();
    
    api.get(`/api/items?type=${itemType}`)
      .then(res => {
        setItems(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [mode]);

  // 카테고리명 추출
  const getCategoryName = (item) => {
    if (item.categoryName) return item.categoryName;
    if (item.category) return item.category; 
    if (item.categoryId && CATEGORY_MAP[item.categoryId]) return CATEGORY_MAP[item.categoryId];
    return '기타';
  };

  // 필터링 적용
  const filteredItems = items.filter(item => {
    const itemCategoryName = getCategoryName(item);
    
    const matchesCategory = selectedCategory === 'ALL' || 
      itemCategoryName === CATEGORY_MAP[selectedCategory];

    const matchesSearch = searchTerm.trim() === '' ||
      (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // 상세 페이지 이동
  const handleCardClick = (id) => {
    if (onNavigate) {
      onNavigate('post-detail', id);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>{mode === 'lost' ? '분실물 목록' : '습득물 목록'}</h2>
      </div>

      <div style={styles.searchBox}>
        <input 
          type="text" 
          placeholder="물품명, 장소, 특징 등을 검색해보세요." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput} 
        />
      </div>

      <div style={styles.categoryContainer}>
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedCategory(c.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: selectedCategory === c.id ? 'none' : '1px solid #d1d5db',
              backgroundColor: selectedCategory === c.id ? '#2563eb' : '#ffffff',
              color: selectedCategory === c.id ? '#ffffff' : '#374151',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: selectedCategory === c.id ? 'bold' : 'normal',
              whiteSpace: 'nowrap'
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>데이터를 불러오는 중입니다... ⏳</div>
      ) : filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>해당 조건에 맞는 게시물이 없습니다.</div>
      ) : (
        <div style={styles.grid}>
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              style={{
                ...styles.card,
                // 완료 상태 스타일 적용
                opacity: item.status === 'RESOLVED' ? 0.5 : 1,
                filter: item.status === 'RESOLVED' ? 'grayscale(80%)' : 'none'
              }} 
              onClick={() => handleCardClick(item.id)}
            >
              <div style={styles.imageWrapper}>
                <img 
                  src={item.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"} 
                  alt="물품 사진" 
                  style={styles.cardImage} 
                />
                <span style={{
                  ...styles.badge, 
                  backgroundColor: item.type === 'LOST' ? '#ef4444' : '#10b981'
                }}>
                  {item.type === 'LOST' ? '분실' : '습득'}
                </span>
              </div>
              <div style={styles.cardContent}>
                <span style={styles.cardCategory}>{getCategoryName(item)}</span>
                <h3 style={styles.cardTitle}>{item.title}</h3>
                <p style={styles.cardInfo}>{item.location || '장소 미상'}</p>
                <p style={styles.cardInfo}> {item.eventDate ? item.eventDate.split('T')[0] : '날짜 미상'}</p>
                <div style={styles.cardFooter}>
                  <span style={{ fontWeight: 'bold', color: item.status === 'RESOLVED' ? '#6b7280' : '#2563eb' }}>
                    {item.status === 'RESOLVED' ? '반환 완료' : '찾는 중'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', fontFamily: "'Pretendard', sans-serif" },
  header: { marginBottom: '20px' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 },
  searchBox: { marginBottom: '16px' },
  searchInput: { width: '100%', padding: '14px', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '15px', boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#111827', colorScheme: 'light', outline: 'none' },
  categoryContainer: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '30px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', cursor: 'pointer', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column' },
  imageWrapper: { position: 'relative', width: '100%', height: '160px', backgroundColor: '#f3f4f6' },
  cardImage: { width: '100%', height: '100%', objectFit: 'cover' },
  badge: { position: 'absolute', top: '12px', left: '12px', color: '#ffffff', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  cardContent: { padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 },
  cardCategory: { fontSize: '12px', color: '#2563eb', fontWeight: 'bold', marginBottom: '4px' },
  cardTitle: { fontSize: '16px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  cardInfo: { fontSize: '13px', color: '#4b5563', margin: '2px 0' },
  cardFooter: { marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f3f4f6', fontSize: '13px' }
};
