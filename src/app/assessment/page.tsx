"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import AssessmentContent from "./AssessmentCounter";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAssessmentStore } from "../store/assessmentStore";

export default function AssessmentPage() {
  const router = useRouter();
  const resetRequested = useAssessmentStore((state) => state.resetRequested);

  // Redirect to thank-you page if resetRequested is true
  useEffect(() => {
    if (resetRequested) {
      router.push("/thank-you");
    }
  }, [resetRequested, router]);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AssessmentContent />
    </Suspense>
  );
}
