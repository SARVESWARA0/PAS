import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AssessmentState {
  recordId: string | null
  setRecordId: (id: string) => void
}

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set) => ({
      recordId: null,
      setRecordId: (id) => set({ recordId: id }),
    }),
    {
      name: "assessment-store",
    },
  ),
)

