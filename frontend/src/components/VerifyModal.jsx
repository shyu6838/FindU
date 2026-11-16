// VerifyModal.jsx

import { useState } from 'react';

// 본인 확인(습득물 주인 검증) 팝업 모달 컴포넌트
export default function VerifyModal({ isOpen, onClose, question, onVerify, onReview, pendingReview }) {
  const [inputAnswer, setInputAnswer] = useState('');
  const [evidence, setEvidence] = useState('');
  const [showReview, setShowReview] = useState(!question);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting || (showReview && pendingReview)) return;
    const value = (showReview ? evidence : inputAnswer).trim();
    if (!value) return;
    setSubmitting(true);
    setError('');
    try {
      await (showReview ? onReview(value) : onVerify(value));
    } catch (requestError) {
      const status = requestError.response?.status;
      if (!showReview && status === 403) setError('답변이 일치하지 않습니다. 다른 방법으로 확인을 요청할 수 있어요.');
      else if (showReview && status === 409) setError('이미 검토 중인 요청이 있습니다.');
      else setError('제출하지 못했습니다. 게시글 상태를 확인한 뒤 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <form role="dialog" aria-modal="true" aria-labelledby="verify-title" style={styles.modal} onSubmit={handleSubmit}>
        <h3 id="verify-title" style={styles.title}>{showReview ? '다른 방법으로 확인 요청' : '분실물 확인 질문'}</h3>
        {showReview ? (
          <>
            <label htmlFor="review-evidence" style={styles.desc}>
              게시글에 공개되지 않은 특징이나 분실한 장소·시간을 적어주세요. 카드번호나 비밀번호는 입력하지 마세요.
            </label>
            <textarea id="review-evidence" style={styles.input} rows={4} maxLength={500} required
              value={evidence} onChange={event => setEvidence(event.target.value)} disabled={submitting || pendingReview} />
            {pendingReview && <p role="status">이미 검토 중인 요청이 있습니다.</p>}
          </>
        ) : (
          <>
            <label htmlFor="verify-answer" style={{ ...styles.questionBox, display: 'block' }}>{question}</label>
            <input id="verify-answer" value={inputAnswer} onChange={event => setInputAnswer(event.target.value)}
              style={styles.input} required disabled={submitting} />
          </>
        )}
        {error && <p role="alert">{error}</p>}
        {question && (
          <button type="button" disabled={submitting}
            onClick={() => { setShowReview(!showReview); setError(''); }}>
            {showReview ? '질문에 답하기' : '다른 방법으로 확인 요청'}
          </button>
        )}
        <div style={styles.buttonGroup}>
          <button type="button" style={styles.cancelBtn} disabled={submitting} onClick={onClose}>닫기</button>
          <button type="submit" style={styles.submitBtn} disabled={submitting || (showReview && pendingReview)}>
            {submitting ? '제출 중…' : showReview ? '확인 요청 보내기' : '답변 확인'}
          </button>
        </div>
      </form>
    </div>
  );
}

// 스타일 설정
const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modal: { backgroundColor: '#fff', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
  title: { margin: '0 0 10px 0', fontSize: '20px', color: '#111827' },
  desc: { color: '#6b7280', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' },
  questionBox: { backgroundColor: '#eff6ff', padding: '16px', borderRadius: '12px', color: '#1e3a8a', fontWeight: 'bold', marginBottom: '20px', fontSize: '15px' },
  qLabel: { color: '#2563eb', marginRight: '6px' },
  input: { width: '100%', padding: '14px', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '15px', marginBottom: '24px', boxSizing: 'border-box' },
  buttonGroup: { display: 'flex', gap: '10px' },
  cancelBtn: { flex: 1, padding: '12px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  submitBtn: { flex: 1, padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
};
