import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

// Store version helps handle migrations and invalidate corrupted state
const STORE_VERSION = 1
const STORAGE_KEY = 'assessment-data-v1'

// Helper to check if localStorage is actually available and working
const isLocalStorageAvailable = () => {
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    return true
  } catch(e) {
    return false
  }
}

// Create a safer storage mechanism
const createSafeStorage = () => {
  // If localStorage isn't available, use a memory-based fallback
  if (!isLocalStorageAvailable()) {
    console.warn('LocalStorage not available, using in-memory storage')
    let storage = {}
    return {
      getItem: (name) => {
        const str = storage[name] || null
        return str ? Promise.resolve(str) : Promise.resolve(null)
      },
      setItem: (name, value) => {
        storage[name] = String(value)
        return Promise.resolve(true)
      },
      removeItem: (name) => {
        delete storage[name]
        return Promise.resolve()
      }
    }
  }
  
  // Use localStorage with error handling
  return {
    getItem: (name) => {
      try {
        const str = localStorage.getItem(name)
        if (!str) return Promise.resolve(null)
        return Promise.resolve(str)
      } catch (err) {
        console.error('Failed to get from localStorage:', err)
        return Promise.resolve(null)
      }
    },
    setItem: (name, value) => {
      try {
        localStorage.setItem(name, value)
        return Promise.resolve(true)
      } catch (err) {
        console.error('Failed to write to localStorage:', err)
        return Promise.resolve(false)
      }
    },
    removeItem: (name) => {
      try {
        localStorage.removeItem(name)
        return Promise.resolve()
      } catch (err) {
        console.error('Failed to remove from localStorage:', err)
        return Promise.resolve()
      }
    }
  }
}

// Initial state to ensure consistent reset
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
})

export const useAssessmentStore = create(
  persist(
    (set, get) => ({
      // Initial state
      ...getInitialState(),
      
      // Actions
      setScenarios: (scenarios) => set({ scenarios }),
      
      startAssessment: () => {
        // Create default data when starting if recordId is empty
        const state = get()
        if (!state.recordId) {
          set({ 
            recordId: `assessment-${Date.now()}`,
            hasStarted: true 
          })
        } else {
          set({ hasStarted: true })
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
            typeof updater === "function" ? updater(state.totalTimeTaken) : updater,
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
            typeof updater === "function" ? updater(state.unusualTypingCount) : updater,
        })),
      
      setTimeOverruns: (updater) =>
        set((state) => ({
          timeOverruns:
            typeof updater === "function" ? updater(state.timeOverruns) : updater,
        })),
      
      // Set loading state
      setLoading: (isLoading) => set({ isLoading }),
      
      // New action to set the reset flag
      setResetRequested: (flag) => set({ resetRequested: flag }),
      
      // Reset the entire assessment (including clearing scenarios and reset flag)
      resetAssessment: () => {
        // First mark it as requested
        set({ resetRequested: true })
        
        // Then perform the actual reset with fresh initial state
        set(getInitialState())
        
        // Attempt to clear storage for complete reset
        try {
          if (isLocalStorageAvailable()) {
            localStorage.removeItem(STORAGE_KEY)
          }
        } catch (err) {
          console.error('Failed to clear localStorage during reset:', err)
        }
      },
      
      // Verify store integrity (call this after hydration)
      verifyStoreIntegrity: () => {
        const state = get()
        
        // Version mismatch indicates potential corrupted state
        if (state.storeVersion !== STORE_VERSION) {
          console.warn('Store version mismatch, resetting state')
          get().resetAssessment()
          return false
        }
        
        // Check for corrupted critical fields
        if (state.hasStarted && !state.recordId) {
          console.warn('Assessment started but recordId is missing, fixing...')
          set({ recordId: `assessment-${Date.now()}` })
        }
        
        // Indicate loading is complete
        set({ isLoading: false })
        return true
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
        storeVersion: STORE_VERSION, // Always store current version
      }),
      // Add onRehydrateStorage to handle hydration errors
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Successful hydration
          setTimeout(() => {
            // Use setTimeout to ensure this runs after hydration is fully complete
            const store = useAssessmentStore.getState()
            store.verifyStoreIntegrity()
            store.setLoading(false)
          }, 100)
        } else {
          // Failed hydration
          console.error('Hydration failed - starting with fresh state')
          set({ ...getInitialState(), isLoading: false })
        }
      },
    }
  )
)

// Create a hook to initialize the store
export const useInitializeStore = () => {
  const { verifyStoreIntegrity, isLoading } = useAssessmentStore()
  
  useEffect(() => {
    // Small delay to ensure hydration has completed
    const timer = setTimeout(() => {
      if (isLoading) {
        verifyStoreIntegrity()
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [verifyStoreIntegrity, isLoading])
  
  return isLoading
}