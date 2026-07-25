import React from 'react';

const MyPage = () => {
  // --- 스타일 정의 ---
  const pageStyle = {
    padding: '40px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    color: 'black',
    fontFamily: 'sans-serif'
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '30px'
  };

  const topSectionStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    marginBottom: '40px'
  };

  const statsBoxStyle = {
    flex: 1,
    border: '2px solid #333',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#fff',
    boxShadow: '4px 4px 0px #ccc'
  };

  const bottomSectionStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px'
  };

  const listBoxStyle = {
    flex: 1,
    border: '2px solid #333',
    borderRadius: '8px',
    padding: '20px',
    minHeight: '400px',
    backgroundColor: '#fff',
    boxShadow: '4px 4px 0px #ccc'
  };

  const listTitleStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    borderBottom: '2px solid #eee',
    paddingBottom: '10px',
    marginBottom: '15px'
  };

  const tempBarStyle = {
    width: '100%',
    height: '20px',
    backgroundColor: '#eee',
    border: '1px solid #333',
    borderRadius: '10px',
    marginTop: '10px',
    overflow: 'hidden'
  };

  const tempFillStyle = {
    width: '65%', // 예시 온도 65%
    height: '100%',
    backgroundColor: '#ff6b6b'
  };

  return (
    <div style={pageStyle}>
      <div style={titleStyle}>마이페이지</div>

      {/* 상단: 내 온도, 찾아준 물품, 받은 후기 */}
      <div style={topSectionStyle}>
        <div style={statsBoxStyle}>
          <div style={{ fontWeight: 'bold', fontSize: '18px' }}>내 온도</div>
          <div style={{ marginTop: '10px', color: '#666' }}>36.5°C</div>
          <div style={tempBarStyle}>
            <div style={tempFillStyle}></div>
          </div>
        </div>
        <div style={statsBoxStyle}>
          <div style={{ fontWeight: 'bold', fontSize: '18px' }}>찾아준 물품 7개</div>
          <p style={{ marginTop: '15px', color: '#888', fontSize: '14px' }}>최근 찾아준 물품: 검은색 가죽 지갑</p>
        </div>
        <div style={statsBoxStyle}>
          <div style={{ fontWeight: 'bold', fontSize: '18px' }}>받은 후기 5개</div>
          <p style={{ marginTop: '15px', color: '#888', fontSize: '14px' }}>"정말 감사합니다!" 외 4건</p>
        </div>
      </div>

      {/* 하단: 내 게시글, 채팅 목록, 알림 목록 */}
      <div style={bottomSectionStyle}>
        <div style={listBoxStyle}>
          <div style={listTitleStyle}>내 게시글</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '2.5' }}>
            <li> [분실] 도서관에서 지갑 잃어버렸어요</li>
            <li> [습득] 학생회관 앞 에어팟 케이스</li>
            <li> [분실] 파란색 전공 서적 찾습니다</li>
          </ul>
        </div>
        
        <div style={listBoxStyle}>
          <div style={listTitleStyle}>채팅 목록</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '2.5' }}>
            <li> 놀란늑대 : 학생회관 에어팟 주인입니다!</li>
            <li> 잠자는거북이 : 지갑 색상이 어떻게 되나요?</li>
          </ul>
        </div>
        
        <div style={listBoxStyle}>
          <div style={listTitleStyle}>알림 목록</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '2.5' }}>
            <li> 내 게시글과 유사한 습득물이 등록되었습니다.</li>
            <li> '도서관 지갑' 게시글에서 새로운 채팅이 왔습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MyPage;