import { InterviewSlot } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Mic, MicOff, Video, VideoOff, Share, PhoneOff, Settings, Send } from "lucide-react";

interface InterviewRoomModalProps {
  interview: InterviewSlot & {
    interviewer?: any;
    interviewee?: any;
    partner?: any;
  };
  onClose: () => void;
}

export default function InterviewRoomModal({ interview, onClose }: InterviewRoomModalProps) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: interview.partner?.name || "Partner",
      text: "Let's start with a dynamic programming problem. Can you solve the maximum subarray sum problem?"
    },
    {
      sender: "You",
      text: "Sure! I'm implementing Kadane's algorithm. It should be O(n) time and O(1) space."
    }
  ]);
  
  const getInitials = (name: string) => {
    return name
      ? name.split(' ').map(part => part[0]).join('').toUpperCase()
      : "?";
  };
  
  const sendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { sender: "You", text: message }]);
      setMessage("");
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-full">
        <DialogHeader>
          <div className="flex items-start">
            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 mr-4">
              <Video className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <DialogTitle>
                Interview Room: {interview.partner?.skills?.[0] || "Technical"} Interview 
                (with {interview.partner?.name})
              </DialogTitle>
              <DialogDescription>
                This interview will last 60 minutes. You can use the provided tools 
                for code sharing and problem discussions.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-5 sm:mt-4">
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="p-4 flex items-center justify-between bg-gray-900">
              <div className="text-white font-medium">Mock Interview Session</div>
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <span className="animate-pulse mr-1 h-2 w-2 bg-red-600 rounded-full"></span>
                  Recording
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 p-2">
              <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="mb-2 text-gray-400">
                    <Avatar className="h-16 w-16 mx-auto">
                      <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                  </div>
                  <p>Your Camera {!isVideoOn && "(Off)"}</p>
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="mb-2 text-gray-400">
                    <Avatar className="h-16 w-16 mx-auto">
                      {interview.partner?.avatarUrl ? (
                        <AvatarImage src={interview.partner.avatarUrl} alt={interview.partner.name} />
                      ) : (
                        <AvatarFallback>{getInitials(interview.partner?.name || "Partner")}</AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <p>{interview.partner?.name}'s Camera</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-900 flex items-center justify-center space-x-4">
              <Button 
                variant="outline" 
                size="icon" 
                className={`rounded-full ${isAudioOn ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'}`}
                onClick={() => setIsAudioOn(!isAudioOn)}
              >
                {isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className={`rounded-full ${isVideoOn ? 'bg-gray-700 text-white' : 'bg-gray-700 text-white'}`}
                onClick={() => setIsVideoOn(!isVideoOn)}
              >
                {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full bg-gray-700 text-white"
              >
                <Share className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full bg-red-600 text-white"
                onClick={onClose}
              >
                <PhoneOff className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <div className="p-2 bg-gray-200 flex items-center justify-between">
                  <div className="font-medium text-sm">Collaborative Code Editor</div>
                  <div>
                    <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                      <Settings className="h-3 w-3 mr-1" /> Settings
                    </Button>
                  </div>
                </div>
                <div className="p-4 bg-gray-900 text-green-400 font-mono text-sm h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">
                    {`// Write your code here
function findMaxSubarraySum(arr) {
  let maxSoFar = arr[0];
  let maxEndingHere = arr[0];

  for (let i = 1; i < arr.length; i++) {
    maxEndingHere = Math.max(arr[i], maxEndingHere + arr[i]);
    maxSoFar = Math.max(maxSoFar, maxEndingHere);
  }

  return maxSoFar;
}`}
                  </pre>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <div className="p-2 bg-gray-200 flex items-center justify-between">
                  <div className="font-medium text-sm">Chat</div>
                </div>
                <div className="p-4 h-64 overflow-y-auto">
                  {messages.map((msg, index) => (
                    <div key={index} className={`mb-3 ${msg.sender === "You" ? "text-right" : ""}`}>
                      <div className="text-xs text-gray-500 mb-1">{msg.sender}</div>
                      <div className={`p-2 rounded-lg inline-block ${
                        msg.sender === "You" 
                          ? "bg-indigo-100 text-left" 
                          : "bg-blue-100"
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-gray-200 flex">
                  <Input 
                    type="text" 
                    placeholder="Type your message..." 
                    className="flex-grow"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white" 
                    onClick={sendMessage}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Minimize
          </Button>
          <Button variant="destructive" onClick={onClose}>
            End Interview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
