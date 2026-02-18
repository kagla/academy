"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];
const DAYS_FULL = [
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
  "일요일",
];
const MEAL_TYPES = ["조식", "중식", "석식"];

interface MealPlanData {
  [key: string]: string;
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatWeekRange(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return `${formatDate(monday)} ~ ${formatDate(sunday)}`;
}

export default function AdminMealPlansPage() {
  const [currentMonday, setCurrentMonday] = useState<Date>(() =>
    getMonday(new Date())
  );
  const [mealData, setMealData] = useState<MealPlanData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getMealKey = (dayIndex: number, mealType: string): string => {
    return `${dayIndex}-${mealType}`;
  };

  const fetchMealPlans = useCallback(async () => {
    setLoading(true);
    try {
      const weekStart = formatDate(currentMonday);
      const res = await fetch(`/api/meal-plans?week_start=${weekStart}`, {
        credentials: "include",
      });
      const data = await res.json();

      const newMealData: MealPlanData = {};

      if (data.meals && Array.isArray(data.meals)) {
        data.meals.forEach(
          (meal: {
            day_of_week: number;
            meal_type: string;
            menu: string;
          }) => {
            const key = getMealKey(meal.day_of_week, meal.meal_type);
            newMealData[key] = meal.menu || "";
          }
        );
      }

      setMealData(newMealData);
    } catch {
      toast.error("식단표를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [currentMonday]);

  useEffect(() => {
    fetchMealPlans();
  }, [fetchMealPlans]);

  const handlePrevWeek = () => {
    setCurrentMonday((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const handleNextWeek = () => {
    setCurrentMonday((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const handleThisWeek = () => {
    setCurrentMonday(getMonday(new Date()));
  };

  const handleMealChange = (dayIndex: number, mealType: string, value: string) => {
    const key = getMealKey(dayIndex, mealType);
    setMealData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const meals: {
        day_of_week: number;
        meal_type: string;
        menu: string;
      }[] = [];

      DAYS.forEach((_, dayIndex) => {
        MEAL_TYPES.forEach((mealType) => {
          const key = getMealKey(dayIndex, mealType);
          const menu = mealData[key]?.trim() || "";
          if (menu) {
            meals.push({
              day_of_week: dayIndex,
              meal_type: mealType,
              menu,
            });
          }
        });
      });

      const res = await fetch("/api/meal-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          week_start: formatDate(currentMonday),
          meals,
        }),
      });

      if (res.ok) {
        toast.success("식단표가 저장되었습니다.");
      } else {
        const data = await res.json();
        toast.error(data.message || "저장에 실패했습니다.");
      }
    } catch {
      toast.error("서버 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">식단표 관리</h1>
          <p className="text-muted-foreground">주간 식단표를 작성하고 관리할 수 있습니다.</p>
        </div>
        <Button onClick={handleSave} disabled={saving || loading}>
          <Save className="mr-1 h-4 w-4" />
          {saving ? "저장 중..." : "저장"}
        </Button>
      </div>

      {/* Week Selector */}
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-4 sm:flex-row sm:justify-between">
          <Button variant="outline" size="sm" onClick={handlePrevWeek}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            이전 주
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {formatWeekRange(currentMonday)}
            </span>
            <Button variant="ghost" size="sm" onClick={handleThisWeek}>
              이번 주
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleNextWeek}>
            다음 주
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Meal Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Desktop Grid */}
          <div className="hidden overflow-x-auto lg:block">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-8 gap-2">
                {/* Header Row */}
                <div className="flex items-center justify-center rounded-md bg-muted p-2 font-medium text-sm">
                  <UtensilsCrossed className="mr-1 h-4 w-4" />
                  구분
                </div>
                {DAYS.map((day, i) => {
                  const date = new Date(currentMonday);
                  date.setDate(currentMonday.getDate() + i);
                  return (
                    <div
                      key={day}
                      className="flex flex-col items-center rounded-md bg-muted p-2 text-center"
                    >
                      <span className="text-sm font-medium">{DAYS_FULL[i]}</span>
                      <span className="text-xs text-muted-foreground">
                        {`${date.getMonth() + 1}/${date.getDate()}`}
                      </span>
                    </div>
                  );
                })}

                {/* Meal Rows */}
                {MEAL_TYPES.map((mealType) => (
                  <>
                    <div
                      key={`label-${mealType}`}
                      className="flex items-center justify-center rounded-md border bg-card p-2"
                    >
                      <Badge variant="outline">{mealType}</Badge>
                    </div>
                    {DAYS.map((_, dayIndex) => (
                      <div key={`${mealType}-${dayIndex}`}>
                        <Textarea
                          placeholder={`${DAYS[dayIndex]} ${mealType}`}
                          value={mealData[getMealKey(dayIndex, mealType)] || ""}
                          onChange={(e) =>
                            handleMealChange(dayIndex, mealType, e.target.value)
                          }
                          className="min-h-24 resize-none text-xs"
                        />
                      </div>
                    ))}
                  </>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile View - Cards per day */}
          <div className="space-y-4 lg:hidden">
            {DAYS.map((day, dayIndex) => {
              const date = new Date(currentMonday);
              date.setDate(currentMonday.getDate() + dayIndex);
              return (
                <Card key={day}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>{DAYS_FULL[dayIndex]}</span>
                      <span className="text-sm text-muted-foreground">
                        {`${date.getMonth() + 1}/${date.getDate()}`}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {MEAL_TYPES.map((mealType) => (
                      <div key={mealType} className="space-y-1.5">
                        <Badge variant="outline" className="text-xs">
                          {mealType}
                        </Badge>
                        <Textarea
                          placeholder={`${mealType} 메뉴를 입력하세요`}
                          value={
                            mealData[getMealKey(dayIndex, mealType)] || ""
                          }
                          onChange={(e) =>
                            handleMealChange(dayIndex, mealType, e.target.value)
                          }
                          className="min-h-20 resize-none text-sm"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
