import { Folder } from '../models/Folder';

// API URL
const API_URL = 'http://localhost:5000/api';

// Get all folders
export const getFolders = async (): Promise<Folder[]> => {
  try {
    const response = await fetch(`${API_URL}/folders`);
    if (!response.ok) {
      throw new Error('Failed to fetch folders');
    }
    const folders = await response.json();
    return folders;
  } catch (error) {
    console.error('Error fetching folders:', error);
    return [];
  }
};

// Get a folder by ID
export const getFolderById = async (id: string): Promise<Folder | null> => {
  try {
    const response = await fetch(`${API_URL}/folders/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch folder');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching folder:', error);
    return null;
  }
};

// Save folder (create or update)
export const saveFolder = async (folder: Folder): Promise<Folder> => {
  try {
    const method = folder.id ? 'PUT' : 'POST';
    const url = folder.id 
      ? `${API_URL}/folders/${folder.id}` 
      : `${API_URL}/folders`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(folder)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save folder');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving folder:', error);
    throw error;
  }
};

// Delete folder
export const deleteFolder = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/folders/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete folder');
    }
  } catch (error) {
    console.error('Error deleting folder:', error);
    throw error;
  }
};

// Get documents in a folder
export const getDocumentsInFolder = async (folderId: string | null): Promise<any[]> => {
  try {
    // Use 'root' as a special ID for documents without a folder
    const id = folderId || 'root';
    const response = await fetch(`${API_URL}/folders/${id}/documents`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch documents in folder');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching documents in folder:', error);
    return [];
  }
};
