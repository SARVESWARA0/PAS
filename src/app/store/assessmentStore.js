import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

const STORAGE_KEY = 'assessment-data'

export const useAssessmentStore = create(
  persist(
    (set, get) => ({
      recordId: "",
      currentQuestion: 0,
      currentSection: "",
      responses: {},
      timing: {},
      scenarios: [], // Now included in persistence
      hasStarted: false,
      totalTimeTaken: 0,
      pasteCount: 0,
      tabSwitchCount: 0,
      unusualTypingCount: 0,
      timeOverruns: {},
      isAssessmentComplete: false, // New flag to track completion

      setScenarios: (scenarios) => set({ scenarios }),
      startAssessment: () => set({ hasStarted: true }),
      completeAssessment: () => set({ isAssessmentComplete: true }),
      
      // Existing setters remain the same
      setRecordId: (recordId) => set({ recordId }),
      setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),
      setCurrentSection: (currentSection) => set({ currentSection }),
      setResponses: (updater) =>
        set((state) => ({
          responses: typeof updater === "function" ? updater(state.responses) : updater,
        })),
      setTiming: (updater) =>
        set((state) => {
          const newTiming = typeof updater === 'function' ? updater(state.timing) : updater;
          if (JSON.stringify(newTiming) !== JSON.stringify(state.timing)) {
            return { timing: newTiming };
          }
          return {};
        }),
      setTotalTimeTaken: (updater) =>
        set((state) => ({
          totalTimeTaken: typeof updater === "function" ? updater(state.totalTimeTaken) : updater,
        })),
      setPasteCount: (updater) =>
        set((state) => ({
          pasteCount: typeof updater === "function" ? updater(state.pasteCount) : updater,
        })),
      setTabSwitchCount: (updater) =>
        set((state) => ({
          tabSwitchCount: typeof updater === "function" ? updater(state.tabSwitchCount) : updater,
        })),
      setUnusualTypingCount: (updater) =>
        set((state) => ({
          unusualTypingCount: typeof updater === "function" ? updater(state.unusualTypingCount) : updater,
        })),
      setTimeOverruns: (updater) =>
        set((state) => ({
          timeOverruns: typeof updater === "function" ? updater(state.timeOverruns) : updater,
        })),
        
      // Modified reset function
      resetAssessment: () => set({
        recordId: "",
        currentQuestion: 0,
        currentSection: "",
        responses: {},
        timing: {},
        scenarios: [], // Clear scenarios on reset
        hasStarted: false,
        totalTimeTaken: 0,
        pasteCount: 0,
        tabSwitchCount: 0,
        unusualTypingCount: 0,
        timeOverruns: {},
        isAssessmentComplete: false,
      }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Include all necessary state in persistence
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
      }),
    },
  ),
)