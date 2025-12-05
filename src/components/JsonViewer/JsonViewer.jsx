import React, { useState } from 'react';
import styles from './JsonViewer.module.css';

const JsonViewer = ({ data }) => {
  const [copied, setCopied] = useState(false);

  // JSON 객체를 예쁘게 문자열로 변환 (들여쓰기 2칸)
  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // 2초 후 상태 복귀
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={styles.viewerContainer}>
      <div className={styles.header}>
        <span className={styles.langLabel}>JSON</span>
        <button
          className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
                <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className={styles.preBlock}>
        <code>{jsonString}</code>
      </pre>
    </div>
  );
};

export default JsonViewer;