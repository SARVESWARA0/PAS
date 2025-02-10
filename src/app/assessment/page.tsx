"use client"

import { Suspense } from "react"
import AssessmentContent from "./AssessmentCounter"
import LoadingSpinner from "../components/LoadingSpinner"

export default function AssessmentPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AssessmentContent />
    </Suspense>
  )
}

