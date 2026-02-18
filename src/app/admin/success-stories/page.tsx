"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
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

interface SuccessStory {
  id: number;
  student_name: string;
  university: string;
  department: string;
  year: number;
  content: string;
  is_visible: number;
  created_at: string;
}

interface StoryForm {
  student_name: string;
  university: string;
  department: string;
  year: number;
  content: string;
  is_visible: boolean;
}

const emptyForm: StoryForm = {
  student_name: "",
  university: "",
  department: "",
  year: new Date().getFullYear(),
  content: "",
  is_visible: true,
};

export default function AdminSuccessStoriesPage() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<SuccessStory | null>(null);
  const [form, setForm] = useState<StoryForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
        admin: "true",
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/success-stories?${params}`, {
        credentials: "include",
      });
      const data = await res.json();
      setStories(data.stories || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error("합격수기를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const openCreateDialog = () => {
    setEditingStory(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = async (story: SuccessStory) => {
    try {
      const res = await fetch(`/api/success-stories/${story.id}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setEditingStory(data);
        setForm({
          student_name: data.student_name,
          university: data.university,
          department: data.department,
          year: data.year,
          content: data.content,
          is_visible: Boolean(data.is_visible),
        });
      } else {
        setEditingStory(story);
        setForm({
          student_name: story.student_name,
          university: story.university,
          department: story.department,
          year: story.year,
          content: story.content,
          is_visible: Boolean(story.is_visible),
        });
      }
    } catch {
      setEditingStory(story);
      setForm({
        student_name: story.student_name,
        university: story.university,
        department: story.department,
        year: story.year,
        content: story.content,
        is_visible: Boolean(story.is_visible),
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.student_name.trim() ||
      !form.university.trim() ||
      !form.department.trim() ||
      !form.content.trim()
    ) {
      toast.error("모든 필수 항목을 입력해주세요.");
      return;
    }

    setSubmitting(true);

    try {
      const url = editingStory
        ? `/api/success-stories/${editingStory.id}`
        : "/api/success-stories";
      const method = editingStory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success(
          editingStory
            ? "합격수기가 수정되었습니다."
            : "합격수기가 등록되었습니다."
        );
        setDialogOpen(false);
        fetchStories();
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
      const res = await fetch(`/api/success-stories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("합격수기가 삭제되었습니다.");
        fetchStories();
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
          <h1 className="text-2xl font-bold">합격수기 관리</h1>
          <p className="text-muted-foreground">
            합격수기를 등록, 수정, 삭제할 수 있습니다.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-1 h-4 w-4" />
          새 합격수기 작성
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="이름, 대학, 학과 검색..."
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
                  <TableHead>이름</TableHead>
                  <TableHead>대학</TableHead>
                  <TableHead>학과</TableHead>
                  <TableHead className="w-16 text-center">연도</TableHead>
                  <TableHead className="w-20 text-center">공개</TableHead>
                  <TableHead className="w-28">등록일</TableHead>
                  <TableHead className="w-28 text-center">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-32 text-center text-muted-foreground"
                    >
                      합격수기가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  stories.map((story) => (
                    <TableRow key={story.id}>
                      <TableCell className="font-medium">{story.id}</TableCell>
                      <TableCell>{story.student_name}</TableCell>
                      <TableCell>{story.university}</TableCell>
                      <TableCell>{story.department}</TableCell>
                      <TableCell className="text-center">{story.year}</TableCell>
                      <TableCell className="text-center">
                        {Boolean(story.is_visible) ? (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <Eye className="mr-1 h-3 w-3" />
                            공개
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          >
                            <EyeOff className="mr-1 h-3 w-3" />
                            비공개
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(story.created_at).toLocaleDateString("ko-KR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => openEditDialog(story)}
                            title="수정"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDelete(story.id)}
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
              {editingStory ? "합격수기 수정" : "새 합격수기 작성"}
            </DialogTitle>
            <DialogDescription>
              {editingStory
                ? "합격수기 내용을 수정합니다."
                : "새로운 합격수기를 작성합니다."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="story-name">학생 이름</Label>
                <Input
                  id="story-name"
                  placeholder="학생 이름"
                  value={form.student_name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      student_name: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="story-year">연도</Label>
                <Input
                  id="story-year"
                  type="number"
                  placeholder="2025"
                  value={form.year}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      year: parseInt(e.target.value) || new Date().getFullYear(),
                    }))
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="story-university">대학</Label>
                <Input
                  id="story-university"
                  placeholder="대학 이름"
                  value={form.university}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      university: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="story-department">학과</Label>
                <Input
                  id="story-department"
                  placeholder="학과 이름"
                  value={form.department}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      department: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="story-content">내용</Label>
              <Textarea
                id="story-content"
                placeholder="합격 후기를 입력하세요"
                value={form.content}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, content: e.target.value }))
                }
                className="min-h-40"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="story-visible"
                checked={form.is_visible}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({
                    ...prev,
                    is_visible: checked === true,
                  }))
                }
              />
              <Label htmlFor="story-visible" className="cursor-pointer">
                공개
              </Label>
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
                {submitting ? "저장 중..." : editingStory ? "수정" : "등록"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
