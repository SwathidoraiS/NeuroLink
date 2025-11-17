import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "../config";

const LEARNING_STYLE_OPTIONS = [
  "Visual",
  "Auditory",
  "Kinesthetic",
  "Reading/Writing",
  "Mixed",
];

const TwinSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // form fields
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [learningStyles, setLearningStyles] = useState<string[]>([]);
  const [subjects, setSubjects] = useState(""); // comma-separated
  const [college, setCollege] = useState("");
  const [phone, setPhone] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [dob, setDob] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load profile");

        setProfile(data);
        setName(data.name || "");
        setDepartment(data.department || "");
        setYear(data.year || "");
        setLearningStyles(data.learning_styles || []);
        setSubjects((data.subjects || []).join(", "));
        setCollege(data.college || "");
        setPhone(data.phone || "");
        setEnrollmentNumber(data.enrollment_number || "");
        setDob(data.dob || "");
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    };

    fetchProfile();
  }, [toast]);

  const toggleLearningStyle = (style: string) => {
    setLearningStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const payload = {
        name,
        department,
        year,
        learning_styles: learningStyles,
        subjects: subjects
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        college: college || undefined,
        phone: phone || undefined,
        enrollment_number: enrollmentNumber || undefined,
        dob: dob || undefined,
      };

      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setProfile(data);
      toast({ title: "Saved", description: "Profile updated successfully." });
    } catch (err: any) {
      toast({ title: "Save Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold">Twin Settings</h1>
          <p className="text-muted-foreground">Complete your student profile (optional fields can be skipped).</p>
        </div>

        <Card className="p-6 glass-card border-white/10 max-w-3xl">
          <div className="grid gap-4">
            <label className="text-sm">Full name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />

            <label className="text-sm">Department</label>
            <Input value={department} onChange={(e) => setDepartment(e.target.value)} />

            <label className="text-sm">Year</label>
            <Input value={year} onChange={(e) => setYear(e.target.value)} />

            <label className="text-sm">Learning Styles (select any)</label>
            <div className="flex flex-wrap gap-2">
              {LEARNING_STYLE_OPTIONS.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => toggleLearningStyle(style)}
                  className={`px-3 py-1 rounded-full border ${
                    learningStyles.includes(style)
                      ? "bg-primary text-white"
                      : "bg-white/5 text-muted-foreground"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>

            <label className="text-sm">Subjects (comma-separated)</label>
            <Input value={subjects} onChange={(e) => setSubjects(e.target.value)} />

            <label className="text-sm">College (optional)</label>
            <Input value={college} onChange={(e) => setCollege(e.target.value)} />

            <label className="text-sm">Phone (optional)</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />

            <label className="text-sm">Enrollment Number (optional)</label>
            <Input value={enrollmentNumber} onChange={(e) => setEnrollmentNumber(e.target.value)} />

            <label className="text-sm">DOB (optional)</label>
            <Input value={dob} onChange={(e) => setDob(e.target.value)} placeholder="YYYY-MM-DD" />

            <div className="flex justify-end gap-3 mt-4">
              <Button onClick={handleSave} className="bg-primary" disabled={loading}>
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TwinSettings;
