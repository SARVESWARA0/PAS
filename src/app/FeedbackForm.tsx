import type React from "react"
import { useState } from "react"

interface FeedbackFormProps {
  onSubmit: () => void
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSubmit }) => {
  const [rating, setRating] = useState<string>("")
  const [comment, setComment] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the feedback to your backend
    console.log({ rating, comment })
    onSubmit()
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl mt-8">
      <h2 className="text-2xl font-bold mb-4 text-white">Assessment Feedback</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 text-white">How would you rate this assessment?</label>
          <div className="flex flex-wrap gap-2">
            {["Very Poor", "Poor", "Average", "Good", "Excellent"].map((option) => (
              <label key={option} className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-indigo-600"
                  name="rating"
                  value={option}
                  checked={rating === option}
                  onChange={(e) => setRating(e.target.value)}
                />
                <span className="ml-2 text-white">{option}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="comment" className="block mb-2 text-white">
            Any additional comments?
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded"
            rows={4}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition duration-200"
        >
          Submit Feedback
        </button>
      </form>
    </div>
  )
}

export default FeedbackForm

