"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Search, MessageSquarePlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface QnaPost {
  id: number;
  title: string;
  author: string;
  created_at: string;
  is_answered: boolean;
}

interface QnaResponse {
  data: QnaPost[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export default function QnaListPage() {
  const [posts, setPosts] = useState<QnaPost[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/qna?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      setPosts([]);
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

  const renderPaginationItems = () => {
    const items = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setPage(1); }}>
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (start > 2) {
        items.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    for (let i = start; i <= end; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            isActive={i === page}
            onClick={(e) => { e.preventDefault(); setPage(i); }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        items.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setPage(totalPages); }}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">문의 게시판</h1>
        <Button asChild>
          <Link href="/entrance/qna/write">
            <MessageSquarePlus className="size-4" />
            문의하기
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="제목으로 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">
          검색
        </Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] text-center">번호</TableHead>
              <TableHead>제목</TableHead>
              <TableHead className="w-[100px] text-center hidden sm:table-cell">작성자</TableHead>
              <TableHead className="w-[110px] text-center hidden md:table-cell">작성일</TableHead>
              <TableHead className="w-[100px] text-center">답변상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  불러오는 중...
                </TableCell>
              </TableRow>
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  등록된 문의가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="text-center">{post.id}</TableCell>
                  <TableCell>
                    <Link
                      href={`/entrance/qna/${post.id}`}
                      className="hover:underline font-medium"
                    >
                      {post.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-center hidden sm:table-cell">{post.author}</TableCell>
                  <TableCell className="text-center hidden md:table-cell text-muted-foreground">
                    {format(new Date(post.created_at), "yyyy.MM.dd", { locale: ko })}
                  </TableCell>
                  <TableCell className="text-center">
                    {post.is_answered ? (
                      <Badge variant="default">답변완료</Badge>
                    ) : (
                      <Badge variant="secondary">대기중</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {renderPaginationItems()}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(page + 1); }}
                  className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
