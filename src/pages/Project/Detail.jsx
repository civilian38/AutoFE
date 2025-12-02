import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiDocList from './components/ApiDocList';
import styles from './Detail.module.css';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // 현재 활성화된 탭 State (기본값: api_docs)
  const [activeTab, setActiveTab] = useState('api_docs');

  // 프로젝트 기본 정보 (추후 API 연동 필요, 현재는 UI 표시용 더미 데이터 혹은 상위에서 가져왔다고 가정)
  const [projectInfo, setProjectInfo] = useState({
    name: `Project #${projectId}`,
    description: 'Loading project details...'
  });

  // 탭 변경 핸들러
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header Area */}
      <header className={styles.header}>
        <div className={styles.breadcrumb}>
          <span className={styles.backLink} onClick={() => navigate('/')}>Projects</span>
          <span className={styles.separator}>/</span>
          <span className={styles.currentTitle}>{projectInfo.name}</span>
        </div>
        <h1 className={styles.projectTitle}>{projectInfo.name}</h1>
      </header>

      {/* Navigation Tabs */}
      <nav className={styles.tabsNav}>
        <button
          className={`${styles.tabItem} ${activeTab === 'api_docs' ? styles.active : ''}`}
          onClick={() => handleTabClick('api_docs')}
        >
          API Document
        </button>
        <button
          className={`${styles.tabItem} ${activeTab === 'requirements' ? styles.active : ''}`}
          onClick={() => handleTabClick('requirements')}
        >
          Requirements
        </button>
        <button
          className={`${styles.tabItem} ${activeTab === 'react_files' ? styles.active : ''}`}
          onClick={() => handleTabClick('react_files')}
        >
          React Files
        </button>
        <button
          className={`${styles.tabItem} ${activeTab === 'discussion' ? styles.active : ''}`}
          onClick={() => handleTabClick('discussion')}
        >
          Discussion
        </button>
      </nav>

      {/* Content Area */}
      <main className={styles.contentArea}>
        {activeTab === 'api_docs' && <ApiDocList projectId={projectId} />}
        {activeTab === 'requirements' && <div className={styles.placeholder}>프론트엔드 요구사항 관리 페이지 (개발 예정)</div>}
        {activeTab === 'react_files' && <div className={styles.placeholder}>React 파일 생성 및 관리 페이지 (개발 예정)</div>}
        {activeTab === 'discussion' && <div className={styles.placeholder}>Discussion 페이지 (개발 예정)</div>}
      </main>
    </div>
  );
};

export default ProjectDetail;