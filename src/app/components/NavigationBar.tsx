import React from 'react';
import { ChevronRight, CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';

interface NavigationBarProps {
  currentQuestion: number;
  totalQuestions: number;
  questionStatuses?: Array<'completed' | 'skipped' | 'current' | 'upcoming'>;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ 
  currentQuestion, 
  totalQuestions,
  questionStatuses = Array(totalQuestions).fill('upcoming')
}) => {
  const getStatusIcon = (status: string, index: number) => {
    const isActive = index + 1 === currentQuestion;
    const baseClass = "w-5 h-5";
    
    switch(status) {
      case 'completed':
        return <CheckCircle className={`${baseClass} text-green-500`} />;
      case 'skipped':
        return <AlertCircle className={`${baseClass} text-yellow-500`} />;
      case 'current':
        return <Clock className={`${baseClass} text-indigo-400`} />;
      default:
        return <Circle className={`${baseClass} text-gray-600`} />;
    }
  };

  return (
    <div className="h-screen flex">
      <nav className="w-72 bg-gray-900 text-white p-6 flex flex-col border-r border-gray-800">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-indigo-300">Assessment</h2>
          <p className="text-sm text-gray-400 mt-2">Track your progress</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {Array.from({ length: totalQuestions }, (_, i) => (
            <div
              key={i}
              className={`
                flex items-center p-3 mb-2 rounded-lg transition-all
                ${i + 1 === currentQuestion ? 'bg-gray-800 shadow-lg' : 'hover:bg-gray-800/50'}
              `}
            >
              <div className="mr-3">
                {getStatusIcon(questionStatuses[i], i)}
              </div>
              <div className="flex-1">
                <span className={`
                  ${i + 1 === currentQuestion ? 'text-indigo-300 font-medium' : 'text-gray-400'}
                `}>
                  Question {i + 1}
                </span>
                {i + 1 === currentQuestion && (
                  <div className="text-xs text-gray-500 mt-1">Currently active</div>
                )}
              </div>
              {i + 1 === currentQuestion && (
                <ChevronRight className="w-4 h-4 text-indigo-400" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Overall Progress</span>
            <span>{Math.round((currentQuestion / totalQuestions) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
            />
          </div>
          <div className="mt-4 flex justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
              <span>Completed</span>
            </div>
            <div className="flex items-center">
              <AlertCircle className="w-3 h-3 text-yellow-500 mr-1" />
              <span>Skipped</span>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavigationBar;