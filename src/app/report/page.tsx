"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import DetailedAssessmentResults from "../components/DetailedAssessmentResults"

export default function ReportPage() {
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
          // First, try to parse the data without decoding
          const parsedData = JSON.parse(data)
          setAssessmentResults(parsedData)
        } catch (error) {
          // If parsing fails, try decoding and then parsing
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

  return <DetailedAssessmentResults results={assessmentResults} behavioralData={assessmentResults.behavioralData} />
}

