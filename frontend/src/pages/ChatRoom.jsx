import React, { useState } from 'react';
import ReportModal from '../components/ReportModal';

/**
 * 게시글 연동 1:1 채팅방 컴포넌트
 * @param {function} changePage - 페이지 이동 함수
 * @param {object} postInfo - 상세페이지에서 전달받은 게시글 정보
 */
function ChatRoom({ changePage, postInfo }) {
  // 1. 신고하기 모달 열림/닫힘 상태
  const [isReportOpen, setIsReportOpen] = useState(false);

  // 2. 채팅 메시지 입력값
  const [inputText, setInputText] = useState('');

  // 3. 연관된 게시글 정보 (전달받은 정보가 없을 경우 대비한 기본값)
  const currentPost = postInfo || {
    id: 1,
    title: '검은색 가죽 지갑',
    type: 'LOST',
    category: '지갑',
    location: '인문관 3층 복도',
    date: '2026-07-24'
  };

  // 4. 랜덤 닉네임 생성 (예: 사나운 코끼리, 용감한 다람쥐 등)
  const [partnerName] = useState(() => {
    const adjectives = ['사나운', '친절한', '용감한', '즐거운', '느긋한', '귀여운', '엉뚱한'];
    const animals = ['코끼리', '다람쥐', '호랑이', '사자', '펭귄', '여우', '곰'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomAni = animals[Math.floor(Math.random() * animals.length)];
    return `${randomAdj} ${randomAni}`;
  });

  // 5. 대화 내역 (더미 데이터 삭제 -> 빈 배열로 시작)
  const [messages, setMessages] = useState([]);

  // 메시지 전송 버튼 클릭/엔터 시 처리
  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: inputText,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  return (
    <div style={containerStyle}>
      {/* ------------------- A. 상단 헤더 (상대 정보 + 신고 버튼) ------------------- */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            style={backButtonStyle} 
            onClick={() => changePage && changePage('detail', currentPost)}
            title="게시글로 돌아가기"
          >
            ←
          </button>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#2d3748' }}>
              {partnerName}
            </h3>
            <span style={{ fontSize: '12px', color: '#38a169', fontWeight: '500' }}>
              ● 온라인
            </span>
          </div>
        </div>

        {/* 채팅 신고 버튼 (모달 호출) */}
        <button style={reportButtonStyle} onClick={() => setIsReportOpen(true)}>
          🚨 채팅 신고
        </button>
      </div>

      {/* ------------------- B. 연관 게시글 요약 바 ------------------- */}
      <div style={postBannerStyle}>
        <div style={postImageThumbnailStyle}>📦</div>
        <div style={{ flex: 1, marginLeft: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={typeBadgeStyle}>
              {currentPost.type === 'LOST' ? '분실' : '습득'}
            </span>
            <span style={{ fontSize: '12px', color: '#718096' }}>{currentPost.location}</span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#2d3748', marginTop: '3px' }}>
            {currentPost.title}
          </div>
        </div>
        {/* 💡 글 보기 클릭 시 해당 게시글 상세 페이지('detail')로 데이터와 함께 이동 */}
        <button 
          style={viewPostButtonStyle}
          onClick={() => changePage && changePage('detail', currentPost)}
        >
          글 보기
        </button>
      </div>

      {/* ------------------- C. 채팅 메시지 대화창 ------------------- */}
      <div style={chatBodyStyle}>
        {messages.length === 0 ? (
          <div style={emptyChatStyle}>
            대화 내역이 없습니다.<br />메시지를 보내 대화를 시작해 보세요!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === 'me';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  marginBottom: '14px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '6px',
                    flexDirection: isMe ? 'row-reverse' : 'row'
                  }}
                >
                  {/* 말풍선 */}
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '16px',
                      borderTopLeftRadius: isMe ? '16px' : '2px',
                      borderTopRightRadius: isMe ? '2px' : '16px',
                      backgroundColor: isMe ? '#2563eb' : '#ffffff',
                      color: isMe ? '#ffffff' : '#2d3748',
                      fontSize: '14px',
                      lineHeight: '1.4',
                      maxWidth: '260px',
                      wordBreak: 'break-word',
                      boxShadow: isMe ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
                      border: isMe ? 'none' : '1px solid #e2e8f0'
                    }}
                  >
                    {msg.text}
                  </div>
                  {/* 전송 시간 */}
                  <span style={{ fontSize: '11px', color: '#a0aec0', marginBottom: '2px' }}>
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ------------------- D. 하단 메시지 입력창 ------------------- */}
      <form onSubmit={handleSend} style={inputContainerStyle}>
        <input
          type="text"
          placeholder="메시지를 입력하세요..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={inputStyle}
        />
        <button type="submit" style={sendButtonStyle}>
          전송
        </button>
      </form>

      {/* ------------------- E. 채팅 신고 모달 연동 ------------------- */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="채팅"
        targetTitle={`${partnerName}님과의 대화`}
      />
    </div>
  );
}

// ------------------- inline-CSS 스타일 정의 ------------------- //

const containerStyle = {
  maxWidth: '600px',
  margin: '20px auto',
  height: '78vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#f7fafc',
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  overflow: 'hidden',
  border: '1px solid #e2e8f0'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '14px 20px',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #edf2f7'
};

const backButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '20px',
  cursor: 'pointer',
  color: '#4a5568',
  padding: '4px 8px',
  borderRadius: '6px'
};

const reportButtonStyle = {
  backgroundColor: '#fff5f5',
  color: '#e53e3e',
  border: '1px solid #fed7d7',
  padding: '6px 12px',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer'
};

const postBannerStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '12px 20px',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e2e8f0',
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
};

const postImageThumbnailStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '8px',
  backgroundColor: '#edf2f7',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px'
};

const typeBadgeStyle = {
  fontSize: '11px',
  padding: '2px 6px',
  borderRadius: '4px',
  backgroundColor: '#ebf8ff',
  color: '#2563eb',
  fontWeight: 'bold'
};

const viewPostButtonStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #cbd5e0',
  color: '#4a5568',
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '600',
  cursor: 'pointer'
};

const chatBodyStyle = {
  flex: 1,
  padding: '20px',
  overflowY: 'auto',
  backgroundColor: '#f8fafc'
};

const emptyChatStyle = {
  textAlign: 'center',
  color: '#a0aec0',
  fontSize: '14px',
  marginTop: '40px',
  lineHeight: '1.6'
};

const inputContainerStyle = {
  display: 'flex',
  gap: '10px',
  padding: '14px 20px',
  backgroundColor: '#ffffff',
  borderTop: '1px solid #edf2f7'
};

// 💡 입력 글자색(color)을 어두운 톤으로 고정하여 하얗게 보이지 않도록 수정
const inputStyle = {
  flex: 1,
  padding: '12px 16px',
  borderRadius: '24px',
  border: '1px solid #cbd5e0',
  fontSize: '14px',
  outline: 'none',
  backgroundColor: '#ffffff',
  color: '#111827'
};

const sendButtonStyle = {
  padding: '10px 20px',
  borderRadius: '24px',
  border: 'none',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

export default ChatRoom;