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
  Eye,
  Loader2,
  Trash2,
  Pencil,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Post {
  id: number;
  title: string;
  author: string;
  created_at: string;
  views: number;
  content: string;
  is_secret: boolean;
}

interface Comment {
  id: number;
  author: string;
  content: string;
  created_at: string;
}

export default function ParentPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);

  // Password dialog
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Edit dialog
  const [editDialog, setEditDialog] = useState(false);
  const [editPassword, setEditPassword] = useState("");

  // Comment form
  const [commentForm, setCommentForm] = useState({
    author: "",
    password: "",
    content: "",
  });
  const [commentLoading, setCommentLoading] = useState(false);

  // Comment delete
  const [commentDeleteDialog, setCommentDeleteDialog] = useState(false);
  const [commentDeleteId, setCommentDeleteId] = useState<number | null>(null);
  const [commentDeletePassword, setCommentDeletePassword] = useState("");
  const [commentDeleting, setCommentDeleting] = useState(false);

  const fetchPost = useCallback(async (pwd?: string) => {
    setLoading(true);
    try {
      const url = pwd
        ? `/api/parent-posts/${id}?password=${encodeURIComponent(pwd)}`
        : `/api/parent-posts/${id}`;
      const res = await fetch(url);

      if (res.status === 403) {
        setNeedsPassword(true);
        setPasswordDialog(true);
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error("게시글을 불러올 수 없습니다.");

      const data = await res.json();
      setPost(data);
      setVerified(true);
      setNeedsPassword(false);
      setPasswordDialog(false);
    } catch {
      if (!needsPassword) {
        toast.error("게시글을 불러올 수 없습니다.");
      }
    } finally {
      setLoading(false);
    }
  }, [id, needsPassword]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/parent-posts/${id}/comments`);
      if (!res.ok) return;
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      // Silently fail
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  useEffect(() => {
    if (verified) {
      fetchComments();
    }
  }, [verified, fetchComments]);

  const handlePasswordVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setVerifying(true);
    try {
      const res = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(id), type: "parent-post", password }),
      });

      if (!res.ok) {
        toast.error("비밀번호가 일치하지 않습니다.");
        return;
      }

      await fetchPost(password);
      setPassword("");
    } catch {
      toast.error("비밀번호 확인에 실패했습니다.");
    } finally {
      setVerifying(false);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword.trim()) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/parent-posts/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });

      if (!res.ok) {
        toast.error("비밀번호가 일치하지 않습니다.");
        return;
      }

      toast.success("게시글이 삭제되었습니다.");
      router.push("/community/parent");
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
        body: JSON.stringify({ id: Number(id), type: "parent-post", password: editPassword }),
      });

      if (!res.ok) {
        toast.error("비밀번호가 일치하지 않습니다.");
        return;
      }

      router.push(`/community/parent/${id}/edit?password=${encodeURIComponent(editPassword)}`);
    } catch {
      toast.error("비밀번호 확인에 실패했습니다.");
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentForm.author.trim() || !commentForm.password.trim() || !commentForm.content.trim()) {
      toast.error("모든 항목을 입력해주세요.");
      return;
    }

    setCommentLoading(true);
    try {
      const res = await fetch(`/api/parent-posts/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentForm),
      });

      if (!res.ok) throw new Error("댓글 작성에 실패했습니다.");

      toast.success("댓글이 등록되었습니다.");
      setCommentForm({ author: "", password: "", content: "" });
      fetchComments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "댓글 작성에 실패했습니다.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleCommentDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentDeleteId === null || !commentDeletePassword.trim()) return;

    setCommentDeleting(true);
    try {
      const res = await fetch(`/api/parent-posts/${id}/comments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: commentDeleteId, password: commentDeletePassword }),
      });

      if (!res.ok) {
        toast.error("비밀번호가 일치하지 않습니다.");
        return;
      }

      toast.success("댓글이 삭제되었습니다.");
      setCommentDeleteDialog(false);
      setCommentDeletePassword("");
      setCommentDeleteId(null);
      fetchComments();
    } catch {
      toast.error("댓글 삭제에 실패했습니다.");
    } finally {
      setCommentDeleting(false);
    }
  };

  // Password verification dialog for secret posts
  if (needsPassword && !verified) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Dialog open={passwordDialog} onOpenChange={(open) => {
          if (!open) router.push("/community/parent");
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>비밀글</DialogTitle>
              <DialogDescription>
                이 글은 비밀글입니다. 비밀번호를 입력해주세요.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePasswordVerify}>
              <div className="space-y-4">
                <Input
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" type="button" onClick={() => router.push("/community/parent")}>
                  취소
                </Button>
                <Button type="submit" disabled={verifying}>
                  {verifying && <Loader2 className="size-4 animate-spin" />}
                  확인
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

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
        <p className="text-center py-20 text-muted-foreground">게시글을 찾을 수 없습니다.</p>
        <div className="text-center">
          <Button variant="outline" asChild>
            <Link href="/community/parent">
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
      {/* Post Header */}
      <div className="mb-6">
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
          <span className="flex items-center gap-1.5">
            <Eye className="size-4" />
            조회 {post.views}
          </span>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Post Content */}
      <div className="min-h-[200px] mb-6">
        <p className="whitespace-pre-wrap leading-relaxed">{post.content}</p>
      </div>

      <Separator className="mb-6" />

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mb-8">
        <Button variant="outline" asChild>
          <Link href="/community/parent">
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

      <Separator className="mb-6" />

      {/* Comments Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          댓글 {comments.length > 0 && `(${comments.length})`}
        </h2>

        {comments.length > 0 ? (
          <div className="space-y-4 mb-8">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4 rounded-md border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{comment.author}</span>
                    <span className="text-muted-foreground">
                      {format(new Date(comment.created_at), "yyyy.MM.dd HH:mm", { locale: ko })}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setCommentDeleteId(comment.id);
                      setCommentDeletePassword("");
                      setCommentDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-8">등록된 댓글이 없습니다.</p>
        )}

        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} className="space-y-4 p-4 rounded-md border">
          <h3 className="font-medium">댓글 작성</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="comment-author">작성자</Label>
              <Input
                id="comment-author"
                placeholder="이름"
                value={commentForm.author}
                onChange={(e) => setCommentForm((prev) => ({ ...prev, author: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment-password">비밀번호</Label>
              <Input
                id="comment-password"
                type="password"
                placeholder="비밀번호"
                value={commentForm.password}
                onChange={(e) => setCommentForm((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment-content">내용</Label>
            <Textarea
              id="comment-content"
              placeholder="댓글을 입력하세요"
              value={commentForm.content}
              onChange={(e) => setCommentForm((prev) => ({ ...prev, content: e.target.value }))}
              className="min-h-[80px]"
              required
            />
          </div>
          <Button type="submit" size="sm" disabled={commentLoading}>
            {commentLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            댓글 등록
          </Button>
        </form>
      </div>

      {/* Edit Password Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>게시글 수정</DialogTitle>
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
            <DialogTitle>게시글 삭제</DialogTitle>
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

      {/* Comment Delete Dialog */}
      <Dialog open={commentDeleteDialog} onOpenChange={setCommentDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>댓글 삭제</DialogTitle>
            <DialogDescription>삭제하려면 비밀번호를 입력해주세요.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCommentDelete}>
            <Input
              type="password"
              placeholder="비밀번호"
              value={commentDeletePassword}
              onChange={(e) => setCommentDeletePassword(e.target.value)}
              autoFocus
            />
            <DialogFooter className="mt-4">
              <Button variant="outline" type="button" onClick={() => setCommentDeleteDialog(false)}>
                취소
              </Button>
              <Button type="submit" variant="destructive" disabled={commentDeleting}>
                {commentDeleting && <Loader2 className="size-4 animate-spin" />}
                삭제
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
