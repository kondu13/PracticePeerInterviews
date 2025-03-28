import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

// Main layout with navigation sidebar
export default function DashboardPage() {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Fetch upcoming interviews
  const { data: upcomingInterviews, isLoading: loadingInterviews } = useQuery({
    queryKey: ["/api/interview-slots/upcoming"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });
  
  // Fetch incoming match requests
  const { data: incomingRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ["/api/match-requests/incoming"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });
  
  // Count of pending incoming requests
  const pendingRequestsCount = incomingRequests?.filter(req => req.status === "Pending").length || 0;
  
  // Filtered upcoming interviews (max 3)
  const nextInterviews = upcomingInterviews?.slice(0, 3) || [];
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
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
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              Dashboard
            </a>
          </Link>
          <Link to="/scheduled-interviews">
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
              {pendingRequestsCount > 0 && (
                <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">
                  {pendingRequestsCount}
                </span>
              )}
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.fullName || 'User'}!</h1>
          <p className="mt-1 text-gray-600">
            Here's an overview of your upcoming interviews and match requests.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Overview cards */}
          <div className="space-y-6">
            {/* Upcoming interviews card */}
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Upcoming Interviews</h2>
                  <Link to="/scheduled-interviews">
                    <a className="text-sm font-medium text-primary hover:text-primary/80">View all</a>
                  </Link>
                </div>
              </div>
              <div className="px-6 py-4">
                {loadingInterviews ? (
                  <div className="flex items-center justify-center py-6">
                    <svg
                      className="h-6 w-6 animate-spin text-primary"
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
                ) : nextInterviews.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {nextInterviews.map((interview) => {
                      const slotDate = new Date(interview.slotTime);
                      const formattedDate = slotDate.toLocaleDateString();
                      const formattedTime = slotDate.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      });
                      
                      const partner = interview.role === 'interviewer' 
                        ? interview.interviewee 
                        : interview.interviewer;
                      
                      return (
                        <li key={interview.id} className="py-4">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                {interview.role === 'interviewer' ? 'I' : 'C'}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900">
                                {interview.topic || 'Interview Session'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formattedDate}, {formattedTime} ({interview.duration} min)
                              </p>
                              <p className="text-sm text-gray-500">
                                With: {partner?.fullName || 'Unknown'}
                              </p>
                              <p className="text-sm text-gray-500">
                                Role: {interview.role === 'interviewer' ? 'Interviewer' : 'Candidate'}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              <a
                                href={interview.meetingLink || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center rounded-md ${
                                  interview.meetingLink
                                    ? 'bg-primary text-white hover:bg-primary/90'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                } px-3 py-2 text-sm font-medium`}
                                onClick={(e) => !interview.meetingLink && e.preventDefault()}
                              >
                                Join
                              </a>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="py-6 text-center text-gray-500">
                    <p>No upcoming interviews scheduled.</p>
                    <Link to="/scheduled-interviews">
                      <a className="mt-2 inline-block text-sm font-medium text-primary hover:text-primary/80">
                        Schedule your first interview
                      </a>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Match requests card */}
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Match Requests</h2>
                  <Link to="/match-requests">
                    <a className="text-sm font-medium text-primary hover:text-primary/80">View all</a>
                  </Link>
                </div>
              </div>
              <div className="px-6 py-4">
                {loadingRequests ? (
                  <div className="flex items-center justify-center py-6">
                    <svg
                      className="h-6 w-6 animate-spin text-primary"
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
                ) : incomingRequests?.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {incomingRequests
                      .filter(req => req.status === 'Pending')
                      .slice(0, 3)
                      .map((request) => (
                        <li key={request.id} className="py-4">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                {request.requester?.fullName?.charAt(0) || 'U'}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900">
                                {request.requester?.fullName || 'Unknown user'} wants to connect
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                {request.message || 'No message provided'}
                              </p>
                            </div>
                            <div className="flex flex-shrink-0 space-x-2">
                              <button className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90">
                                Accept
                              </button>
                              <button className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Decline
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <div className="py-6 text-center text-gray-500">
                    <p>No pending match requests.</p>
                    <Link to="/match-requests">
                      <a className="mt-2 inline-block text-sm font-medium text-primary hover:text-primary/80">
                        Find interview partners
                      </a>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User profile card */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 bg-white px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Your Profile</h2>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{user?.fullName}</h3>
                  <p className="text-sm text-gray-500">{user?.targetRole || 'No target role specified'}</p>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Experience Level</h4>
                  <p className="text-base text-gray-900">{user?.experienceLevel}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Skills</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {user?.skills?.length > 0 ? (
                      user.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No skills specified</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Bio</h4>
                  <p className="text-base text-gray-900">{user?.bio || 'No bio provided'}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 px-6 py-4">
              <button className="rounded-md border border-primary bg-white px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}