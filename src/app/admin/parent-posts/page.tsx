"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Trash2,
  Eye,
  Lock,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ParentPost {
  id: number;
  title: string;
  content: string;
  author: string;
  is_secret: number;
  views: number;
  created_at: string;
}

export default function AdminParentPostsPage() {
  const [posts, setPosts] = useState<ParentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [detailPost, setDetailPost] = useState<ParentPost | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
        admin: "true",
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/parent-posts?${params}`, {
        credentials: "include",
      });
      const data = await res.json();
      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error("게시글을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleViewDetail = async (post: ParentPost) => {
    try {
      const res = await fetch(`/api/parent-posts/${post.id}?admin=true`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setDetailPost(data);
      } else {
        setDetailPost(post);
      }
    } catch {
      setDetailPost(post);
    }
    setDetailOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/parent-posts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("게시글이 삭제되었습니다.");
        fetchPosts();
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
      <div>
        <h1 className="text-2xl font-bold">학부모게시판 관리</h1>
        <p className="text-muted-foreground">
          학부모게시판 글을 조회하고 관리할 수 있습니다. 비밀글도 확인 가능합니다.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="제목 또는 작성자 검색..."
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
                {posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      게시글이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {Boolean(post.is_secret) && (
                            <Badge
                              variant="secondary"
                              className="shrink-0"
                            >
                              <Lock className="mr-1 h-3 w-3" />
                              비밀
                            </Badge>
                          )}
                          <span className="truncate">{post.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{post.author}</TableCell>
                      <TableCell className="text-center">{post.views}</TableCell>
                      <TableCell>
                        {new Date(post.created_at).toLocaleDateString("ko-KR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleViewDetail(post)}
                            title="상세보기"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDelete(post.id)}
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

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{detailPost?.title}</DialogTitle>
            <DialogDescription>
              {detailPost?.author} |{" "}
              {detailPost?.created_at &&
                new Date(detailPost.created_at).toLocaleDateString("ko-KR")}
              {Boolean(detailPost?.is_secret) && " | 비밀글"}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-md border bg-muted/50 p-4 text-sm">
            {detailPost?.content}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
