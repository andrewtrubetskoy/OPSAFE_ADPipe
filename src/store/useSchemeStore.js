import { create } from 'zustand';

const MOCK_FOLDERS = [
  { id: 'f-1', name: 'Геопросторові схеми', parentId: null },
  { id: 'f-2', name: 'Аналіз векторних шарів', parentId: 'f-1' },
  { id: 'f-3', name: 'Конвертація таблиць', parentId: null },
];

const INITIAL_NODES = [
  {
    id: 'node-stream-out-1',
    type: 'streamNode',
    position: { x: 100, y: 150 },
    data: {
      name: 'Вхідний GeoJSON файл',
      desc: 'Вхідний векторний шар з координатами об’єктів',
      direction: 'out',
      type: 'file',
      data_element: {
        data: 'features.geojson',
        data_type: 'geojson',
      },
    },
  },
  {
    id: 'node-script-1',
    type: 'scriptNode',
    position: { x: 450, y: 120 },
    data: {
      name: 'Фільтр об’єктів Python',
      desc: 'Обробка та фільтрація буферної зони',
      type: 'python',
      script_text: 'def process(input_data, buffer_dist):\n    # Python spatial buffer script\n    return input_data.buffer(buffer_dist)',
      script_params_list: [
        { name: 'buffer_dist', desc: 'Радіус буферної зони (м)', type: 'float', default: 50.0, min: 1.0, max: 500.0 },
        { name: 'min_points', desc: 'Мін. кількість точок', type: 'int', default: 5, min: 1, max: 100 },
      ],
      input_data_elem_list: [{ data_type: 'geojson' }],
      output_data_elem: { data_type: 'geojson' },
    },
  },
  {
    id: 'node-converter-1',
    type: 'converterNode',
    position: { x: 820, y: 150 },
    data: {
      name: 'GeoJSON -> CSV Конвертер',
      input_data_element: { data_type: 'geojson' },
      output_data_element: { data_type: 'csv' },
    },
  },
  {
    id: 'node-stream-in-1',
    type: 'streamNode',
    position: { x: 1150, y: 160 },
    data: {
      name: 'Вихідний CSV результат',
      desc: 'Збереження підсумкової таблиці атрибутів',
      direction: 'in',
      type: 'db',
      data_element: {
        data: 'output_table.csv',
        data_type: 'csv',
      },
    },
  },
];

const INITIAL_EDGES = [
  { id: 'e1-2', type: 'customDeletable', source: 'node-stream-out-1', target: 'node-script-1', sourceHandle: 'out', targetHandle: 'in-0', animated: true, style: { stroke: '#10b981', strokeWidth: 2.5 } },
  { id: 'e2-3', type: 'customDeletable', source: 'node-script-1', target: 'node-converter-1', sourceHandle: 'out', targetHandle: 'in', animated: true, style: { stroke: '#10b981', strokeWidth: 2.5 } },
  { id: 'e3-4', type: 'customDeletable', source: 'node-converter-1', target: 'node-stream-in-1', sourceHandle: 'out', targetHandle: 'in', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2.5 } },
];

const MOCK_SCHEMES = [
  {
    id: 's-1',
    name: 'Паайплайн обробки GeoJSON в CSV',
    desc: 'Фільтрація буферних зон векторних шарів та експорт атрибутивної таблиці',
    folderId: 'f-2',
    nodes: INITIAL_NODES,
    edges: INITIAL_EDGES,
  },
  {
    id: 's-2',
    name: 'Імпорт демо-даних шару',
    desc: 'Конвертація вхідних координат з файлу бази даних',
    folderId: 'f-3',
    nodes: [],
    edges: [],
  },
];

