import React, { useEffect, useState } from 'react';
import { authApi } from '../../../api/axios';
import FileTreeView from './FileTreeView';
import FileDetailView from './FileDetailView';
import styles from './ReactFilesView.module.css';

const ReactFilesView = ({ projectId }) => {
  const [rootFolder, setRootFolder] = useState(null);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFolderStructure = async () => {
      try {
        // API Document 5번 항목 참조: 폴더 구조 조회
        const response = await authApi.get(`/frontfiles/${projectId}/folders/`);
        setRootFolder(response.data);
      } catch (error) {
        console.error("Failed to fetch folder structure:", error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchFolderStructure();
    }
  }, [projectId]);

  if (loading) return <div className={styles.loading}>Loading file structure...</div>;

  return (
    <div className={styles.viewContainer}>
      {/* 왼쪽: 파일 트리 영역 */}
      <div className={styles.treePane}>
        <div className={styles.paneHeader}>
          Explorer
        </div>
        <div className={styles.treeContent}>
          {rootFolder ? (
            <FileTreeView
              rootFolder={rootFolder}
              onSelectFile={setSelectedFileId}
              selectedFileId={selectedFileId}
            />
          ) : (
            <div className={styles.emptyState}>No files found.</div>
          )}
        </div>
      </div>

      {/* 오른쪽: 파일 상세/코드 영역 */}
      <div className={styles.detailPane}>
        {selectedFileId ? (
          <FileDetailView fileId={selectedFileId} />
        ) : (
          <div className={styles.placeholderState}>
            왼쪽 목록에서 파일을 선택하여<br/>코드를 확인하세요.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReactFilesView;