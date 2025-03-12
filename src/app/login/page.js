"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"
import { useAssessmentStore } from "../store/assessmentStore"
import LoadingSpinner from "../components/LoadingSpinner"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    name: "",
    college: "",
    department: "",
    phone: "",
    email: "",
  })
  const [formErrors, setFormErrors] = useState({
    college: "",
    department: "",
    phone: ""
  })
  const [colleges, setColleges] = useState([])
  const [departments, setDepartments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [collegeSearch, setCollegeSearch] = useState("")
  const [departmentSearch, setDepartmentSearch] = useState("")
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false)
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false)
  const [selectedCollegeIndex, setSelectedCollegeIndex] = useState(-1)
  const [selectedDepartmentIndex, setSelectedDepartmentIndex] = useState(-1)
  const router = useRouter()
  const setRecordId = useAssessmentStore((state) => state.setRecordId)
  const collegeDropdownRef = useRef(null)
  const departmentDropdownRef = useRef(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/airtable")
        const data = await response.json()
        setColleges([...new Set(data.colleges)])
        setDepartments([...new Set(data.departments)])
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setIsLoading(false)
      }
    }
    fetchData()

    const handleClickOutside = (event) => {
      if (collegeDropdownRef.current && !collegeDropdownRef.current.contains(event.target)) {
        setShowCollegeDropdown(false)
      }
      if (departmentDropdownRef.current && !departmentDropdownRef.current.contains(event.target)) {
        setShowDepartmentDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "phone") {
      const phone = value.replace(/\D/g, "")
      if (phone.length > 10) {
        setFormErrors(prev => ({ ...prev, phone: "Phone number must be exactly 10 digits." }))
        return
      } else {
        setFormErrors(prev => ({ ...prev, phone: "" }))
      }
      setFormData({ ...formData, phone })
    } else {
      setFormData({ ...formData, [name]: value })
    }
    
    // Clear errors when field is filled
    if (name === "college" || name === "department") {
      if (value.trim()) {
        setFormErrors(prev => ({ ...prev, [name]: "" }))
      }
    }
  }

  const validateForm = () => {
    const errors = {}
    let isValid = true

    if (!formData.college.trim()) {
      errors.college = "College is required"
      isValid = false
    }
    if (!formData.department.trim()) {
      errors.department = "Department is required"
      isValid = false
    }
    if (!formData.phone || formData.phone.length !== 10) {
      errors.phone = "Valid 10-digit phone number is required"
      isValid = false
    }

    setFormErrors(prev => ({ ...prev, ...errors }))
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
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
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setIsSubmitting(false)
    }
  }

  const filteredColleges = colleges.filter((college) =>
    college.toLowerCase().includes(collegeSearch.toLowerCase())
  )

  const filteredDepartments = departments.filter((department) =>
    department.toLowerCase().includes(departmentSearch.toLowerCase())
  )

  const handleKeyDown = (e, type) => {
    if (type === "college") {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedCollegeIndex((prev) => (prev < filteredColleges.length - 1 ? prev + 1 : prev))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedCollegeIndex((prev) => (prev > 0 ? prev - 1 : prev))
      } else if (e.key === "Enter" && selectedCollegeIndex !== -1) {
        e.preventDefault()
        const selectedCollege = filteredColleges[selectedCollegeIndex]
        setFormData((prev) => ({ ...prev, college: selectedCollege }))
        setCollegeSearch(selectedCollege)
        setFormErrors(prev => ({ ...prev, college: "" }))
        setShowCollegeDropdown(false)
      }
    } else if (type === "department") {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedDepartmentIndex((prev) => (prev < filteredDepartments.length - 1 ? prev + 1 : prev))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedDepartmentIndex((prev) => (prev > 0 ? prev - 1 : prev))
      } else if (e.key === "Enter" && selectedDepartmentIndex !== -1) {
        e.preventDefault()
        const selectedDepartment = filteredDepartments[selectedDepartmentIndex]
        setFormData((prev) => ({ ...prev, department: selectedDepartment }))
        setDepartmentSearch(selectedDepartment)
        setFormErrors(prev => ({ ...prev, department: "" }))
        setShowDepartmentDropdown(false)
      }
    }
  }

  // Show submission loading spinner if the form is being submitted
  if (isSubmitting) {
    return <LoadingSpinner />
  }

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

          <div className="relative search-dropdown space-y-1" ref={collegeDropdownRef}>
            <label className="block text-sm font-semibold text-gray-700 flex items-center">
              College <span className="text-red-500 ml-1">*</span>
            </label>
            <div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for your college..."
                  className={`w-full px-4 py-3 rounded-xl border ${
                    formErrors.college ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-gray-50 transition-all placeholder-gray-400`}
                  value={collegeSearch}
                  onChange={(e) => {
                    setCollegeSearch(e.target.value)
                    setShowCollegeDropdown(true)
                    setSelectedCollegeIndex(-1)
                    if (e.target.value === formData.college) {
                      setFormErrors(prev => ({ ...prev, college: "" }))
                    }
                  }}
                  onFocus={() => setShowCollegeDropdown(true)}
                  onKeyDown={(e) => handleKeyDown(e, "college")}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {showCollegeDropdown ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                {showCollegeDropdown && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                    {filteredColleges.length > 0 ? (
                      filteredColleges.map((college, index) => (
                        <button
                          key={`college-${index}-${college}`}
                          type="button"
                          className={`w-full text-left px-4 py-3 hover:bg-blue-50 focus:outline-none text-gray-700 transition-colors ${
                            index === selectedCollegeIndex ? "bg-blue-100" : ""
                          }`}
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, college }))
                            setCollegeSearch(college)
                            setFormErrors(prev => ({ ...prev, college: "" }))
                            setShowCollegeDropdown(false)
                          }}
                        >
                          {college}
                        </button>
                      ))
                    ) : (
                      <div className="p-4">
                        <p className="text-sm text-gray-500">No college found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {formErrors.college && (
                <div className="flex items-center gap-2 mt-1 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{formErrors.college}</span>
                </div>
              )}
            </div>
          </div>

          <div className="relative search-dropdown space-y-1" ref={departmentDropdownRef}>
            <label className="block text-sm font-semibold text-gray-700 flex items-center">
              Department <span className="text-red-500 ml-1">*</span>
            </label>
            <div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for your department..."
                  className={`w-full px-4 py-3 rounded-xl border ${
                    formErrors.department ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-gray-50 transition-all placeholder-gray-400`}
                  value={departmentSearch}
                  onChange={(e) => {
                    setDepartmentSearch(e.target.value)
                    setShowDepartmentDropdown(true)
                    setSelectedDepartmentIndex(-1)
                    if (e.target.value === formData.department) {
                      setFormErrors(prev => ({ ...prev, department: "" }))
                    }
                  }}
                  onFocus={() => setShowDepartmentDropdown(true)}
                  onKeyDown={(e) => handleKeyDown(e, "department")}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {showDepartmentDropdown ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                {showDepartmentDropdown && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                    {filteredDepartments.length > 0 ? (
                      filteredDepartments.map((department, index) => (
                        <button
                          key={`department-${index}-${department}`}
                          type="button"
                          className={`w-full text-left px-4 py-3 hover:bg-blue-50 focus:outline-none text-gray-700 transition-colors ${
                            index === selectedDepartmentIndex ? "bg-blue-100" : ""
                          }`}
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, department }))
                            setDepartmentSearch(department)
                            setFormErrors(prev => ({ ...prev, department: "" }))
                            setShowDepartmentDropdown(false)
                          }}
                        >
                          {department}
                        </button>
                      ))
                    ) : (
                      <div className="p-4">
                        <p className="text-sm text-gray-500">No department found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {formErrors.department && (
                <div className="flex items-center gap-2 mt-1 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{formErrors.department}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 flex items-center">
              Phone Number <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              pattern="[0-9]{10}"
              className={`w-full px-4 py-3 rounded-xl border ${
                formErrors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-gray-50 transition-all placeholder-gray-400`}
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
            {formErrors.phone && (
              <div className="flex items-center gap-2 mt-1 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{formErrors.phone}</span>
              </div>
            )}
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
            disabled={isSubmitting}
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
