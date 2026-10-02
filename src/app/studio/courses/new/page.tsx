import type { Metadata } from "next";
import { CourseForm } from "@/components/studio/course-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createCourse } from "../../actions";

export const metadata: Metadata = { title: "New course" };

export default function NewCoursePage() {
  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle className="text-2xl">Create a new course</CardTitle>
        <CardDescription>
          Start with the basics. You can add sections and lessons on the next screen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CourseForm action={createCourse} submitLabel="Create course" />
      </CardContent>
    </Card>
  );
}
