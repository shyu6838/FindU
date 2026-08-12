import React, { useState } from 'react';

/**
 * 습득물 본인 확인 질문 답변 모달 컴포넌트
 * @param {boolean} isOpen - 모달 열림 여부
 * @param {function} onClose - 모달 닫기
 * @param {string} question - 습득자가 작성한 본인 확인 질문
 * @param {function} onSuccess - 답변 인증 성공 시 실행할 콜백 함수
 */
export default function VerifyModal({ isOpen, onClose, question, onSuccess }) {
  const [answer, setAnswer] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      alert('답변을 입력해 주세요!');
      return;
    }

    // 💡 프론트엔드 목업 로직 (실제 서비스에서는 백엔드 API로 정답 검증)
    alert('본인 확인 질문 답변이 제출되었습니다.\n인증이 완료되어 채팅하기 버튼이 활성화됩니다!');
    onSuccess(); // 채팅하기 버튼 활성화 처리
    setAnswer('');
    onClose();
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* 상단 헤더 */}
        <div style={headerStyle}>
          <h3 style={titleStyle}>❓ 습득자 본인 확인 질문</h3>
          <button style={closeBtnStyle} onClick={onClose}>✕</button>
        </div>

        {/* 안내 문구 및 질문 박스 */}
        <p style={subTextStyle}>
          습득자가 물건의 실제 소유자인지 확인하기 위해 설정한 질문입니다. 정확히 답변해 주세요.
        </p>
        
        <div style={questionBoxStyle}>
          <span style={questionLabelStyle}> Q. 질문</span>
          <p style={questionTextStyle}>
            {question || '사전에 입력한 본인확인질문'}
          </p>
        </div>

        {/* 답변 입력 폼 */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>답변 작성</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="답변을 상세히 입력해 주세요."
              rows={4}
              style={textareaStyle}
            />
          </div>

          {/* 하단 버튼 */}
          <div style={buttonGroupStyle}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>
              취소
            </button>
            <button type="submit" style={submitBtnStyle}>
              답변 제출하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ------------------- inline-CSS 스타일 ------------------- //

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(3px)'
};

const modalStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '24px',
  width: '90%',
  maxWidth: '460px',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
  boxSizing: 'border-box'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
  borderBottom: '1px solid #edf2f7',
  paddingBottom: '12px'
};

const titleStyle = {
  margin: 0,
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111827'
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  fontSize: '18px',
  cursor: 'pointer',
  color: '#a0aec0'
};

const subTextStyle = {
  fontSize: '13px',
  color: '#6b7280',
  marginTop: 0,
  marginBottom: '16px',
  lineHeight: '1.4'
};

const questionBoxStyle = {
  backgroundColor: '#f3f4f6',
  padding: '14px',
  borderRadius: '10px',
  marginBottom: '18px',
  border: '1px solid #e5e7eb'
};

const questionLabelStyle = {
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#2563eb',
  display: 'block',
  marginBottom: '4px'
};

const questionTextStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1f2937',
  margin: 0,
  lineHeight: '1.4'
};

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '8px'
};

const textareaStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
  fontFamily: 'inherit',
  resize: 'none',
  outline: 'none'
};

const buttonGroupStyle = {
  display: 'flex',
  gap: '10px',
  justifyContent: 'flex-end'
};

const cancelBtnStyle = {
  padding: '10px 18px',
  borderRadius: '8px',
  border: '1px solid #cbd5e0',
  backgroundColor: '#ffffff',
  color: '#4b5568',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer'
};

const submitBtnStyle = {
  padding: '10px 18px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer'
};