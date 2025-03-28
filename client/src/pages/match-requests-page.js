import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";

export default function MatchRequestsPage() {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("incoming");
  
  // Fetch user data for potential matches
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["/api/users"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });
  
  // Fetch incoming match requests
  const { data: incomingRequests, isLoading: loadingIncoming } = useQuery({
    queryKey: ["/api/match-requests/incoming"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });
  
  // Fetch outgoing match requests
  const { data: outgoingRequests, isLoading: loadingOutgoing } = useQuery({
    queryKey: ["/api/match-requests/outgoing"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });
  
  // Create match request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (requestData) => {
      const res = await apiRequest("POST", "/api/match-requests", requestData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/match-requests/outgoing"] });
    },
  });
  
  // Update match request status mutation
  const updateRequestStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await apiRequest("PUT", `/api/match-requests/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/match-requests/incoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/match-requests/outgoing"] });
    },
  });
  
  // Handle match request creation
  const handleCreateRequest = (peerId) => {
    createRequestMutation.mutate({
      matchedPeerId: peerId,
      message: `I'd like to practice interviews with you.`,
      status: "Pending"
    });
  };
  
  // Handle match request status update
  const handleUpdateStatus = (id, status) => {
    updateRequestStatusMutation.mutate({ id, status });
  };
  
  // Filter potential matches to exclude users already requested
  const potentialMatches = users?.filter(potentialUser => {
    // Exclude current user
    if (potentialUser.id === user.id) return false;
    
    // Exclude users already in outgoing requests
    const alreadyRequested = outgoingRequests?.some(
      request => request.matchedPeerId === potentialUser.id
    );
    
    return !alreadyRequested;
  }) || [];
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const isLoading = loadingIncoming || loadingOutgoing || loadingUsers;
  const pendingIncomingCount = incomingRequests?.filter(req => req.status === "Pending").length || 0;
  
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
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Match Requests
              {pendingIncomingCount > 0 && (
                <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">
                  {pendingIncomingCount}
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
          <h1 className="text-2xl font-bold text-gray-900">Match Requests</h1>
          <p className="mt-1 text-gray-600">
            Connect with other users for mock interview practice.
          </p>
        </div>

        {/* Match requests tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("incoming")}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "incoming"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Incoming Requests
              {pendingIncomingCount > 0 && (
                <span className="ml-2 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-white">
                  {pendingIncomingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("outgoing")}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "outgoing"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Outgoing Requests
            </button>
            <button
              onClick={() => setActiveTab("find")}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "find"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Find Partners
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
        ) : (
          <>
            {/* Incoming Requests Tab */}
            {activeTab === "incoming" && (
              <div className="space-y-6">
                {incomingRequests?.length > 0 ? (
                  incomingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="px-6 py-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                              {request.requester?.fullName?.charAt(0) || "U"}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {request.requester?.fullName || "Unknown user"}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {request.requester?.experienceLevel} • {request.requester?.targetRole || "No target role"}
                            </p>
                            {request.requester?.skills?.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {request.requester.skills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="mt-3 rounded-md bg-gray-50 p-3">
                              <p className="text-sm italic text-gray-700">
                                "{request.message || "I'd like to connect for interview practice."}"
                              </p>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                              Status: 
                              <span className={
                                request.status === "Pending" ? "text-yellow-600" :
                                request.status === "Accepted" ? "text-green-600" :
                                "text-red-600"
                              }>
                                {" " + request.status}
                              </span>
                            </p>
                          </div>
                          {request.status === "Pending" && (
                            <div className="flex flex-shrink-0 space-x-2">
                              <button
                                onClick={() => handleUpdateStatus(request.id, "Accepted")}
                                className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90"
                                disabled={updateRequestStatusMutation.isPending}
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(request.id, "Rejected")}
                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                disabled={updateRequestStatusMutation.isPending}
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <h3 className="mb-1 text-lg font-medium text-gray-900">No incoming requests</h3>
                    <p className="text-gray-500">
                      When other users request to match with you, they will appear here
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Outgoing Requests Tab */}
            {activeTab === "outgoing" && (
              <div className="space-y-6">
                {outgoingRequests?.length > 0 ? (
                  outgoingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="px-6 py-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                              {request.matchedPeer?.fullName?.charAt(0) || "U"}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {request.matchedPeer?.fullName || "Unknown user"}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {request.matchedPeer?.experienceLevel} • {request.matchedPeer?.targetRole || "No target role"}
                            </p>
                            {request.matchedPeer?.skills?.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {request.matchedPeer.skills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="mt-3 rounded-md bg-gray-50 p-3">
                              <p className="text-sm italic text-gray-700">
                                You: "{request.message || "I'd like to connect for interview practice."}"
                              </p>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                              Status: 
                              <span className={
                                request.status === "Pending" ? "text-yellow-600" :
                                request.status === "Accepted" ? "text-green-600" :
                                "text-red-600"
                              }>
                                {" " + request.status}
                              </span>
                            </p>
                          </div>
                          {request.status === "Pending" && (
                            <div>
                              <button
                                onClick={() => handleUpdateStatus(request.id, "Cancelled")}
                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                disabled={updateRequestStatusMutation.isPending}
                              >
                                Cancel Request
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
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
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <h3 className="mb-1 text-lg font-medium text-gray-900">No outgoing requests</h3>
                    <p className="text-gray-500">
                      You haven't sent any match requests yet
                    </p>
                    <button
                      onClick={() => setActiveTab("find")}
                      className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                    >
                      Find interview partners
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Find Partners Tab */}
            {activeTab === "find" && (
              <div className="space-y-6">
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                  <div className="px-6 py-4">
                    <h3 className="text-lg font-medium text-gray-900">Find Interview Partners</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Connect with peers for mock interview practice based on your experience level and skills.
                    </p>
                  </div>
                </div>

                {potentialMatches.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {potentialMatches.map((potentialMatch) => (
                      <div
                        key={potentialMatch.id}
                        className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                      >
                        <div className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                                {potentialMatch.fullName?.charAt(0) || "U"}
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {potentialMatch.fullName}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {potentialMatch.experienceLevel}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700">
                              {potentialMatch.targetRole || "No target role"}
                            </p>
                            {potentialMatch.skills?.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {potentialMatch.skills.slice(0, 3).map((skill) => (
                                  <span
                                    key={skill}
                                    className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {potentialMatch.skills.length > 3 && (
                                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                                    +{potentialMatch.skills.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                            {potentialMatch.bio && (
                              <p className="mt-2 text-sm text-gray-500">
                                {potentialMatch.bio.length > 100
                                  ? `${potentialMatch.bio.substring(0, 100)}...`
                                  : potentialMatch.bio}
                              </p>
                            )}
                          </div>
                          <div className="mt-4">
                            <button
                              onClick={() => handleCreateRequest(potentialMatch.id)}
                              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                              disabled={createRequestMutation.isPending}
                            >
                              {createRequestMutation.isPending ? "Sending request..." : "Send match request"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
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
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                    <h3 className="mb-1 text-lg font-medium text-gray-900">No potential matches found</h3>
                    <p className="text-gray-500">
                      You have already sent requests to all available users
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}