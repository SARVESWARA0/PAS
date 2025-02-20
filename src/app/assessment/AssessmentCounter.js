"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, Clock, AlertCircle, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import LoadingSpinner from "../components/LoadingSpinner"
import ConfirmationModal from "../components/ConfirmationModal"
import { detectUnusualTyping } from "../utils/detectUnusualTyping"
import ProgressBar from "../components/ProgressBar"
import Confetti from "react-confetti"
import { useAssessmentStore } from "../store/assessmentStore"


const AssessmentContent = () => {
  const router = useRouter()
  const timerRef = useRef(null)

  // Simplified refs for loading states
  const loadingRef = useRef({
    attempted: false,
    inProgress: false,
  })

  const stateRestoredRef = useRef(false)
  const initialLoadAttemptedRef = useRef(false)

  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [blockCopyPaste, setBlockCopyPaste] = useState(false)

  const {
    recordId,
    currentQuestion,
    currentSection,
    responses,
    timing,
    scenarios,
    setRecordId,
    setCurrentQuestion,
    setCurrentSection,
    setResponses,
    setTiming,
    setScenarios,
    totalTimeTaken,
    pasteCount,
    tabSwitchCount,
    unusualTypingCount,
    timeOverruns,
    setTotalTimeTaken,
    setScenariosLoaded,
    scenariosLoaded,
    setPasteCount,
    setTabSwitchCount,
    setUnusualTypingCount,
    setTimeOverruns,
    hasStarted,
    startAssessment,
    resetAssessment,
    setResetRequested,
  } = useAssessmentStore()

  const handleEnd = useCallback(
    (index, section) => {
      if (!scenarios[index]) return
  
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
  
      const currentTimerState = timing[index]
      if (!currentTimerState) return
  
      const initialTime = scenarios[index].timer * 60
      // Calculate the actual time taken from the recorded start time
      const actualTimeTaken = Math.floor((Date.now() - currentTimerState.startTime) / 1000)
      // Determine overtime as the extra seconds beyond the allotted time
      const overtime = actualTimeTaken - initialTime
  
      if (overtime > 0) {
        setTimeOverruns((prev) => ({
          ...prev,
          [index]: overtime,
        }))
      }
  
      setTiming((prev) => ({
        ...prev,
        [index]: {
          ...prev[index],
          isCompleted: true,
          timeLeft: 0,
        },
      }))
  
      setResponses((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [index]: {
            ...(prev[section]?.[index] || {}),
            completed: true,
            timeTaken: actualTimeTaken,
          },
        },
      }))
    },
    [scenarios, setTiming, setResponses, setTimeOverruns, timing],
  )
  

  const startTimer = useCallback(
    (index) => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      const initialTime = scenarios[index]?.timer * 60 || 0
      if (initialTime <= 0) return

      // Initialize timer state if not already set
      if (!timing[index]) {
        const now = Date.now()
        setTiming((prev) => ({
          ...prev,
          [index]: {
            startTime: now,
            timeLeft: initialTime,
            lastUpdateTime: now,
            isCompleted: false,
          },
        }))
      }

      timerRef.current = setInterval(() => {
        setTiming((prev) => {
          const currentTimer = prev[index]
          if (!currentTimer || currentTimer.isCompleted) {
            clearInterval(timerRef.current)
            return prev
          }

          const now = Date.now()
          const elapsed = Math.floor((now - currentTimer.lastUpdateTime) / 1000)
          const newTimeLeft = Math.max(0, currentTimer.timeLeft - elapsed)

          if (newTimeLeft <= 0) {
            clearInterval(timerRef.current)
            timerRef.current = null
            // Handle end outside of setState to avoid nested updates
            setTimeout(() => handleEnd(index, currentSection), 0)
            return {
              ...prev,
              [index]: {
                ...currentTimer,
                timeLeft: 0,
                lastUpdateTime: now,
                isCompleted: true,
              },
            }
          }

          return {
            ...prev,
            [index]: {
              ...currentTimer,
              timeLeft: newTimeLeft,
              lastUpdateTime: now,
            },
          }
        })
      }, 1000)
    },
    [scenarios, handleEnd, timing, currentSection, setTiming],
  )

  const handleStart = useCallback(
    (index) => {
      if (!scenarios[index]?.timer) return
      startTimer(index)
    },
    [scenarios, startTimer],
  )

  const handleResponse = useCallback(
    (section, index, value) => {
      if (!timing[index] && scenarios[index]) {
        const now = Date.now()
        const totalTime = scenarios[index].timer * 60

        setTiming((prev) => ({
          ...prev,
          [index]: {
            startTime: now,
            timeLeft: totalTime,
            lastUpdateTime: now,
            isCompleted: false,
          },
        }))
      }

      const currentTime = Date.now()
      const startTime = timing[index]?.startTime || currentTime
      const responseTime = (currentTime - startTime) / 1000
      const isUnusualTyping = detectUnusualTyping(value, responseTime)

      if (isUnusualTyping) {
        setUnusualTypingCount((prev) => prev + 1)
      }

      setResponses((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [index]: {
            ...(prev[section]?.[index] || {}),
            response: value,
            responseTime,
            timeTaken: responseTime,
          },
        },
      }))
    },
    [timing, scenarios, setTiming, setResponses, setUnusualTypingCount],
  )

  const handleCopyPaste = useCallback(
    (e) => {
      setPasteCount((prev) => prev + 1)
      setResponses((prev) => ({
        ...prev,
        [currentSection]: {
          ...prev[currentSection],
          [currentQuestion]: {
            ...(prev[currentSection]?.[currentQuestion] || {}),
            pasteCount: (prev[currentSection]?.[currentQuestion]?.pasteCount || 0) + 1,
          },
        },
      }))
      if (blockCopyPaste) {
        e.preventDefault()
      }
    },
    [blockCopyPaste, currentQuestion, currentSection, setPasteCount, setResponses],
  )

  const handleSubmit = useCallback(async () => {
    setShowConfetti(true)
    setIsLoading(true)

    try {
      const payload = {
        recordId,
        responses: {},
        behavioralData: {
          totalPasteCount: pasteCount,
          totalTabSwitchCount: tabSwitchCount,
          totalUnusualTypingCount: unusualTypingCount,
          timeOverruns,
          totalTimeTaken,
        },
      }

      Object.entries(responses).forEach(([topic, topicResponses]) => {
        payload.responses[topic] = {}
        Object.entries(topicResponses).forEach(([index, response]) => {
          const scenario = scenarios[Number.parseInt(index)]
          if (scenario && response) {
            payload.responses[topic][index] = {
              id: scenario.id,
              headers: scenario.header,
              question: scenario.question,
              answer: response.response,
              responseTime: response.responseTime,
              timeTaken: response.timeTaken,
              pasteCount: response.pasteCount || 0,
              tabSwitchCount: response.tabSwitchCount || 0,
              unusualTypingCount: response.unusualTypingCount || 0,
            }
          }
        })
      })

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      setResetRequested(true)
      resetAssessment()
      router.push("/thank-you")
    } catch (error) {
      console.error("Error submitting assessment:", error)
      setIsLoading(false)
      setErrorMessage("Failed to submit assessment: " + error.message)
      setShowConfetti(false)
    }
  }, [
    recordId,
    responses,
    scenarios,
    pasteCount,
    tabSwitchCount,
    unusualTypingCount,
    timeOverruns,
    totalTimeTaken,
    router,
    setResetRequested,
    resetAssessment,
  ])

  const handleNext = useCallback(() => {
    if (!scenarios[currentQuestion]) {
      setErrorMessage("Question data is not available")
      return
    }

    const currentResponse = responses[currentSection]?.[currentQuestion]?.response || ""
    if (currentResponse.trim().split(/\s+/).length < 5) {
      setErrorMessage("Please provide at least 5 words")
      return
    }

    setErrorMessage("")
    handleEnd(currentQuestion, currentSection)

    if (currentQuestion < scenarios.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setCurrentSection(scenarios[currentQuestion + 1].topic)
    } else {
      setShowConfirmation(true)
    }

    const remainingTime = timing[currentQuestion]?.timeLeft || 0
    const timeTaken = scenarios[currentQuestion].timer * 60 - remainingTime
    setTotalTimeTaken((prev) => prev + timeTaken)
  }, [
    currentQuestion,
    currentSection,
    scenarios,
    responses,
    timing,
    handleEnd,
    setCurrentQuestion,
    setCurrentSection,
    setTotalTimeTaken,
  ])

  // Simplified effect for timer management
  useEffect(() => {
    if (!stateRestoredRef.current) {
      stateRestoredRef.current = true
      return
    }

    if (initialLoadAttemptedRef.current || scenarios.length > 0 || scenariosLoaded) {
      setIsLoading(false)
      return
    }

    initialLoadAttemptedRef.current = true

    const loadScenarios = async () => {
      if (loadingRef.current.inProgress) return

      try {
        loadingRef.current.inProgress = true
        setIsLoading(true)

        const response = await fetch("/api/fetchScenarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch scenarios: ${response.status}`)
        }

        const data = await response.json()

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("No scenarios available")
        }

        setScenarios(data)
        setScenariosLoaded(true)

        if (!hasStarted) {
          setRecordId(`assessment-${Date.now()}`)
          setCurrentQuestion(0)
          setCurrentSection(data[0]?.topic || "")
          startAssessment()
        }
      } catch (error) {
        console.error("Error loading scenarios:", error)
        setErrorMessage(error.message || "Failed to load assessment")
      } finally {
        loadingRef.current.inProgress = false
        setIsLoading(false)
      }
    }

    loadScenarios()
  }, [
    scenarios,
    scenariosLoaded,
    hasStarted,
    setRecordId,
    setCurrentQuestion,
    setCurrentSection,
    startAssessment,
    setScenarios,
    setScenariosLoaded,
  ])

  // Handle tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1)
        setResponses((prev) => ({
          ...prev,
          [currentSection]: {
            ...prev[currentSection],
            [currentQuestion]: {
              ...(prev[currentSection]?.[currentQuestion] || {}),
              tabSwitchCount: (prev[currentSection]?.[currentQuestion]?.tabSwitchCount || 0) + 1,
            },
          },
        }))
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [currentSection, currentQuestion, setTabSwitchCount, setResponses])

  // Start timer for current question
  useEffect(() => {
    if (!scenarios[currentQuestion]?.timer) return
    if (timing[currentQuestion]?.isCompleted) return

    handleStart(currentQuestion)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [currentQuestion, scenarios, timing, handleStart])

  // Add a timeout for loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading && !scenarios.length) {
        setErrorMessage("Loading is taking longer than expected. Please refresh the page.")
      }
    }, 10000) // 10 second timeout

    return () => clearTimeout(timeoutId)
  }, [isLoading, scenarios.length])

  // Early return for loading state with better UI feedback
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex justify-center items-center">
        <div className="bg-gray-800/80 backdrop-blur-lg shadow-2xl rounded-3xl p-8 max-w-lg mx-auto text-center">
          <LoadingSpinner />
          <p className="text-gray-300 mt-4">Loading assessment...</p>
          {errorMessage && (
            <div className="mt-4 text-red-400 bg-red-900/30 p-4 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Error state with retry button
  if (!scenarios.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex justify-center items-center">
        <div className="bg-gray-800/80 backdrop-blur-lg shadow-2xl rounded-3xl p-8 max-w-lg mx-auto">
          <h2 className="text-2xl font-semibold text-red-300 mb-4">Error Loading Assessment</h2>
          <p className="text-gray-300">
            There was a problem loading the assessment questions. Please try refreshing the page.
          </p>
          <button
            onClick={() => {
              loadingRef.current.inProgress = false
              initialLoadAttemptedRef.current = false
              setIsLoading(true)
              setErrorMessage("")
              window.location.reload()
            }}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  const currentScenario = scenarios[currentQuestion]
  if (!currentScenario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex justify-center items-center">
        <div className="bg-gray-800/80 backdrop-blur-lg shadow-2xl rounded-3xl p-8 max-w-lg mx-auto">
          <h2 className="text-2xl font-semibold text-red-300 mb-4">Error Loading Assessment</h2>
          <p className="text-gray-300">
            There was a problem loading the assessment questions. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  const totalQuestions = scenarios.length
  const currentQuestionNumber = currentQuestion + 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex">
      {showConfetti && <Confetti />}
      <div className="flex-1 pl-28 min-h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800/80 backdrop-blur-lg shadow-2xl rounded-3xl overflow-hidden border border-indigo-500/30"
          >
            <div className="p-0">
              <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-pattern opacity-10"></div>
                <h1 className="text-4xl font-bold tracking-tight relative z-10 flex items-center">
                  Assessment
                  <Sparkles className="ml-2 w-6 h-6 text-yellow-300" />
                </h1>
                <p className="mt-2 text-indigo-100 text-lg relative z-10">{currentSection}</p>
              </div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-sm font-medium text-indigo-300 bg-indigo-900/50 px-4 py-2 rounded-full">
                    Question {currentQuestionNumber} of {totalQuestions}
                  </span>
                  <div className="flex items-center text-indigo-300 bg-indigo-900/50 px-4 py-2 rounded-full">
                    <Clock className="w-5 h-5 mr-2" />
                    <span className="font-mono text-lg">
                      {Math.floor((timing[currentQuestion]?.timeLeft || 0) / 60)}:
                      {((timing[currentQuestion]?.timeLeft || 0) % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>
                <ProgressBar current={currentQuestionNumber} total={totalQuestions} />
                <motion.h2
                  key={`header-${currentQuestion}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl font-semibold text-indigo-300 mb-6"
                >
                  {currentScenario.header}
                </motion.h2>
                <motion.p
                  key={`question-${currentQuestion}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-gray-300 text-lg mb-8 leading-relaxed"
                >
                  {currentScenario.question}
                </motion.p>
                <motion.textarea
                  key={`textarea-${currentQuestion}-${currentSection}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="w-full p-6 bg-gray-700/80 text-gray-100 border border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ease-in-out hover:bg-gray-600/80 text-lg resize-none shadow-inner"
                  rows={8}
                  placeholder="Type your answer here..."
                  onChange={(e) => handleResponse(currentSection, currentQuestion, e.target.value)}
                  onPaste={handleCopyPaste}
                  value={responses[currentSection]?.[currentQuestion]?.response || ""}
                />
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 text-red-400 bg-red-900/30 p-4 rounded-xl flex items-center"
                  >
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
                <div className="mt-8 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex items-center text-yellow-300 bg-yellow-900/30 p-4 rounded-xl"
                  >
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>Answer within the time limit for best results</span>
                  </motion.div>
                  <div className="flex justify-end items-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNext}
                      className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg font-medium"
                    >
                      {currentQuestionNumber === totalQuestions ? "Submit" : "Next"}
                      <ChevronRight className="ml-2 w-6 h-6" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      {isLoading && <LoadingSpinner />}
      <ConfirmationModal
        isOpen={showConfirmation}
        onConfirm={handleSubmit}
        onCancel={() => setShowConfirmation(false)}
      />
    </div>
  )
}

export default AssessmentContent

