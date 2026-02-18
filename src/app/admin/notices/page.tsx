"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Pin,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Notice {
  id: number;
  title: string;
  content: string;
  author: string;
  is_pinned: number;
  views: number;
  created_at: string;
  updated_at: string;
}

interface NoticeForm {
  title: string;
  content: string;
  author: string;
  is_pinned: boolean;
}

const emptyForm: NoticeForm = {
  title: "",
  content: "",
  author: "관리자",
  is_pinned: false,
};

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [form, setForm] = useState<NoticeForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/notices?${params}`, {
        credentials: "include",
      });
      const data = await res.json();
      setNotices(data.notices || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error("공지사항을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const openCreateDialog = () => {
    setEditingNotice(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = async (notice: Notice) => {
    try {
      const res = await fetch(`/api/notices/${notice.id}`, {
        credentials: "include",
      });
      const data = await res.json();
      setEditingNotice(data);
      setForm({
        title: data.title,
        content: data.content,
        author: data.author || "관리자",
        is_pinned: Boolean(data.is_pinned),
      });
      setDialogOpen(true);
    } catch {
      toast.error("공지사항 정보를 불러오는데 실패했습니다.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      toast.error("제목과 내용을 입력해주세요.");
      return;
    }

    setSubmitting(true);

    try {
      const url = editingNotice
        ? `/api/notices/${editingNotice.id}`
        : "/api/notices";
      const method = editingNotice ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success(
          editingNotice
            ? "공지사항이 수정되었습니다."
            : "공지사항이 등록되었습니다."
        );
        setDialogOpen(false);
        fetchNotices();
      } else {
        const data = await res.json();
        toast.error(data.message || "처리에 실패했습니다.");
      }
    } catch {
      toast.error("서버 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/notices/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("공지사항이 삭제되었습니다.");
        fetchNotices();
      } else {
        const data = await res.json();
        toast.error(data.message || "삭제에 실패했습니다.");
      }
    } catch {
      toast.error("서버 오류가 발생했습니다.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">공지사항 관리</h1>
          <p className="text-muted-foreground">공지사항을 등록, 수정, 삭제할 수 있습니다.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-1 h-4 w-4" />
          새 공지 작성
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="제목 또는 내용 검색..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="secondary">
          검색
        </Button>
      </form>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">번호</TableHead>
                  <TableHead>제목</TableHead>
                  <TableHead className="w-24">작성자</TableHead>
                  <TableHead className="w-20 text-center">조회수</TableHead>
                  <TableHead className="w-28">작성일</TableHead>
                  <TableHead className="w-28 text-center">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      공지사항이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  notices.map((notice) => (
                    <TableRow key={notice.id}>
                      <TableCell className="font-medium">{notice.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {Boolean(notice.is_pinned) && (
                            <Badge
                              variant="secondary"
                              className="shrink-0 bg-primary/10 text-primary"
                            >
                              <Pin className="mr-1 h-3 w-3" />
                              고정
                            </Badge>
                          )}
                          <span className="truncate">{notice.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{notice.author}</TableCell>
                      <TableCell className="text-center">{notice.views}</TableCell>
                      <TableCell>
                        {new Date(notice.created_at).toLocaleDateString("ko-KR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => openEditDialog(notice)}
                            title="수정"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDelete(notice.id)}
                            title="삭제"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                이전
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - page) <= 2
                  )
                  .reduce<(number | string)[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) {
                      acc.push("...");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={p}
                        variant={page === p ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(p as number)}
                        className="w-9"
                      >
                        {p}
                      </Button>
                    )
                  )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                다음
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingNotice ? "공지사항 수정" : "새 공지사항 작성"}
            </DialogTitle>
            <DialogDescription>
              {editingNotice
                ? "공지사항 내용을 수정합니다."
                : "새로운 공지사항을 작성합니다."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notice-title">제목</Label>
              <Input
                id="notice-title"
                placeholder="제목을 입력하세요"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notice-content">내용</Label>
              <Textarea
                id="notice-content"
                placeholder="내용을 입력하세요"
                value={form.content}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, content: e.target.value }))
                }
                className="min-h-40"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notice-author">작성자</Label>
                <Input
                  id="notice-author"
                  placeholder="작성자"
                  value={form.author}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, author: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-end pb-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="notice-pinned"
                    checked={form.is_pinned}
                    onCheckedChange={(checked) =>
                      setForm((prev) => ({
                        ...prev,
                        is_pinned: checked === true,
                      }))
                    }
                  />
                  <Label htmlFor="notice-pinned" className="cursor-pointer">
                    상단 고정
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                취소
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "저장 중..." : editingNotice ? "수정" : "등록"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
