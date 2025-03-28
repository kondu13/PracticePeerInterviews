import { InterviewSlot } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar, Clock, User, Video, ExternalLink } from "lucide-react";

interface InterviewCardProps {
  interview: InterviewSlot & { 
    interviewer?: any;
    interviewee?: any;
    partner?: any;
  };
  isPast?: boolean;
  onJoin?: () => void;
}

export default function InterviewCard({ interview, isPast = false, onJoin }: InterviewCardProps) {
  const { toast } = useToast();
  
  // Function to determine the partner
  const partner = interview.interviewer && interview.interviewee 
    ? (interview.interviewerId === interview.interviewee.id 
      ? interview.interviewer 
      : interview.interviewee)
    : interview.partner;
  
  // Format dates for display
  const formatDate = (date: string | Date) => {
    return format(new Date(date), "EEEE, MMMM d, yyyy");
  };
  
  const formatTime = (date: string | Date) => {
    return format(new Date(date), "h:mm a");
  };
  
  // Cancel interview mutation
  const cancelInterviewMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/cancel-slot/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Interview cancelled",
        description: "The interview has been cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to cancel interview",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  // Handle cancellation
  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel this interview?")) {
      cancelInterviewMutation.mutate(interview.id);
    }
  };
  
  // Determine if the interview is joinable (is in the near future or in progress)
  const isJoinable = !isPast && interview.status === "Booked";
  
  return (
    <Card className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm font-medium">{formatDate(interview.slotTime)}</span>
          </div>
          <Badge variant={
            interview.status === "Completed" ? "secondary" : 
            interview.status === "Cancelled" ? "destructive" : 
            "default"
          }>
            {interview.status}
          </Badge>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Time */}
          <div className="flex items-start">
            <Clock className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
            <div>
              <p className="text-sm font-medium">
                {formatTime(interview.slotTime)} - {formatTime(interview.endTime)}
              </p>
              <p className="text-xs text-gray-500">
                Duration: {Math.round((new Date(interview.endTime).getTime() - new Date(interview.slotTime).getTime()) / (1000 * 60))} minutes
              </p>
            </div>
          </div>
          
          {/* Partner */}
          <div className="flex items-start">
            <User className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
            <div>
              <p className="text-sm font-medium">
                {interview.intervieweeId ? (
                  interview.interviewerId === interview.intervieweeId ? 
                    <span>You are interviewing</span> : 
                    <span>You are being interviewed</span>
                ) : <span>Open slot</span>}
              </p>
              {partner && (
                <p className="text-sm text-gray-600">Partner: {partner.name}</p>
              )}
            </div>
          </div>
          
          {/* Meeting Link */}
          {interview.meetingLink && !isPast && (
            <div className="flex items-start">
              <Video className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Video Meeting</p>
                <p className="text-xs text-gray-500 truncate max-w-xs">
                  {interview.meetingLink.length > 40 
                    ? interview.meetingLink.substring(0, 40) + "..." 
                    : interview.meetingLink}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex justify-between">
        {isPast ? (
          <div className="text-sm text-gray-500">Past interview</div>
        ) : interview.status === "Cancelled" ? (
          <div className="text-sm text-gray-500">Cancelled</div>
        ) : (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCancel}
              disabled={cancelInterviewMutation.isPending}
            >
              {cancelInterviewMutation.isPending ? "Cancelling..." : "Cancel"}
            </Button>
            
            {isJoinable && onJoin && (
              <Button 
                size="sm" 
                onClick={onJoin}
                className="flex items-center"
              >
                <ExternalLink className="mr-1 h-3 w-3" />
                Join Interview
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}