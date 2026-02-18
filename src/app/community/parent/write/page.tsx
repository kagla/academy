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
import { Checkbox } from "@/components/ui/checkbox";

export default function ParentWritePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    author: "",
    password: "",
    title: "",
    content: "",
    is_secret: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.author.trim()) {
      toast.error("작성자를 입력해주세요.");
      return;
    }
    if (!form.password.trim()) {
      toast.error("비밀번호를 입력해주세요.");
      return;
    }
    if (!form.title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }
    if (!form.content.trim()) {
      toast.error("내용을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/parent-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "게시글 작성에 실패했습니다.");
      }

      toast.success("게시글이 등록되었습니다.");
      router.push("/community/parent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "게시글 작성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">글쓰기</h1>

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
            placeholder="내용을 입력하세요"
            value={form.content}
            onChange={handleChange}
            className="min-h-[200px]"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="is_secret"
            checked={form.is_secret}
            onCheckedChange={(checked) =>
              setForm((prev) => ({ ...prev, is_secret: checked === true }))
            }
          />
          <Label htmlFor="is_secret" className="cursor-pointer">
            비밀글
          </Label>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            등록
          </Button>
          <Button variant="outline" type="button" asChild>
            <Link href="/community/parent">
              <ArrowLeft className="size-4" />
              취소
            </Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
