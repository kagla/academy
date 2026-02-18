import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdminLoggedIn } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    // Calculate the Monday of the target week
    let targetDate: Date;
    if (dateParam) {
      targetDate = new Date(dateParam);
    } else {
      targetDate = new Date();
    }

    // Get Monday of the week
    const day = targetDate.getDay();
    const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(targetDate);
    monday.setDate(diff);

    // Get Friday of the week
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    const mondayStr = monday.toISOString().split('T')[0];
    const fridayStr = friday.toISOString().split('T')[0];

    const [mealPlans] = await pool.execute(
      `SELECT id, meal_date, meal_type, menu_items, calories, allergens
       FROM meal_plans
       WHERE meal_date >= ? AND meal_date <= ?
       ORDER BY meal_date ASC, FIELD(meal_type, 'breakfast', 'lunch', 'dinner', 'snack')`,
      [mondayStr, fridayStr]
    ) as any;

    // Group by date
    const grouped: Record<string, any[]> = {};
    for (const plan of mealPlans) {
      const dateKey = new Date(plan.meal_date).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(plan);
    }

    return NextResponse.json({
      mealPlans: grouped,
      weekStart: mondayStr,
      weekEnd: fridayStr,
    });
  } catch (error) {
    console.error('Meal plans GET error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await isAdminLoggedIn();
    if (!admin) {
      return NextResponse.json(
        { message: '관리자 권한이 필요합니다.' },
        { status: 401 }
      );
    }

    const { meal_date, meal_type, menu_items, calories, allergens } = await request.json();

    if (!meal_date || !meal_type || !menu_items) {
      return NextResponse.json(
        { message: '날짜, 식사 유형, 메뉴를 입력해주세요.' },
        { status: 400 }
      );
    }

    // UPSERT: Insert or update on duplicate (meal_date, meal_type)
    const [result] = await pool.execute(
      `INSERT INTO meal_plans (meal_date, meal_type, menu_items, calories, allergens)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       menu_items = VALUES(menu_items),
       calories = VALUES(calories),
       allergens = VALUES(allergens),
       updated_at = NOW()`,
      [meal_date, meal_type, menu_items, calories || null, allergens || null]
    ) as any;

    return NextResponse.json(
      { message: '식단이 등록되었습니다.', id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Meal plans POST error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
