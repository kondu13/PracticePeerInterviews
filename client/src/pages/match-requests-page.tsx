import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MatchRequest } from "@shared/schema";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import RequestCard from "@/components/request-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

type RequestWithUser = MatchRequest & { 
  requester?: any; 
  matchedPeer?: any;
};

type MatchRequestsResponse = {
  incoming: RequestWithUser[];
  outgoing: RequestWithUser[];
};

export default function MatchRequestsPage() {
  // Fetch match requests
  const { data: requests, isLoading } = useQuery<MatchRequestsResponse>({
    queryKey: ["/api/match-requests"],
  });
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <MobileNav />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Match Requests</h2>
            <p className="mt-1 text-gray-600">View and manage your incoming and outgoing interview requests.</p>
          </div>
          
          {/* Tabs Navigation */}
          <Tabs defaultValue="incoming" className="w-full">
            <div className="border-b border-gray-200 mb-6">
              <TabsList className="flex space-x-8 -mb-px bg-transparent">
                <TabsTrigger 
                  value="incoming"
                  className="data-[state=active]:border-primary data-[state=active]:text-primary pb-4 px-1 border-b-2 data-[state=inactive]:border-transparent text-sm font-medium data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:hover:border-gray-300 flex items-center"
                >
                  Incoming
                  {requests?.incoming.length ? (
                    <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                      {requests.incoming.filter(r => r.status === "Pending").length}
                    </span>
                  ) : null}
                </TabsTrigger>
                <TabsTrigger 
                  value="outgoing"
                  className="data-[state=active]:border-primary data-[state=active]:text-primary pb-4 px-1 border-b-2 data-[state=inactive]:border-transparent text-sm font-medium data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:hover:border-gray-300 flex items-center"
                >
                  Outgoing
                  {requests?.outgoing.length ? (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {requests.outgoing.filter(r => r.status === "Pending").length}
                    </span>
                  ) : null}
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="incoming">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : requests?.incoming && requests.incoming.length > 0 ? (
                <div className="space-y-4">
                  {requests.incoming
                    .filter(request => request.status === "Pending")
                    .map((request) => (
                      <RequestCard 
                        key={request.id} 
                        request={request} 
                        type="incoming"
                      />
                    ))}
                    
                  {requests.incoming.filter(request => request.status === "Pending").length === 0 && (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-medium text-gray-900">No pending incoming requests</h3>
                      <p className="mt-1 text-gray-500">You don't have any pending interview requests at the moment</p>
                    </div>
                  )}
                  
                  {requests.incoming.some(request => request.status !== "Pending") && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Past Requests</h3>
                      <div className="space-y-4">
                        {requests.incoming
                          .filter(request => request.status !== "Pending")
                          .map((request) => (
                            <RequestCard 
                              key={request.id} 
                              request={request} 
                              type="incoming"
                              isPast={true}
                            />
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <h3 className="text-lg font-medium text-gray-900">No incoming requests</h3>
                  <p className="mt-1 text-gray-500">You haven't received any interview requests yet</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="outgoing">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : requests?.outgoing && requests.outgoing.length > 0 ? (
                <div className="space-y-4">
                  {requests.outgoing
                    .filter(request => request.status === "Pending")
                    .map((request) => (
                      <RequestCard 
                        key={request.id} 
                        request={request} 
                        type="outgoing"
                      />
                    ))}
                    
                  {requests.outgoing.filter(request => request.status === "Pending").length === 0 && (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-medium text-gray-900">No pending outgoing requests</h3>
                      <p className="mt-1 text-gray-500">You don't have any pending interview requests at the moment</p>
                    </div>
                  )}
                  
                  {requests.outgoing.some(request => request.status !== "Pending") && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Past Requests</h3>
                      <div className="space-y-4">
                        {requests.outgoing
                          .filter(request => request.status !== "Pending")
                          .map((request) => (
                            <RequestCard 
                              key={request.id} 
                              request={request} 
                              type="outgoing"
                              isPast={true}
                            />
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <h3 className="text-lg font-medium text-gray-900">No outgoing requests</h3>
                  <p className="mt-1 text-gray-500">You haven't sent any interview requests yet</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
