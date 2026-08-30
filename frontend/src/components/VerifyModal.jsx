// VerifyModal.jsx

import React, { useState } from 'react';

// 본인 확인(습득물 주인 검증) 팝업 모달 컴포넌트
export default function VerifyModal({ isOpen, onClose, question, onVerify }) {
  const [inputAnswer, setInputAnswer] = useState('');

  if (!isOpen) return null;

  // 정답 제출 핸들러
  const handleSubmit = () => {
    if (!inputAnswer.trim()) {
      alert("정답을 입력해주세요.");
      return;
    }
    onVerify(inputAnswer);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>본인 확인 진행</h3>
        <p style={styles.desc}>
          이 물건의 주인이 맞으신가요?<br/>
          습득자가 남긴 아래 질문에 올바른 답변을 입력하시면 채팅이 활성화됩니다.
        </p>
        
        <div style={styles.questionBox}>
          <span style={styles.qLabel}>Q.</span> {question}
        </div>

        <input 
          type="text" 
          placeholder="정답을 입력하세요" 
          value={inputAnswer}
          onChange={(e) => setInputAnswer(e.target.value)}
          style={styles.input}
        />

        <div style={styles.buttonGroup}>
          <button style={styles.cancelBtn} onClick={onClose}>취소</button>
          <button style={styles.submitBtn} onClick={handleSubmit}>확인</button>
        </div>
      </div>
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