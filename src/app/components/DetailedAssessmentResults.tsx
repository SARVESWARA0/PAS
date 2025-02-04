"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react"

interface AssessmentReportProps {
  results: {
    overallAssessment: {
      overallRating: number
      innovationScore: number
      communicationScore: number
    }
    detailedAnalysis: {
      innovation: QuestionAnalysis[]
      communication: QuestionAnalysis[]
    }
    behavioralAnalysis?: {
      timeEfficiency?: {
        rating?: string
        observations?: string[]
        impact?: string
      }
      responsePatterns?: {
        patterns?: string[]
        consistency?: string
        concerns?: string[]
      }
      interactionAnalysis?: {
        overview?: string
        keyBehaviors?: string[]
        recommendations?: string[]
      }
    }
  }
  behavioralData: BehavioralData | undefined
}

interface BehavioralData {
  totalUnusualTypingCount: number
  totalTabSwitchCount: number
  totalPasteCount: number
  timeOverruns: {
    [section: string]: {
      [index: string]: boolean
    }
  }
  userName:string
}

interface QuestionAnalysis {
  questionNumber: number
  keyCompetencies: string[]
  improvementAreas: ImprovementArea[]
  quickRecommendations: QuickRecommendation[]
}

interface ImprovementArea {
  point: string
  example: string
}

interface QuickRecommendation {
  recommendation: string
  example: string
}

const AccordionItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="border-b border-gray-700">
      <button
        className="flex justify-between items-center w-full py-4 px-6 text-left text-indigo-300 hover:bg-gray-700/50 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium">{title}</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      {isOpen && <div className="p-6 bg-gray-800/50">{children}</div>}
    </div>
  )
}

