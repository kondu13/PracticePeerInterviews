import { useState } from "react";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { format, addHours } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Loader2 } from "lucide-react";

interface PeerCardProps {
  peer: User;
  matchScore?: number;
}

export default function PeerCard({ peer, matchScore }: PeerCardProps) {
  const { toast } = useToast();
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("14:00");
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
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
  
  // Convert availability data for display
  const formattedAvailability = peer.availability
    ? peer.availability.map((slot: any) => 
        `${slot.day}: ${slot.timeSlots.join(", ")}`
      ).join("\n")
    : "Not specified";
  
  const sendRequestMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !selectedTime) {
        throw new Error("Please select a date and time");
      }
      
      // Combine date and time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const requestedTime = new Date(selectedDate);
      requestedTime.setHours(hours, minutes, 0, 0);
      
      const requestData = {
        matchedPeerId: peer.id,
        requestedTime,
        message: "I'd like to practice a mock interview with you.",
      };
      
      const res = await apiRequest("POST", "/api/match-request", requestData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Request sent!",
        description: `Your interview request has been sent to ${peer.name}.`,
      });
      setShowRequestDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/match-requests"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send request",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];
  
  // Generate a formatted time slot for display
  const getTimeSlotDisplay = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const startTime = new Date();
    startTime.setHours(hours, minutes, 0, 0);
    const endTime = addHours(startTime, 1);
    
    return `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Avatar className="h-12 w-12">
              {peer.avatarUrl ? (
                <AvatarImage src={peer.avatarUrl} alt={peer.name} />
              ) : (
                <AvatarFallback>{getInitials(peer.name)}</AvatarFallback>
              )}
            </Avatar>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">{peer.name}</h3>
              <div className="flex items-center mt-1">
                <Badge variant={getExperienceBadgeVariant(peer.experienceLevel)}>
                  {peer.experienceLevel}
                </Badge>
                {matchScore !== undefined && (
                  <span className="ml-2 text-xs text-gray-500">
                    Match: {Math.round(matchScore * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <span 
            className={`inline-flex h-2 w-2 rounded-full ${
              Math.random() > 0.3 ? 'bg-green-400' : 'bg-gray-300'
            }`} 
            title={Math.random() > 0.3 ? "Online" : "Offline"}
          ></span>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700">Skills</h4>
          <div className="mt-1 flex flex-wrap gap-1">
            {peer.skills.map((skill, index) => (
              <Badge key={index} variant="skill">{skill}</Badge>
            ))}
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700">Availability</h4>
          <div className="mt-1 text-sm text-gray-600">
            {formattedAvailability.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
        
        <div className="mt-5 flex justify-between items-center">
          <Button variant="link" className="text-sm font-medium text-primary p-0">
            View Profile
          </Button>
          <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
            <DialogTrigger asChild>
              <Button>Send Request</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Schedule Interview with {peer.name}</DialogTitle>
                <DialogDescription>
                  Select a date and time that works for you. Once confirmed, 
                  the interview request will be sent to {peer.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Select Date</h4>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Select Time</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        className="text-sm"
                        onClick={() => setSelectedTime(time)}
                      >
                        {format(new Date().setHours(parseInt(time.split(':')[0]), 0), 'h:mm a')}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                  <h4 className="font-medium mb-2">Interview Details</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-700">
                      <strong>Date:</strong> {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Time:</strong> {selectedTime ? getTimeSlotDisplay(selectedTime) : 'Select a time'}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>With:</strong> {peer.name} ({peer.experienceLevel})
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowRequestDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => sendRequestMutation.mutate()}
                  disabled={sendRequestMutation.isPending || !selectedDate || !selectedTime}
                >
                  {sendRequestMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Request"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
