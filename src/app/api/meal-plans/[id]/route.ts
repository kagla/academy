import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdminLoggedIn } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await isAdminLoggedIn();
    if (!admin) {
      return NextResponse.json(
        { message: '관리자 권한이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const [result] = await pool.execute(
      'DELETE FROM meal_plans WHERE id = ?',
      [id]
    ) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: '식단을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '식단이 삭제되었습니다.' });
  } catch (error) {
    console.error('Meal plan DELETE error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
