"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const STORE_VERSION = 1;
const STORAGE_KEY = "assessment-data-v1";

// Enhanced localStorage check with SSR awareness
const isLocalStorageAvailable = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

// Enhanced storage creator with SSR handling
const createSafeStorage = () => {
  if (typeof window === 'undefined') {
    return {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve()
    };
  }

  if (!isLocalStorageAvailable()) {
    console.warn("LocalStorage not available, using in-memory storage");
    let storage = {};
    return {
      getItem: (name) => Promise.resolve(storage[name] || null),
      setItem: (name, value) => {
        storage[name] = String(value);
        return Promise.resolve();
      },
      removeItem: (name) => {
        delete storage[name];
        return Promise.resolve();
      },
    };
  }

  return {
    getItem: async (name) => {
      try {
        const str = localStorage.getItem(name);
        return str || null;
      } catch (err) {
        console.error("Failed to get from localStorage:", err);
        return null;
      }
    },
    setItem: async (name, value) => {
      try {
        localStorage.setItem(name, value);
        return true;
      } catch (err) {
        console.error("Failed to write to localStorage:", err);
        return false;
      }
    },
    removeItem: async (name) => {
      try {
        localStorage.removeItem(name);
      } catch (err) {
        console.error("Failed to remove from localStorage:", err);
      }
    },
  };
};

const getInitialState = () => ({
  recordId: "",
  currentQuestion: 0,
  currentSection: "",
  responses: {},
  timing: {},
  scenarios: [],
  hasStarted: false,
  totalTimeTaken: 0,
  pasteCount: 0,
  tabSwitchCount: 0,
  unusualTypingCount: 0,
  timeOverruns: {},
  isAssessmentComplete: false,
  scenariosLoaded: false,
  storeVersion: STORE_VERSION,
  resetRequested: false,
  isLoading: true,
  isHydrated: false // New flag for tracking hydration status
});

export const useAssessmentStore = create(
  persist(
    (set, get) => ({
      ...getInitialState(),
      initialize: () => {
        const state = get();
        if (!state.recordId && typeof window !== 'undefined') {
          set({
            recordId: `assessment-${Date.now()}`,
            isHydrated: true
          });
        }
      },

      // Actions
      setScenarios: (scenarios) => set({ 
        scenarios,
        isLoading: false,
        scenariosLoaded: true 
      }),

      startAssessment: () => {
        const state = get();
        if (!state.recordId) {
          set({
            recordId: `assessment-${Date.now()}`,
            hasStarted: true,
            isHydrated: true
          });
        } else {
          set({ hasStarted: true });
        }
      },


      completeAssessment: () => set({ isAssessmentComplete: true }),

      setScenariosLoaded: (loaded) => set({ scenariosLoaded: loaded }),

      setRecordId: (recordId) => set({ recordId }),

      setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),

      setCurrentSection: (currentSection) => set({ currentSection }),

      setResponses: (updater) =>
        set((state) => ({
          responses:
            typeof updater === "function" ? updater(state.responses) : updater,
        })),

      setTiming: (updater) =>
        set((state) => {
          const newTiming =
            typeof updater === "function" ? updater(state.timing) : updater;
          if (JSON.stringify(newTiming) !== JSON.stringify(state.timing)) {
            return { timing: newTiming };
          }
          return {};
        }),

      setTotalTimeTaken: (updater) =>
        set((state) => ({
          totalTimeTaken:
            typeof updater === "function"
              ? updater(state.totalTimeTaken)
              : updater,
        })),

      setPasteCount: (updater) =>
        set((state) => ({
          pasteCount:
            typeof updater === "function" ? updater(state.pasteCount) : updater,
        })),

      setTabSwitchCount: (updater) =>
        set((state) => ({
          tabSwitchCount:
            typeof updater === "function" ? updater(state.tabSwitchCount) : updater,
        })),

      setUnusualTypingCount: (updater) =>
        set((state) => ({
          unusualTypingCount:
            typeof updater === "function"
              ? updater(state.unusualTypingCount)
              : updater,
        })),

      setTimeOverruns: (updater) =>
        set((state) => ({
          timeOverruns:
            typeof updater === "function"
              ? updater(state.timeOverruns)
              : updater,
        })),

      // Set loading state
      setLoading: (isLoading) => set({ isLoading }),

      // New action to set the reset flag
      setResetRequested: (flag) => set({ resetRequested: flag }),

      // Reset the entire assessment (including clearing scenarios and reset flag)
      resetAssessment: () => {
        set({ resetRequested: true });
        set(getInitialState());
        try {
          if (isLocalStorageAvailable()) {
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch (err) {
          console.error("Failed to clear localStorage during reset:", err);
        }
      },

      verifyStoreIntegrity: () => {
        const state = get();
        if (state.storeVersion !== STORE_VERSION) {
          console.warn("Store version mismatch, resetting state");
          get().resetAssessment();
          return false;
        }
        if (state.hasStarted && !state.recordId) {
          console.warn("Assessment started but recordId is missing, fixing...");
          set({ 
            recordId: `assessment-${Date.now()}`,
            isHydrated: true 
          });
        }
        set({ 
          isLoading: false,
          isHydrated: true 
        });
        return true;
      },

      // Enhanced reset
      resetAssessment: () => {
        set({ resetRequested: true });
        set({
          ...getInitialState(),
          isHydrated: true,
          recordId: `assessment-${Date.now()}`
        });
        if (typeof window !== 'undefined' && isLocalStorageAvailable()) {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => createSafeStorage()),
      partialize: (state) => ({
        recordId: state.recordId,
        currentQuestion: state.currentQuestion,
        currentSection: state.currentSection,
        responses: state.responses,
        timing: state.timing,
        scenarios: state.scenarios,
        hasStarted: state.hasStarted,
        totalTimeTaken: state.totalTimeTaken,
        pasteCount: state.pasteCount,
        tabSwitchCount: state.tabSwitchCount,
        unusualTypingCount: state.unusualTypingCount,
        timeOverruns: state.timeOverruns,
        isAssessmentComplete: state.isAssessmentComplete,
        scenariosLoaded: state.scenariosLoaded,
        storeVersion: STORE_VERSION,
        isHydrated: state.isHydrated
      }),
      onRehydrateStorage: () => (state, error) => {
        if (state) {
          console.log("State successfully hydrated:", state);
          setTimeout(() => {
            const store = useAssessmentStore.getState();
            store.initialize();
            store.verifyStoreIntegrity();
          }, 100);
        } else {
          console.error("Hydration failed - starting with fresh state", error);
          useAssessmentStore.setState({
            ...getInitialState(),
            isLoading: false,
            isHydrated: true,
            recordId: `assessment-${Date.now()}`
          });
        }
      }
    }
  )
);

// Enhanced initialization hook
export const useInitializeStore = () => {
  const { verifyStoreIntegrity, isLoading, isHydrated, initialize } = useAssessmentStore();

  useEffect(() => {
    if (!isHydrated) {
      initialize();
    }

    const timer = setTimeout(() => {
      if (isLoading) {
        verifyStoreIntegrity();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [verifyStoreIntegrity, isLoading, isHydrated, initialize]);

  return isLoading;
};