import { create } from 'zustand';

const DEFAULT_MINIMUMS = {
  'HEETS Amber': 5,
  'HEETS Yellow': 5,
  'HEETS Turquoise': 5,
  'HEETS Purple': 5,
  'HEETS Sienna': 5,
  'TEREA Bronze': 10,
  'TEREA Silver': 10,
  'TEREA Amber': 10,
  'TEREA Purple': 10,
  'TEREA Turquoise': 10,
  'IQOS ILUMA': 1,
  'IQOS ILUMA One': 1,
  'IQOS ILUMA Prime': 1,
  'IQOS 3 Duo': 1,
  'Аксессуары': 2,
};

function loadFromStorage(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

export const useAppStore = create((set, get) => ({
  // Data
  rawData: null,
  report: null,
  fileName: '',
  isLoading: false,
  loadingProgress: 0,
  loadingMessage: '',

  // Settings
  minimums: loadFromStorage('iqos_minimums', DEFAULT_MINIMUMS),

  // Filters
  filters: {
    bre: '',
    store: '',
    region: '',
    city: '',
    sku: '',
    status: '',
    search: '',
  },

  // UI state
  activeTab: 'dashboard', // 'dashboard' | 'analysis' | 'settings'
  toasts: [],
  selectedStore: null,

  // Actions
  setLoading: (isLoading, progress = 0, message = '') =>
    set({ isLoading, loadingProgress: progress, loadingMessage: message }),

  setRawData: (rawData, fileName) => set({ rawData, fileName }),

  setReport: (report) => set({ report }),

  setFilter: (key, value) =>
    set(state => ({ filters: { ...state.filters, [key]: value } })),

  clearFilters: () =>
    set({ filters: { bre: '', store: '', region: '', city: '', sku: '', status: '', search: '' } }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSelectedStore: (store) => set({ selectedStore: store }),

  updateMinimum: (sku, value) => {
    set(state => {
      const minimums = { ...state.minimums, [sku]: Number(value) };
      localStorage.setItem('iqos_minimums', JSON.stringify(minimums));
      return { minimums };
    });
  },

  addMinimum: (sku, value) => {
    set(state => {
      const minimums = { ...state.minimums, [sku]: Number(value) };
      localStorage.setItem('iqos_minimums', JSON.stringify(minimums));
      return { minimums };
    });
  },

  removeMinimum: (sku) => {
    set(state => {
      const minimums = { ...state.minimums };
      delete minimums[sku];
      localStorage.setItem('iqos_minimums', JSON.stringify(minimums));
      return { minimums };
    });
  },

  resetMinimums: () => {
    localStorage.setItem('iqos_minimums', JSON.stringify(DEFAULT_MINIMUMS));
    set({ minimums: DEFAULT_MINIMUMS });
  },

  addToast: (message, type = 'info') => {
    const id = Date.now();
    set(state => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) =>
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),

  reset: () => set({
    rawData: null, report: null, fileName: '',
    filters: { bre: '', store: '', region: '', city: '', sku: '', status: '', search: '' },
  }),
}));