export const useSchemeStore = create((set, get) => ({
  folders: MOCK_FOLDERS,
  schemes: MOCK_SCHEMES,
  activeSchemeId: 's-1',
  activeLeftTab: 'scheme', // 'scheme' | 'admin' | null
  isLeftPanelOpen: true,

  nodes: INITIAL_NODES,
  edges: INITIAL_EDGES,

  // Selected node for parameter editing modal/panel
  selectedNodeId: null,

  setActiveScheme: (id) => {
    const targetScheme = get().schemes.find((s) => s.id === id);
    if (targetScheme) {
      set({
        activeSchemeId: id,
        nodes: targetScheme.nodes || [],
        edges: targetScheme.edges || [],
        selectedNodeId: null,
      });
    }
  },

  toggleLeftPanel: (tabName) => {
    set((state) => {
      if (state.activeLeftTab === tabName && state.isLeftPanelOpen) {
        return { isLeftPanelOpen: false };
      }
      return { activeLeftTab: tabName, isLeftPanelOpen: true };
    });
  },

  // Folder Operations
  createFolder: (name, parentId = null) => {
    const newFolder = {
      id: `f-${Date.now()}`,
      name: name || 'Нова папка',
      parentId,
    };
    set((state) => ({ folders: [...state.folders, newFolder] }));
  },

  renameFolder: (folderId, newName) => {
    set((state) => ({
      folders: state.folders.map((f) => (f.id === folderId ? { ...f, name: newName } : f)),
    }));
  },

  deleteFolder: (folderId) => {
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== folderId && f.parentId !== folderId),
      schemes: state.schemes.filter((s) => s.folderId !== folderId),
    }));
  },

  // Scheme Operations
  createScheme: (name, folderId = null) => {
    const newScheme = {
      id: `s-${Date.now()}`,
      name: name || 'Нова схема',
      desc: 'Опис нової схеми обробки',
      folderId,
      nodes: [],
      edges: [],
    };
    set((state) => ({
      schemes: [...state.schemes, newScheme],
      activeSchemeId: newScheme.id,
      nodes: [],
      edges: [],
    }));
  },

  renameScheme: (schemeId, newName) => {
    set((state) => ({
      schemes: state.schemes.map((s) => (s.id === schemeId ? { ...s, name: newName } : s)),
    }));
  },

  deleteScheme: (schemeId) => {
    set((state) => {
      const updatedSchemes = state.schemes.filter((s) => s.id !== schemeId);
      const nextActive = updatedSchemes.length > 0 ? updatedSchemes[0].id : null;
      const nextActiveScheme = updatedSchemes.find((s) => s.id === nextActive);
      return {
        schemes: updatedSchemes,
        activeSchemeId: nextActive,
        nodes: nextActiveScheme ? nextActiveScheme.nodes : [],
        edges: nextActiveScheme ? nextActiveScheme.edges : [],
      };
    });
  },

  // Canvas Nodes & Edges Handlers
  setNodes: (nodesUpdater) => {
    set((state) => {
      const newNodes = typeof nodesUpdater === 'function' ? nodesUpdater(state.nodes) : nodesUpdater;
      // sync with current active scheme
      const updatedSchemes = state.schemes.map((s) =>
        s.id === state.activeSchemeId ? { ...s, nodes: newNodes } : s
      );
      return { nodes: newNodes, schemes: updatedSchemes };
    });
  },

  setEdges: (edgesUpdater) => {
    set((state) => {
      const newEdges = typeof edgesUpdater === 'function' ? edgesUpdater(state.edges) : edgesUpdater;
      const updatedSchemes = state.schemes.map((s) =>
        s.id === state.activeSchemeId ? { ...s, edges: newEdges } : s
      );
      return { edges: newEdges, schemes: updatedSchemes };
    });
  },

  addNode: (nodeType, customDirection = null) => {
    const actualType = nodeType === 'streamInNode' || nodeType === 'streamOutNode' ? 'streamNode' : nodeType;
    const id = `node-${actualType}-${Date.now()}`;
    const currentNodesCount = get().nodes.length;
    const position = { x: 250 + (currentNodesCount * 30) % 400, y: 150 + (currentNodesCount * 30) % 300 };

    let newNodeData = {};
    if (actualType === 'streamNode') {
      const direction = customDirection || (nodeType === 'streamInNode' ? 'in' : 'out');
      const isInput = direction === 'in';
      newNodeData = {
        name: isInput ? 'Новий Потік (прийом даних)' : 'Новий Потік (видача даних)',
        desc: isInput ? 'Потік прийому підсумкових даних' : 'Потік видачі початкових даних',
        direction,
        type: 'file',
        data_element: { data: isInput ? 'input_table.csv' : 'file.geojson', data_type: isInput ? 'csv' : 'geojson' },
      };
    } else if (actualType === 'converterNode') {
      newNodeData = {
        name: 'Новий Конвертер',
        input_data_element: { data_type: 'csv' },
        output_data_element: { data_type: 'geojson' },
      };
    } else if (actualType === 'scriptNode') {
      newNodeData = {
        name: 'Новий Python Скрипт',
        desc: 'Кастомна обробка даних на Python',
        type: 'python',
        script_text: '# Python script code\noutput = input_data',
        script_params_list: [
          { name: 'threshold', desc: 'Поріг значень', type: 'float', default: 10.0, min: 0.0, max: 100.0 },
        ],
        input_data_elem_list: [{ data_type: 'csv' }],
        output_data_elem: { data_type: 'csv' },
      };
    }

    const newNode = {
      id,
      type: actualType,
      position,
      data: newNodeData,
    };

    get().setNodes((nds) => [...nds, newNode]);
  },

  updateNodeData: (nodeId, updatedData) => {
    get().setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...updatedData } } : n))
    );
  },

  deleteNode: (nodeId) => {
    get().setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    get().setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (get().selectedNodeId === nodeId) {
      set({ selectedNodeId: null });
    }
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
}));
