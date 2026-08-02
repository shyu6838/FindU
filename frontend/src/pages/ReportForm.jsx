import React, { useState, useEffect } from 'react';

/**
 * [ReportForm.jsx]
 * 분실물 및 습득물을 신고(등록)하는 폼 페이지 컴포넌트입니다.
 * - 주요 역할: 사용자가 물품 정보(분류, 이름, 장소, 시간, 사진 등)를 입력하고 등록할 수 있게 합니다.
 * - 특징: '습득(found)' 선택 시 분실자를 확인하기 위한 '본인확인 질문' 입력란이 조건부로 나타납니다.
 */

const ReportForm = ({ setCurrentPage, initialType = 'lost' }) => {
  // [상태 관리] 신고 유형 (분실 'lost' 또는 습득 'found')
  const [reportType, setReportType] = useState(initialType);

  // [효과] 외부(홈 화면 등)에서 넘어온 initialType이 변경되면 상태를 동기화
  useEffect(() => {
    setReportType(initialType);
  }, [initialType]);

  return (
    <div style={styles.page}>
      
      {/* 상단 타이틀 */}
      <h2 style={styles.pageTitle}>
        분실/습득 신고하기
      </h2>
      
      {/* 1. 구분 및 분류 선택 */}
      <div style={styles.formGroup}>
        <label style={styles.label}>구분</label>
        <select style={styles.input} value={reportType} onChange={(e) => setReportType(e.target.value)}>
          <option value="lost">물건을 잃어버렸습니다 (분실)</option>
          <option value="found">물건을 찾았습니다 (습득)</option>
        </select>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>분류</label>
        <select style={styles.input}>
          <option>전자기기</option>
          <option>지갑/카드</option>
          <option>가방</option>
          <option>의류</option>
          <option>악세서리</option>
          <option>책/노트</option>
          <option>우산</option>
          <option>기타</option>
        </select>
      </div>

      {/* 2. 상세 정보 입력 (물품명, 장소) */}
      <div style={styles.formGroup}>
        <label style={styles.label}>물품명</label>
        <input type="text" style={styles.input} placeholder="예: 검은색 가죽 지갑" />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>장소</label>
        <div style={styles.flexGroup}>
          <input 
            type="text" 
            style={{ ...styles.input, flex: 1 }} 
            placeholder="예: 중앙도서관 3층 열람실" 
          />
          <button 
            style={styles.mapButton} 
            onClick={(e) => { 
              e.preventDefault(); 
              alert('🗺️ 카카오맵 API 창이 열려 위치를 핀(Pin) 할 수 있게 될 예정입니다!'); 
            }}
          >
            📍 지도에서 찾기
          </button>
        </div>
      </div>

      {/* 3. 날짜 및 시간 입력 */}
      {/* 💡 날짜(필수)와 시간(선택) 입력창 분리*/}
      <div style={styles.formGroup}>
        <label style={styles.label}>날짜 (필수) 및 시간 (선택)</label>
        <div style={styles.flexGroup}>
          <input 
            type="date" 
            style={{ ...styles.datetime, flex: 1 }} 
            required 
            title="날짜는 필수 입력입니다."
          />
          <input 
            type="time" 
            style={{ ...styles.datetime, flex: 1 }} 
            title="시간은 선택 사항입니다."
          />
        </div>
      </div>

      {/* 4. 조건부 입력: 습득물일 경우에만 나타나는 본인확인 질문 */}
      {reportType === 'found' && (
        <div style={styles.formGroup}>
          <label style={styles.label}>본인확인 질문</label>
          <input type="text" style={styles.input} placeholder="예: 지갑 안에 들어있는 신분증의 이름은?" />
        </div>
      )}

      {/* 5. 파일 및 텍스트 첨부 */}
      <div style={styles.formGroup}>
        <label style={styles.label}>이미지 첨부</label>
        <input type="file" style={{ ...styles.input, padding: '10px' }} />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>상세 내용</label>
        <textarea style={{ ...styles.input, minHeight: '160px', resize: 'vertical' }} placeholder="상세한 설명을 적어주세요."></textarea>
      </div>

      {/* 6. 하단 액션 버튼 */}
      <div style={styles.buttonGroup}>
        <button 
          style={styles.primaryButton} 
          onClick={() => { alert('신고가 성공적으로 등록되었습니다.'); setCurrentPage('home'); }}
        >
          등록하기
        </button>
        <button 
          style={styles.cancelButton} 
          onClick={() => setCurrentPage('home')}
        >
          취소
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// UI 스타일 정의
// ---------------------------------------------------------
const styles = {
  page: { padding: '40px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: "'Pretendard', sans-serif" },
  pageTitle: { color: '#111827', fontSize: '28px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '32px', marginTop: 0 },
  formGroup: { marginBottom: '24px' },
  label: { fontWeight: 'bold', display: 'block', marginBottom: '10px', color: '#374151', fontSize: '15px' },
  
  // 공통 인풋 스타일
  input: { width: '100%', padding: '14px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#111827', borderRadius: '10px', boxSizing: 'border-box', fontSize: '15px', outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  
  // 달력/시간 전용 인풋 스타일
  datetime: { width: '100%', padding: '14px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#111827', borderRadius: '10px', boxSizing: 'border-box', fontSize: '15px', outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', colorScheme: 'light', fontFamily: "inherit", cursor: 'pointer' },
  
  flexGroup: { display: 'flex', gap: '10px' },
  mapButton: { padding: '0 20px', backgroundColor: '#f9fafb', color: '#374151', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' },
  buttonGroup: { display: 'flex', gap: '12px', marginTop: '40px' },
  primaryButton: { padding: '14px 28px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', flex: 1, boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)' },
  cancelButton: { padding: '14px 28px', backgroundColor: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', flex: 1 }
};

export default ReportForm;