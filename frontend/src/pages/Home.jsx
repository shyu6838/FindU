import React, { useState, useEffect } from 'react';
import api from '../api/axios';

// 메인 홈 화면 컴포넌트
// 서비스 소개, 최근 게시물 요약, 이용 방법 안내 제공
function Home({ requireLogin, changePage }) {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 최근 게시글 목록 조회
  useEffect(() => {
    const fetchRecentItems = async () => {
      try {
        const res = await api.get('/api/items');
        const allItems = res.data || [];

        const recentLost = allItems
          .filter(item => item.type === 'LOST')
          .slice(0, 3);

        const recentFound = allItems
          .filter(item => item.type === 'FOUND')
          .slice(0, 3);

        setLostItems(recentLost);
        setFoundItems(recentFound);
      } catch (err) {
        console.error("게시글 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentItems();
  }, []);

  return (
    <div style={styles.container}>
      
      {/* 서비스 소개 배너 */}
      <div style={styles.banner}>
        <h2 style={styles.bannerTitle}>캠퍼스 분실물 찾기 서비스 FindU</h2>
        <p style={styles.bannerText}>잃어버린 물건을 찾거나, 습득한 물건의 주인을 찾아주세요.</p>
        <button style={styles.reportButton} onClick={() => requireLogin('report')}>
          분실/습득 신고하기
        </button>
      </div>

      {/* 최근 게시물 목록 */}
      <div style={styles.gridContainer}>
        
        {/* 최근 분실물 */}
        <div style={styles.column}>
          <div 
            style={styles.sectionHeaderContainer} 
            onClick={() => changePage('lost-list')}
            title="전체 분실물 목록 보기"
          >
            <h3 style={styles.sectionTitle}>최근 등록된 분실물</h3>
            <span style={styles.arrowIcon}>➔</span>
          </div>
          
          {loading ? (
            <p style={styles.loadingText}>불러오는 중...</p>
          ) : lostItems.length === 0 ? (
            <p style={styles.emptyText}>최근 등록된 분실물이 없습니다.</p>
          ) : (
            lostItems.map(item => (
              <div 
                key={item.id} 
                style={styles.card}
                onClick={() => changePage('post-detail', item.id)}
              >
                <h4 style={styles.cardTitle}>{item.title}</h4>
                <p style={styles.cardInfo}>
                  {item.location || '장소 미상'} |  {item.eventDate ? item.eventDate.split('T')[0] : '날짜 미상'}
                </p>
              </div>
            ))
          )}
        </div>

        {/* 최근 습득물 */}
        <div style={styles.column}>
          <div 
            style={styles.sectionHeaderContainer} 
            onClick={() => changePage('found-list')}
            title="전체 습득물 목록 보기"
          >
            <h3 style={styles.sectionTitle}>최근 등록된 습득물</h3>
            <span style={styles.arrowIcon}>➔</span>
          </div>

          {loading ? (
            <p style={styles.loadingText}>불러오는 중...</p>
          ) : foundItems.length === 0 ? (
            <p style={styles.emptyText}>최근 등록된 습득물이 없습니다.</p>
          ) : (
            foundItems.map(item => (
              <div 
                key={item.id} 
                style={styles.card}
                onClick={() => changePage('post-detail', item.id)}
              >
                <h4 style={styles.cardTitle}>{item.title}</h4>
                <p style={styles.cardInfo}>
                  {item.location || '장소 미상'} |  {item.eventDate ? item.eventDate.split('T')[0] : '날짜 미상'}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 서비스 이용 방법 안내 */}
      <div style={styles.infoContainer}>
        <h3 style={styles.infoMainTitle}>FindU 이용 방법</h3>
        <div style={styles.infoGrid}>
          
          {/* 습득자 안내 */}
          <div style={styles.infoColumn}>
            <h4 style={styles.infoSubTitle}>습득자의 경우 (물건을 주웠을 때)</h4>
            <ol style={styles.infoList}>
              <li>상단의 <b>[신고하기]</b> 버튼을 누르고 <b>습득 신고</b>를 선택합니다.</li>
              <li>습득한 위치, 시간, 카테고리와 함께 물건의 특징을 입력합니다.</li>
              <li>주인을 정확히 찾기 위한 <b>'본인 확인 질문'</b>(예: 지갑 속 카드 종류 등)을 작성하여 등록합니다.</li>
              <li>채팅을 통해 분실자와 연락하여 물건을 전달합니다.</li>
            </ol>
          </div>

          {/* 분실자 안내 */}
          <div style={styles.infoColumn}>
            <h4 style={{ ...styles.infoSubTitle, color: '#ff8c00' }}>분실자의 경우 (물건을 잃어버렸을 때)</h4>
            <ol style={styles.infoList}>
              <li><b>[습득물 목록]</b>에서 내 물건이 올라와 있는지 확인합니다.</li>
              <li>물건이 없다면 <b>[신고하기]</b> 버튼을 눌러 <b>분실 신고</b> 글을 작성하고 대기합니다. 분실 신고 글을 작성하면 유사 습득물을 확인할 수 있습니다.</li>
            </ol>
          </div>

        </div>
      </div>
      
    </div>
  );
}

// UI 스타일 정의
const styles = {
  container: { padding: '20px', maxWidth: '1000px', margin: '0 auto', color: 'black' },
  banner: {
    backgroundColor: '#f0f4f8', padding: '40px 20px', borderRadius: '12px',
    textAlign: 'center', marginBottom: '40px'
  },
  bannerTitle: { margin: '0 0 10px 0', fontSize: '24px', fontWeight: 'bold', color: 'black' },
  bannerText: { margin: '0 0 20px 0', color: 'black', fontWeight: '500' }, 
  reportButton: {
    backgroundColor: '#007bff', color: 'white', border: 'none',
    padding: '12px 24px', borderRadius: '8px', fontSize: '16px',
    cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  gridContainer: { display: 'flex', gap: '20px' },
  column: { flex: 1, backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #eee' },
  sectionHeaderContainer: {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottom: '2px solid #f0f0f0', 
    paddingBottom: '10px', 
    marginBottom: '15px',
    cursor: 'pointer',
  },
  sectionTitle: { margin: 0, fontSize: '18px', fontWeight: 'bold', color: 'black' },
  arrowIcon: { fontSize: '18px', color: '#007bff', fontWeight: 'bold' },
  card: {
    border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '10px',
    backgroundColor: '#fafafa', cursor: 'pointer', transition: 'background-color 0.2s ease'
  },
  cardTitle: { margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: 'black' },
  cardInfo: { margin: 0, fontSize: '14px', color: 'black' },
  loadingText: { color: '#6b7280', fontSize: '14px', textAlign: 'center' },
  emptyText: { color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '20px 0' },
  infoContainer: {
    marginTop: '40px',
    backgroundColor: '#f8f9fa',
    padding: '25px',
    borderRadius: '12px',
    border: '1px solid #eee',
  },
  infoMainTitle: { margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold', color: 'black' },
  infoGrid: { display: 'flex', gap: '20px' },
  infoColumn: { flex: 1, backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' },
  infoSubTitle: { margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', color: '#007bff' },
  infoList: { margin: 0, paddingLeft: '20px', color: 'black', lineHeight: '1.8', fontSize: '14px', textAlign: 'left' }
};

export default Home;