import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function SimilarItemsModal({ isOpen, onClose, baseItemId, baseItemTitle, onNavigate }) {
  const [similarItems, setSimilarItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    setLoading(true);
    setErrorMessage('');

    api.get(`/api/items/${baseItemId}/similar?limit=12`)
      .then(res => {
        if (!active) return;
        setSimilarItems(res.data || []);
      })
      .catch(err => {
        console.error("유사 습득물 로딩 실패", err);
        if (!active) return;
        setSimilarItems([]);
        setErrorMessage(err.response?.data || '유사 습득물을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, baseItemId]);

  if (!isOpen) return null;

  // 💡 카드 클릭 시 해당 게시글 상세 페이지로 이동
  const handleCardClick = (id) => {
    onClose();
    onNavigate('post-detail', id);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        <div style={styles.header}>
          <h3 style={styles.title}>🔍 유사 습득물 탐색 결과</h3>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.summaryBox}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>내가 잃어버린 물건: </span>
          <strong style={{ fontSize: '15px', color: '#111827' }}>{baseItemTitle}</strong>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#4b5563', lineHeight: '1.4' }}>
            유사한 습득물 목록입니다.
          </p>
        </div>

        {/* 로딩 및 결과 없음 처리 */}
        {loading ? (
           <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>습득물을 탐색하는 중입니다... ⏳</div>
        ) : errorMessage ? (
           <div style={{ textAlign: 'center', padding: '40px 0', color: '#dc2626' }}>{errorMessage}</div>
        ) : similarItems.length === 0 ? (
           <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>비슷한 습득물이 아직 등록되지 않았습니다.</div>
        ) : (
          <div style={styles.grid}>
            {similarItems.map(item => (
              <div key={item.id} style={styles.card} onClick={() => handleCardClick(item.id)}>
                <div style={styles.imageWrapper}>
                  <img 
                    src={item.imageUrl || "https://via.placeholder.com/300x200?text=Found"} 
                    alt="물품 사진" 
                    style={styles.cardImage} 
                  />
                  <span style={styles.badge}>습득</span>
                  <span style={styles.matchBadge}>{Number(item.matchScore || 0).toFixed(1)}% 일치</span>
                </div>
                <div style={styles.cardContent}>
                  <span style={styles.cardCategory}>{item.categoryName || '기타'}</span>
                  <h4 style={styles.cardTitle}>{item.title}</h4>
                  <p style={styles.cardInfo}>{item.location}</p>
                  <p style={styles.cardInfo}>{item.eventDate ? item.eventDate.split('T')[0] : '날짜 미상'}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// 스타일 설정 (기존과 동일)
const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(3px)' },
  modal: { backgroundColor: '#fff', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '800px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #edf2f7', paddingBottom: '12px' },
  title: { margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#111827' },
  closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#a0aec0' },
  summaryBox: { backgroundColor: '#f9fafb', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e5e7eb' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' },
  card: { backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', cursor: 'pointer', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' },
  imageWrapper: { position: 'relative', width: '100%', height: '140px', backgroundColor: '#f3f4f6' },
  cardImage: { width: '100%', height: '100%', objectFit: 'cover' },
  badge: { position: 'absolute', top: '10px', left: '10px', color: '#ffffff', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#10b981' },
  matchBadge: { position: 'absolute', bottom: '10px', right: '10px', color: '#ffffff', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#8b5cf6', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' },
  cardContent: { padding: '14px', display: 'flex', flexDirection: 'column', flex: 1 },
  cardCategory: { fontSize: '12px', color: '#2563eb', fontWeight: 'bold', marginBottom: '4px' },
  cardTitle: { fontSize: '15px', fontWeight: 'bold', color: '#111827', margin: '0 0 6px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  cardInfo: { fontSize: '12px', color: '#4b5563', margin: '2px 0' },
};
