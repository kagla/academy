import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { isAdminLoggedIn } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await pool.execute('UPDATE parent_posts SET views = views + 1 WHERE id = ?', [id]);

    const [rows] = await pool.execute(
      'SELECT id, title, content, author, views, created_at, updated_at FROM parent_posts WHERE id = ?',
      [id]
    ) as any;

    if (rows.length === 0) {
      return NextResponse.json(
        { message: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Parent post GET error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title, content, author, password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { message: '비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute(
      'SELECT password FROM parent_posts WHERE id = ?',
      [id]
    ) as any;

    if (rows.length === 0) {
      return NextResponse.json(
        { message: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const isValid = await bcrypt.compare(password, rows[0].password);
    if (!isValid) {
      return NextResponse.json(
        { message: '비밀번호가 올바르지 않습니다.' },
        { status: 403 }
      );
    }

    if (!title || !content) {
      return NextResponse.json(
        { message: '제목과 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    await pool.execute(
      'UPDATE parent_posts SET title = ?, content = ?, author = ?, updated_at = NOW() WHERE id = ?',
      [title, content, author || '익명', id]
    );

    return NextResponse.json({ message: '게시글이 수정되었습니다.' });
  } catch (error) {
    console.error('Parent post PUT error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const admin = await isAdminLoggedIn();

    if (!admin) {
      const { password } = await request.json();

      if (!password) {
        return NextResponse.json(
          { message: '비밀번호를 입력해주세요.' },
          { status: 400 }
        );
      }

      const [rows] = await pool.execute(
        'SELECT password FROM parent_posts WHERE id = ?',
        [id]
      ) as any;

      if (rows.length === 0) {
        return NextResponse.json(
          { message: '게시글을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      const isValid = await bcrypt.compare(password, rows[0].password);
      if (!isValid) {
        return NextResponse.json(
          { message: '비밀번호가 올바르지 않습니다.' },
          { status: 403 }
        );
      }
    }

    const [result] = await pool.execute(
      'DELETE FROM parent_posts WHERE id = ?',
      [id]
    ) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '게시글이 삭제되었습니다.' });
  } catch (error) {
    console.error('Parent post DELETE error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
