// ReportForm.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 기본 카테고리 목록 설정
const DEFAULT_CATEGORIES = [
  { id: 1, name: '카드/신분증' },
  { id: 2, name: '이어폰/헤드폰' },
  { id: 3, name: '스마트폰/노트북/태블릿' },
  { id: 4, name: '지갑' },
  { id: 5, name: '책/노트/필기구' },
  { id: 6, name: '가방/파우치' },
  { id: 7, name: '의류/모자' },
  { id: 8, name: '기타 전자기기' },
  { id: 9, name: '기타' }
];

// 분실 및 습득 신고 게시물 작성 및 수정 폼 컴포넌트
export default function ReportForm({ setCurrentPage, initialType = 'lost', editData = null }) {
  const isEditMode = !!editData;
  const [reportType, setReportType] = useState(initialType);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    location: '',
    eventDate: '',
    eventTime: '',
    content: '',
    question: '',
    answer: '',
    image: null
  });

  // 수정 모드일 경우 기존 데이터 세팅 및 카테고리 목록 조회
  useEffect(() => {
    if (editData) {
      setReportType(editData.type ? editData.type.toLowerCase() : 'lost');
      
      const dateParts = editData.eventDate ? editData.eventDate.split('T') : ['', ''];
      setFormData({
        categoryId: editData.categoryId || '',
        title: editData.title || '',
        location: editData.location || '',
        eventDate: dateParts[0] || '',
        eventTime: dateParts[1] ? dateParts[1].substring(0, 5) : '',
        content: editData.content || '',
        question: editData.question || '',
        answer: editData.answer || '',
        image: null
      });
    } else {
      setReportType(initialType);
    }

    axios.get('http://localhost:8080/api/categories')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setCategories(res.data);
        }
      })
      .catch(err => console.error("카테고리 정보 로드 실패:", err));
  }, [editData, initialType]);

  // 입력 폼 변경 핸들러
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData(prev => ({ ...prev, image: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // 카테고리 선택 핸들러
  const handleCategorySelect = (id) => {
    setFormData(prev => ({ ...prev, categoryId: id }));
  };

  // 게시물 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.categoryId) {
      alert("카테고리를 선택해주세요.");
      return;
    }

    const dateTime = formData.eventTime 
      ? `${formData.eventDate}T${formData.eventTime}:00` 
      : `${formData.eventDate}T00:00:00`;

    const requestData = {
      type: reportType.toUpperCase(),
      title: formData.title,
      content: formData.content,
      location: formData.location,
      eventDate: dateTime,
      question: reportType === 'found' ? formData.question : null,
      answer: reportType === 'found' ? formData.answer : null,
      categoryId: parseInt(formData.categoryId)
    };

    try {
      const token = localStorage.getItem('accessToken'); 
      const headers = { Authorization: `Bearer ${token}` };
      
      if (isEditMode) {
        await axios.put(`http://localhost:8080/api/items/${editData.id}`, requestData, { headers });
        alert('게시물이 수정되었습니다.');
        setCurrentPage('post-detail', editData.id);
      } else {
        await axios.post('http://localhost:8080/api/items', requestData, { headers });
        alert('게시물이 성공적으로 등록되었습니다.');
        setCurrentPage(reportType === 'lost' ? 'lost-list' : 'found-list'); 
      }
    } catch (error) {
      alert(isEditMode ? '게시물 수정에 실패했습니다.' : '게시물 등록에 실패했습니다.');
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>{isEditMode ? '게시물 수정하기' : '분실/습득 신고하기'}</h2>
      
      <form onSubmit={handleSubmit} style={styles.formContainer}>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>구분</label>
          <select 
            style={styles.input} 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)} 
            disabled={isEditMode}
          >
            <option value="lost">물건을 잃어버렸습니다 (분실)</option>
            <option value="found">물건을 찾았습니다 (습득)</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>분류 (카테고리)</label>
          <div style={styles.categoryWrapper}>
            {categories.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleCategorySelect(c.id)}
                style={{
                  ...styles.categoryButton,
                  border: formData.categoryId === c.id ? 'none' : '1px solid #d1d5db',
                  backgroundColor: formData.categoryId === c.id ? '#2563eb' : '#fff',
                  color: formData.categoryId === c.id ? '#fff' : '#374151',
                  fontWeight: formData.categoryId === c.id ? 'bold' : 'normal'
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>사진 첨부</label>
          <input 
            type="file" 
            accept="image/*" 
            name="image" 
            onChange={handleChange} 
            style={styles.fileInput} 
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>물품명</label>
          <input 
            type="text" 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            style={styles.input} 
            placeholder="예) 검은색 가죽 지갑" 
            required 
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>장소</label>
          <input 
            type="text" 
            name="location" 
            value={formData.location} 
            onChange={handleChange} 
            style={styles.input} 
            placeholder="예) 도서관 3층 열람실" 
            required 
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>날짜 및 시간</label>
          <div style={styles.dateTimeWrapper}>
            <input 
              type="date" 
              name="eventDate" 
              value={formData.eventDate} 
              onChange={handleChange} 
              style={styles.input} 
              required 
            />
            <input 
              type="time" 
              name="eventTime" 
              value={formData.eventTime} 
              onChange={handleChange} 
              style={styles.input} 
            />
          </div>
        </div>

        {reportType === 'found' && (
          <>
            <div style={styles.formGroup}>
              <label style={styles.label}>본인 확인 질문 (주인 검증용)</label>
              <input 
                type="text" 
                name="question" 
                value={formData.question} 
                onChange={handleChange} 
                style={styles.input} 
                placeholder="예) 지갑 안 신분증의 이름은?" 
                required 
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>본인 확인 정답</label>
              <input 
                type="text" 
                name="answer" 
                value={formData.answer} 
                onChange={handleChange} 
                style={styles.input} 
                placeholder="예) 홍길동" 
                required 
              />
            </div>
          </>
        )}

        <div style={styles.formGroup}>
          <label style={styles.label}>상세 설명</label>
          <textarea 
            name="content" 
            value={formData.content} 
            onChange={handleChange} 
            style={{ ...styles.input, height: '120px', resize: 'vertical' }} 
            placeholder="물품의 특징, 상태 등을 자세히 적어주세요." 
            required 
          />
        </div>

        <button type="submit" style={styles.submitButton}>
          {isEditMode ? '수정 완료' : '등록하기'}
        </button>
      </form>
    </div>
  );
}

// 스타일 속성
const styles = {
  page: { 
    maxWidth: '600px', 
    margin: '0 auto', 
    padding: '40px 20px', 
    fontFamily: "'Pretendard', sans-serif" 
  },
  pageTitle: { 
    fontSize: '24px', 
    fontWeight: 'bold', 
    marginBottom: '24px', 
    color: '#111827' 
  },
  formContainer: { 
    backgroundColor: '#fff', 
    padding: '30px', 
    borderRadius: '16px', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)' 
  },
  formGroup: { 
    marginBottom: '20px' 
  },
  label: { 
    display: 'block', 
    fontWeight: 'bold', 
    marginBottom: '8px', 
    color: '#374151' 
  },
  input: { 
    width: '100%', 
    padding: '12px', 
    border: '1px solid #d1d5db', 
    borderRadius: '8px', 
    fontSize: '15px', 
    boxSizing: 'border-box', 
    backgroundColor: '#ffffff', 
    color: '#111827', 
    colorScheme: 'light' 
  },
  categoryWrapper: { 
    display: 'flex', 
    gap: '8px', 
    flexWrap: 'wrap' 
  },
  categoryButton: {
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  fileInput: { 
    width: '100%', 
    padding: '10px', 
    border: '1px solid #d1d5db', 
    borderRadius: '8px', 
    fontSize: '14px', 
    backgroundColor: '#f9fafb', 
    color: '#111827' 
  },
  dateTimeWrapper: { 
    display: 'flex', 
    gap: '10px' 
  },
  submitButton: { 
    width: '100%', 
    padding: '14px', 
    backgroundColor: '#2563eb', 
    color: '#ffffff', 
    border: 'none', 
    borderRadius: '8px', 
    fontSize: '16px', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    marginTop: '10px' 
  }
};