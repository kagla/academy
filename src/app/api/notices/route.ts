import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdminLoggedIn } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let whereClause = '';
    const queryParams: any[] = [];

    if (search) {
      whereClause = 'WHERE title LIKE ? OR content LIKE ?';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) as total FROM notices ${whereClause}`,
      queryParams
    ) as any;
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

    const [notices] = await pool.execute(
      `SELECT id, title, author, is_pinned, views, created_at, updated_at
       FROM notices ${whereClause}
       ORDER BY is_pinned DESC, created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, String(limit), String(offset)]
    ) as any;

    return NextResponse.json({ notices, total, totalPages });
  } catch (error) {
    console.error('Notices GET error:', error);
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

    const { title, content, author, is_pinned } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { message: '제목과 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute(
      'INSERT INTO notices (title, content, author, is_pinned) VALUES (?, ?, ?, ?)',
      [title, content, author || '관리자', is_pinned ? 1 : 0]
    ) as any;

    return NextResponse.json(
      { message: '공지사항이 등록되었습니다.', id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Notices POST error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
