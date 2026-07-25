import React, { useState } from 'react';

const ReportForm = ({ setCurrentPage }) => {
  const [reportType, setReportType] = useState('lost');

  const pageStyle = {
    padding: '40px 20px',
    maxWidth: '800px',
    margin: '0 auto',
    color: 'black',
    fontFamily: 'sans-serif'
  };

  const formGroupStyle = { marginBottom: '20px' };
  const labelStyle = { fontWeight: 'bold', display: 'block', marginBottom: '8px', color: 'black' };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '2px solid black',
    backgroundColor: 'white',
    color: 'black',
    borderRadius: '8px',
    boxSizing: 'border-box',
    fontSize: '16px',
    colorScheme: 'light' 
  };

  const buttonStyle = {
    padding: '12px 24px',
    backgroundColor: 'white',
    color: 'black',
    border: '2px solid black',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginRight: '10px',
    boxShadow: '2px 2px 0px black'
  };

  return (
    <div style={pageStyle}>
      <h2 style={{ color: 'black', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '30px' }}>
        분실/습득 신고하기
      </h2>
      
      <div style={formGroupStyle}>
        <label style={labelStyle}>구분</label>
        <select style={inputStyle} value={reportType} onChange={(e) => setReportType(e.target.value)}>
          <option value="lost">물건을 잃어버렸습니다 (분실)</option>
          <option value="found">물건을 찾았습니다 (습득)</option>
        </select>
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>분류</label>
        <select style={inputStyle}>
          <option>전자기기</option><option>지갑/카드</option><option>가방</option>
          <option>의류</option><option>악세서리</option><option>책/노트</option>
          <option>우산</option><option>기타</option>
        </select>
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>물품명</label>
        <input type="text" style={inputStyle} placeholder="예: 검은색 가죽 지갑" />
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>장소</label>
        <input type="text" style={inputStyle} placeholder="예: 도서관 3층 열람실" />
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>날짜 및 시간</label>
        <input 
          type="datetime-local" 
          style={inputStyle} 
          required
        />
      </div>

      {reportType === 'found' && (
        <div style={formGroupStyle}>
          <label style={labelStyle}>본인확인 질문</label>
          <input type="text" style={inputStyle} placeholder="예: 지갑 안에 들어있는 신분증의 이름은?" />
        </div>
      )}

      <div style={formGroupStyle}>
        <label style={labelStyle}>이미지 첨부</label>
        <input type="file" style={inputStyle} />
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>상세 내용</label>
        <textarea style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }} placeholder="상세한 설명을 적어주세요."></textarea>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
        <button 
          style={buttonStyle} 
          onClick={() => { alert('신고가 성공적으로 등록되었습니다.'); setCurrentPage('home'); }}
        >
          등록하기
        </button>
        <button 
          style={{ ...buttonStyle, backgroundColor: '#f5f5f5', boxShadow: 'none' }} 
          onClick={() => setCurrentPage('home')}
        >
          취소
        </button>
      </div>
    </div>
  );
};

export default ReportForm;