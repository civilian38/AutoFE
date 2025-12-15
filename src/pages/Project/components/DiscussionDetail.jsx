import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { authApi } from '../../../api/axios';
import styles from './DiscussionView.module.css';

const DiscussionDetail = ({ discussionId, projectId, onDiscussionUpdate, onDeleteSuccess }) => {
  const [detail, setDetail] = useState(null);
  const [chats, setChats] = useState([]);

  const [loadingDetail, setLoadingDetail] = useState(true);
  const [loadingChats, setLoadingChats] = useState(true);
  const [error, setError] = useState(null);

  // UI States
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [inputContent, setInputContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Summary Generation State
  const [isSummarizing, setIsSummarizing] = useState(false);

  const chatEndRef = useRef(null);

  // --- Fetch Logic ---
  const fetchDetail = async (isBackground = false) => {
    try {
      if (!isBackground) setLoadingDetail(true);
      const response = await authApi.get(`/discussion/detail/${discussionId}/`);
      setDetail(response.data);
      if (!isBackground) setEditTitle(response.data.title);
      return response.data;
    } catch (err) {
      console.error("Failed to fetch discussion detail:", err);
      if (!isBackground) setError("데이터를 불러오는데 실패했습니다.");
    } finally {
      if (!isBackground) setLoadingDetail(false);
    }
  };

  const fetchChats = async (isBackground = false) => {
    try {
      if (!isBackground) setLoadingChats(true);
      const response = await authApi.get(`/discussion/chat/${discussionId}/list/`);
      const results = response.data.results || response.data;
      const sortedResults = results.sort((a, b) => a.id - b.id);
      setChats(sortedResults);
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    } finally {
      if (!isBackground) setLoadingChats(false);
    }
  };

  useEffect(() => {
    if (discussionId) {
      fetchDetail();
      fetchChats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discussionId]);

  // --- Polling Logic ---
  useEffect(() => {
    let intervalId;
    if (detail && detail.is_occupied) {
      intervalId = setInterval(async () => {
        const updatedDetail = await fetchDetail(true);
        await fetchChats(true);

        if (updatedDetail && !updatedDetail.is_occupied) {
          if (onDiscussionUpdate) onDiscussionUpdate();
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail?.is_occupied]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  // --- Handlers ---
  const handleSaveTitle = async () => {
    if (!editTitle.trim()) return alert("제목을 입력해주세요.");
    try {
      const response = await authApi.put(`/discussion/detail/${discussionId}/`, {
        title: editTitle
      });
      setDetail(response.data);
      setIsEditing(false);
      if (onDiscussionUpdate) onDiscussionUpdate();
    } catch (err) {
      console.error("Failed to update title:", err);
      alert("제목 수정에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("정말로 이 Discussion을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.")) {
      try {
        await authApi.delete(`/discussion/detail/${discussionId}/`);
        alert("삭제되었습니다.");
        if (onDeleteSuccess) onDeleteSuccess();
      } catch (err) {
        console.error("Failed to delete discussion:", err);
        alert("삭제에 실패했습니다.");
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputContent.trim()) return;
    if (detail?.is_occupied) {
      alert("현재 AI가 응답을 생성 중입니다. 잠시만 기다려주세요.");
      return;
    }

    try {
      setIsSending(true);
      await authApi.post(`/discussion/chat/${discussionId}/`, {
        content: inputContent
      });
      setInputContent('');
      setDetail(prev => ({ ...prev, is_occupied: true }));
      if (onDiscussionUpdate) onDiscussionUpdate();
      await fetchChats(true);
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("메시지 전송에 실패했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  const handleRequestSummary = async () => {
    if (chats.length === 0) return;
    if (window.confirm("현재까지의 대화 내용을 바탕으로 요약을 생성하시겠습니까?")) {
      try {
        setIsSummarizing(true);
        await authApi.post(`/discussion/chat/${discussionId}/summarize/`);
        alert("요약 요청이 전송되었습니다. 완료되면 Summary에서 확인할 수 있습니다.");
      } catch (err) {
        console.error("Failed to request summary:", err);
        alert("요약 요청에 실패했습니다.");
      } finally {
        setIsSummarizing(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- Render ---
  if (loadingDetail) return <div className={styles.placeholderState}>Loading discussion...</div>;
  if (error || !detail) return <div className={styles.placeholderState}>{error || "Not found"}</div>;

  return (
    <>
      <div className={styles.detailPane}>
        <div className={styles.detailHeader}>
          <div className={styles.titleArea}>
            {isEditing ? (
              <input
                type="text"
                className={styles.titleInput}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Discussion Title"
              />
            ) : (
              <div className={styles.titleWrapper}>
                <h3 className={styles.detailTitle}>{detail.title}</h3>
                {detail.is_occupied && (
                  <span className={styles.occupiedBadge}>Generating...</span>
                )}
              </div>
            )}
          </div>
          <div className={styles.headerActions}>
            {!isEditing && (
              <button
                className={styles.btnOutline}
                onClick={handleRequestSummary}
                disabled={chats.length === 0 || isSummarizing}
                title="Create or Update Summary"
              >
                {isSummarizing ? 'Requesting...' : 'Summarize Chat'}
              </button>
            )}

            {isEditing ? (
              <>
                <button
                  className={styles.btnDanger}
                  onClick={handleDelete}
                  title="Delete this discussion"
                >
                  Delete
                </button>
                <div className={styles.separatorVertical} />
                <button className={styles.btnSecondary} onClick={() => setIsEditing(false)}>Cancel</button>
                <button className={styles.btnPrimary} onClick={handleSaveTitle}>Save</button>
              </>
            ) : (
              // [Modified] Button text changed from "Edit Title" to "Edit"
              <button className={styles.btnSecondary} onClick={() => setIsEditing(true)}>Edit</button>
            )}
          </div>
        </div>

        <div className={styles.discussionBody}>
          <div className={styles.chatList}>
            {loadingChats ? (
              <div className={styles.loadingMsg}>Loading messages...</div>
            ) : chats.length === 0 ? (
              <div className={styles.emptyMsg}>대화를 시작해보세요!</div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`${styles.chatBubbleRow} ${chat.is_by_user ? styles.rowUser : styles.rowBot}`}
                >
                  <div className={`${styles.chatBubble} ${chat.is_by_user ? styles.bubbleUser : styles.bubbleBot}`}>
                    {chat.is_by_user ? (
                      <div className={styles.userText}>{chat.content}</div>
                    ) : (
                      <div className={`${styles.markdownBody} ${styles.botMarkdown}`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {chat.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    <span className={styles.timestamp}>
                      {new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <div className={styles.inputArea}>
            <textarea
              className={styles.chatInput}
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={detail.is_occupied ? "AI가 응답을 작성 중입니다..." : "Type your message..."}
              disabled={detail.is_occupied || isSending}
              rows={1}
            />
            <button
              className={styles.sendBtn}
              onClick={handleSendMessage}
              disabled={detail.is_occupied || isSending || !inputContent.trim()}
            >
              {isSending ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DiscussionDetail;