"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import AssessmentContent from "./AssessmentCounter";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAssessmentStore } from "../store/assessmentStore";

export default function AssessmentPage() {
  const router = useRouter();
  const resetRequested = useAssessmentStore((state) => state.resetRequested);

  // Immediately redirect if the flag is set
  if (resetRequested) {
    router.push("/thank-you");
    return null;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AssessmentContent />
    </Suspense>
  );
}
