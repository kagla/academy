"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  ChevronDown,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavDropdownItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  children?: NavDropdownItem[];
}

const navigation: NavItem[] = [
  { label: "학원소개", href: "/" },
  {
    label: "커뮤니티",
    children: [
      { label: "공지사항", href: "/community/notice" },
      { label: "학부모게시판", href: "/community/parent" },
    ],
  },
  {
    label: "입학안내",
    children: [
      { label: "문의게시판", href: "/entrance/qna" },
      { label: "상담신청", href: "/entrance/consultation" },
    ],
  },
  {
    label: "학습/생활",
    children: [
      { label: "식단표", href: "/learn/meal-plan" },
    ],
  },
  { label: "합격스토리", href: "/story/success" },
];

function DesktopNavItem({ item }: { item: NavItem }) {
  if (item.children) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground focus:outline-none">
            {item.label}
            <ChevronDown className="size-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" sideOffset={8}>
          {item.children.map((child) => (
            <DropdownMenuItem key={child.href} asChild>
              <Link href={child.href} className="cursor-pointer">
                {child.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Link
      href={item.href!}
      className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
    >
      {item.label}
    </Link>
  );
}

function MobileNavItem({
  item,
  onClose,
}: {
  item: NavItem;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
        >
          {item.label}
          <ChevronDown
            className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <div className="ml-4 flex flex-col gap-1 border-l pl-3">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={onClose}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href!}
      onClick={onClose}
      className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
    >
      {item.label}
    </Link>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <GraduationCap className="size-7 text-primary" />
          <span className="text-xl font-bold tracking-tight">명문학원</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="메인 내비게이션">
          {navigation.map((item) => (
            <DesktopNavItem key={item.label} item={item} />
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/admin">
              <ShieldCheck className="size-4" />
              관리자
            </Link>
          </Button>

          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="메뉴 열기">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <GraduationCap className="size-5 text-primary" />
                  명문학원
                </SheetTitle>
              </SheetHeader>
              <Separator />
              <nav className="flex flex-col gap-1 px-2 py-4" aria-label="모바일 내비게이션">
                {navigation.map((item) => (
                  <MobileNavItem
                    key={item.label}
                    item={item}
                    onClose={() => setMobileMenuOpen(false)}
                  />
                ))}
              </nav>
              <Separator />
              <div className="px-2 py-4">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShieldCheck className="size-4" />
                    관리자
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
