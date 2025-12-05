import React, { useState } from 'react';
import styles from './Overlay.module.css';

// 내부 재귀 컴포넌트
const MiniFolderItem = ({ folder, selectedId, onSelect, disabledIds, depth = 0 }) => {
  const isDisabled = disabledIds.includes(folder.id);

  return (
    <>
      <div
        className={`${styles.treeItem} ${selectedId === folder.id ? styles.selected : ''} ${isDisabled ? styles.disabledItem : ''}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => !isDisabled && onSelect(folder.id)}
      >
        <span>{folder.name === '.' || !folder.name ? 'root' : folder.name}</span>
      </div>
      {folder.subfolders && folder.subfolders.map(sub => (
        <MiniFolderItem
          key={sub.id}
          folder={sub}
          selectedId={selectedId}
          onSelect={onSelect}
          disabledIds={disabledIds}
          depth={depth + 1}
        />
      ))}
    </>
  );
};

const MoveModal = ({ rootFolder, targetItem, targetType, onConfirm, onClose }) => {
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  // 이동 불가능한 폴더 ID 목록 계산
  const getDisabledIds = () => {
    let ids = [];

    // 1. 현재 부모 폴더 (이동해도 변화 없음)
    const currentParentId = targetType === 'folder'
      ? targetItem.parent_folder
      : targetItem.folder;
    if (currentParentId) ids.push(currentParentId);

    // 2. 자기 자신 (폴더일 경우) 및 그 하위 폴더들 (순환 참조 방지)
    if (targetType === 'folder') {
      const collectIds = (folder) => {
        let descendants = [folder.id];
        if (folder.subfolders) {
          folder.subfolders.forEach(sub => {
            descendants = [...descendants, ...collectIds(sub)];
          });
        }
        return descendants;
      };
      // 재귀적으로 찾기 위해 root에서 targetItem을 찾아야 하지만,
      // 여기서는 targetItem 객체 자체의 구조를 이용하거나, 이미 id를 아니까...
      // 간단히 targetItem과 그 서브폴더 구조가 온전하다고 가정하고 수집합니다.
      // (주의: API 응답 구조상 targetItem에 subfolders가 포함되어 있어야 함)
      ids = [...ids, ...collectIds(targetItem)];
    }

    return ids;
  };

  const disabledIds = getDisabledIds();

  const handleConfirm = () => {
    if (selectedFolderId !== null) {
      onConfirm(selectedFolderId);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <span>Move '{targetItem.name}' to...</span>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.treeViewBox}>
            <MiniFolderItem
              folder={rootFolder}
              selectedId={selectedFolderId}
              onSelect={setSelectedFolderId}
              disabledIds={disabledIds}
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={`${styles.btn} ${styles.btnCancel}`}>Cancel</button>
          <button
            onClick={handleConfirm}
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={selectedFolderId === null}
          >
            Move Here
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveModal;