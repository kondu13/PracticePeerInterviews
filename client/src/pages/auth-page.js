import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [location, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    experienceLevel: "Junior",
    skills: [],
    targetRole: "",
    bio: ""
  });
  
  const [errors, setErrors] = useState({});
  const [skillInput, setSkillInput] = useState("");
  
  // If user is already logged in, redirect to dashboard
  if (user) {
    setLocation("/dashboard");
    return null;
  }
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };
  
  // Handle skill input
  const handleSkillInputChange = (e) => {
    setSkillInput(e.target.value);
  };
  
  // Add skill to the list
  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      const updatedSkills = [...formData.skills, skillInput.trim()];
      setFormData({
        ...formData,
        skills: updatedSkills
      });
      setSkillInput("");
      
      // Clear skills error if it exists
      if (errors.skills) {
        setErrors({
          ...errors,
          skills: ""
        });
      }
    }
  };
  
  // Remove skill from the list
  const removeSkill = (skillToRemove) => {
    const updatedSkills = formData.skills.filter(skill => skill !== skillToRemove);
    setFormData({
      ...formData,
      skills: updatedSkills
    });
  };
  
  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!isLogin) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required";
      }
      
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
      
      if (formData.skills.length === 0) {
        newErrors.skills = "At least one skill is required";
      }
      
      if (!formData.targetRole.trim()) {
        newErrors.targetRole = "Target role is required";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (isLogin) {
      // Login
      loginMutation.mutate({
        username: formData.username,
        password: formData.password
      });
    } else {
      // Register
      registerMutation.mutate(formData);
    }
  };
  
  // Handle Enter key in skill input
  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };
  
  const isSubmitting = loginMutation.isPending || registerMutation.isPending;
  
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      {/* Form Section */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 md:px-8 lg:px-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              {isLogin ? "Sign in to your account" : "Create a new account"}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {isLogin ? "New to MockMate? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-primary hover:text-primary/80"
              >
                {isLogin ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                />
                {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                />
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>

              {/* Registration fields */}
              {!isLogin && (
                <>
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                    />
                    {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700">
                      Experience Level
                    </label>
                    <select
                      id="experienceLevel"
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                    >
                      <option value="Junior">Junior</option>
                      <option value="Mid-level">Mid-level</option>
                      <option value="Senior">Senior</option>
                    </select>
                  </div>

                  {/* Skills */}
                  <div>
                    <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                      Skills
                    </label>
                    <div className="flex">
                      <input
                        id="skills"
                        type="text"
                        value={skillInput}
                        onChange={handleSkillInputChange}
                        onKeyDown={handleSkillKeyDown}
                        placeholder="Add a skill and press Enter"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="ml-2 mt-1 inline-flex items-center rounded-md border border-transparent bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        Add
                      </button>
                    </div>
                    {errors.skills && <p className="mt-1 text-xs text-red-600">{errors.skills}</p>}
                    {formData.skills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formData.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-primary hover:bg-primary/20 focus:outline-none"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Target Role */}
                  <div>
                    <label htmlFor="targetRole" className="block text-sm font-medium text-gray-700">
                      Target Role
                    </label>
                    <input
                      id="targetRole"
                      name="targetRole"
                      type="text"
                      required
                      value={formData.targetRole}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                    />
                    {errors.targetRole && <p className="mt-1 text-xs text-red-600">{errors.targetRole}</p>}
                  </div>

                  {/* Bio */}
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                    />
                  </div>
                </>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : isLogin ? (
                  "Sign in"
                ) : (
                  "Create account"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hidden bg-primary md:flex md:w-1/2 md:flex-col md:items-center md:justify-center md:bg-gradient-to-b md:from-primary md:to-primary/80 md:px-8 md:text-white">
        <div className="max-w-md">
          <div className="mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10"
            >
              <path d="M10 16l-6-6 6-6" />
              <path d="M20 10v4a2 2 0 0 1-2 2H8" />
            </svg>
          </div>
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">Improve your interview skills with peer feedback</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-3 h-6 w-6"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9" y2="9"></line>
                <line x1="15" y1="9" x2="15" y2="9"></line>
              </svg>
              <span>Connect with peers at your experience level</span>
            </li>
            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-3 h-6 w-6"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>Schedule practice interviews that fit your calendar</span>
            </li>
            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-3 h-6 w-6"
              >
                <polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon>
                <line x1="3" y1="22" x2="21" y2="22"></line>
              </svg>
              <span>Give and receive constructive feedback</span>
            </li>
            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-3 h-6 w-6"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Track your progress and improve your chances of success</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}