"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, Clock, AlertCircle, Sparkles } from "lucide-react"
import LoadingSpinner from "../components/LoadingSpinner"
import ConfirmationModal from "../components/ConfirmationModal"
import { detectUnusualTyping } from "../utils/detectUnusualTyping"
import ProgressBar from "../components/ProgressBar"
import Confetti from "react-confetti"
import { useAssessmentStore } from "../store/assessmentStore"
import { motion } from "framer-motion"

const timerRef: { current: NodeJS.Timeout | null } = { current: null }

export default function AssessmentContent() {
  const [scenarios, setScenarios] = useState([]);

  const [responses, setResponses] = useState<{
    [key: string]: {
      [key: number]: {
        response: string
        responseTime: number
        timeTaken: number
        pasteCount: number
        tabSwitchCount: number
        unusualTypingCount: number
        completed?: boolean
      }
    }
  }>({})
  const [timing, setTiming] = useState<{ [key: number]: { startTime: number; timeLeft: number } }>({})

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [currentSection, setCurrentSection] = useState("")
  const [totalTimeTaken, setTotalTimeTaken] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [pasteCount, setPasteCount] = useState(0)
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [unusualTypingCount, setUnusualTypingCount] = useState(0)
  const [blockCopyPaste, setBlockCopyPaste] = useState(true)
  const [timeOverruns, setTimeOverruns] = useState<{ [key: string]: { [key: number]: boolean } }>({})
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()
  const [showConfetti, setShowConfetti] = useState(false)




  useEffect(() => {
    const loadScenarios = async () => {
      try {
        const response = await fetch("/api/fetchScenarios", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch scenarios: ${response.statusText}`);
        }

        const fetchedScenarios = await response.json();
        setScenarios(fetchedScenarios);
        setCurrentSection(fetchedScenarios[0]?.topic || "");
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching scenarios:", error);
        setIsLoading(false);
      }
    };

    loadScenarios();
  }, []);


  const handleEnd = useCallback(
    (index: number, section: string) => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      setTiming((prev) => {
        const startTime = prev[index]?.startTime || Date.now()
        const endTime = Date.now()
        const timeTaken = (endTime - startTime) / 1000 // Convert to seconds

        const timeOverrun = timeTaken > scenarios[index].timer * 60
        setTimeOverruns((prevOverruns) => ({
          ...prevOverruns,
          [section]: { ...prevOverruns[section], [index]: timeOverrun },
        }))

        setResponses((prevResponses) => ({
          ...prevResponses,
          [section]: {
            ...prevResponses[section],
            [index]: {
              ...prevResponses[section]?.[index],
              timeTaken,
              timeOverrun,
            },
          },
        }))

        return {
          ...prev,
          [index]: { ...prev[index], timeLeft: 0 },
        }
      })
    },
    [scenarios],
  )

  const handleStart = useCallback(
    (index: number) => {
      if (!scenarios[index] || scenarios[index].timer === undefined) {
        return
      }

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      const startTime = Date.now()
      const timeLeft = scenarios[index].timer * 60

      timerRef.current = setInterval(() => {
        setTiming((prev) => {
          const elapsed = Math.floor((Date.now() - startTime) / 1000)
          const newTimeLeft = Math.max(0, timeLeft - elapsed)

          if (newTimeLeft <= 0) {
            clearInterval(timerRef.current!)
            timerRef.current = null
            handleEnd(index, currentSection)
          }

          return {
            ...prev,
            [index]: { startTime, timeLeft: newTimeLeft },
          }
        })
      }, 1000)
    },
    [currentSection, handleEnd, scenarios],
  )

  const handleResponse = (section: string, index: number, value: string) => {
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
          ...((prev[section]?.[index] as any) || {}),
          response: value,
          responseTime: responseTime,
          timeTaken: (Date.now() - (timing[index]?.startTime || Date.now())) / 1000,
          pasteCount: (prev[section]?.[index]?.pasteCount || 0) as number,
          tabSwitchCount: (prev[section]?.[index]?.tabSwitchCount || 0) as number,
          unusualTypingCount: ((prev[section]?.[index]?.unusualTypingCount || 0) + (isUnusualTyping ? 1 : 0)) as number,
        },
      },
    }))
  }

  const handleCopyPaste = (e: React.ClipboardEvent) => {
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
    setShowConfetti(true)
    setIsLoading(true)
    try {
      const { recordId } = useAssessmentStore.getState();
      const payload = {
      recordId,
      responses: {},
      behavioralData: {
        totalPasteCount: pasteCount,
        totalTabSwitchCount: tabSwitchCount,
        totalUnusualTypingCount: unusualTypingCount,
        timeOverruns: timeOverruns,
        totalTimeTaken
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        setShowConfetti(false)
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      console.log("Assessment submitted successfully")
      router.push("/thank-you")
    } catch (error) {
      console.error("Error submitting assessment:", error)
      setIsLoading(false)
      setErrorMessage("Failed to submit assessment: " + (error as Error).message)
    }
  }, [responses, pasteCount, tabSwitchCount, unusualTypingCount, timeOverruns, router, scenarios])

  const handleNext = () => {
    const currentResponse = responses[currentSection]?.[currentQuestion]?.response || ""
    if (currentResponse.trim().split(/\s+/).length < 5) {
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
      setCurrentQuestion((prev) => prev + 1)
      setCurrentSection(scenarios[currentQuestion + 1].topic)
      handleStart(currentQuestion + 1)
    } else {
      setShowConfirmation(true)
    }

    const remainingTime = timing[currentQuestion]?.timeLeft || 0
    const timeTaken = scenarios[currentQuestion]?.timer * 60 - remainingTime
    setTotalTimeTaken((prev) => prev + timeTaken)
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
              ...((prev[currentSection]?.[currentQuestion] as any) || {}),
              tabSwitchCount: ((prev[currentSection]?.[currentQuestion]?.tabSwitchCount || 0) as number) + 1,
            },
          },
        }))
      }
    }

    const handleCopy = () => {
      setPasteCount((prev) => prev + 1)
      setResponses((prev) => ({
        ...prev,
        [currentSection]: {
          ...prev[currentSection],
          [currentQuestion]: {
            ...((prev[currentSection]?.[currentQuestion] as any) || {}),
            pasteCount: ((prev[currentSection]?.[currentQuestion]?.pasteCount || 0) as number) + 1,
          },
        },
      }))
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    document.addEventListener("copy", handleCopy)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      document.removeEventListener("copy", handleCopy)
    }
  }, [currentSection, currentQuestion])

  useEffect(() => {
    const preventCopy = (e: ClipboardEvent) => {
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
    if (!responses[currentSection]?.[currentQuestion]?.completed) {
      handleStart(currentQuestion)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [currentQuestion, currentSection, responses, handleStart])

  const totalQuestions = scenarios.length
  const currentQuestionNumber = currentQuestion + 1

  const handleQuestionSelect = (index: number) => {
    if (index <= currentQuestion) {
      setCurrentSection(scenarios[index].topic)
      setCurrentQuestion(index)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

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
                  {Math.floor(timing[currentQuestion]?.timeLeft! / 60)}:
                  {(timing[currentQuestion]?.timeLeft! % 60).toString().padStart(2, "0")}
                </span>
                </div>
              </div>

              <ProgressBar current={currentQuestionNumber} total={totalQuestions} />

              <motion.h2
                key={currentQuestion}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-semibold text-indigo-300 mb-6"
              >
                {scenarios[currentQuestion].header}
              </motion.h2>

              <motion.p
                key={`question-${currentQuestion}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-gray-300 text-lg mb-8 leading-relaxed"
              >
                {scenarios[currentQuestion].question}
              </motion.p>

              <motion.textarea
                key={`textarea-${currentQuestion}`}
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



