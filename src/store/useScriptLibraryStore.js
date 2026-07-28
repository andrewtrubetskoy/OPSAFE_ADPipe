import { create } from 'zustand';
import { scriptLibraryApi } from '../services/api';

const INITIAL_MOCK_SCRIPT_FOLDERS = [
  { id: 1, name: 'Геопросторові буфери', parentId: null },
  { id: 2, name: 'Конвертери атрибутів', parentId: null },
];

const STANDARD_TEMPLATE_CODE = `from typing import Literal, Protocol
from pydantic import BaseModel, Field

DataType = Literal["csv", "geojson"]

# 1. Схема конфігурації для побудови GUI
class ConfigSchema(BaseModel):
    threshold: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        multiple_of=0.1,
        title="Поріг чутливості"
    )
    max_retries: int = Field(
        default=3,
        ge=0,
        le=10,
        multiple_of=1,
        title="Кількість спроб"
    )

# 2. Інтерфейс зворотного зв'язку
class FeedbackHandler(Protocol):
    def update_progress(self, percent: float, stage_description: str) -> None:
        ...

# 3. Головна функція
def process_data(
    data_type: DataType,
    input_data_items_list: list[str],
    config: ConfigSchema,
    feedback: FeedbackHandler
) -> tuple[bool, str]:
    try:
        feedback.update_progress(0.0, f"Старт обробки файлу типу {data_type}")
        processed_lines = [item.strip().upper() for item in input_data_items_list]
        feedback.update_progress(100.0, "Завершено успішно")
        return True, "\\n".join(processed_lines)
    except Exception as e:
        return False, f"Помилка під час виконання: {str(e)}"`;

const INITIAL_MOCK_SCRIPTS = [
  {
    id: 101,
    name: 'Фільтр об\'єктів Python',
    description: 'Обробка та фільтрація буферної зони навколо об\'єктів',
    code: STANDARD_TEMPLATE_CODE,
    inputType: 'geojson',
    outputType: 'geojson',
    folderId: 1,
  },
  {
    id: 102,
    name: 'Конвертер атрибутів CSV',
    description: 'Конвертація атрибутів та розрахунок статистики',
    code: STANDARD_TEMPLATE_CODE,
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

  uploadScript: async (scriptData, fileContent = '') => {
    try {
      let created;
      if (scriptData instanceof FormData) {
        created = await scriptLibraryApi.uploadScript(scriptData);
      } else {
        created = await scriptLibraryApi.createScript(scriptData);
      }
      set((state) => ({ scriptItems: [...state.scriptItems, created] }));
      return created;
    } catch (err) {
      const mockScript = {
        id: Date.now(),
        name: scriptData.name || 'Новий скрипт',
        description: scriptData.description || 'Скрипт з бібліотеки',
        code: fileContent || scriptData.code || STANDARD_TEMPLATE_CODE,
        inputType: scriptData.inputType || 'geojson',
        outputType: scriptData.outputType || 'geojson',
        folderId: scriptData.folderId || null,
      };
      set((state) => ({ scriptItems: [...state.scriptItems, mockScript] }));
      return mockScript;
    }
  },

  updateScriptCode: async (scriptId, newCode) => {
    set((state) => ({
      scriptItems: state.scriptItems.map((s) => (s.id === scriptId ? { ...s, code: newCode } : s)),
    }));
    try {
      await scriptLibraryApi.updateScript(scriptId, { code: newCode });
    } catch (err) {
      console.warn('Backend update script code error:', err);
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

  moveScriptToFolder: async (scriptId, targetFolderId) => {
    set((state) => ({
      scriptItems: state.scriptItems.map((s) =>
        s.id === scriptId ? { ...s, folderId: targetFolderId } : s
      ),
    }));
    try {
      await scriptLibraryApi.moveScript(scriptId, targetFolderId);
    } catch (err) {
      console.warn('Backend move script error:', err);
    }
  },
}));
