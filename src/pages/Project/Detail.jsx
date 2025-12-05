import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiDocList from './components/ApiDocList';
import RequirementsView from './components/RequirementsView';
import ReactFilesView from './components/ReactFilesView'; // Import 추가
import styles from './Detail.module.css';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // 현재 활성화된 탭 State (기본값: api_docs)
  const [activeTab, setActiveTab] = useState('api_docs');

  // 프로젝트 기본 정보 (추후 API 연동 필요)
  const [projectInfo, setProjectInfo] = useState({
    name: `Project #${projectId}`,
    description: 'Loading project details...'
  });

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
        {activeTab === 'requirements' && <RequirementsView projectId={projectId} />}
        {activeTab === 'react_files' && <ReactFilesView projectId={projectId} />}
        {activeTab === 'discussion' && <div className={styles.placeholder}>Discussion 페이지 (개발 예정)</div>}
      </main>
    </div>
  );
};

export default ProjectDetail;