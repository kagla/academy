"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  MessageCircleQuestion,
  CalendarCheck,
  UtensilsCrossed,
  Trophy,
  LogOut,
  Menu,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/notices", label: "공지사항 관리", icon: Megaphone },
  { href: "/admin/parent-posts", label: "학부모게시판 관리", icon: Users },
  { href: "/admin/qna", label: "문의게시판 관리", icon: MessageCircleQuestion },
  { href: "/admin/consultations", label: "상담신청 관리", icon: CalendarCheck },
  { href: "/admin/meal-plans", label: "식단표 관리", icon: UtensilsCrossed },
  { href: "/admin/success-stories", label: "합격수기 관리", icon: Trophy },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoginPage = pathname === "/admin";

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/check", {
          credentials: "include",
        });
        const data = await res.json();

        if (!data.isAdmin) {
          router.replace("/admin");
        } else {
          setIsAdmin(true);
        }
      } catch {
        router.replace("/admin");
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
      toast.success("로그아웃 되었습니다.");
      router.replace("/admin");
    } catch {
      toast.error("로그아웃에 실패했습니다.");
    }
  };

  if (isLoginPage) {
    return (
      <>
        <Toaster position="top-center" />
        {children}
      </>
    );
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-5">
        <Shield className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">학원 관리자</span>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Separator />
      <div className="p-3">
        <button
          onClick={() => {
            onNavigate?.();
            handleLogout();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          로그아웃
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Toaster position="top-center" />

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Header + Sheet */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-card px-4 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">메뉴 열기</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>관리자 메뉴</SheetTitle>
              </SheetHeader>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold">학원 관리자</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
