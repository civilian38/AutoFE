import React, { useEffect, useState } from 'react';
import { getFileDetail, patchFileContent } from '../../../api/fileService';
import styles from './ReactFilesView.module.css';

const FileDetailView = ({ fileId }) => {
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Copy State
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchFileDetail = async () => {
      if (!fileId) return;

      setLoading(true);
      setError(null);
      setFileData(null);
      setIsEditing(false);
      setIsCopied(false);

      try {
        const data = await getFileDetail(fileId);
        setFileData(data);
        setEditContent(data.content || '');
      } catch (err) {
        console.error("Failed to fetch file detail:", err);
        setError("파일 내용을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchFileDetail();
  }, [fileId]);

  const handleSave = async () => {
    if (!fileId) return;
    setIsSaving(true);
    try {
      const updatedData = await patchFileContent(fileId, editContent);
      setFileData(updatedData);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save file content:", err);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditContent(fileData.content);
    setIsEditing(false);
  };

  // [NEW] 복사 기능 핸들러
  const handleCopy = async () => {
    if (!fileData?.content) return;

    try {
      // 현재 에디팅 중이라면 에디터의 내용을, 아니라면 원본 내용을 복사
      const textToCopy = isEditing ? editContent : fileData.content;
      await navigator.clipboard.writeText(textToCopy);

      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // 2초 후 상태 리셋
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('클립보드 복사에 실패했습니다.');
    }
  };

  if (loading) return <div className={styles.detailLoading}>Loading file content...</div>;
  if (error) return <div className={styles.detailError}>{error}</div>;
  if (!fileData) return <div className={styles.detailEmpty}>파일을 선택해주세요.</div>;

  return (
    <div className={styles.detailContainer}>
      <div className={styles.detailHeader}>
        <div className={styles.headerLeft}>
          <h3 className={styles.detailTitle}>{fileData.name}</h3>
          <span className={styles.filePath}>{fileData.file_path}</span>
        </div>

        <div className={styles.headerRight}>
          {/* [NEW] Copy Button */}
          <button
            className={`${styles.actionBtn} ${styles.copyBtn}`}
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {isCopied ? 'Copied! ✅' : 'Copy'}
          </button>

          {isEditing ? (
            <>
              <button
                className={`${styles.actionBtn} ${styles.cancelBtn}`}
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className={`${styles.actionBtn} ${styles.saveBtn}`}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              className={`${styles.actionBtn} ${styles.editBtn}`}
              onClick={() => setIsEditing(true)}
            >
              Edit Content
            </button>
          )}
        </div>
      </div>

      <div className={styles.codeContainer}>
        {isEditing ? (
          <textarea
            className={styles.codeEditor}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            spellCheck="false"
          />
        ) : (
          <pre className={styles.codeBlock}>
            <code>{fileData.content}</code>
          </pre>
        )}
      </div>

      <div className={styles.metaInfo}>
        Last updated: {new Date(fileData.updated_at).toLocaleString()}
        {isEditing && <span className={styles.editingIndicator}> (Editing...)</span>}
      </div>
    </div>
  );
};

export default FileDetailView;