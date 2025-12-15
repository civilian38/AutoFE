import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { authApi } from '../../../api/axios';
import styles from './DiscussionView.module.css';

const DiscussionDetail = ({ discussionId, projectId, onUpdateTitle }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI States
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');

  // Modal State
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // Fetch Detail
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await authApi.get(`/discussion/detail/${discussionId}/`);
        setDetail(response.data);
        setEditTitle(response.data.title);
      } catch (err) {
        console.error("Failed to fetch discussion detail:", err);
        setError("데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (discussionId) {
      fetchDetail();
    }
  }, [discussionId]);

  const handleSaveTitle = async () => {
    if (!editTitle.trim()) return alert("제목을 입력해주세요.");

    try {
      const response = await authApi.put(`/discussion/detail/${discussionId}/`, {
        title: editTitle
      });
      setDetail(response.data);
      setIsEditing(false);
      if (onUpdateTitle) {
        onUpdateTitle();
      }
    } catch (err) {
      console.error("Failed to update title:", err);
      alert("제목 수정에 실패했습니다.");
    }
  };

  if (loading) return <div className={styles.placeholderState}>Loading discussion...</div>;
  if (error || !detail) return <div className={styles.placeholderState}>{error || "Not found"}</div>;

  return (
    <>
      <div className={styles.detailPane}>
        {/* --- Header --- */}
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
              <h3 className={styles.detailTitle}>{detail.title}</h3>
            )}
          </div>
          <div className={styles.headerActions}>
            {!isEditing && (
              <button
                className={styles.btnOutline}
                onClick={() => setIsSummaryModalOpen(true)}
              >
                View Summary
              </button>
            )}

            {isEditing ? (
              <>
                <button className={styles.btnSecondary} onClick={() => setIsEditing(false)}>Cancel</button>
                <button className={styles.btnPrimary} onClick={handleSaveTitle}>Save</button>
              </>
            ) : (
              <button className={styles.btnSecondary} onClick={() => setIsEditing(true)}>Edit Title</button>
            )}
          </div>
        </div>

        {/* --- Chat Body --- */}
        <div className={styles.discussionBody}>
          <div className={styles.chatArea}>
            <div>
              <p><strong>Chat Interface</strong></p>
              <span style={{ fontSize: '12px', color: '#58a6ff' }}>&lt;구현 예정&gt;</span>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>LLM과의 대화 기능이 이곳에 추가됩니다.</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Summary Modal with Markdown Support --- */}
      {isSummaryModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsSummaryModalOpen(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Discussion Summary (Prompt Context)</span>
              <button className={styles.closeBtn} onClick={() => setIsSummaryModalOpen(false)}>
                &times;
              </button>
            </div>

            <div className={styles.modalContent}>
              {detail.summary ? (
                // [Fix] Wrapper Div for Styling (className prop removed from ReactMarkdown)
                <div className={styles.markdownBody}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {detail.summary}
                  </ReactMarkdown>
                </div>
              ) : (
                <span className={styles.emptySummary}>
                  아직 생성된 요약이 없습니다.<br/>
                  (Chat을 통해 요약을 생성한 후 확인할 수 있습니다.)
                </span>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setIsSummaryModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DiscussionDetail;