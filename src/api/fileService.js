// src/api/fileService.js
import { authApi } from './axios';

// ... (기존 createFolder, createFile 등은 유지) ...

export const getFolderStructure = async (projectId) => {
  const response = await authApi.get(`/frontfiles/${projectId}/folders/`);
  return response.data;
};

export const getFileDetail = async (fileId) => {
  const response = await authApi.get(`/frontfiles/projectfile/${fileId}/`);
  return response.data;
};

export const createFolder = async (projectId, name, parentFolderId) => {
  const response = await authApi.post(`/frontfiles/${projectId}/folders/`, {
    name,
    parent_folder: parentFolderId,
  });
  return response.data;
};

export const createFile = async (projectId, name, parentFolderId) => {
  const response = await authApi.post(`/frontfiles/projectfile/create/`, {
    name,
    content: '# New File', // 초기 내용
    project_under: projectId,
    folder: parentFolderId,
  });
  return response.data;
};

export const updateFolder = async (folderId, data) => {
  const response = await authApi.put(`/frontfiles/folder/${folderId}/`, data);
  return response.data;
};

// 파일 메타데이터 수정 (이름, 폴더 이동 등 - PUT)
export const updateFile = async (fileId, data) => {
  const response = await authApi.put(`/frontfiles/projectfile/${fileId}/`, data);
  return response.data;
};

// 파일 내용 수정 (PATCH)
export const patchFileContent = async (fileId, content) => {
  const response = await authApi.patch(`/frontfiles/projectfile/${fileId}/`, {
    content: content
  });
  return response.data;
};

// [NEW] Draft 내용을 본문에 반영 (POST)
export const applyFileDraft = async (fileId) => {
    // URL: /api/frontfiles/projectfile/{id}/draft
    const response = await authApi.post(`/frontfiles/projectfile/${fileId}/draft`);
    return response.data;
};

export const deleteFolder = async (folderId) => {
  await authApi.delete(`/frontfiles/folder/${folderId}/`);
};

export const deleteFile = async (fileId) => {
  await authApi.delete(`/frontfiles/projectfile/${fileId}/`);
};