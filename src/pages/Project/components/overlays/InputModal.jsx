import React, { useState } from 'react';
import styles from './Overlay.module.css';

const InputModal = ({ title, defaultValue = '', placeholder, onConfirm, onClose }) => {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <form className={styles.modalContainer} onSubmit={handleSubmit}>
        <div className={styles.modalHeader}>
          <span>{title}</span>
          <button type="button" className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalBody}>
          <input
            autoFocus
            className={styles.inputField}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
          />
        </div>
        <div className={styles.modalFooter}>
          <button type="button" className={`${styles.btn} ${styles.btnCancel}`} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={!value.trim()}>
            Confirm
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputModal;