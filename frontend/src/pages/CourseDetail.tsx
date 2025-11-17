import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { PlusCircle, CheckCircle, FileText } from "lucide-react";

interface Course {
  _id: string;
  title: string;
  code: string;
  semester: string;
  progress_percent: number;
  lessons: any[];
  modules: any[];
  labs: any[];
  assessments: any[];
}

const CourseDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);

  const fetchCourse = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (res.ok) setCourse(data);
    else toast({ title: "Error", description: data.error, variant: "destructive" });
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  if (!course) return <div className="text-center pt-24">Loading...</div>;

  // Add new content to a section
  const addItem = async (type: string) => {
    const title = prompt(`Enter ${type} title:`);
    if (!title) return;

    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/courses/${course._id}/${type}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });

    const data = await res.json();
    if (res.ok) {
      toast({ title: `${type} added!` });
      setCourse(data);
    } else {
      toast({ title: "Error", description: data.error, variant: "destructive" });
    }
  };

  const toggle = async (type: string, itemId: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/courses/${course._id}/${type}/${itemId}/toggle`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (res.ok) setCourse(data);
    else toast({ title: "Error", description: data.error, variant: "destructive" });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 container mx-auto px-4">
      <h1 className="text-4xl font-heading font-bold text-gradient mb-3">{course.title}</h1>
      <p className="text-muted-foreground mb-8">{course.code} • {course.semester}</p>

      {/* Progress Bar */}
      <Card className="glass-card border-white/10 p-6 mb-10">
        <p className="font-medium mb-2">Overall Progress</p>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-secondary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${course.progress_percent}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        <p className="text-primary font-semibold mt-2">{course.progress_percent}%</p>
      </Card>

      {/* Sections */}
      {["lessons", "modules", "labs"].map((section) => (
        <Card key={section} className="glass-card border-white/10 mb-8 p-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-semibold capitalize">{section}</h2>
            <Button
              variant="outline"
              onClick={() => addItem(section.slice(0, -1))}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" /> Add
            </Button>
          </div>

          {course[section].length === 0 && <p className="text-muted-foreground">No items yet.</p>}

          <ul className="space-y-3">
            {course[section].map((item) => (
              <li
                key={item._id}
                className="flex items-center justify-between bg-white/5 p-3 rounded-xl"
              >
                <span className={item.completed ? "line-through opacity-60" : ""}>
                  {item.title}
                </span>
                <Button
                  size="sm"
                  onClick={() => toggle(section.slice(0, -1), item._id)}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      {/* Assessments */}
      <Card className="glass-card border-white/10 mb-8 p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-semibold">Assessments</h2>
          <Button
            variant="outline"
            onClick={() => addItem("assessment")}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" /> Add
          </Button>
        </div>

        {course.assessments.length === 0 && <p className="text-muted-foreground">No assessments yet.</p>}

        {course.assessments.map((assess) => (
          <Card key={assess._id} className="p-4 bg-white/5 mb-3">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{assess.title}</p>
                <p className="text-sm text-muted-foreground">
                  Score: {assess.score ?? "--"} / {assess.max_score}
                </p>
              </div>

              <Button
                size="sm"
                onClick={() => {
                  const score = prompt("Enter score:");
                  if (score) {
                    fetch(`${API_BASE_URL}/api/courses/${course._id}/assessment/${assess._id}`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                      },
                      body: JSON.stringify({ score: Number(score) }),
                    })
                      .then((res) => res.json())
                      .then(setCourse);
                  }
                }}
              >
                <FileText className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </Card>
    </div>
  );
};

export default CourseDetail;
