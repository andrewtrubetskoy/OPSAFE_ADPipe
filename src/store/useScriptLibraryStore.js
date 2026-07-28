import { create } from 'zustand';
import { scriptLibraryApi } from '../services/api';

const INITIAL_MOCK_SCRIPT_FOLDERS = [
  { id: 1, name: 'Геопросторові буфери', parentId: null },
  { id: 2, name: 'Конвертери атрибутів', parentId: null },
];

const INITIAL_MOCK_SCRIPTS = [
  {
    id: 101,
    name: 'Фільтр об\'єктів Python',
    description: 'Обробка та фільтрація буферної зони навколо об\'єктів',
    code: `def process(input_data, buffer_dist=50.0):\n    """Побудова буферної зони навколо векторних об'єктів"""\n    if input_data is None:\n        return None\n    buffered = input_data.copy()\n    buffered['geometry'] = buffered.geometry.buffer(buffer_dist)\n    return buffered`,
    inputType: 'geojson',
    outputType: 'geojson',
    folderId: 1,
  },
  {
    id: 102,
    name: 'Конвертер атрибутів CSV',
    description: 'Конвертація атрибутів та розрахунок статистики',
    code: `import pandas as pd\n\ndef process(input_data_list):\n    """Конвертація списку таблиць у підсумковий датафрейм"""\n    results = []\n    for item in input_data_list:\n        if isinstance(item, pd.DataFrame):\n            results.append(item)\n    return pd.concat(results, ignore_index=True) if results else pd.DataFrame()`,
    inputType: 'csv',
    outputType: 'csv',
    folderId: 2,
  },
];

export const useScriptLibraryStore = create((set, get) => ({
  activePanelTab: 'schemes', // 'schemes' | 'scripts'
  scriptFolders: INITIAL_MOCK_SCRIPT_FOLDERS,
  scriptItems: INITIAL_MOCK_SCRIPTS,
  selectedScriptId: null,
  isUploadModalOpen: false,

  setActivePanelTab: (tab) => set({ activePanelTab: tab }),
  setSelectedScriptId: (id) => set({ selectedScriptId: id }),
  setUploadModalOpen: (isOpen) => set({ isUploadModalOpen: isOpen }),

  fetchLibrary: async () => {
    try {
      const [folders, scripts] = await Promise.all([
        scriptLibraryApi.getFolders(),
        scriptLibraryApi.getScripts(),
      ]);
      set({
        scriptFolders: folders.length > 0 ? folders : INITIAL_MOCK_SCRIPT_FOLDERS,
        scriptItems: scripts.length > 0 ? scripts : INITIAL_MOCK_SCRIPTS,
      });
    } catch (err) {
      console.warn('Backend unavailable, using initial mock script library:', err);
    }
  },

  createFolder: async (name, parentId = null) => {
    try {
      const newFolder = await scriptLibraryApi.createFolder({ name, parentId });
      set((state) => ({ scriptFolders: [...state.scriptFolders, newFolder] }));
    } catch (err) {
      const mockFolder = { id: Date.now(), name, parentId };
      set((state) => ({ scriptFolders: [...state.scriptFolders, mockFolder] }));
    }
  },

  deleteFolder: async (id) => {
    try {
      await scriptLibraryApi.deleteFolder(id);
    } catch (err) {
      console.warn('Mock delete folder');
    }
    set((state) => ({
      scriptFolders: state.scriptFolders.filter((f) => f.id !== id),
      scriptItems: state.scriptItems.filter((s) => s.folderId !== id),
    }));
  },

  moveFolderToFolder: async (folderId, targetParentId) => {
    if (folderId === targetParentId) return;
    set((state) => ({
      scriptFolders: state.scriptFolders.map((f) =>
        f.id === folderId ? { ...f, parentId: targetParentId } : f
      ),
    }));
    try {
      await scriptLibraryApi.moveFolder(folderId, targetParentId);
    } catch (err) {
      console.warn('Backend move script folder error:', err);
    }
  },

  createScript: async (scriptData) => {
    try {
      const created = await scriptLibraryApi.createScript(scriptData);
      set((state) => ({ scriptItems: [...state.scriptItems, created] }));
      return created;
    } catch (err) {
      const mockScript = { id: Date.now(), ...scriptData };
      set((state) => ({ scriptItems: [...state.scriptItems, mockScript] }));
      return mockScript;
    }
  },

  updateScriptCode: async (scriptId, newCode) => {
    const existing = get().scriptItems.find((s) => s.id === scriptId);
    if (!existing) return;
    const updated = { ...existing, code: newCode };
    set((state) => ({
      scriptItems: state.scriptItems.map((s) => (s.id === scriptId ? updated : s)),
    }));
    try {
      await scriptLibraryApi.updateScript(updated);
    } catch (err) {
      console.warn('Backend update script error:', err);
    }
  },

  uploadScript: async (formData) => {
    try {
      const uploaded = await scriptLibraryApi.uploadScript(formData);
      set((state) => ({ scriptItems: [...state.scriptItems, uploaded] }));
      return uploaded;
    } catch (err) {
      console.error('Error uploading script:', err);
      throw err;
    }
  },

  moveScriptToFolder: async (scriptId, folderId) => {
    set((state) => ({
      scriptItems: state.scriptItems.map((s) =>
        s.id === scriptId ? { ...s, folderId } : s
      ),
    }));
    try {
      await scriptLibraryApi.moveScript(scriptId, folderId);
    } catch (err) {
      console.warn('Backend move script error / mock mode fallback:', err);
    }
  },

  deleteScript: async (id) => {
    try {
      await scriptLibraryApi.deleteScript(id);
    } catch (err) {
      console.warn('Mock delete script');
    }
    set((state) => ({
      scriptItems: state.scriptItems.filter((s) => s.id !== id),
      selectedScriptId: state.selectedScriptId === id ? null : state.selectedScriptId,
    }));
  },
}));
