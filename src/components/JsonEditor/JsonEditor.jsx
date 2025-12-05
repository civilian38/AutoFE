import React, { useEffect, useRef } from 'react';
import { JSONEditor } from 'vanilla-jsoneditor';
import styles from './JsonEditor.module.css';

const JsonEditor = ({
  content,
  onChange,
  readOnly = false,
  mode = 'tree',
  mainMenuBar = true,
  navigationBar = true
}) => {
  const refContainer = useRef(null);
  const refEditor = useRef(null);

  useEffect(() => {
    // 에디터 인스턴스 생성
    refEditor.current = new JSONEditor({
      target: refContainer.current,
      props: {
        content,
        readOnly,
        mode,
        mainMenuBar,
        navigationBar,
        onChange: (updatedContent, previousContent, { contentErrors }) => {
          // 에러가 없을 때만 부모에게 변경사항 전달
          if (!contentErrors && onChange) {
            onChange(updatedContent);
          }
        }
      }
    });

    return () => {
      // 컴포넌트 언마운트 시 에디터 제거
      if (refEditor.current) {
        refEditor.current.destroy();
        refEditor.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 초기화는 한 번만 수행

  // Props 변경 시 에디터 업데이트
  useEffect(() => {
    if (refEditor.current) {
      refEditor.current.updateProps({
        content,
        readOnly,
        mode,
        mainMenuBar,
        navigationBar
      });
    }
  }, [content, readOnly, mode, mainMenuBar, navigationBar]);

  return <div className={`json-editor-container ${styles.editorContainer}`} ref={refContainer} />;
};

export default JsonEditor;