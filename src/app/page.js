"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, Clock, AlertCircle } from "lucide-react"
import LoadingSpinner from "./LoadingSpinner"
import DetailedAssessmentResults from "./DetailedAssessmentResults"
import FeedbackForm from "./FeedbackForm"
import ConfirmationModal from "./ConfirmationModal"
import ProgressIndicator from "./ProgressIndicator"
import { detectUnusualTyping } from "../utils/detectUnusualTyping"
import { innovationQuestions, emailScenarios } from "../lib/questions"

const timerRef = { current: null }

export default function AssessmentPage() {
  const [responses, setResponses] = useState({})
  const [timing, setTiming] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [currentSection, setCurrentSection] = useState("innovationMindset")
  const [assessmentResults, setAssessmentResults] = useState(null)
  const [totalTimeTaken, setTotalTimeTaken] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [pasteCount, setPasteCount] = useState(0)
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [unusualTypingCount, setUnusualTypingCount] = useState(0)
  const [blockCopyPaste, setBlockCopyPaste] = useState(false)
  const [timeOverruns, setTimeOverruns] = useState(0)
  
  const [showFeedback, setShowFeedback] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleEnd = useCallback(
    (index, section) => {
      clearInterval(timerRef.current)
      timerRef.current = null
      const endTime = Date.now()
      const startTime = timing[index]?.startTime
      if (startTime) {
        const timeTaken = ((endTime - startTime) / 60000).toFixed(2)
        const timeOverrun = timeTaken > 3
        setTiming((prev) => ({
          ...prev,
          [index]: { ...prev[index], timeTaken },
        }))
        setTimeOverruns((prev) => ({
          ...prev,
          [section]: { ...prev[section], [index]: timeOverrun },
        }))
        setResponses((prev) => ({
          ...prev,
          [section]: {
            ...prev[section],
            [index]: { ...prev[section]?.[index], timeTaken, timeOverrun },
          },
        }))
      }
    },
    [timing],
  )

  const handleStart = useCallback(
    (index) => {
      setTiming((prev) => {
        if (prev[index] && prev[index].startTime) {
          return prev
        }
        return { ...prev, [index]: { startTime: Date.now(), timeLeft: 180 } }
      })

      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setTiming((prev) => {
            const currentTiming = prev[index]
            if (!currentTiming || currentTiming.timeLeft <= 0) {
              clearInterval(timerRef.current)
              timerRef.current = null
              handleEnd(index, currentSection)
              return prev
            }
            return {
              ...prev,
              [index]: { ...currentTiming, timeLeft: currentTiming.timeLeft - 1 },
            }
          })
        }, 1000)
      }
    },
    [currentSection, handleEnd],
  )

  const handleResponse = (section, index, value) => {
    const currentTime = Date.now()
    const startTime = timing[index]?.startTime || currentTime
    const responseTime = (currentTime - startTime) / 1000

    let questionData

    if (section === "innovationMindset") {
      questionData = { question: innovationQuestions[index] }
    } else if (section === "professionalCommunication") {
      const emailScenario = emailScenarios[index]
      questionData = {
        subject: emailScenario.subject,
        context: emailScenario.context,
        instructions: emailScenario.instructions,
      }
    }

    const isUnusualTyping = detectUnusualTyping(value, responseTime)
    if (isUnusualTyping) {
      setUnusualTypingCount((prev) => prev + 1)
    }

    setResponses((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [index]: {
          ...prev[section]?.[index],
          response: value,
          responseTime: responseTime,
          timeTaken: timing[index]?.timeTaken || 0,
          pasteCount: prev[section]?.[index]?.pasteCount || 0,
          tabSwitchCount: prev[section]?.[index]?.tabSwitchCount || 0,
          unusualTypingCount: (prev[section]?.[index]?.unusualTypingCount || 0) + (isUnusualTyping ? 1 : 0),
          ...questionData,
        },
      },
    }))
  }

  const handleCopyPaste = (e) => {
    setPasteCount((prev) => prev + 1)
    setResponses((prev) => ({
      ...prev,
      [currentSection]: {
        ...prev[currentSection],
        [currentQuestion]: {
          ...prev[currentSection]?.[currentQuestion],
          pasteCount: (prev[currentSection]?.[currentQuestion]?.pasteCount || 0) + 1,
        },
      },
    }))
    if (blockCopyPaste) {
      e.preventDefault()
    }
  }

  const handleSubmit = useCallback(async () => {
    setShowConfirmation(false)
    setIsLoading(true)
    try {
      const innovationMindsetResponses = Object.entries(responses.innovationMindset || {}).reduce(
        (acc, [index, data]) => {
          if (data && data.response) {
            acc[index] = {
              ...data,
              question: innovationQuestions[Number(index)],
              pasteCount: data.pasteCount || 0,
              tabSwitchCount: data.tabSwitchCount || 0,
              unusualTypingCount: data.unusualTypingCount || 0,
            }
          }
          return acc
        },
        {},
      )

      const professionalCommunicationResponses = Object.entries(responses.professionalCommunication || {}).reduce(
        (acc, [index, data]) => {
          if (data && data.response) {
            acc[index] = {
              ...data,
              subject: emailScenarios[Number(index)].subject,
              context: emailScenarios[Number(index)].context,
              instructions: emailScenarios[Number(index)].instructions,
              pasteCount: data.pasteCount || 0,
              tabSwitchCount: data.tabSwitchCount || 0,
              unusualTypingCount: data.unusualTypingCount || 0,
            }
          }
          return acc
        },
        {},
      )

      const payload = {
        innovationMindset: innovationMindsetResponses,
        professionalCommunication: professionalCommunicationResponses,
        behavioralData: {
          totalPasteCount: pasteCount,
          totalTabSwitchCount: tabSwitchCount,
          totalUnusualTypingCount: unusualTypingCount,
          timeOverruns: timeOverruns,
        },
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ASSESSMENT_TOKEN}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      console.log("Assessment submitted successfully:", data)

      setAssessmentResults(data)
      setIsLoading(false)
    } catch (error) {
      console.error("Error submitting assessment:", error)
      setIsLoading(false)
      setErrorMessage("Failed to submit assessment: " + error.message)
    }
  }, [responses, pasteCount, tabSwitchCount, unusualTypingCount, timeOverruns])

  const handleNext = () => {
    const currentResponse = responses[currentSection]?.[currentQuestion]?.response || ""
    if (currentResponse.trim().split(/\s+/).length < 5) {
      setErrorMessage("Please provide an answer with at least 5 words before moving to the next question.")
      return
    }
    setErrorMessage("")
    handleEnd(currentQuestion, currentSection)
    if (currentSection === "innovationMindset" && currentQuestion === innovationQuestions.length - 1) {
      setCurrentSection("professionalCommunication")
      setCurrentQuestion(0)
    } else if (currentSection === "professionalCommunication" && currentQuestion === emailScenarios.length - 1) {
      setShowConfirmation(true)
    } else {
      setCurrentQuestion((prev) => prev + 1)
    }
    handleStart(currentQuestion + 1)

    const remainingTime = timing[currentQuestion]?.timeLeft
    const timeTaken = 180 - remainingTime
    setTotalTimeTaken(totalTimeTaken + timeTaken)
  }

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1)
        setResponses((prev) => ({
          ...prev,
          [currentSection]: {
            ...prev[currentSection],
            [currentQuestion]: {
              ...prev[currentSection]?.[currentQuestion],
              tabSwitchCount: (prev[currentSection]?.[currentQuestion]?.tabSwitchCount || 0) + 1,
            },
          },
        }))
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [currentSection, currentQuestion])

  useEffect(() => {
    const handleCopy = () => {
      setPasteCount((prev) => prev + 1)
      setResponses((prev) => ({
        ...prev,
        [currentSection]: {
          ...prev[currentSection],
          [currentQuestion]: {
            ...prev[currentSection]?.[currentQuestion],
            pasteCount: (prev[currentSection]?.[currentQuestion]?.pasteCount || 0) + 1,
          },
        },
      }))
    }

    document.addEventListener("copy", handleCopy)
    return () => {
      document.removeEventListener("copy", handleCopy)
    }
  }, [currentSection, currentQuestion])

  useEffect(() => {
    const preventCopy = (e) => {
      if (blockCopyPaste) {
        e.preventDefault()
      }
    }

    document.addEventListener("copy", preventCopy)
    return () => {
      document.removeEventListener("copy", preventCopy)
    }
  }, [blockCopyPaste])

  useEffect(() => {
    handleStart(currentQuestion)
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [currentQuestion, handleStart])

  const currentQuestionData =
    currentSection === "innovationMindset" ? innovationQuestions[currentQuestion] : emailScenarios[currentQuestion]

  const totalQuestions = innovationQuestions.length + emailScenarios.length
  const currentQuestionNumber =
    currentSection === "innovationMindset" ? currentQuestion + 1 : innovationQuestions.length + currentQuestion + 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <ProgressIndicator currentQuestion={currentQuestionNumber} totalQuestions={totalQuestions} />
        <div className="bg-gray-800 shadow-2xl rounded-2xl overflow-hidden border border-indigo-500/30">
          <div className="px-6 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <h1 className="text-4xl font-bold tracking-tight">Student Assessment</h1>
            <p className="mt-2 text-indigo-100 text-lg">
              {currentSection === "innovationMindset"
                ? "Part A: Innovation Mindset"
                : "Part B: Professional Communication"}
            </p>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-gray-300 bg-gray-700 px-3 py-1 rounded-full">
                Question {currentQuestionNumber} of {totalQuestions}
              </span>
              <div className="flex items-center text-indigo-300 bg-indigo-900/50 px-4 py-2 rounded-full">
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-mono text-lg">
                  {Math.floor(timing[currentQuestion]?.timeLeft / 60)}:
                  {(timing[currentQuestion]?.timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-indigo-300 mb-4">
              {currentSection === "innovationMindset"
                ? `Question ${currentQuestionNumber}`
                : currentQuestionData.subject}
            </h2>

            {currentSection === "professionalCommunication" && (
              <div className="mb-4 p-4 bg-indigo-900/30 rounded-lg border border-indigo-500/50">
                <p className="text-sm text-indigo-200">
                  <strong>Context:</strong> {currentQuestionData.context}
                </p>
              </div>
            )}

            <p className="text-gray-300 mb-6">
              {currentSection === "innovationMindset" ? currentQuestionData : currentQuestionData.instructions}
            </p>

            <textarea
              className="w-full p-4 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ease-in-out hover:bg-gray-650"
              rows={6}
              placeholder="Type your answer here..."
              onChange={(e) => handleResponse(currentSection, currentQuestion, e.target.value)}
              onPaste={handleCopyPaste}
              value={responses[currentSection]?.[currentQuestion]?.response || ""}
            ></textarea>

            {errorMessage && (
              <div className="mt-4 text-red-400 bg-red-900/30 p-3 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div className="flex items-center text-yellow-300 bg-yellow-900/30 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm">Answer within the time limit for best results</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <label htmlFor="blockCopyPaste" className="mr-2 text-sm text-indigo-300">
                    Block Copy/Paste:
                  </label>
                  <input
                    type="checkbox"
                    id="blockCopyPaste"
                    checked={blockCopyPaste}
                    onChange={(e) => setBlockCopyPaste(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                </div>
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {currentQuestionNumber === totalQuestions ? "Submit" : "Next"}
                  <ChevronRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {isLoading && <LoadingSpinner />}
        {showFeedback && <FeedbackForm onSubmit={() => setShowFeedback(false)} />}
        {assessmentResults && (
          <DetailedAssessmentResults
            results={{
              ...assessmentResults,
              behavioralData: {
                totalUnusualTypingCount: unusualTypingCount,
                totalTabSwitchCount: tabSwitchCount,
                totalPasteCount: pasteCount,
              },
            }}
          />
        )}

        <ConfirmationModal
          isOpen={showConfirmation}
          onConfirm={handleSubmit}
          onCancel={() => setShowConfirmation(false)}
        />
      </div>
    </div>
  )
}