const QuestionSection: React.FC<{ questionData: QuestionAnalysis; questionNumber: number }> = ({
  questionData,
  questionNumber,
}) => (
  <div className="mb-8 bg-gray-800/30 p-6 rounded-lg">
    <h4 className="text-xl font-semibold mb-4 text-indigo-300">Question {questionNumber}</h4>
    <div className="space-y-6">
      <div>
        <h5 className="text-md font-medium text-indigo-200 mb-2">Key Competencies:</h5>
        <ul className="list-disc list-inside pl-4 text-gray-300">
          {questionData.keyCompetencies.map((item, index) => (
            <li key={`item-${index}`}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h5 className="text-md font-medium text-indigo-200 mb-2">Improvement Areas:</h5>
        <ul className="space-y-3 pl-4">
          {questionData.improvementAreas.map((item, index) => (
            <li key={`item-${index}`} className="text-gray-300">
              <div className="font-medium">• {item.point}</div>
              <div className="pl-4 text-gray-400 mt-1">
                <span className="font-medium">Example: </span>
                {item.example}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h5 className="text-md font-medium text-indigo-200 mb-2">Quick Recommendations:</h5>
        <ul className="space-y-3 pl-4">
          {questionData.quickRecommendations.map((item, index) => (
            <li key={`item-${index}`} className="text-gray-300">
              <div className="font-medium">• {item.recommendation}</div>
              <div className="pl-4 text-gray-400 mt-1">
                <span className="font-medium">Example: </span>
                {item.example}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
)

const calculateDeductions = (behavioralData: BehavioralData | undefined) => {
  if (!behavioralData) return 0
  let deductions = 0
  console.log(behavioralData)
  const { totalTabSwitchCount, totalUnusualTypingCount, totalPasteCount, timeOverruns } = behavioralData

  // Deductions for tab switching
  if (totalTabSwitchCount > 2) {
    deductions += Math.min((totalTabSwitchCount - 2) * 0.1, 0.2)
  }

  // Deductions for unusual typing patterns
  if (totalUnusualTypingCount > 4) {
    deductions += Math.min((totalUnusualTypingCount - 4) * 0.05, 0.2)
  }

  // Deductions for copy/paste actions
  if (totalPasteCount > 3) {
    deductions += Math.min((totalPasteCount - 3) * 0.1, 0.3)
  }

  // Deductions for time overruns
  let timeOverrunCount = 0
  Object.values(timeOverruns).forEach((section) => {
    Object.values(section).forEach((overrun) => {
      if (overrun) timeOverrunCount++
    })
  })
  deductions += Math.min(timeOverrunCount * 0.3, 0.3)

  return Math.min(deductions, 1) // Cap deductions at 1.0
}

const AssessmentReport: React.FC<AssessmentReportProps> = ({ results, behavioralData }) => {
  const router = useRouter()
  const [showFullReport, setShowFullReport] = useState(false)

  const { deductions, adjustedOverallRating, innovationScore, communicationScore, chartData,userName } = useMemo(() => {
    const deductions = calculateDeductions(behavioralData)

    const innovationScore = results.overallAssessment.innovationScore
    const communicationScore = results.overallAssessment.communicationScore
    const userName=behavioralData.userName
    const adjustedOverallRating = Math.max(0, (innovationScore + communicationScore) - deductions)

    const chartData = [
      { name: "Innovation", score: innovationScore },
      { name: "Communication", score: communicationScore },
      { name: "Overall", score: adjustedOverallRating },
    ]

    return {
      deductions,
      adjustedOverallRating,
      innovationScore,
      communicationScore,
      chartData,
      userName
    }
  }, [results, behavioralData])

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto p-6 bg-gray-900 shadow-2xl rounded-2xl text-white mt-8 border border-indigo-500/30">
        <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text">
          Assessment Report
        </h1>

        <div className="mb-6 p-6 bg-gray-800 rounded-xl border border-indigo-500/20">
          <h2 className="text-2xl font-bold mb-4 text-indigo-300">Candidate Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-400">Name:</span>
              <span className="ml-2 text-white">{userName}</span>
            </div>
            <div>
              <span className="text-gray-400">Assessment Date:</span>
              <span className="ml-2 text-white">{currentDate}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <AccordionItem title="Assessment Summary">
            <h3 className="text-xl font-medium mb-4 text-indigo-300">Performance Overview:</h3>
            <ul className="list-disc list-inside mb-6 text-gray-300">
              <li>
                Overall Rating:{" "}
                <span className="text-indigo-400 font-semibold">{adjustedOverallRating.toFixed(2)} ⭐</span> out of 5
              </li>
              <li>
                Innovation Score: <span className="text-indigo-400 font-semibold">{innovationScore.toFixed(2)}</span>
              </li>
              <li>
                Communication Score:{" "}
                <span className="text-indigo-400 font-semibold">{communicationScore.toFixed(2)}</span>
              </li>
              <li>
                Behavioral Deductions: <span className="text-indigo-400 font-semibold">{deductions.toFixed(2)}</span>
              </li>
            </ul>

            <h3 className="text-xl font-medium mb-4 text-indigo-300">Performance Breakdown:</h3>
            <div className="bg-gray-800 p-4 rounded-lg">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis domain={[0, 5]} stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "none" }} />
                  <Bar dataKey="score" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AccordionItem>

          {showFullReport && (
            <>
              <AccordionItem title="Innovation Assessment">
                <div className="space-y-6">
                  {results.detailedAnalysis.innovation.map((question) => (
                    <QuestionSection
                      key={question.questionNumber}
                      questionData={question}
                      questionNumber={question.questionNumber}
                    />
                  ))}
                </div>
              </AccordionItem>

              <AccordionItem title="Communication Assessment">
                <div className="space-y-6">
                  {results.detailedAnalysis.communication.map((question) => (
                    <QuestionSection
                      key={question.questionNumber}
                      questionData={question}
                      questionNumber={question.questionNumber}
                    />
                  ))}
                </div>
              </AccordionItem>

              <AccordionItem title="Behavioral Insights">
                <div className="space-y-6">
                  <div className="bg-gray-800/30 p-6 rounded-lg">
                    <h4 className="text-xl font-medium mb-4 text-indigo-300">Time Efficiency:</h4>
                    <p className="text-gray-300">
                      {results.behavioralAnalysis?.timeEfficiency?.rating || "Not available"}
                    </p>
                    {results.behavioralAnalysis?.timeEfficiency?.observations && (
                      <ul className="list-disc list-inside mt-4 text-gray-300">
                        {results.behavioralAnalysis.timeEfficiency.observations.map((observation, index) => (
                          <li key={`item-${index}`}>{observation}</li>
                        ))}
                      </ul>
                    )}
                    {results.behavioralAnalysis?.timeEfficiency?.impact && (
                      <p className="mt-4 text-gray-300">Impact: {results.behavioralAnalysis.timeEfficiency.impact}</p>
                    )}
                  </div>
                  <div className="bg-gray-800/30 p-6 rounded-lg">
                    <h4 className="text-xl font-medium mb-4 text-indigo-300">Response Patterns:</h4>
                    {results.behavioralAnalysis?.responsePatterns?.patterns && (
                      <ul className="list-disc list-inside text-gray-300">
                        {results.behavioralAnalysis.responsePatterns.patterns.map((pattern, index) => (
                          <li key={`item-${index}`}>{pattern}</li>
                        ))}
                      </ul>
                    )}
                    {results.behavioralAnalysis?.responsePatterns?.consistency && (
                      <p className="mt-4 text-gray-300">
                        Consistency: {results.behavioralAnalysis.responsePatterns.consistency}
                      </p>
                    )}
                    {results.behavioralAnalysis?.responsePatterns?.concerns && (
                      <div className="mt-4">
                        <h5 className="text-lg font-medium text-indigo-200 mb-2">Concerns:</h5>
                        <ul className="list-disc list-inside text-gray-300">
                          {results.behavioralAnalysis.responsePatterns.concerns.map((concern, index) => (
                            <li key={`item-${index}`}>{concern}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-800/30 p-6 rounded-lg">
                    <h4 className="text-xl font-medium mb-4 text-indigo-300">Interaction Analysis:</h4>
                    {results.behavioralAnalysis?.interactionAnalysis?.overview && (
                      <p className="text-gray-300">{results.behavioralAnalysis.interactionAnalysis.overview}</p>
                    )}
                    {results.behavioralAnalysis?.interactionAnalysis?.keyBehaviors && (
                      <div className="mt-4">
                        <h5 className="text-lg font-medium text-indigo-200 mb-2">Key Behaviors:</h5>
                        <ul className="list-disc list-inside text-gray-300">
                          {results.behavioralAnalysis.interactionAnalysis.keyBehaviors.map((behavior, index) => (
                            <li key={`item-${index}`}>{behavior}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {results.behavioralAnalysis?.interactionAnalysis?.recommendations && (
                      <div className="mt-4">
                        <h5 className="text-lg font-medium text-indigo-200 mb-2">Recommendations:</h5>
                        <ul className="list-disc list-inside text-gray-300">
                          {results.behavioralAnalysis.interactionAnalysis.recommendations.map(
                            (recommendation, index) => (
                              <li key={`item-${index}`}>{recommendation}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-800/30 p-6 rounded-lg">
                    <h4 className="text-xl font-medium mb-4 text-indigo-300">Behavioral Analysis:</h4>
                    {behavioralData ? (
                      <>
                        <ul className="list-disc list-inside text-gray-300">
                          <li>Unusual Typing Patterns: {behavioralData.totalUnusualTypingCount}</li>
                          <li>Tab Switching: {behavioralData.totalTabSwitchCount}</li>
                          <li>Copy/Paste Actions: {behavioralData.totalPasteCount}</li>
                        </ul>
                        <div className="mt-6">
                          <h5 className="text-lg font-medium text-indigo-200 mb-2">Time Overruns:</h5>
                          {Object.entries(behavioralData.timeOverruns).length > 0 ? (
                            <ul className="list-disc list-inside text-gray-300">
                              {Object.entries(behavioralData.timeOverruns).map(([section, questions]) => (
                                <li key={section}>
                                  {section}:
                                  <ul className="list-disc list-inside ml-4">
                                    {Object.entries(questions).map(([questionIndex, overrun]) => (
                                      <li key={`${section}-${questionIndex}`}>
                                        Question {Number.parseInt(questionIndex) + 1}:{" "}
                                        {overrun ? (
                                          <span className="text-red-400">Time overrun</span>
                                        ) : (
                                          <span className="text-green-400">Within time limit</span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-300">No time overruns recorded.</p>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-300">Behavioral data not available.</p>
                    )}
                    <p className="mt-4 text-gray-300">
                      Total Deductions:{" "}
                      <span className="text-indigo-400 font-semibold">{deductions.toFixed(2)} stars</span>
                    </p>
                  </div>
                </div>
              </AccordionItem>
            </>
          )}
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => setShowFullReport(!showFullReport)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          >
            {showFullReport ? "Hide Full Report" : "Show Full Report"}
          </button>
          <button
            onClick={() => router.push("/assessment")}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded flex items-center transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          >
            Reattempt Assessment
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AssessmentReport

