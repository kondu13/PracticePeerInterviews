import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { InterviewSlot } from "@shared/schema";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import InterviewCard from "@/components/interview-card";
import InterviewRoomModal from "@/components/interview-room-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

type InterviewWithUsers = InterviewSlot & {
  interviewer?: any;
  interviewee?: any;
  partner?: any;
};

type InterviewsResponse = {
  upcoming: InterviewWithUsers[];
  past: InterviewWithUsers[];
};

export default function ScheduledInterviewsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedInterview, setSelectedInterview] = useState<InterviewWithUsers | null>(null);
  
  // Fetch interviews
  const { data: interviews, isLoading } = useQuery<InterviewsResponse>({
    queryKey: ["/api/interviews"],
  });
  
  // Filter interviews by selected date
  const filteredUpcoming = interviews?.upcoming.filter(interview => {
    if (!selectedDate) return true;
    const interviewDate = new Date(interview.slotTime);
    return (
      interviewDate.getDate() === selectedDate.getDate() &&
      interviewDate.getMonth() === selectedDate.getMonth() &&
      interviewDate.getFullYear() === selectedDate.getFullYear()
    );
  });
  
  // Get interview dates for calendar highlighting
  const interviewDates = interviews?.upcoming.map(interview => 
    new Date(interview.slotTime)
  ) || [];
  
  // Function to determine if a date has interviews
  const hasInterviewOnDate = (date: Date) => {
    return interviewDates.some(interviewDate => 
      interviewDate.getDate() === date.getDate() &&
      interviewDate.getMonth() === date.getMonth() &&
      interviewDate.getFullYear() === date.getFullYear()
    );
  };
  
  const handleJoinInterview = (interview: InterviewWithUsers) => {
    setSelectedInterview(interview);
  };
  
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
            <h2 className="text-2xl font-bold text-gray-900">Scheduled Interviews</h2>
            <p className="mt-1 text-gray-600">View your upcoming and past interview sessions.</p>
          </div>
          
          {/* Tabs Navigation */}
          <Tabs defaultValue="upcoming" className="w-full">
            <div className="border-b border-gray-200 mb-6">
              <TabsList className="flex space-x-8 -mb-px bg-transparent">
                <TabsTrigger 
                  value="upcoming"
                  className="data-[state=active]:border-primary data-[state=active]:text-primary pb-4 px-1 border-b-2 data-[state=inactive]:border-transparent text-sm font-medium data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:hover:border-gray-300 flex items-center"
                >
                  Upcoming
                  {interviews?.upcoming.length ? (
                    <span className="ml-2 bg-green-100 text-green-600 py-0.5 px-2 rounded-full text-xs">
                      {interviews.upcoming.length}
                    </span>
                  ) : null}
                </TabsTrigger>
                <TabsTrigger 
                  value="past"
                  className="data-[state=active]:border-primary data-[state=active]:text-primary pb-4 px-1 border-b-2 data-[state=inactive]:border-transparent text-sm font-medium data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:hover:border-gray-300"
                >
                  Past
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="upcoming">
              {/* Calendar View */}
              <div className="mb-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-8">
                    <div className="md:col-span-5">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="w-full"
                        modifiers={{
                          hasInterview: (date) => hasInterviewOnDate(date),
                        }}
                        modifiersStyles={{
                          hasInterview: {
                            fontWeight: 'bold',
                            color: 'var(--primary)',
                            backgroundColor: 'rgba(79, 70, 229, 0.1)'
                          }
                        }}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'All Upcoming'}
                      </h3>
                      
                      {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : filteredUpcoming && filteredUpcoming.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                          {filteredUpcoming.map(interview => (
                            <div key={interview.id} className="bg-gray-50 p-2 rounded-md">
                              <p className="font-medium">
                                {format(new Date(interview.slotTime), 'h:mm a')} - {format(new Date(interview.endTime), 'h:mm a')}
                              </p>
                              <p className="text-sm text-gray-600">
                                with {interview.partner?.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No interviews scheduled for this date</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Interviews */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Sessions</h3>
                
                {isLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : interviews?.upcoming && interviews.upcoming.length > 0 ? (
                  <div className="space-y-4">
                    {interviews.upcoming.map((interview) => (
                      <InterviewCard 
                        key={interview.id} 
                        interview={interview}
                        onJoin={() => handleJoinInterview(interview)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium text-gray-900">No upcoming interviews</h3>
                    <p className="mt-1 text-gray-500">You don't have any interviews scheduled. Find peers to practice with!</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="past">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : interviews?.past && interviews.past.length > 0 ? (
                <div className="space-y-4">
                  {interviews.past.map((interview) => (
                    <InterviewCard 
                      key={interview.id} 
                      interview={interview}
                      isPast={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <h3 className="text-lg font-medium text-gray-900">No past interviews</h3>
                  <p className="mt-1 text-gray-500">You haven't completed any interviews yet</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Interview Room Modal */}
      {selectedInterview && (
        <InterviewRoomModal 
          interview={selectedInterview}
          onClose={() => setSelectedInterview(null)}
        />
      )}
    </div>
  );
}
