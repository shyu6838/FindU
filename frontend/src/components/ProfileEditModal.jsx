import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export default function ProfileEditModal({ isOpen, onClose, currentUser, onUpdateSuccess }) {
  const [nickname, setNickname] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  // 모달이 열리거나 유저 정보가 바뀔 때 기본 닉네임 세팅
  useEffect(() => {
    if (currentUser) {
      setNickname(currentUser.nickname || '');
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let finalImageUrl = currentUser?.profileImage; // 기존 프로필 이미지 URL 기본값

      // 1. 새로운 사진이 첨부되었다면, 이미지 전용 API로 먼저 업로드
      if (profileImage) {
        const imageFormData = new FormData();
        imageFormData.append('file', profileImage); // 백엔드 설정에 맞게 'file'로 전송

        const imageRes = await api.post('/api/images', imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // 백엔드에서 받아온 새 S3 이미지 URL로 업데이트
        finalImageUrl = imageRes.data?.imageUrl || finalImageUrl;
      }

      // 2. 사진 URL과 닉네임을 JSON 형태로 묶어서 유저 정보 수정 요청
      const requestData = {
        nickname: nickname,
        profileImage: finalImageUrl
      };

      await api.patch('/api/users/me', requestData); // 기본 application/json 형식으로 전송
      
      alert('프로필이 성공적으로 수정되었습니다.');
      onUpdateSuccess(); // 마이페이지 데이터 새로고침
      onClose(); // 모달 닫기
    } catch (error) {
      console.error('프로필 수정 실패:', error);
      alert('프로필 수정에 실패했습니다. (콘솔 창의 에러 로그를 확인해 주세요)');
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>내 정보 수정</h3>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>닉네임</label>
            <input 
              type="text" 
              value={nickname} 
              onChange={(e) => setNickname(e.target.value)} 
              maxLength={20}
              style={styles.input}
              placeholder="새 닉네임을 입력하세요"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>프로필 사진</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setProfileImage(e.target.files[0])}
              style={styles.fileInput}
            />
            <p style={styles.helpText}>새로운 사진을 선택하지 않으면 기존 프로필이 유지됩니다.</p>
          </div>

          <button type="submit" style={styles.submitBtn}>저장하기</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(3px)' },
  modal: { backgroundColor: '#fff', padding: '28px', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#111827' },
  closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#a0aec0' },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#374151' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' },
  fileInput: { width: '100%', padding: '8px', fontSize: '13px', color: '#4b5563' },
  helpText: { fontSize: '12px', color: '#6b7280', marginTop: '6px' },
  submitBtn: { width: '100%', padding: '14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }
};