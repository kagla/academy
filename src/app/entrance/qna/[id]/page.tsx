"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  Loader2,
  Trash2,
  Pencil,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface QnaPost {
  id: number;
  title: string;
  author: string;
  phone: string;
  created_at: string;
  content: string;
  is_answered: boolean;
  answer_content?: string;
  answered_at?: string;
  answeredBy?: string;
}

export default function QnaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [post, setPost] = useState<QnaPost | null>(null);
  const [loading, setLoading] = useState(true);

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Edit dialog
  const [editDialog, setEditDialog] = useState(false);
  const [editPassword, setEditPassword] = useState("");

  const fetchPost = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/qna/${id}`);
      if (!res.ok) throw new Error("문의를 불러올 수 없습니다.");
      const data = await res.json();
      setPost(data);
    } catch {
      toast.error("문의를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword.trim()) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/qna/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });

      if (!res.ok) {
        toast.error("비밀번호가 일치하지 않습니다.");
        return;
      }

      toast.success("문의가 삭제되었습니다.");
      router.push("/entrance/qna");
    } catch {
      toast.error("삭제에 실패했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  const handleEditCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPassword.trim()) return;

    try {
      const res = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(id), type: "qna", password: editPassword }),
      });

      if (!res.ok) {
        toast.error("비밀번호가 일치하지 않습니다.");
        return;
      }

      router.push(`/entrance/qna/${id}/edit?password=${encodeURIComponent(editPassword)}`);
    } catch {
      toast.error("비밀번호 확인에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <p className="text-center py-20 text-muted-foreground">문의를 찾을 수 없습니다.</p>
        <div className="text-center">
          <Button variant="outline" asChild>
            <Link href="/entrance/qna">
              <ArrowLeft className="size-4" />
              목록으로
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Question Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant={post.is_answered ? "default" : "secondary"}>
            {post.is_answered ? "답변완료" : "대기중"}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="size-4" />
            {post.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="size-4" />
            {format(new Date(post.created_at), "yyyy년 MM월 dd일 HH:mm", { locale: ko })}
          </span>
          {post.phone && (
            <span className="flex items-center gap-1.5">
              <Phone className="size-4" />
              {post.phone}
            </span>
          )}
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Question Content */}
      <div className="min-h-[150px] mb-6">
        <p className="whitespace-pre-wrap leading-relaxed">{post.content}</p>
      </div>

      <Separator className="mb-6" />

      {/* Answer Section */}
      {post.is_answered && post.answer_content && (
        <div className="mb-6 rounded-lg bg-muted/50 border p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">답변</h2>
          </div>
          {post.answeredBy && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1.5">
                <User className="size-4" />
                {post.answeredBy}
              </span>
              {post.answered_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  {format(new Date(post.answered_at), "yyyy년 MM월 dd일 HH:mm", { locale: ko })}
                </span>
              )}
            </div>
          )}
          <p className="whitespace-pre-wrap leading-relaxed">{post.answer_content}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button variant="outline" asChild>
          <Link href="/entrance/qna">
            <ArrowLeft className="size-4" />
            목록으로
          </Link>
        </Button>
        <Button
          variant="outline"
          onClick={() => { setEditPassword(""); setEditDialog(true); }}
        >
          <Pencil className="size-4" />
          수정
        </Button>
        <Button
          variant="destructive"
          onClick={() => { setDeletePassword(""); setDeleteDialog(true); }}
        >
          <Trash2 className="size-4" />
          삭제
        </Button>
      </div>

      {/* Edit Password Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>문의 수정</DialogTitle>
            <DialogDescription>비밀번호를 입력해주세요.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditCheck}>
            <Input
              type="password"
              placeholder="비밀번호"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              autoFocus
            />
            <DialogFooter className="mt-4">
              <Button variant="outline" type="button" onClick={() => setEditDialog(false)}>
                취소
              </Button>
              <Button type="submit">확인</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Password Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>문의 삭제</DialogTitle>
            <DialogDescription>삭제하려면 비밀번호를 입력해주세요.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDelete}>
            <Input
              type="password"
              placeholder="비밀번호"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              autoFocus
            />
            <DialogFooter className="mt-4">
              <Button variant="outline" type="button" onClick={() => setDeleteDialog(false)}>
                취소
              </Button>
              <Button type="submit" variant="destructive" disabled={deleting}>
                {deleting && <Loader2 className="size-4 animate-spin" />}
                삭제
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
