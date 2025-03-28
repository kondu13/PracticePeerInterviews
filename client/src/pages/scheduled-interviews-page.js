import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";

export default function ScheduledInterviewsPage() {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form state for creating a new interview slot
  const [slotFormData, setSlotFormData] = useState({
    topic: "",
    slotTime: "",
    duration: 30,
    description: ""
  });
  
  // Fetch upcoming interviews
  const { data: upcomingInterviews, isLoading: loadingUpcoming } = useQuery({
    queryKey: ["/api/interview-slots/upcoming"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });
  
  // Fetch past interviews
  const { data: pastInterviews, isLoading: loadingPast } = useQuery({
    queryKey: ["/api/interview-slots/past"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user && activeTab === "past",
  });
  
  // Fetch available slots
  const { data: availableSlots, isLoading: loadingAvailable } = useQuery({
    queryKey: ["/api/interview-slots/available"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user && activeTab === "available",
  });
  
  // Create interview slot mutation
  const createSlotMutation = useMutation({
    mutationFn: async (slotData) => {
      const res = await apiRequest("POST", "/api/interview-slots", slotData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interview-slots/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/interview-slots/available"] });
      setShowCreateModal(false);
      setSlotFormData({
        topic: "",
        slotTime: "",
        duration: 30,
        description: ""
      });
    },
  });
  
  // Book interview slot mutation
  const bookSlotMutation = useMutation({
    mutationFn: async (slotId) => {
      const res = await apiRequest("POST", `/api/interview-slots/${slotId}/book`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interview-slots/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/interview-slots/available"] });
    },
  });
  
  // Cancel interview slot mutation
  const cancelSlotMutation = useMutation({
    mutationFn: async (slotId) => {
      const res = await apiRequest("POST", `/api/interview-slots/${slotId}/cancel`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interview-slots/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/interview-slots/available"] });
    },
  });
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSlotFormData({
      ...slotFormData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleCreateSlot = (e) => {
    e.preventDefault();
    
    createSlotMutation.mutate({
      ...slotFormData,
      // Convert string to date object
      slotTime: new Date(slotFormData.slotTime).toISOString(),
      // Ensure duration is a number
      duration: Number(slotFormData.duration)
    });
  };
  
  // Handle booking a slot
  const handleBookSlot = (slotId) => {
    bookSlotMutation.mutate(slotId);
  };
  
  // Handle canceling a slot
  const handleCancelSlot = (slotId) => {
    cancelSlotMutation.mutate(slotId);
  };
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Get the correct interviews data based on active tab
  const getInterviewsData = () => {
    if (activeTab === "upcoming") return upcomingInterviews || [];
    if (activeTab === "past") return pastInterviews || [];
    if (activeTab === "available") return availableSlots || [];
    return [];
  };
  
  const isLoading = 
    (activeTab === "upcoming" && loadingUpcoming) || 
    (activeTab === "past" && loadingPast) || 
    (activeTab === "available" && loadingAvailable);
  
  const interviews = getInterviewsData();
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-gray-200 bg-white px-4 py-6">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-primary"
          >
            <path d="M10 16l-6-6 6-6" />
            <path d="M20 10v4a2 2 0 0 1-2 2H8" />
          </svg>
          <span className="text-xl font-bold">MockMate</span>
        </div>
        
        <nav className="mt-8 space-y-1">
          <Link to="/dashboard">
            <a className="flex items-center rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-3 h-5 w-5 text-gray-400"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              Dashboard
            </a>
          </Link>
          <Link to="/scheduled-interviews">
            <a className="flex items-center rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-3 h-5 w-5"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Scheduled Interviews
            </a>
          </Link>
          <Link to="/match-requests">
            <a className="flex items-center rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-3 h-5 w-5 text-gray-400"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Match Requests
            </a>
          </Link>
        </nav>
        
        <div className="mt-auto pt-8">
          <button
            onClick={handleLogout}
            className="flex w-full items-center rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-3 h-5 w-5 text-gray-400"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scheduled Interviews</h1>
            <p className="mt-1 text-gray-600">
              Manage your upcoming and past interviews.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="-ml-1 mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create Interview Slot
          </button>
        </div>

        {/* Interview tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "upcoming"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "past"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setActiveTab("available")}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "available"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Available Slots
            </button>
          </nav>
        </div>

        {/* Tab content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <svg
              className="h-8 w-8 animate-spin text-primary"
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
          </div>
        ) : interviews.length > 0 ? (
          <div className="space-y-6">
            {interviews.map((interview) => {
              const slotDate = new Date(interview.slotTime);
              const formattedDate = slotDate.toLocaleDateString();
              const formattedTime = slotDate.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              });
              
              const isInterviewer = interview.role === 'interviewer';
              const partner = isInterviewer ? interview.interviewee : interview.interviewer;
              const isPast = activeTab === "past";
              const isAvailable = activeTab === "available";
              
              return (
                <div
                  key={interview.id}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                >
                  <div className="px-6 py-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                          isPast ? "bg-gray-100 text-gray-600" : "bg-primary/10 text-primary"
                        }`}>
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
                          >
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">
                            {interview.topic || 'Interview Session'}
                          </h3>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isAvailable 
                              ? "bg-green-100 text-green-800" 
                              : isInterviewer 
                                ? "bg-blue-100 text-blue-800" 
                                : "bg-purple-100 text-purple-800"
                          }`}>
                            {isAvailable 
                              ? "Available" 
                              : isInterviewer 
                                ? "Interviewer" 
                                : "Candidate"}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {formattedDate}, {formattedTime} ({interview.duration} minutes)
                        </p>
                        {interview.description && (
                          <p className="mt-2 text-sm text-gray-700">
                            {interview.description}
                          </p>
                        )}
                        {partner && (
                          <p className="mt-2 text-sm font-medium text-gray-700">
                            {isInterviewer ? "Interviewing:" : "Interviewer:"} {partner.fullName}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-shrink-0 space-x-2">
                        {isAvailable ? (
                          <button
                            onClick={() => handleBookSlot(interview.id)}
                            className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90"
                            disabled={bookSlotMutation.isPending}
                          >
                            Book Slot
                          </button>
                        ) : !isPast && (
                          <>
                            <a
                              href={interview.meetingLink || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center rounded-md ${
                                interview.meetingLink
                                  ? "bg-primary text-white hover:bg-primary/90"
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              } px-3 py-2 text-sm font-medium`}
                              onClick={(e) => !interview.meetingLink && e.preventDefault()}
                            >
                              Join
                            </a>
                            <button
                              onClick={() => handleCancelSlot(interview.id)}
                              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                              disabled={cancelSlotMutation.isPending}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mb-4 h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mb-1 text-lg font-medium text-gray-900">
              {activeTab === "upcoming"
                ? "No upcoming interviews"
                : activeTab === "past"
                ? "No past interviews"
                : "No available slots"}
            </h3>
            <p className="text-gray-500">
              {activeTab === "upcoming"
                ? "You don't have any upcoming interviews scheduled"
                : activeTab === "past"
                ? "You haven't completed any interviews yet"
                : "There are no available interview slots at the moment"}
            </p>
            {activeTab === "available" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                Create an interview slot
              </button>
            )}
          </div>
        )}
      </main>

      {/* Create Interview Slot Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateModal(false)}></div>
            
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <form onSubmit={handleCreateSlot}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-5 sm:flex sm:items-start">
                    <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Create Interview Slot
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Set up a time when you're available to interview others.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
                        Interview Topic
                      </label>
                      <input
                        type="text"
                        name="topic"
                        id="topic"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                        placeholder="e.g. Frontend Development"
                        value={slotFormData.topic}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="slotTime" className="block text-sm font-medium text-gray-700">
                        Date and Time
                      </label>
                      <input
                        type="datetime-local"
                        name="slotTime"
                        id="slotTime"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                        value={slotFormData.slotTime}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                        Duration (minutes)
                      </label>
                      <select
                        id="duration"
                        name="duration"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                        value={slotFormData.duration}
                        onChange={handleChange}
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">60 minutes</option>
                        <option value="90">90 minutes</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description (optional)
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows="3"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                        placeholder="Describe what the interview will focus on..."
                        value={slotFormData.description}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    disabled={createSlotMutation.isPending}
                  >
                    {createSlotMutation.isPending ? "Creating..." : "Create Slot"}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}