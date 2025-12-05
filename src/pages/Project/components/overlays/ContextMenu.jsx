import React, { useEffect, useRef } from 'react';
import styles from './Overlay.module.css';

const ContextMenu = ({ x, y, type, target, onClose, onAction }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    // 외부 클릭 시 닫기
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleAction = (action) => {
    onAction(action, target);
    onClose();
  };

  return (
    <div
      className={styles.contextMenu}
      style={{ top: y, left: x }}
      ref={menuRef}
    >
      {/* 폴더일 경우에만 생성 메뉴 표시 */}
      {type === 'folder' && (
        <>
          <div className={styles.menuItem} onClick={() => handleAction('create_file')}>
            📄 New File
          </div>
          <div className={styles.menuItem} onClick={() => handleAction('create_folder')}>
            📁 New Folder
          </div>
          <div className={styles.separator} />
        </>
      )}

      <div className={styles.menuItem} onClick={() => handleAction('rename')}>
        ✏️ Rename
      </div>
      <div className={styles.menuItem} onClick={() => handleAction('move')}>
        ↪️ Move to...
      </div>
      <div className={styles.separator} />
      <div
        className={styles.menuItem}
        style={{ color: '#f85149' }}
        onClick={() => handleAction('delete')}
      >
        🗑️ Delete
      </div>
    </div>
  );
};

export default ContextMenu;