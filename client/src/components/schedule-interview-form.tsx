import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays } from "lucide-react";
import { format, addHours } from "date-fns";

// Schema for the interview slot form
const scheduleInterviewSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  startTime: z.string({
    required_error: "Please select a start time",
  }),
  duration: z.string({
    required_error: "Please select a duration",
  }),
  meetingType: z.enum(["auto", "external"], {
    required_error: "Please select a meeting type",
  }),
  meetingLink: z.string().url().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof scheduleInterviewSchema>;

interface ScheduleInterviewFormProps {
  onSuccess: () => void;
}

export default function ScheduleInterviewForm({ onSuccess }: ScheduleInterviewFormProps) {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(scheduleInterviewSchema),
    defaultValues: {
      date: undefined,
      startTime: "",
      duration: "60",
      meetingType: "auto",
      meetingLink: "",
    },
  });
  
  const meetingType = form.watch("meetingType");
  
  const createInterviewSlotMutation = useMutation({
    mutationFn: async (formData: FormValues) => {
      // Format the date and time for the server
      const startTimeComponents = formData.startTime.split(":");
      const slotTime = new Date(formData.date);
      slotTime.setHours(parseInt(startTimeComponents[0]));
      slotTime.setMinutes(parseInt(startTimeComponents[1]));
      
      // Calculate end time based on duration
      const durationMinutes = parseInt(formData.duration);
      const endTime = addHours(slotTime, durationMinutes / 60);
      
      // Create the meeting link based on type
      let meetingLink = null;
      if (formData.meetingType === "external" && formData.meetingLink) {
        meetingLink = formData.meetingLink;
      } else {
        // Auto-generate a mock meeting link (in a real app, this would be a real link)
        meetingLink = `https://meet.example.com/interview-${Math.random().toString(36).substring(2, 10)}`;
      }
      
      const interviewSlotData = {
        slotTime,
        endTime,
        status: "Available",
        meetingLink
      };
      
      const response = await apiRequest("POST", "/api/book-slot", interviewSlotData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Interview slot created",
        description: "Your interview slot has been scheduled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/available-slots"] });
      form.reset();
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create interview slot",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: FormValues) => {
    createInterviewSlotMutation.mutate(data);
  };
  
  return (
    <DialogContent className="sm:max-w-[525px]">
      <DialogHeader>
        <DialogTitle>Schedule Interview Slot</DialogTitle>
        <DialogDescription>
          Create an available time slot for a mock interview. You'll be the interviewer.
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-full pl-3 text-left font-normal ${
                          !field.value && "text-muted-foreground"
                        }`}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        setDate(date);
                        field.onChange(date);
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select start time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[
                        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
                        "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", 
                        "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
                      ].map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="meetingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meeting Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select meeting type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="auto">Auto-generated link</SelectItem>
                    <SelectItem value="external">External meeting link</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose to use an auto-generated link or provide your own external meeting link (Zoom, Google Meet, etc.)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {meetingType === "external" && (
            <FormField
              control={form.control}
              name="meetingLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>External Meeting Link</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://zoom.us/j/123456789 or https://meet.google.com/abc-defg-hij" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter a valid Zoom, Google Meet, or other video conferencing link
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={createInterviewSlotMutation.isPending}
            >
              {createInterviewSlotMutation.isPending ? "Creating..." : "Create Interview Slot"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}