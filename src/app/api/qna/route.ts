import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

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
      `SELECT COUNT(*) as total FROM qna_posts ${whereClause}`,
      queryParams
    ) as any;
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

    const [posts] = await pool.execute(
      `SELECT id, title, author, is_answered, views, created_at, updated_at
       FROM qna_posts ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, String(limit), String(offset)]
    ) as any;

    return NextResponse.json({ posts, total, totalPages });
  } catch (error) {
    console.error('QnA GET error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, author, password } = await request.json();

    if (!title || !content || !password) {
      return NextResponse.json(
        { message: '제목, 내용, 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO qna_posts (title, content, author, password) VALUES (?, ?, ?, ?)',
      [title, content, author || '익명', hashedPassword]
    ) as any;

    return NextResponse.json(
      { message: '질문이 등록되었습니다.', id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('QnA POST error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
