import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ArrowLeft, Download, Eye, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Notice {
  id: number;
  title: string;
  author: string;
  created_at: string;
  views: number;
  content: string;
  file_name?: string;
  file_path?: string;
}

async function getNotice(id: string): Promise<Notice> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/notices/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch notice");
  return res.json();
}

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const notice = await getNotice(id);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">{notice.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="size-4" />
            {notice.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="size-4" />
            {format(new Date(notice.created_at), "yyyy년 MM월 dd일 HH:mm", { locale: ko })}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="size-4" />
            조회 {notice.views}
          </span>
        </div>
      </div>

      <Separator className="mb-6" />

      <div className="min-h-[200px] mb-6">
        <p className="whitespace-pre-wrap leading-relaxed">{notice.content}</p>
      </div>

      {notice.file_name && notice.file_path && (
        <>
          <Separator className="mb-4" />
          <div className="flex items-center gap-2 mb-6 p-3 rounded-md bg-muted/50">
            <Download className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">첨부파일:</span>
            <a
              href={notice.file_path}
              download={notice.file_name}
              className="text-sm text-primary hover:underline"
            >
              {notice.file_name}
            </a>
          </div>
        </>
      )}

      <Separator className="mb-6" />

      <div>
        <Button variant="outline" asChild>
          <Link href="/community/notice">
            <ArrowLeft className="size-4" />
            목록으로
          </Link>
        </Button>
      </div>
    </div>
  );
}
