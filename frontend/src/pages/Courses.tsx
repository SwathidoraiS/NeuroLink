import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, BookOpen, TrendingUp } from "lucide-react";
import { API_BASE_URL } from "../config";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import AddCourseModal from "../components/AddCourseModal";
import { useNavigate } from "react-router-dom";

interface Course {
  _id: string;
  title: string;
  code: string;
  semester: string;
  progress_percent: number;
}

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchCourses = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE_URL}/api/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCourses(data);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 container mx-auto px-4">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-heading font-bold text-gradient">
          Your Courses
        </h1>

        <Button
          className="bg-primary hover:bg-primary/90 flex items-center gap-2"
          onClick={() => setOpenModal(true)}
        >
          <PlusCircle className="h-5 w-5" /> Add Course
        </Button>
      </div>

      {/* Course Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <motion.div
            key={course._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="glass-card border-white/10 p-6 hover-scale cursor-pointer"
              onClick={() => navigate(`/courses/${course._id}`)}
            >
              <div className="flex items-center justify-between mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
                <span className="text-sm bg-white/10 px-3 py-1 rounded-full">
                  {course.semester || "Semester"}
                </span>
              </div>

              <h2 className="text-xl font-bold mb-1">{course.title}</h2>
              <p className="text-muted-foreground mb-4">{course.code}</p>

              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold text-primary">
                    {course.progress_percent}%
                  </span>
                </div>

                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary via-secondary to-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${course.progress_percent}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add Course Modal */}
      <AddCourseModal
        open={openModal}
        setOpen={setOpenModal}
        refreshCourses={fetchCourses}
      />
    </div>
  );
};

export default Courses;
