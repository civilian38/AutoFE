import React, { useState } from 'react';
import styles from './ReactFilesView.module.css';

// 재귀적으로 렌더링되는 폴더 아이템
const FolderItem = ({ folder, onSelectFile, selectedFileId, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(true); // 기본적으로 펼침 상태

  const toggleFolder = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.treeNode} style={{ paddingLeft: `${depth * 12}px` }}>
      {/* 폴더 렌더링 */}
      <div className={styles.folderRow} onClick={toggleFolder}>
        <span className={styles.folderIcon}>{isOpen ? '📂' : '📁'}</span>
        <span className={styles.folderName}>{folder.name}</span>
      </div>

      {/* 하위 항목 렌더링 (isOpen일 때만) */}
      {isOpen && (
        <div className={styles.treeChildren}>
          {/* 하위 폴더 재귀 호출 */}
          {folder.subfolders && folder.subfolders.map((subfolder) => (
            <FolderItem
              key={`folder-${subfolder.id}`}
              folder={subfolder}
              onSelectFile={onSelectFile}
              selectedFileId={selectedFileId}
              depth={depth + 1}
            />
          ))}

          {/* 파일 렌더링 */}
          {folder.files && folder.files.map((file) => (
            <div
              key={`file-${file.id}`}
              className={`${styles.fileRow} ${selectedFileId === file.id ? styles.selectedFile : ''}`}
              onClick={() => onSelectFile(file.id)}
              style={{ paddingLeft: `${(depth + 1) * 12}px` }}
            >
              <span className={styles.fileIcon}>📄</span>
              <span className={styles.fileName}>{file.name}</span>
            </div>
          ))}

          {/* 빈 폴더일 경우 표시 */}
          {(!folder.subfolders?.length && !folder.files?.length) && (
            <div className={styles.emptyFolder} style={{ paddingLeft: `${(depth + 1) * 12}px` }}>
              (Empty)
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const FileTreeView = ({ rootFolder, onSelectFile, selectedFileId }) => {
  if (!rootFolder) return null;

  return (
    <div className={styles.treeContainer}>
      <FolderItem
        folder={rootFolder}
        onSelectFile={onSelectFile}
        selectedFileId={selectedFileId}
      />
    </div>
  );
};

export default FileTreeView;