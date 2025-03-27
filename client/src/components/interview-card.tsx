import { InterviewSlot } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { format, formatDistance, isAfter, addMinutes } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
  const partner = interview.partner;
  
  const getInitials = (name: string) => {
    return name
      ? name.split(' ').map(part => part[0]).join('').toUpperCase()
      : "?";
  };
  
  const getExperienceBadgeVariant = (level: string) => {
    switch (level) {
      case "Beginner":
        return "beginner";
      case "Intermediate":
        return "intermediate";
      case "Advanced":
        return "advanced";
      default:
        return "default";
    }
  };
  
  // Format date/time for display
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${format(date, 'EEEE, MMMM d')} · ${format(date, 'h:mm a')} - ${format(new Date(interview.endTime), 'h:mm a')}`;
  };
  
  // Calculate time until interview starts or after it ended
  const getTimeStatus = () => {
    const interviewTime = new Date(interview.slotTime);
    const now = new Date();
    const endTime = new Date(interview.endTime);
    
    if (isAfter(interviewTime, now)) {
      return {
        message: `Starts ${formatDistance(interviewTime, now, { addSuffix: true })}`,
        isStartingSoon: interviewTime.getTime() - now.getTime() < 15 * 60 * 1000, // Within 15 minutes
      };
    } else if (isAfter(endTime, now)) {
      return {
        message: "In progress",
        isStartingSoon: true,
      };
    } else {
      return {
        message: `Ended ${formatDistance(endTime, now, { addSuffix: true })}`,
        isStartingSoon: false,
      };
    }
  };
  
  const timeStatus = getTimeStatus();
  
  // Cancel interview mutation
  const cancelInterviewMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/cancel-slot/${interview.id}`, undefined);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Interview cancelled",
        description: `You've cancelled the interview with ${partner?.name}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error cancelling interview",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  if (!partner) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <Avatar className="h-12 w-12">
            {partner.avatarUrl ? (
              <AvatarImage src={partner.avatarUrl} alt={partner.name} />
            ) : (
              <AvatarFallback>{getInitials(partner.name)}</AvatarFallback>
            )}
          </Avatar>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">{partner.name}</h3>
            <div className="flex items-center mt-1">
              <Badge variant={getExperienceBadgeVariant(partner.experienceLevel)}>
                {partner.experienceLevel}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex-grow md:mx-4">
          <div className="flex flex-wrap gap-1 mb-2">
            {partner.skills?.slice(0, 3).map((skill: string, index: number) => (
              <Badge key={index} variant="skill">{skill}</Badge>
            ))}
          </div>
          <div>
            <p className="text-sm text-gray-600 flex items-center">
              <Calendar className="text-gray-400 mr-1 h-4 w-4" /> 
              <span className="font-medium">{formatDateTime(interview.slotTime)}</span>
            </p>
            {!isPast && (
              <p className="text-sm mt-1 flex items-center">
                <Clock className="text-gray-400 mr-1 h-4 w-4" /> 
                <span className={`font-medium ${timeStatus.isStartingSoon ? 'text-primary' : 'text-gray-600'}`}>
                  {timeStatus.message}
                </span>
              </p>
            )}
          </div>
        </div>
        
        {!isPast ? (
          <div className="flex space-x-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Interview?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this interview? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Interview</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => cancelInterviewMutation.mutate()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {cancelInterviewMutation.isPending ? "Cancelling..." : "Yes, Cancel"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button 
              onClick={onJoin}
              disabled={!timeStatus.isStartingSoon}
              className={timeStatus.isStartingSoon ? "bg-primary hover:bg-primary/90" : "bg-gray-400 hover:bg-gray-500"}
            >
              <Video className="mr-2 h-4 w-4" /> Join Room
            </Button>
          </div>
        ) : (
          <div>
            <Badge variant="outline">
              {interview.status === "Completed" ? "Completed" : "Cancelled"}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
