import React, { useEffect, useState } from 'react';
import { authApi } from '../../../api/axios';
import styles from './ReactFilesView.module.css'; // 스타일 공유

const FileDetailView = ({ fileId }) => {
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFileDetail = async () => {
      if (!fileId) return;

      setLoading(true);
      setError(null);
      setFileData(null);

      try {
        // API Document 5번 항목 참조: 파일 상세 조회
        const response = await authApi.get(`/frontfiles/projectfile/${fileId}/`);
        setFileData(response.data);
      } catch (err) {
        console.error("Failed to fetch file detail:", err);
        setError("파일 내용을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchFileDetail();
  }, [fileId]);

  if (loading) {
    return <div className={styles.detailLoading}>Loading file content...</div>;
  }

  if (error) {
    return <div className={styles.detailError}>{error}</div>;
  }

  if (!fileData) {
    return <div className={styles.detailEmpty}>파일을 선택해주세요.</div>;
  }

  return (
    <div className={styles.detailContainer}>
      <div className={styles.detailHeader}>
        <h3 className={styles.detailTitle}>{fileData.name}</h3>
        <span className={styles.filePath}>{fileData.file_path}</span>
      </div>

      <div className={styles.codeContainer}>
        {/* 간단한 Code Block 스타일 적용 */}
        <pre className={styles.codeBlock}>
          <code>{fileData.content}</code>
        </pre>
      </div>

      <div className={styles.metaInfo}>
        Last updated: {new Date(fileData.updated_at).toLocaleString()}
      </div>
    </div>
  );
};

export default FileDetailView;