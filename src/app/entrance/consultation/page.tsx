"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export default function ConsultationPage() {
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({
    student_name: "",
    phone: "",
    parent_phone: "",
    grade: "",
    dormitory: "",
    desired_date: "",
    desired_time: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    if (!form.student_name.trim()) {
      toast.error("학생 이름을 입력해주세요.");
      return false;
    }
    if (!form.phone.trim()) {
      toast.error("연락처를 입력해주세요.");
      return false;
    }
    const phoneRegex = /^[0-9]{2,3}-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!phoneRegex.test(form.phone.replace(/\s/g, ""))) {
      toast.error("올바른 연락처 형식을 입력해주세요. (예: 010-1234-5678)");
      return false;
    }
    if (!form.grade) {
      toast.error("학년을 선택해주세요.");
      return false;
    }
    if (!form.dormitory) {
      toast.error("기숙사 이용 여부를 선택해주세요.");
      return false;
    }
    if (!agreed) {
      toast.error("개인정보 수집에 동의해주세요.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "상담 신청에 실패했습니다.");
      }

      toast.success("상담 신청이 완료되었습니다. 빠른 시일 내에 연락드리겠습니다.");
      setForm({
        student_name: "",
        phone: "",
        parent_phone: "",
        grade: "",
        dormitory: "",
        desired_date: "",
        desired_time: "",
        message: "",
      });
      setAgreed(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "상담 신청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const grades = [
    { value: "예비고1", label: "예비고1" },
    { value: "예비고2", label: "예비고2" },
    { value: "예비고3", label: "예비고3" },
    { value: "재학생", label: "재학생" },
  ];

  const dormOptions = [
    { value: "이용", label: "이용" },
    { value: "미이용", label: "미이용" },
  ];

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">상담 신청</h1>
      <p className="text-muted-foreground mb-8">
        상담을 원하시는 분은 아래 양식을 작성해주세요.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="student_name">
            학생 이름 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="student_name"
            name="student_name"
            placeholder="학생 이름을 입력하세요"
            value={form.student_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">
              연락처 <span className="text-destructive">*</span>
            </Label>
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
            <Label htmlFor="parent_phone">학부모 연락처</Label>
            <Input
              id="parent_phone"
              name="parent_phone"
              placeholder="010-1234-5678"
              value={form.parent_phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>
            학년 <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-wrap gap-4">
            {grades.map((grade) => (
              <label
                key={grade.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="grade"
                  value={grade.value}
                  checked={form.grade === grade.value}
                  onChange={handleChange}
                  className="size-4 accent-primary"
                />
                <span className="text-sm">{grade.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>
            기숙사 <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-wrap gap-4">
            {dormOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="dormitory"
                  value={option.value}
                  checked={form.dormitory === option.value}
                  onChange={handleChange}
                  className="size-4 accent-primary"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="desired_date">상담 희망일</Label>
            <Input
              id="desired_date"
              name="desired_date"
              type="date"
              value={form.desired_date}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desired_time">상담 희망 시간</Label>
            <Input
              id="desired_time"
              name="desired_time"
              placeholder="예: 오후 2시"
              value={form.desired_time}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">상담 내용</Label>
          <Textarea
            id="message"
            name="message"
            placeholder="상담 내용을 입력하세요"
            value={form.message}
            onChange={handleChange}
            className="min-h-[150px]"
          />
        </div>

        <div className="rounded-md border p-4 bg-muted/30">
          <div className="flex items-start gap-3">
            <Checkbox
              id="agree"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor="agree" className="cursor-pointer text-sm leading-relaxed font-normal">
              [필수] 개인정보 수집 및 이용에 동의합니다. 수집 항목: 이름, 연락처, 학년.
              수집 목적: 상담 진행 및 안내. 보유 기간: 상담 완료 후 1년.
            </Label>
          </div>
        </div>

        <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
          {loading && <Loader2 className="size-4 animate-spin" />}
          상담 신청
        </Button>
      </form>
    </div>
  );
}
