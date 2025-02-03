"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Star, Clock, Brain, Mail, Shield } from "lucide-react"

export default function LandingPage() {
  const [userName, setUserName] = useState("")
  const router = useRouter()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (userName.trim()) {
      router.push(`/assessment?name=${encodeURIComponent(userName)}`)
    }
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
    <div className="min-h-screen w-screen bg-gradient-to-br from-background to-secondary">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Professional Assessment System</h1>
          <p className="text-xl text-primary">AI-Powered Evaluation of Innovation & Communication Skills</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="bg-card/50 p-6 rounded-xl backdrop-blur-sm border border-border/50">
              <feature.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="max-w-lg mx-auto bg-card rounded-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">Begin Your Assessment</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Clock className="h-5 w-5 text-primary" />
              <p className="text-primary">60-minute comprehensive evaluation</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition duration-200"
                placeholder="Enter your full name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
            >
              Start Assessment
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-6 text-sm text-center text-muted-foreground">
            By starting the assessment, you agree to our monitoring and evaluation process
          </div>
        </div>
      </div>
    </div>
  )
}

