import type React from "react"

interface ProgressIndicatorProps {
  currentQuestion: number
  totalQuestions: number
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentQuestion, totalQuestions }) => {
  const progress = (currentQuestion / totalQuestions) * 100

  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">Progress</span>
        <span className="text-sm font-medium text-muted-foreground">{`${currentQuestion} / ${totalQuestions}`}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2.5">
        <div
          className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  )
}

export default ProgressIndicator

