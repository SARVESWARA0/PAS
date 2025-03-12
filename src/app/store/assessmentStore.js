"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const STORE_VERSION = 1;
const STORAGE_KEY = "assessment-data-v1";

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
  completed: false, // new flag to indicate assessment has been completed
  scenariosLoaded: false, // flag to indicate scenarios have been fetched
  resetRequested: false,
  isLoading: true,
  isRehydrated: false, // new flag indicating rehydration complete
  storeVersion: STORE_VERSION,
});

export const useAssessmentStore = create(
  persist(
    (set, get) => ({
      ...getInitialState(),

      // Actions
      setScenarios: (scenarios) =>
        set({ scenarios, scenariosLoaded: true, isLoading: false }),
      startAssessment: () => {
        const state = get();
        if (!state.recordId) {
          set({
            recordId: `assessment-${Date.now()}`,
            hasStarted: true,
          });
        } else {
          set({ hasStarted: true });
        }
      },
      // Updated completeAssessment to mark the assessment as completed
      completeAssessment: () => set({ completed: true }),
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
            typeof updater === "function"
              ? updater(state.tabSwitchCount)
              : updater,
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
      setLoading: (isLoading) => set({ isLoading }),
      setResetRequested: (flag) => set({ resetRequested: flag }),
      // resetAssessment now resets the state except for the 'completed' flag
      resetAssessment: () => {
        const { completed } = get();
        return set({
          ...getInitialState(),
          completed, // preserve the completion status
        });
      },
      verifyStoreIntegrity: () => {
        const state = get();
        if (state.storeVersion !== STORE_VERSION) {
          set(getInitialState());
        }
        set({ isLoading: false });
        return true;
      },
      setRehydrated: () => set({ isRehydrated: true }),
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
        completed: state.completed,
        scenariosLoaded: state.scenariosLoaded,
        resetRequested: state.resetRequested,
        storeVersion: state.storeVersion,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (state) {
          state.setRehydrated();
          state.verifyStoreIntegrity();
        } else {
          console.error("Failed to rehydrate assessment store:", error);
        }
      },
    }
  )
);
