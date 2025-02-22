"use client"

import { useRouter } from "next/navigation"
import { ArrowRight, Star, Clock, Brain, Mail, Shield, Sparkles,Flame } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()

  const handleStartAssessment = () => {
    router.push("/login")
  }

  const features = [
    {
      icon: Brain,
      title: "Innovation Assessment",
      description: "30-minute evaluation of problem-solving and adaptability",
    },
    {
      icon: Mail,
      title: "Communication Skills",
      description: "30-minute assessment of professional email communication",
    },
    {
      icon: Flame,
      title: "fire in belly",
      description: "10-mins assessment of your passion and drive",
    },
    {
      icon: Star,
      title: "Comprehensive Scoring",
      description: "5-star rating system across multiple competencies",
    },
    
    {
      icon: Shield,
      title: "Real-time Monitoring",
      description: "Secure assessment environment with behavioral analysis",
    },
    
  ]

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-950 via-indigo-950 to-blue-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-2">
            
          </div>
          <button
            onClick={handleStartAssessment}
            className="bg-gradient-to-r from-amber-500 to-amber-700 text-white px-6 py-2 rounded-full font-semibold hover:from-amber-600 hover:to-amber-800 transition duration-300 transform hover:scale-105 shadow-lg"
          >
            Get Started
          </button>
        </nav>

        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight animate-fade-in-up">
            Elevate Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">
              Professional Skills
            </span>
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto animate-fade-in-up animation-delay-300">
            AI-Powered Evaluation of Innovation & Communication Skills
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/5 p-8 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition duration-300 transform hover:scale-105 hover:border-amber-500/30"
            >
              <feature.icon className="h-12 w-12 text-amber-400 mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-4">{feature.title}</h3>
              <p className="text-blue-200 text-lg">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto bg-white/5 rounded-3xl shadow-2xl p-12 backdrop-blur-sm border border-white/10 transform hover:scale-105 transition duration-300 hover:border-amber-500/30">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-white mb-6">Begin Your Assessment Journey</h2>
            <div className="flex items-center justify-center gap-3">
              <Clock className="h-6 w-6 text-amber-400" />
              <p className="text-blue-200 text-xl">30-minute comprehensive evaluation</p>
            </div>
          </div>

          <button
            onClick={handleStartAssessment}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-700 text-white rounded-xl font-semibold text-lg transition duration-300 transform hover:scale-105 hover:shadow-lg hover:from-amber-600 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Start Your Assessment
            <ArrowRight className="h-6 w-6" />
          </button>

          <div className="mt-8 text-sm text-center text-blue-300">
            By starting the assessment, you agree to our monitoring and evaluation process
          </div>
        </div>
      </div>
    </div>
  )
}
