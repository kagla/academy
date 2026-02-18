import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdminLoggedIn } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const offset = (page - 1) * limit;

    const [countRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM success_stories'
    ) as any;
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

    const [stories] = await pool.execute(
      `SELECT id, student_name, school_name, content, year, created_at
       FROM success_stories
       ORDER BY year DESC, created_at DESC
       LIMIT ? OFFSET ?`,
      [String(limit), String(offset)]
    ) as any;

    return NextResponse.json({ stories, total, totalPages });
  } catch (error) {
    console.error('Success stories GET error:', error);
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

    const { student_name, school_name, content, year } = await request.json();

    if (!student_name || !content) {
      return NextResponse.json(
        { message: '학생 이름과 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute(
      'INSERT INTO success_stories (student_name, school_name, content, year) VALUES (?, ?, ?, ?)',
      [student_name, school_name || null, content, year || new Date().getFullYear()]
    ) as any;

    return NextResponse.json(
      { message: '합격 수기가 등록되었습니다.', id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Success stories POST error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
