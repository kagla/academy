import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { postType, postId, password } = await request.json();

    if (!postType || !postId || !password) {
      return NextResponse.json(
        { verified: false, message: '필수 항목을 입력해주세요.' },
        { status: 400 }
      );
    }

    let tableName: string;
    if (postType === 'parent') {
      tableName = 'parent_posts';
    } else if (postType === 'qna') {
      tableName = 'qna_posts';
    } else {
      return NextResponse.json(
        { verified: false, message: '잘못된 게시판 유형입니다.' },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute(
      `SELECT password FROM ${tableName} WHERE id = ?`,
      [postId]
    ) as any;

    if (rows.length === 0) {
      return NextResponse.json(
        { verified: false, message: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const isValid = await bcrypt.compare(password, rows[0].password);

    return NextResponse.json({ verified: isValid });
  } catch (error) {
    console.error('Verify password error:', error);
    return NextResponse.json(
      { verified: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
