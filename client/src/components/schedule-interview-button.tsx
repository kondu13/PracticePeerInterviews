import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { CalendarPlus } from "lucide-react";
import ScheduleInterviewForm from "./schedule-interview-form";

export default function ScheduleInterviewButton() {
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center">
          <CalendarPlus className="mr-2 h-4 w-4" />
          Schedule Interview Slot
        </Button>
      </DialogTrigger>
      <ScheduleInterviewForm onSuccess={() => setOpen(false)} />
    </Dialog>
  );
}