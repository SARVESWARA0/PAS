import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

const STORAGE_KEY = 'assessment-data'

export const useAssessmentStore = create(
  persist(
    (set) => ({
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
      // New flag to indicate reset has been requested
      resetRequested: false,

      // Actions
      setScenarios: (scenarios) => set({ scenarios }),
      startAssessment: () => set({ hasStarted: true }),
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
            typeof updater === "function"
              ? updater(state.unusualTypingCount)
              : updater,
        })),
      setTimeOverruns: (updater) =>
        set((state) => ({
          timeOverruns:
            typeof updater === "function" ? updater(state.timeOverruns) : updater,
        })),

      // New action to set the reset flag
      setResetRequested: (flag) => set({ resetRequested: flag }),

      // Reset the entire assessment (including clearing scenarios and reset flag)
      resetAssessment: () =>
        set({
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
          resetRequested: true, // clear the flag after reset
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
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
        // Optionally, include resetRequested if you need its value to persist
        resetRequested: state.resetRequested,
      }),
    }
  )
)
