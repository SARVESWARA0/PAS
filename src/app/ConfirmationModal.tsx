import type React from "react"

interface ConfirmationModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-white">Confirm Submission</h2>
        <p className="mb-6 text-gray-300">Are you sure you want to submit your assessment?</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal

