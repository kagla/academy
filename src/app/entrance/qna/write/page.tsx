"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function QnaWritePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    author: "",
    password: "",
    phone: "",
    title: "",
    content: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    if (!form.author.trim()) {
      toast.error("작성자를 입력해주세요.");
      return false;
    }
    if (!form.password.trim()) {
      toast.error("비밀번호를 입력해주세요.");
      return false;
    }
    if (!form.phone.trim()) {
      toast.error("연락처를 입력해주세요.");
      return false;
    }
    const phoneRegex = /^[0-9]{2,3}-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!phoneRegex.test(form.phone.replace(/\s/g, ""))) {
      toast.error("올바른 연락처를 입력해주세요.");
      return false;
    }
    if (!form.title.trim()) {
      toast.error("제목을 입력해주세요.");
      return false;
    }
    if (!form.content.trim()) {
      toast.error("내용을 입력해주세요.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/qna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "문의 등록에 실패했습니다.");
      }

      toast.success("문의가 등록되었습니다.");
      router.push("/entrance/qna");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "문의 등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">문의하기</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="author">작성자</Label>
            <Input
              id="author"
              name="author"
              placeholder="이름을 입력하세요"
              value={form.author}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">연락처</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="010-1234-5678"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">제목</Label>
          <Input
            id="title"
            name="title"
            placeholder="제목을 입력하세요"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">내용</Label>
          <Textarea
            id="content"
            name="content"
            placeholder="문의 내용을 입력하세요"
            value={form.content}
            onChange={handleChange}
            className="min-h-[200px]"
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            등록
          </Button>
          <Button variant="outline" type="button" asChild>
            <Link href="/entrance/qna">
              <ArrowLeft className="size-4" />
              취소
            </Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
