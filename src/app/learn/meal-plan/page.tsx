"use client";

import { useState, useEffect, useCallback } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  addDays,
} from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MealPlan {
  date: string;
  breakfast: string[];
  lunch: string[];
  dinner: string[];
}

interface MealPlanResponse {
  data: MealPlan[];
  weekStart: string;
  weekEnd: string;
}

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];
const MEAL_TYPES = [
  { key: "breakfast" as const, label: "조식" },
  { key: "lunch" as const, label: "중식" },
  { key: "dinner" as const, label: "석식" },
];

export default function MealPlanPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const fetchMealPlans = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: format(weekStart, "yyyy-MM-dd"),
        endDate: format(weekEnd, "yyyy-MM-dd"),
      });
      const res = await fetch(`/api/meal-plans?${params}`);
      if (!res.ok) throw new Error("Failed to fetch meal plans");
      const data: MealPlanResponse = await res.json();
      setMealPlans(data.data || []);
    } catch {
      setMealPlans([]);
    } finally {
      setLoading(false);
    }
  }, [weekStart.toISOString(), weekEnd.toISOString()]);

  useEffect(() => {
    fetchMealPlans();
  }, [fetchMealPlans]);

  const goToPrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToThisWeek = () => setCurrentDate(new Date());

  const getMealForDay = (dayIndex: number, mealType: "breakfast" | "lunch" | "dinner"): string[] => {
    const targetDate = format(addDays(weekStart, dayIndex), "yyyy-MM-dd");
    const plan = mealPlans.find((p) => p.date === targetDate);
    if (!plan) return [];
    return plan[mealType] || [];
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">식단표</h1>

      {/* Week Navigation */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <Button variant="outline" size="icon" onClick={goToPrevWeek}>
          <ChevronLeft className="size-4" />
        </Button>
        <Button variant="outline" onClick={goToThisWeek} className="gap-2">
          <CalendarDays className="size-4" />
          이번 주
        </Button>
        <Button variant="outline" size="icon" onClick={goToNextWeek}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <p className="text-center text-muted-foreground mb-6">
        {format(weekStart, "yyyy년 MM월 dd일", { locale: ko })} ~{" "}
        {format(weekEnd, "yyyy년 MM월 dd일", { locale: ko })}
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium w-[80px]">구분</th>
                  {DAYS.map((day, i) => (
                    <th key={day} className="p-3 text-center font-medium">
                      <div>{day}</div>
                      <div className="text-xs text-muted-foreground font-normal">
                        {format(addDays(weekStart, i), "MM/dd")}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MEAL_TYPES.map((meal) => (
                  <tr key={meal.key} className="border-b last:border-0">
                    <td className="p-3 font-medium bg-muted/30">{meal.label}</td>
                    {DAYS.map((_, dayIndex) => {
                      const items = getMealForDay(dayIndex, meal.key);
                      return (
                        <td key={dayIndex} className="p-3 text-center align-top">
                          {items.length > 0 ? (
                            <div className="space-y-0.5">
                              {items.map((item, idx) => (
                                <div key={idx} className="text-sm">
                                  {item}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {DAYS.map((day, dayIndex) => {
              const hasAnyMeal = MEAL_TYPES.some(
                (meal) => getMealForDay(dayIndex, meal.key).length > 0
              );

              return (
                <div key={day} className="rounded-lg border overflow-hidden">
                  <div className="bg-muted/50 px-4 py-2.5 font-medium flex items-center justify-between">
                    <span>{day}요일</span>
                    <span className="text-sm text-muted-foreground">
                      {format(addDays(weekStart, dayIndex), "MM월 dd일", { locale: ko })}
                    </span>
                  </div>
                  {hasAnyMeal ? (
                    <div className="divide-y">
                      {MEAL_TYPES.map((meal) => {
                        const items = getMealForDay(dayIndex, meal.key);
                        return (
                          <div key={meal.key} className="px-4 py-3 flex gap-3">
                            <span className="font-medium text-sm w-10 shrink-0">
                              {meal.label}
                            </span>
                            <span className="text-sm">
                              {items.length > 0 ? items.join(", ") : "-"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                      등록된 식단이 없습니다.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
