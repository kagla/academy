"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Megaphone,
  CalendarCheck,
  MessageCircleQuestion,
  Trophy,
  ArrowRight,
  Clock,
  Phone,
  User,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardCounts {
  notices: number;
  pendingConsultations: number;
  unansweredQna: number;
  successStories: number;
}

interface Consultation {
  id: number;
  student_name: string;
  phone: string;
  status: string;
  desired_date: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<DashboardCounts>({
    notices: 0,
    pendingConsultations: 0,
    unansweredQna: 0,
    successStories: 0,
  });
  const [recentConsultations, setRecentConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [noticesRes, consultationsRes, qnaRes, storiesRes] =
          await Promise.allSettled([
            fetch("/api/notices?limit=1", { credentials: "include" }),
            fetch("/api/consultations?limit=5", { credentials: "include" }),
            fetch("/api/qna?limit=1", { credentials: "include" }),
            fetch("/api/success-stories?limit=1", { credentials: "include" }),
          ]);

        let noticeCount = 0;
        if (noticesRes.status === "fulfilled" && noticesRes.value.ok) {
          const data = await noticesRes.value.json();
          noticeCount = data.total || 0;
        }

        let pendingCount = 0;
        let consultations: Consultation[] = [];
        if (consultationsRes.status === "fulfilled" && consultationsRes.value.ok) {
          const data = await consultationsRes.value.json();
          pendingCount = data.pendingCount ?? data.total ?? 0;
          consultations = data.consultations || [];
        }

        let unansweredCount = 0;
        if (qnaRes.status === "fulfilled" && qnaRes.value.ok) {
          const data = await qnaRes.value.json();
          unansweredCount = data.unansweredCount ?? 0;
        }

        let storiesCount = 0;
        if (storiesRes.status === "fulfilled" && storiesRes.value.ok) {
          const data = await storiesRes.value.json();
          storiesCount = data.total || 0;
        }

        setCounts({
          notices: noticeCount,
          pendingConsultations: pendingCount,
          unansweredQna: unansweredCount,
          successStories: storiesCount,
        });
        setRecentConsultations(consultations.slice(0, 5));
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const summaryCards = [
    {
      title: "공지사항",
      count: counts.notices,
      icon: Megaphone,
      href: "/admin/notices",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "상담신청 (대기)",
      count: counts.pendingConsultations,
      icon: CalendarCheck,
      href: "/admin/consultations",
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      title: "문의 (미답변)",
      count: counts.unansweredQna,
      icon: MessageCircleQuestion,
      href: "/admin/qna",
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
    {
      title: "합격수기",
      count: counts.successStories,
      icon: Trophy,
      href: "/admin/success-stories",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
  ];

  const quickActions = [
    { label: "공지사항 작성", href: "/admin/notices" },
    { label: "문의 답변", href: "/admin/qna" },
    { label: "상담 확인", href: "/admin/consultations" },
    { label: "식단표 관리", href: "/admin/meal-plans" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-muted-foreground">학원 관리 현황을 한눈에 확인하세요.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 pt-0">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${card.bgColor}`}
                  >
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold">{card.count}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Consultations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5" />
              최근 상담신청
            </CardTitle>
            <CardDescription>최근 접수된 상담신청 내역입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentConsultations.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                상담신청 내역이 없습니다.
              </p>
            ) : (
              <div className="space-y-3">
                {recentConsultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {consultation.student_name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {consultation.phone}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          consultation.status === "대기"
                            ? "secondary"
                            : consultation.status === "확인"
                            ? "default"
                            : "outline"
                        }
                        className={
                          consultation.status === "대기"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : consultation.status === "확인"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }
                      >
                        {consultation.status || "대기"}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(consultation.created_at).toLocaleDateString("ko-KR")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Link href="/admin/consultations">
                <Button variant="outline" size="sm" className="w-full">
                  전체보기
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 실행</CardTitle>
            <CardDescription>자주 사용하는 관리 기능입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href}>
                  <Button variant="outline" className="h-auto w-full py-4">
                    {action.label}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
