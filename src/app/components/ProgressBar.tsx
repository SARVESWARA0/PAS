import type React from "react"

interface ProgressBarProps {
  current: number
  total: number
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = (current / total) * 100

  return (
    <div className="w-full bg-gray-700 rounded-full h-2.5 mb-6">
      <div
        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  )
}

export default ProgressBar

