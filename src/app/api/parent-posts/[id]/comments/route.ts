import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [comments] = await pool.execute(
      `SELECT id, post_id, author, content, created_at
       FROM comments
       WHERE post_id = ?
       ORDER BY created_at ASC`,
      [id]
    ) as any;

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Comments GET error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { author, content, password } = await request.json();

    if (!content || !password) {
      return NextResponse.json(
        { message: '내용과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // Verify the post exists
    const [postRows] = await pool.execute(
      'SELECT id FROM parent_posts WHERE id = ?',
      [id]
    ) as any;

    if (postRows.length === 0) {
      return NextResponse.json(
        { message: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO comments (post_id, author, content, password) VALUES (?, ?, ?, ?)',
      [id, author || '익명', content, hashedPassword]
    ) as any;

    return NextResponse.json(
      { message: '댓글이 등록되었습니다.', id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Comments POST error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
