import { MatchRequest } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { format, formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare } from "lucide-react";

interface RequestCardProps {
  request: MatchRequest & { 
    requester?: any; 
    matchedPeer?: any;
  };
  type: "incoming" | "outgoing";
  isPast?: boolean;
}

export default function RequestCard({ request, type, isPast = false }: RequestCardProps) {
  const { toast } = useToast();
  
  // User info from request (either requester or matched peer depending on type)
  const user = type === "incoming" ? request.requester : request.matchedPeer;
  
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
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Accepted":
        return "success";
      case "Declined":
        return "destructive";
      case "Pending":
        return "secondary";
      default:
        return "default";
    }
  };
  
  // Format date/time for display
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${format(date, 'EEE, MMM d')} · ${format(date, 'h:mm a')} - ${format(date.setHours(date.getHours() + 1), 'h:mm a')}`;
  };
  
  // Mutations for accepting/declining requests
  const acceptRequestMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/match-request/${request.id}`, { status: "Accepted" });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Request accepted",
        description: `You've accepted the interview request from ${user.name}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/match-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error accepting request",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const declineRequestMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/match-request/${request.id}`, { status: "Declined" });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Request declined",
        description: `You've declined the interview request.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/match-requests"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error declining request",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <Avatar className="h-12 w-12">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.name} />
            ) : (
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            )}
          </Avatar>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
            <div className="flex items-center mt-1">
              <Badge variant={getExperienceBadgeVariant(user.experienceLevel)}>
                {user.experienceLevel}
              </Badge>
              {!isPast && (
                <span className="ml-2 text-xs text-gray-500">
                  {formatDistance(new Date(request.createdAt), new Date(), { addSuffix: true })}
                </span>
              )}
              {isPast && (
                <Badge className="ml-2" variant={getStatusBadgeVariant(request.status)}>
                  {request.status}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex-grow md:mx-4">
          <div className="flex flex-wrap gap-1 mb-2">
            {user.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="skill">{skill}</Badge>
            ))}
          </div>
          <div>
            <p className="text-sm text-gray-600 flex items-center">
              <Calendar className="text-gray-400 mr-1 h-4 w-4" /> Requested Time: 
              <span className="font-medium ml-1">
                {formatDateTime(request.requestedTime)}
              </span>
            </p>
            {request.message && (
              <p className="text-sm text-gray-600 mt-1 flex items-center">
                <MessageSquare className="text-gray-400 mr-1 h-4 w-4" />
                <span>{request.message}</span>
              </p>
            )}
          </div>
        </div>
        
        {/* Only show action buttons for incoming pending requests */}
        {type === "incoming" && request.status === "Pending" && !isPast && (
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => declineRequestMutation.mutate()}
              disabled={declineRequestMutation.isPending}
            >
              Decline
            </Button>
            <Button 
              onClick={() => acceptRequestMutation.mutate()}
              disabled={acceptRequestMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              Accept
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
