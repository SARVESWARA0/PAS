"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import DetailedAssessmentResults from "../components/DetailedAssessmentResults"

function ReportPageContent() {
  const [assessmentResults, setAssessmentResults] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchData = async () => {
      const data = searchParams.get("data")
      if (data) {
        try {
          const parsedData = JSON.parse(data)
          setAssessmentResults(parsedData)
        } catch (error) {
          try {
            const decodedData = decodeURIComponent(data)
            const parsedData = JSON.parse(decodedData)
            setAssessmentResults(parsedData)
          } catch (decodeError) {
            console.error("Error parsing assessment results:", decodeError)
            setError("Error loading assessment results. Please try again.")
          }
        }
      } else {
        const assessmentId = searchParams.get("id")
        if (assessmentId) {
          try {
            const response = await fetch(`/api/assessment/${assessmentId}`)
            if (!response.ok) {
              throw new Error("Failed to fetch assessment results")
            }
            const data = await response.json()
            setAssessmentResults(data)
          } catch (error) {
            console.error("Error fetching assessment results:", error)
            setError("Error loading assessment results. Please try again.")
          }
        } else {
          setError("No assessment data or ID provided.")
        }
      }
      setIsLoading(false)
    }

    fetchData()
  }, [router, searchParams])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  if (!assessmentResults) {
    return <div>No assessment results found.</div>
  }

  // Ensure the fireInBelly data is included in the detailedAnalysis
  const updatedResults = {
    ...assessmentResults,
    detailedAnalysis: {
      ...assessmentResults.detailedAnalysis,
      fireInBelly: assessmentResults.detailedAnalysis.fireInBelly || [],
    },
    recruitmentSummary: assessmentResults.recruitmentSummary || {
      recommendation: "Not available",
      summary: "Recruitment summary not available.",
    },
  }

  return <DetailedAssessmentResults results={updatedResults} behavioralData={updatedResults.behavioralData} />
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div>Loading Report...</div>}>
      <ReportPageContent />
    </Suspense>
  )
}

