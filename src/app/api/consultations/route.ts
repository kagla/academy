import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdminLoggedIn } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const admin = await isAdminLoggedIn();
    if (!admin) {
      return NextResponse.json(
        { message: '관리자 권한이 필요합니다.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const offset = (page - 1) * limit;

    const [countRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM consultations'
    ) as any;
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

    const [consultations] = await pool.execute(
      `SELECT id, parent_name, student_name, phone, email, subject, status, created_at, updated_at
       FROM consultations
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [String(limit), String(offset)]
    ) as any;

    return NextResponse.json({ consultations, total, totalPages });
  } catch (error) {
    console.error('Consultations GET error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { parent_name, student_name, phone, email, subject, message } = await request.json();

    if (!parent_name || !student_name || !phone || !subject) {
      return NextResponse.json(
        { message: '필수 항목을 입력해주세요.' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute(
      'INSERT INTO consultations (parent_name, student_name, phone, email, subject, message) VALUES (?, ?, ?, ?, ?, ?)',
      [parent_name, student_name, phone, email || null, subject, message || null]
    ) as any;

    return NextResponse.json(
      { message: '상담 신청이 접수되었습니다.', id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Consultations POST error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
