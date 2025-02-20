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
  
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [blockCopyPaste, setBlockCopyPaste] = useState(false)
  const loadingTimeoutRef = useRef(null)
  const scenariosInitializedRef = useRef(false)

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
    setPasteCount,
    setTabSwitchCount,
    setUnusualTypingCount,
    setTimeOverruns,
    hasStarted,
    startAssessment,
    resetAssessment,
    completeAssessment,
  } = useAssessmentStore()


  useEffect(() => {
    const loadScenarios = async () => {
      try {
        // Set loading timeout
        loadingTimeoutRef.current = setTimeout(() => {
          setErrorMessage("Loading is taking longer than expected. Please refresh the page.")
          setIsLoading(false)
        }, 10000)
    
        // Check if we already have scenarios in the store and if they've been initialized
        if (scenarios && scenarios.length > 0 && hasStarted) {
          console.log("Using scenarios from store:", scenarios.length)
          setIsLoading(false)
          clearTimeout(loadingTimeoutRef.current)
          return
        }
    
        // Only fetch new scenarios if scenarios array is empty
        if (!scenarios || scenarios.length === 0) {
          console.log("Fetching scenarios from API")
          const response = await fetch("/api/fetchScenarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: 'no-store'
          })
      
          if (!response.ok) {
            throw new Error(`Failed to fetch scenarios: ${response.statusText}`)
          }
      
          const fetchedScenarios = await response.json()
          
          if (!fetchedScenarios?.length) {
            throw new Error("No scenarios received")
          }
      
          // Save scenarios to the store
          setScenarios(fetchedScenarios)
          scenariosInitializedRef.current = true
        }
    
        // Initialize assessment if not started
        if (!hasStarted && !scenariosInitializedRef.current) {
          const scenariosToUse = scenarios.length > 0 ? scenarios : []
          const newRecordId = `assessment-${Date.now()}`
          setRecordId(newRecordId)
          setCurrentQuestion(0)
          setCurrentSection(scenariosToUse[0]?.topic || "")
          startAssessment()
          scenariosInitializedRef.current = true
        }
    
      } catch (error) {
        console.error("Error loading scenarios:", error)
        setErrorMessage(error.message || "Failed to load assessment. Please try again.")
      } finally {
        setIsLoading(false)
        clearTimeout(loadingTimeoutRef.current)
      }
    }
    
    loadScenarios()
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [hasStarted, setRecordId, setCurrentQuestion, setCurrentSection, startAssessment, setScenarios, scenarios])
  


  const handleStart = useCallback(
    (index) => {
      if (!scenarios[index] || scenarios[index].timer === undefined || timerRef.current) {
        return
      }

      // Use existing timing data if available (after refresh) or create new
      if (!timing[index]) {
        const startTime = Date.now()
        const totalTime = scenarios[index].timer * 60

        setTiming((prev) => ({
          ...prev,
          [index]: { startTime, timeLeft: totalTime },
        }))
      } else if (timing[index].timeLeft > 0) {
        // Resume from previous state
        const currentTime = Date.now()
        const elapsedSinceLastUpdate = Math.floor((currentTime - timing[index].lastUpdateTime || timing[index].startTime) / 1000)
        const updatedTimeLeft = Math.max(0, timing[index].timeLeft - elapsedSinceLastUpdate)
        
        setTiming((prev) => ({
          ...prev,
          [index]: { 
            ...prev[index],
            timeLeft: updatedTimeLeft,
            lastUpdateTime: currentTime
          },
        }))
      }

      timerRef.current = setInterval(() => {
        setTiming((prev) => {
          if (!prev[index]) return prev;
          
          const currentTime = Date.now()
          const elapsed = Math.floor((currentTime - prev[index].lastUpdateTime || prev[index].startTime) / 1000)
          const newTimeLeft = Math.max(0, prev[index].timeLeft - elapsed)

          if (newTimeLeft <= 0) {
            clearInterval(timerRef.current)
            timerRef.current = null
            handleEnd(index, currentSection)
          }

          return {
            ...prev,
            [index]: { 
              ...prev[index], 
              timeLeft: newTimeLeft,
              lastUpdateTime: currentTime 
            },
          }
        })
      }, 1000)
    },
    [scenarios, setTiming, currentSection, timing],
  )

  const handleEnd = useCallback(
    (index, section) => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      if (!scenarios[index]) {
        console.error("Cannot end assessment for non-existent scenario index:", index);
        return;
      }

      setTiming((prev) => {
        if (!prev[index]) return prev;
        
        const initialTime = scenarios[index].timer * 60;
        const timeTaken = initialTime - (prev[index]?.timeLeft || 0);
        const timeOverrun = timeTaken > initialTime;

        setResponses((prevResponses) => ({
          ...prevResponses,
          [section]: {
            ...prevResponses[section],
            [index]: {
              ...(prevResponses[section]?.[index] || {}),
              timeTaken,
              timeOverrun,
            },
          },
        }))

        // Keep timing data but mark as completed
        return {
          ...prev,
          [index]: { ...prev[index], isCompleted: true },
        }
      })
    },
    [scenarios, setTiming, setResponses],
  )

  const handleResponse = useCallback(
    (section, index, value) => {
      if (!timing[index] && scenarios[index]) {
        // Initialize timing data if it doesn't exist yet
        const startTime = Date.now()
        const totalTime = scenarios[index].timer * 60
        
        setTiming((prev) => ({
          ...prev,
          [index]: { startTime, timeLeft: totalTime, lastUpdateTime: startTime },
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
            pasteCount: prev[section]?.[index]?.pasteCount || 0,
            tabSwitchCount: prev[section]?.[index]?.tabSwitchCount || 0,
            unusualTypingCount: (prev[section]?.[index]?.unusualTypingCount || 0) + (isUnusualTyping ? 1 : 0),
          },
        },
      }))
    },
    [setResponses, setUnusualTypingCount, timing, scenarios, setTiming],
  )

  const handleCopyPaste = useCallback(
    (e) => {
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

      scenarios.forEach((scenario, index) => {
        const response = responses[scenario.topic]?.[index]
        if (response) {
          if (!payload.responses[scenario.topic]) {
            payload.responses[scenario.topic] = {}
          }
          payload.responses[scenario.topic][index] = {
            id: scenario.id,
            headers: scenario.header,
            question: scenario.question,
            answer: response.response,
            responseTime: response.responseTime,
            timeTaken: response.timeTaken,
            pasteCount: response.pasteCount,
            tabSwitchCount: response.tabSwitchCount,
            unusualTypingCount: response.unusualTypingCount,
          }
        }
      })

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        setShowConfetti(false)
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      resetAssessment()
      completeAssessment()
      console.log("Assessment submitted successfully")
      router.push("/thank-you")
    } catch (error) {
      console.error("Error submitting assessment:", error)
      setIsLoading(false)
      setErrorMessage("Failed to submit assessment: " + error.message)
    }
  },  [
    recordId,
    pasteCount,
    tabSwitchCount,
    unusualTypingCount,
    timeOverruns,
    totalTimeTaken,
    scenarios,
    responses,
    router,
    resetAssessment,
    completeAssessment
  ])
  
  const handleNext = useCallback(() => {
    if (!scenarios[currentQuestion]) {
      setErrorMessage("Question data is not available. Please reload the page and try again.");
      return;
    }

    const currentResponseData = responses[currentSection]?.[currentQuestion]?.response || ""
    if (currentResponseData.trim().split(/\s+/).length < 5) {
      setErrorMessage("Please provide an answer with at least 5 words before moving to the next question.")
      return
    }
    setErrorMessage("")

    setResponses((prev) => ({
      ...prev,
      [currentSection]: {
        ...prev[currentSection],
        [currentQuestion]: {
          ...prev[currentSection]?.[currentQuestion],
          completed: true,
        },
      },
    }))

    handleEnd(currentQuestion, currentSection)

    if (currentQuestion < scenarios.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion)
      setCurrentSection(scenarios[nextQuestion].topic)
    } else {
      setShowConfirmation(true)
    }

    const remainingTime = timing[currentQuestion]?.timeLeft || 0
    const timeTaken = scenarios[currentQuestion]?.timer * 60 - remainingTime
    setTotalTimeTaken((prev) => prev + timeTaken)
  }, [
    currentSection,
    currentQuestion,
    scenarios,
    responses,
    setResponses,
    handleEnd,
    setCurrentQuestion,
    setCurrentSection,
    setTotalTimeTaken,
    timing,
  ])

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
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [currentSection, currentQuestion, setTabSwitchCount, setResponses])

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

  // Start timer for current question when component mounts or question changes
  useEffect(() => {
    // Don't start timer until scenarios are loaded
    if (scenarios.length === 0 || currentQuestion === undefined || currentQuestion === null) {
      return;
    }
    
    const currentScenario = scenarios[currentQuestion];
    if (!currentScenario) return;
    
    const isCompleted = timing[currentQuestion]?.isCompleted || responses[currentSection]?.[currentQuestion]?.completed;
    const timerAlreadyRunning = timerRef.current !== null;
    
    if (!isCompleted && !timerAlreadyRunning) {
      handleStart(currentQuestion);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [scenarios, currentQuestion, currentSection, responses, timing, handleStart]);

  // Safety check - if no scenarios or currentQuestion is invalid, show a loading state
  if (isLoading || !scenarios.length) {
    return <LoadingSpinner />
  }

  // Check if currentQuestion is valid before rendering
  const currentScenario = scenarios[currentQuestion];
  if (!currentScenario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex justify-center items-center">
        <div className="bg-gray-800/80 backdrop-blur-lg shadow-2xl rounded-3xl p-8 max-w-lg mx-auto">
          <h2 className="text-2xl font-semibold text-red-300 mb-4">Error Loading Assessment</h2>
          <p className="text-gray-300">There was a problem loading the assessment questions. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
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