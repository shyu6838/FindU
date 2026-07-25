import React from 'react';

function Home({ requireLogin, changePage }) {
  const recentLostItems = [
    { id: 1, title: '검은색 가죽 지갑', location: '도서관 3층', date: '2026-07-19' },
    { id: 2, title: '에어팟 프로 본체', location: '공학관 1층', date: '2026-07-19' },
    { id: 3, title: '로지텍 무선 마우스', location: '향파관 1층', date: '2026-07-19' },

  ];


  const recentFoundItems = [
    { id: 1, title: '파란색 우산', location: '학생회관 식당', date: '2026-07-19' },
    { id: 2, title: '학생증 (김**)', location: '정문 버스정류장', date: '2026-07-19' },
    { id: 3, title: '노트북 파우치', location: '중앙도서관 4층 열람실', date: '2026-07-18' },

  ];

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
      backgroundColor: '#fafafa'
    },
    cardTitle: { margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: 'black' },
    cardInfo: { margin: 0, fontSize: '14px', color: 'black' },

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

  return (
    <div style={styles.container}>
      <div style={styles.banner}>
        <h2 style={styles.bannerTitle}>캠퍼스 분실물 찾기 서비스 FindU</h2>
        <p style={styles.bannerText}>잃어버린 물건을 찾거나, 습득한 물건의 주인을 찾아주세요.</p>
        <button style={styles.reportButton} onClick={() => requireLogin('report')}>
          분실/습득 신고하기
        </button>
      </div>

      <div style={styles.gridContainer}>
        <div style={styles.column}>
          <div 
            style={styles.sectionHeaderContainer} 
            onClick={() => changePage('lost-list')}
            title="전체 분실물 목록 보기"
          >
            <h3 style={styles.sectionTitle}>최근 등록된 분실물</h3>
            <span style={styles.arrowIcon}>➔</span>
          </div>
          
          {recentLostItems.map(item => (
            <div key={item.id} style={styles.card}>
              <h4 style={styles.cardTitle}>{item.title}</h4>
              <p style={styles.cardInfo}>{item.location} | 📅 {item.date}</p>
            </div>
          ))}
        </div>

        <div style={styles.column}>
          <div 
            style={styles.sectionHeaderContainer} 
            onClick={() => changePage('found-list')}
            title="전체 습득물 목록 보기"
          >
            <h3 style={styles.sectionTitle}>최근 등록된 습득물</h3>
            <span style={styles.arrowIcon}>➔</span>
          </div>

          {recentFoundItems.map(item => (
            <div key={item.id} style={styles.card}>
              <h4 style={styles.cardTitle}>{item.title}</h4>
              <p style={styles.cardInfo}>{item.location} | 📅 {item.date}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.infoContainer}>
        <h3 style={styles.infoMainTitle}>💡 FindU 이용 방법</h3>
        <div style={styles.infoGrid}>
          <div style={styles.infoColumn}>
            <h4 style={styles.infoSubTitle}>습득자의 경우 (물건을 주웠을 때)</h4>
            <ol style={styles.infoList}>
              <li>상단의 <b>[신고하기]</b> 버튼을 누르고 <b>습득 신고</b>를 선택합니다.</li>
              <li>습득한 위치, 시간, 카테고리와 함께 물건의 특징을 입력합니다.</li>
              <li>주인을 정확히 찾기 위한 <b>'본인 확인 질문'</b>(예: 지갑 속 카드 종류 등)을 작성하여 등록합니다.</li>
              <li>채팅을 통해 분실자와 연락하여 물건을 전달합니다.</li>
            </ol>
          </div>

          {/* 분실자의 경우 */}
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

export default Home;