"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { GraduationCap, User, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface SuccessStory {
  id: number;
  name: string;
  university: string;
  department: string;
  year: string;
  image_path?: string;
  excerpt?: string;
}

interface SuccessStoryResponse {
  data: SuccessStory[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export default function SuccessStoriesPage() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "9",
      });
      const res = await fetch(`/api/success-stories?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setStories(data.stories || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

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
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">합격수기</h1>
      <p className="text-muted-foreground mb-8">
        우리 학원 학생들의 합격 이야기를 확인해보세요.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          등록된 합격수기가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <Link key={story.id} href={`/story/success/${story.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="aspect-[4/3] relative bg-muted">
                  {story.image_path ? (
                    <Image
                      src={story.image_path}
                      alt={`${story.name} 학생`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="size-16 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="size-4 text-primary" />
                    <span className="font-semibold">{story.name}</span>
                  </div>
                  <p className="text-sm font-medium text-primary">{story.university}</p>
                  <p className="text-sm text-muted-foreground">{story.department}</p>
                  <p className="text-xs text-muted-foreground mt-1">{story.year}</p>
                  {story.excerpt && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {story.excerpt}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8">
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
