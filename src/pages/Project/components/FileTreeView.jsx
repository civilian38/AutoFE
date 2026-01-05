// src/pages/Project/components/FileTreeView.jsx
import React, { useState } from 'react';
import styles from './ReactFilesView.module.css';

// 재귀적으로 렌더링되는 폴더 아이템
const FolderItem = ({ folder, onSelectFile, selectedFileId, onContextMenu, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleFolder = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleRightClick = (e, type, item) => {
    e.preventDefault();
    e.stopPropagation(); // 부모로 이벤트 전파 방지
    onContextMenu(e, type, item);
  };

  return (
    <div className={styles.treeNode}>
      {/* 폴더 렌더링 */}
      <div
        className={styles.folderRow}
        onClick={toggleFolder}
        onContextMenu={(e) => handleRightClick(e, 'folder', folder)}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <span className={styles.folderIcon}>{isOpen ? '📂' : '📁'}</span>
        <span className={styles.folderName}>{folder.name}</span>
      </div>

      {/* 하위 항목 렌더링 */}
      {isOpen && (
        <div className={styles.treeChildren}>
          {folder.subfolders && folder.subfolders.map((subfolder) => (
            <FolderItem
              key={`folder-${subfolder.id}`}
              folder={subfolder}
              onSelectFile={onSelectFile}
              selectedFileId={selectedFileId}
              onContextMenu={onContextMenu}
              depth={depth + 1}
            />
          ))}

          {folder.files && folder.files.map((file) => (
            <div
              key={`file-${file.id}`}
              className={`${styles.fileRow} ${selectedFileId === file.id ? styles.selectedFile : ''}`}
              onClick={() => onSelectFile(file.id)}
              onContextMenu={(e) => handleRightClick(e, 'file', file)}
              style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
            >
              <span className={styles.fileIcon}>📄</span>
              {/* [MODIFIED] has_draft가 true이면 파란색 스타일 적용 */}
              <span className={`${styles.fileName} ${file.has_draft ? styles.hasDraftText : ''}`}>
                {file.name}
              </span>
            </div>
          ))}

          {(!folder.subfolders?.length && !folder.files?.length) && (
            <div className={styles.emptyFolder} style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}>
              (Empty)
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const FileTreeView = ({ rootFolder, onSelectFile, selectedFileId, onContextMenu }) => {
  if (!rootFolder) return null;

  // Root 폴더 자체도 Context Menu 대상이 될 수 있음
  const handleRootRightClick = (e) => {
    e.preventDefault();
    onContextMenu(e, 'folder', rootFolder);
  };

  return (
    <div className={styles.treeContainer} onContextMenu={handleRootRightClick}>
      <FolderItem
        folder={rootFolder}
        onSelectFile={onSelectFile}
        selectedFileId={selectedFileId}
        onContextMenu={onContextMenu}
      />
    </div>
  );
};

export default FileTreeView;