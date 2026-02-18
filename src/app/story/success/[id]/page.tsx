import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  ArrowLeft,
  GraduationCap,
  Building2,
  BookOpen,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SuccessStory {
  id: number;
  name: string;
  university: string;
  department: string;
  year: string;
  image_path?: string;
  content: string;
  created_at?: string;
}

async function getStory(id: string): Promise<SuccessStory> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/success-stories/${id}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch story");
  return res.json();
}

export default async function SuccessStoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = await getStory(id);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Student Info Header */}
      <div className="flex flex-col sm:flex-row gap-6 mb-6">
        {/* Photo */}
        <div className="w-full sm:w-48 shrink-0">
          <div className="aspect-[3/4] relative rounded-lg overflow-hidden bg-muted">
            {story.image_path ? (
              <Image
                src={story.image_path}
                alt={`${story.name} 학생`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="size-20 text-muted-foreground/30" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-4">{story.name} 학생</h1>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground w-16">대학교</span>
              <span className="font-medium">{story.university}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground w-16">학과</span>
              <span className="font-medium">{story.department}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground w-16">입학년도</span>
              <span className="font-medium">{story.year}</span>
            </div>
            {story.created_at && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground w-16">작성일</span>
                <span className="font-medium">
                  {format(new Date(story.created_at), "yyyy년 MM월 dd일", { locale: ko })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Content */}
      <div className="min-h-[200px] mb-8">
        <p className="whitespace-pre-wrap leading-relaxed">{story.content}</p>
      </div>

      <Separator className="mb-6" />

      {/* Back Button */}
      <div>
        <Button variant="outline" asChild>
          <Link href="/story/success">
            <ArrowLeft className="size-4" />
            목록으로
          </Link>
        </Button>
      </div>
    </div>
  );
}
