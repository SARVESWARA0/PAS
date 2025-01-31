"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import AssessmentContent from "./AssessmentCounter"

function AssessmentPageContent() {
  const [userName, setUserName] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const name = searchParams.get("name")
    if (name) {
      setUserName(decodeURIComponent(name))
    } else {
      router.push("/")
    }
  }, [router, searchParams])

  if (!userName) {
    return null
  }

  return <AssessmentContent userName={userName} />
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AssessmentPageContent />
    </Suspense>
  )
}
