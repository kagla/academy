"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Phone,
  User,
  Calendar,
  Clock,
  GraduationCap,
  Building,
  MessageSquare,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Consultation {
  id: number;
  student_name: string;
  phone: string;
  parent_phone: string;
  grade: string;
  dormitory: string;
  desired_date: string;
  desired_time: string;
  message: string;
  status: string;
  created_at: string;
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  대기: {
    label: "대기",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  확인: {
    label: "확인",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  완료: {
    label: "완료",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
};

export default function AdminConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [detailItem, setDetailItem] = useState<Consultation | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchConsultations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/consultations?${params}`, {
        credentials: "include",
      });
      const data = await res.json();
      setConsultations(data.consultations || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error("상담신청을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(`상태가 '${newStatus}'(으)로 변경되었습니다.`);
        setConsultations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
        );
      } else {
        const data = await res.json();
        toast.error(data.message || "상태 변경에 실패했습니다.");
      }
    } catch {
      toast.error("서버 오류가 발생했습니다.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("상담신청이 삭제되었습니다.");
        fetchConsultations();
      } else {
        const data = await res.json();
        toast.error(data.message || "삭제에 실패했습니다.");
      }
    } catch {
      toast.error("서버 오류가 발생했습니다.");
    }
  };

  const openDetail = (consultation: Consultation) => {
    setDetailItem(consultation);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">상담신청 관리</h1>
        <p className="text-muted-foreground">
          상담신청 내역을 확인하고 상태를 관리할 수 있습니다.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="학생 이름 또는 연락처 검색..."
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
                  <TableHead>학생 이름</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead className="w-20">학년</TableHead>
                  <TableHead className="w-28">희망일시</TableHead>
                  <TableHead className="w-28 text-center">상태</TableHead>
                  <TableHead className="w-28">신청일</TableHead>
                  <TableHead className="w-28 text-center">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-32 text-center text-muted-foreground"
                    >
                      상담신청 내역이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  consultations.map((c) => {
                    const status = statusConfig[c.status] || statusConfig["대기"];
                    return (
                      <TableRow
                        key={c.id}
                        className="cursor-pointer"
                        onClick={() => openDetail(c)}
                      >
                        <TableCell className="font-medium">{c.id}</TableCell>
                        <TableCell>{c.student_name}</TableCell>
                        <TableCell>{c.phone}</TableCell>
                        <TableCell>{c.grade}</TableCell>
                        <TableCell>
                          {c.desired_date}
                          {c.desired_time && ` ${c.desired_time}`}
                        </TableCell>
                        <TableCell
                          className="text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Select
                            value={c.status || "대기"}
                            onValueChange={(val) =>
                              handleStatusChange(c.id, val)
                            }
                          >
                            <SelectTrigger className="h-7 w-20 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusConfig).map(
                                ([key, config]) => (
                                  <SelectItem key={key} value={key}>
                                    <Badge
                                      variant="secondary"
                                      className={config.className}
                                    >
                                      {config.label}
                                    </Badge>
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {new Date(c.created_at).toLocaleDateString("ko-KR")}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleDelete(c.id)}
                              title="삭제"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>상담신청 상세</DialogTitle>
            <DialogDescription>
              신청일:{" "}
              {detailItem?.created_at &&
                new Date(detailItem.created_at).toLocaleDateString("ko-KR")}
            </DialogDescription>
          </DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="h-3 w-3" /> 학생 이름
                  </div>
                  <p className="text-sm font-medium">{detailItem.student_name}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <GraduationCap className="h-3 w-3" /> 학년
                  </div>
                  <p className="text-sm font-medium">{detailItem.grade || "-"}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" /> 연락처
                  </div>
                  <p className="text-sm font-medium">{detailItem.phone}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" /> 학부모 연락처
                  </div>
                  <p className="text-sm font-medium">
                    {detailItem.parent_phone || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Building className="h-3 w-3" /> 기숙사
                  </div>
                  <p className="text-sm font-medium">
                    {detailItem.dormitory || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" /> 희망 상담일
                  </div>
                  <p className="text-sm font-medium">
                    {detailItem.desired_date || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> 희망 시간
                  </div>
                  <p className="text-sm font-medium">
                    {detailItem.desired_time || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    상태
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      statusConfig[detailItem.status]?.className ||
                      statusConfig["대기"].className
                    }
                  >
                    {detailItem.status || "대기"}
                  </Badge>
                </div>
              </div>
              {detailItem.message && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" /> 메시지
                  </div>
                  <div className="whitespace-pre-wrap rounded-md border bg-muted/50 p-3 text-sm">
                    {detailItem.message}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
