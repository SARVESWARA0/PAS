"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { useAssessmentStore } from "../store/assessmentStore"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    name: "",
    college: "",
    department: "",
    phone: "",
    email: "",
  })
  const [colleges, setColleges] = useState([])
  const [departments, setDepartments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [collegeSearch, setCollegeSearch] = useState("")
  const [departmentSearch, setDepartmentSearch] = useState("")
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false)
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false)
  const [customCollege, setCustomCollege] = useState(false)
  const [customDepartment, setCustomDepartment] = useState(false)
  const router = useRouter()
  const setRecordId = useAssessmentStore((state) => state.setRecordId)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/airtable")
        const data = await response.json()
        // Remove duplicates from the arrays
        setColleges([...new Set(data.colleges)])
        setDepartments([...new Set(data.departments)])
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setIsLoading(false)
      }
    }
    fetchData()

    // Add click outside handler
    const handleClickOutside = (event) => {
      if (!event.target.closest(".search-dropdown")) {
        setShowCollegeDropdown(false)
        setShowDepartmentDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/airtable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        const data = await response.json()
        setRecordId(data.recordId)
        router.push(`/assessment`)
      } else {
        console.error("Error submitting form")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  const filteredColleges = colleges.filter((college) => college.toLowerCase().includes(collegeSearch.toLowerCase()))

  const filteredDepartments = departments.filter((department) =>
    department.toLowerCase().includes(departmentSearch.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-blue-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 transform transition-all hover:scale-[1.01]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <ArrowRight className="h-8 w-8 text-blue-600 transform -rotate-45" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Welcome</h2>
          <p className="text-gray-500 mt-2">Please complete your profile to start</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-gray-50 transition-all placeholder-gray-400"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>

          <div className="relative search-dropdown space-y-1">
            <label className="block text-sm font-semibold text-gray-700">College</label>
            {!customCollege ? (
              <div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for your college..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-gray-50 transition-all placeholder-gray-400"
                    value={collegeSearch}
                    onChange={(e) => {
                      setCollegeSearch(e.target.value)
                      setShowCollegeDropdown(true)
                    }}
                    onFocus={() => setShowCollegeDropdown(true)}
                  />
                  {showCollegeDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                      {filteredColleges.length > 0 ? (
                        filteredColleges.map((college, index) => (
                          <button
                            key={`college-${index}-${college}`}
                            type="button"
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 focus:outline-none text-gray-700 transition-colors"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, college }))
                              setCollegeSearch(college)
                              setShowCollegeDropdown(false)
                            }}
                          >
                            {college}
                          </button>
                        ))
                      ) : (
                        <div className="p-4">
                          <p className="text-sm text-gray-500">No college found</p>
                          <button
                            type="button"
                            className="mt-2 w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => {
                              setCustomCollege(true)
                              setShowCollegeDropdown(false)
                            }}
                          >
                            Add new college
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="Enter college name"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-gray-50 transition-all placeholder-gray-400"
                />
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors"
                  onClick={() => {
                    setCustomCollege(false)
                    setFormData((prev) => ({ ...prev, college: "" }))
                    setCollegeSearch("")
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="relative search-dropdown space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Department</label>
            {!customDepartment ? (
              <div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for your department..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-gray-50 transition-all placeholder-gray-400"
                    value={departmentSearch}
                    onChange={(e) => {
                      setDepartmentSearch(e.target.value)
                      setShowDepartmentDropdown(true)
                    }}
                    onFocus={() => setShowDepartmentDropdown(true)}
                  />
                  {showDepartmentDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                      {filteredDepartments.length > 0 ? (
                        filteredDepartments.map((department, index) => (
                          <button
                            key={`department-${index}-${department}`}
                            type="button"
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 focus:outline-none text-gray-700 transition-colors"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, department }))
                              setDepartmentSearch(department)
                              setShowDepartmentDropdown(false)
                            }}
                          >
                            {department}
                          </button>
                        ))
                      ) : (
                        <div className="p-4">
                          <p className="text-sm text-gray-500">No department found</p>
                          <button
                            type="button"
                            className="mt-2 w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => {
                              setCustomDepartment(true)
                              setShowDepartmentDropdown(false)
                            }}
                          >
                            Add new department
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Enter department name"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-gray-50 transition-all placeholder-gray-400"
                />
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors"
                  onClick={() => {
                    setCustomDepartment(false)
                    setFormData((prev) => ({ ...prev, department: "" }))
                    setDepartmentSearch("")
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              pattern="[0-9]{10}"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-gray-50 transition-all placeholder-gray-400"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-gray-50 transition-all placeholder-gray-400"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-[1.02]"
          >
            Start Assessment
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}

