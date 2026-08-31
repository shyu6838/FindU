import { useEffect, useState } from 'react';
import ReportModal from '../components/ReportModal';
import api from '../api/axios';

// 게시글 연동 1:1 채팅방 컴포넌트
function ChatRoom({ changePage, postInfo }) {
  // 상태 관리
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const incomingRoom = postInfo?.room || (postInfo?.user1Id ? postInfo : null);
  const [room, setRoom] = useState(incomingRoom);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 연관 게시글 기본 정보 처리
  const initialPost = postInfo?.post || (postInfo?.title ? postInfo : null);
  const [connectedPost, setConnectedPost] = useState(initialPost);
  const currentPost = connectedPost;

  useEffect(() => {
    let ignore = false;

    const loadChat = async () => {
      try {
        setLoading(true);
        const userRes = await api.get('/api/users/me');
        if (ignore) return;
        setCurrentUser(userRes.data);

        let activeRoom = incomingRoom;
        if (!activeRoom && initialPost?.writerId) {
          const roomRes = await api.post('/api/chat-rooms', {
            userId: initialPost.writerId,
            itemId: initialPost.id,
          });
          activeRoom = roomRes.data;
        }

        if (activeRoom?.id) {
          const roomRes = await api.get(`/api/chat-rooms/${activeRoom.id}`);
          activeRoom = roomRes.data;
          const messagesRes = await api.get(`/api/chat-rooms/${activeRoom.id}/messages`);

          let item = initialPost;
          if (activeRoom.itemId) {
            const itemRes = await api.get(`/api/items/${activeRoom.itemId}`);
            item = itemRes.data;
          }

          if (!ignore) {
            setRoom(activeRoom);
            setConnectedPost(item || null);
            setMessages(messagesRes.data || []);
          }
        } else if (!ignore) {
          setRoom(null);
          setConnectedPost(initialPost || null);
          setMessages([]);
        }
      } catch {
        alert('채팅 정보를 불러오지 못했습니다.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadChat();

    return () => {
      ignore = true;
    };
  }, [incomingRoom, initialPost]);

  const partnerName = room && currentUser
    ? (room.user1Id === currentUser.id ? room.user2Nickname : room.user1Nickname)
    : '상대방';

  // 메시지 전송 처리
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (!room?.id) return alert('채팅방을 확인할 수 없습니다.');

    try {
      const res = await api.post(`/api/chat-rooms/${room.id}/messages`, { content: inputText });
      setMessages((prev) => [...prev, res.data]);
      setInputText('');
    } catch {
      alert('메시지 전송에 실패했습니다.');
    }
  };

  return (
    <div style={containerStyle}>
      {/* 상단 헤더 */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            style={backButtonStyle} 
            onClick={() => currentPost?.id ? changePage && changePage('detail', currentPost) : changePage && changePage('mypage')}
            title="게시글로 돌아가기"
          >
            ←
          </button>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#2d3748' }}>
              {partnerName}
            </h3>
            <span style={{ fontSize: '12px', color: '#38a169', fontWeight: '500' }}>
              {loading ? '불러오는 중' : '대화 가능'}
            </span>
          </div>
        </div>

        <button style={reportButtonStyle} onClick={() => setIsReportOpen(true)}>
          🚨 채팅 신고
        </button>
      </div>

      {/* 연관 게시글 요약 */}
      <div style={postBannerStyle}>
        <div style={postImageThumbnailStyle}>
          {currentPost?.imageUrl ? <img src={currentPost.imageUrl} alt="게시글 사진" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} /> : '📦'}
        </div>
        <div style={{ flex: 1, marginLeft: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={typeBadgeStyle}>
              {currentPost?.type === 'LOST' ? '분실' : currentPost?.type === 'FOUND' ? '습득' : '채팅'}
            </span>
            <span style={{ fontSize: '12px', color: '#718096' }}>{currentPost?.location || '연결된 게시글 없음'}</span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#2d3748', marginTop: '3px' }}>
            {currentPost?.title || '채팅방'}
          </div>
        </div>
        {currentPost?.id && (
          <button 
            style={viewPostButtonStyle}
            onClick={() => changePage && changePage('detail', currentPost)}
          >
            글 보기
          </button>
        )}
      </div>

      {/* 채팅 메시지 영역 */}
      <div style={chatBodyStyle}>
        {messages.length === 0 ? (
          <div style={emptyChatStyle}>
            대화 내역이 없습니다.<br />메시지를 보내 대화를 시작해 보세요!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
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
                    {msg.content || msg.text}
                  </div>
                  <span style={{ fontSize: '11px', color: '#a0aec0', marginBottom: '2px' }}>
                    {msg.createdAt ? msg.createdAt.replace('T', ' ').slice(11, 16) : ''}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 메시지 입력 영역 */}
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

      {/* 신고 모달 */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="CHAT"
        targetId={room?.id}
        targetTitle={`${partnerName}님과의 대화`}
      />
    </div>
  );
}

// 스타일 설정
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
