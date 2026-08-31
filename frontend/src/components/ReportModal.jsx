// ReportModal.jsx

import { useState } from 'react';
import api from '../api/axios';

// 게시글 및 채팅 신고 모달 컴포넌트
function ReportModal({ isOpen, onClose, targetType = '게시글', targetTitle = '', targetId = null }) {
  const [reason, setReason] = useState('부적절한 내용 / 허위 정보');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  // 신고 데이터 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!targetId) {
      alert('신고 대상을 확인할 수 없습니다.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/api/reports', {
        targetType,
        targetId,
        reason,
        description: details,
      });

      alert('신고가 접수되었습니다.');
      setDetails('');
      onClose();
    } catch {
      alert('신고 접수에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        
        <div style={headerStyle}>
          <h3 style={titleStyle}>🚨 {targetType} 신고하기</h3>
          <button style={closeButtonStyle} onClick={onClose}>✕</button>
        </div>

        {targetTitle && (
          <div style={targetBoxStyle}>
            <span style={{ fontSize: '13px', color: '#666' }}>신고 대상 : </span>
            <strong style={{ fontSize: '14px', color: '#2d3748' }}>{targetTitle}</strong>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>신고 사유를 선택해 주세요</label>
            <div style={radioGroupStyle}>
              {[
                '부적절한 내용 / 허위 정보',
                '부적절한 언행 및 욕설/비방',
                '영리목적 및 불법 홍보',
                '개인정보 노출 위험',
                '기타 사유'
              ].map((item, idx) => (
                <label key={idx} style={radioLabelStyle}>
                  <input
                    type="radio"
                    name="reportReason"
                    value={item}
                    checked={reason === item}
                    onChange={(e) => setReason(e.target.value)}
                    style={{ marginRight: '8px', accentColor: '#e53e3e' }}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={labelStyle}>상세 사유 (선택 사항)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="구체적인 신고 사유를 작성해 주시면 조치에 큰 도움이 됩니다."
              rows={4}
              style={textareaStyle}
            />
          </div>

          <div style={buttonGroupStyle}>
            <button type="button" onClick={onClose} style={cancelButtonStyle}>
              취소
            </button>
            <button type="submit" style={submitButtonStyle} disabled={submitting}>
              {submitting ? '접수 중...' : '신고하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 스타일 설정
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
  maxWidth: '440px',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
  boxSizing: 'border-box'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
  borderBottom: '1px solid #edf2f7',
  paddingBottom: '12px'
};

const titleStyle = {
  margin: 0,
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#2d3748'
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '18px',
  cursor: 'pointer',
  color: '#a0aec0',
  padding: '4px'
};

const targetBoxStyle = {
  backgroundColor: '#f7fafc',
  padding: '10px 14px',
  borderRadius: '8px',
  marginBottom: '16px',
  border: '1px solid #edf2f7'
};

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '600',
  color: '#4a5568',
  marginBottom: '10px'
};

const radioGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
};

const radioLabelStyle = {
  fontSize: '14px',
  color: '#2d3748',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center'
};

const textareaStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
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

const cancelButtonStyle = {
  padding: '10px 18px',
  borderRadius: '8px',
  border: '1px solid #cbd5e0',
  backgroundColor: '#ffffff',
  color: '#4a5568',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer'
};

const submitButtonStyle = {
  padding: '10px 18px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#e53e3e',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer'
};

export default ReportModal;
