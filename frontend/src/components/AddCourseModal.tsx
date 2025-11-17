import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "../config";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const AddCourseModal = ({ open, setOpen, refreshCourses }) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [semester, setSemester] = useState("");

  const handleCreate = async () => {
    if (!title || !code) {
      toast({
        title: "Missing Data",
        description: "Course title and code are required.",
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, code, semester }),
    });

    const data = await res.json();

    if (res.ok) {
      toast({ title: "Course Added!", description: "Your course has been created." });
      setOpen(false);
      refreshCourses();
      setTitle("");
      setCode("");
      setSemester("");
    } else {
      toast({ title: "Error", description: data.error, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-card border-white/10">
        <DialogHeader>
          <DialogTitle>Add New Course</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Input placeholder="Course Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Course Code (e.g., CS201)" value={code} onChange={(e) => setCode(e.target.value)} />
          <Input placeholder="Semester (optional)" value={semester} onChange={(e) => setSemester(e.target.value)} />

          <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleCreate}>
            Create Course
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCourseModal;
