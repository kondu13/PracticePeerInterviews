import { InterviewSlot } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ExternalLink, Video, Copy, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InterviewRoomModalProps {
  interview: InterviewSlot & {
    interviewer?: any;
    interviewee?: any;
    partner?: any;
  };
  onClose: () => void;
}

export default function InterviewRoomModal({ interview, onClose }: InterviewRoomModalProps) {
  const { toast } = useToast();
  
  const partner = interview.interviewer && interview.interviewee 
    ? (interview.interviewerId === interview.interviewee.id 
      ? interview.interviewer 
      : interview.interviewee)
    : interview.partner;
  
  const copyMeetingLink = () => {
    if (interview.meetingLink) {
      navigator.clipboard.writeText(interview.meetingLink);
      toast({
        title: "Link copied!",
        description: "Meeting link copied to clipboard",
      });
    }
  };
  
  const openMeetingLink = () => {
    if (interview.meetingLink) {
      window.open(interview.meetingLink, "_blank");
    }
  };
  
  const formatDate = (date: string | Date) => {
    return format(new Date(date), "EEEE, MMMM d, yyyy");
  };
  
  const formatTime = (date: string | Date) => {
    return format(new Date(date), "h:mm a");
  };
  
  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <Video className="mr-2 h-5 w-5 text-primary" />
            Interview Room
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Session Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-700">{formatDate(interview.slotTime)}</span>
              </div>
              <Badge variant={interview.status === "Completed" ? "secondary" : "default"}>
                {interview.status}
              </Badge>
            </div>
            <div className="text-sm text-gray-500">
              {formatTime(interview.slotTime)} - {formatTime(interview.endTime)}
            </div>
          </div>
          
          {/* Participants */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Participants</h3>
            <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-md">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold">
                  {partner?.name?.charAt(0) || "?"}
                </span>
              </div>
              <div>
                <p className="font-medium">{partner?.name || "Unknown"}</p>
                <p className="text-xs text-gray-500">{partner?.email || ""}</p>
              </div>
            </div>
          </div>
          
          {/* Meeting Link */}
          {interview.meetingLink ? (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Meeting Link</h3>
              <div className="relative">
                <div className="bg-gray-50 p-3 pr-14 rounded-md text-sm text-gray-700 truncate">
                  {interview.meetingLink}
                </div>
                <button 
                  onClick={copyMeetingLink}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  title="Copy link"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button 
                  onClick={openMeetingLink}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  title="Open link"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No meeting link available
            </div>
          )}
          
          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {interview.meetingLink && (
              <Button onClick={openMeetingLink}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Join Meeting
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}