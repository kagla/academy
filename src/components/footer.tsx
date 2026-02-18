import Link from "next/link";
import {
  GraduationCap,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const quickLinks = [
  { label: "학원소개", href: "/" },
  { label: "공지사항", href: "/community/notice" },
  { label: "상담신청", href: "/entrance/consultation" },
  { label: "합격스토리", href: "/story/success" },
];

const supportLinks = [
  { label: "문의게시판", href: "/entrance/qna" },
  { label: "학부모게시판", href: "/community/parent" },
  { label: "식단표", href: "/learn/meal-plan" },
  { label: "관리자", href: "/admin" },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Academy info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <GraduationCap className="size-6 text-primary" />
              <span className="text-lg font-bold tracking-tight">명문학원</span>
            </Link>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              학생 한 명 한 명의 꿈을 실현하는 대입 전문 학원입니다.
              체계적인 커리큘럼과 전문 강사진이 함께합니다.
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>서울특별시 강남구 테헤란로 123 명문빌딩 3층</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 shrink-0" />
                <span>02-1234-5678</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="size-4 shrink-0" />
                <span>info@myungmoon.kr</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">바로가기</h3>
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">고객지원</h3>
            <ul className="flex flex-col gap-2.5">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Operating hours */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">운영시간</h3>
            <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>평일</span>
                <span>09:00 - 22:00</span>
              </div>
              <div className="flex justify-between">
                <span>토요일</span>
                <span>09:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span>일요일/공휴일</span>
                <span>휴원</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} 명문학원. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="#" className="transition-colors hover:text-foreground">
              개인정보처리방침
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              이용약관
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
