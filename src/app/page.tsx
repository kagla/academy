import Link from "next/link";
import {
  GraduationCap,
  Trophy,
  Users,
  BookOpen,
  TrendingUp,
  Bell,
  MessageSquare,
  UtensilsCrossed,
  Medal,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* ------------------------------------------------------------------ */
/* Stats data                                                          */
/* ------------------------------------------------------------------ */

const stats = [
  {
    icon: Trophy,
    value: "95.8%",
    label: "대학 합격률",
    description: "2025학년도 기준",
  },
  {
    icon: Users,
    value: "320+",
    label: "재원생 수",
    description: "현재 등록 기준",
  },
  {
    icon: BookOpen,
    value: "15년",
    label: "교육 경력",
    description: "2010년 개원",
  },
  {
    icon: TrendingUp,
    value: "1,200+",
    label: "누적 합격생",
    description: "서울 주요 대학",
  },
];

/* ------------------------------------------------------------------ */
/* Quick links data                                                    */
/* ------------------------------------------------------------------ */

const quickLinks = [
  {
    icon: Bell,
    title: "공지사항",
    description: "학원 소식과 주요 공지를 확인하세요",
    href: "/community/notice",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    icon: MessageSquare,
    title: "상담신청",
    description: "입학 상담을 신청하세요",
    href: "/entrance/consultation",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    icon: UtensilsCrossed,
    title: "식단표",
    description: "이번 주 식단을 확인하세요",
    href: "/learn/meal-plan",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    icon: Medal,
    title: "합격수기",
    description: "선배들의 합격 이야기를 읽어보세요",
    href: "/story/success",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/30",
  },
];

/* ------------------------------------------------------------------ */
/* Notice type                                                         */
/* ------------------------------------------------------------------ */

interface Notice {
  id: number;
  title: string;
  created_at: string;
  category?: string;
}

/* ------------------------------------------------------------------ */
/* Data fetching (server component)                                    */
/* ------------------------------------------------------------------ */

async function getRecentNotices(): Promise<Notice[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/notices?limit=5`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.notices ?? data ?? [];
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Page component                                                      */
/* ------------------------------------------------------------------ */

export default async function Home() {
  const notices = await getRecentNotices();

  return (
    <div className="flex flex-col">
      {/* ============================================================ */}
      {/* Hero Section                                                  */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 sm:py-28 lg:py-36">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
              <GraduationCap className="mr-1 size-3.5" />
              대입 전문 학원
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              꿈을 현실로 만드는
              <br />
              <span className="text-primary">명문학원</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              체계적인 커리큘럼과 전문 강사진이 학생 한 명 한 명의
              대입 성공을 함께 준비합니다.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/entrance/consultation">
                  상담신청
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/">학원소개</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Stats Section                                                 */}
      {/* ============================================================ */}
      <section className="border-y bg-muted/30 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex flex-col items-center text-center"
                >
                  <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="size-6 text-primary" />
                  </div>
                  <p className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm font-medium">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Recent Notices Section                                        */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                최근 공지사항
              </h2>
              <p className="mt-2 text-muted-foreground">
                학원의 최신 소식을 확인하세요
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/community/notice">
                전체보기
                <ChevronRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {notices.length > 0 ? (
                <ul className="divide-y">
                  {notices.map((notice, idx) => (
                    <li key={notice.id ?? idx}>
                      <Link
                        href={`/community/notice/${notice.id}`}
                        className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {notice.category && (
                            <Badge variant="outline" className="shrink-0 text-xs">
                              {notice.category}
                            </Badge>
                          )}
                          <span className="truncate text-sm font-medium">
                            {notice.title}
                          </span>
                        </div>
                        <time className="shrink-0 ml-4 text-xs text-muted-foreground">
                          {notice.created_at
                            ? new Date(notice.created_at).toLocaleDateString("ko-KR")
                            : ""}
                        </time>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Bell className="mb-3 size-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    등록된 공지사항이 없습니다.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-4 text-center sm:hidden">
            <Button variant="outline" size="sm" asChild>
              <Link href="/community/notice">
                공지사항 전체보기
                <ChevronRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Quick Links Section                                           */}
      {/* ============================================================ */}
      <section className="border-t bg-muted/20 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              빠른 메뉴
            </h2>
            <p className="mt-2 text-muted-foreground">
              자주 찾는 메뉴를 바로 이용하세요
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="group">
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardHeader>
                      <div
                        className={`mb-2 flex size-11 items-center justify-center rounded-lg ${item.bg}`}
                      >
                        <Icon className={`size-5 ${item.color}`} />
                      </div>
                      <CardTitle className="text-base group-hover:text-primary transition-colors">
                        {item.title}
                      </CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <span className="inline-flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        바로가기
                        <ArrowRight className="ml-1 size-3.5" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA Section                                                   */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="overflow-hidden bg-primary text-primary-foreground">
            <CardContent className="flex flex-col items-center gap-6 px-6 py-12 text-center sm:py-16">
              <GraduationCap className="size-12 opacity-90" />
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                지금 바로 상담을 시작하세요
              </h2>
              <p className="max-w-lg text-primary-foreground/80">
                학생에게 맞는 최적의 학습 전략을 함께 설계합니다.
                부담 없이 상담을 신청해 주세요.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  variant="secondary"
                  asChild
                >
                  <Link href="/entrance/consultation">
                    상담신청하기
                    <ArrowRight className="ml-1 size-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link href="/entrance/qna">문의하기</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
