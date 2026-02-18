import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdminLoggedIn } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await pool.execute('UPDATE notices SET views = views + 1 WHERE id = ?', [id]);

    const [rows] = await pool.execute(
      'SELECT * FROM notices WHERE id = ?',
      [id]
    ) as any;

    if (rows.length === 0) {
      return NextResponse.json(
        { message: '공지사항을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Notice GET error:', error);
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
    const admin = await isAdminLoggedIn();
    if (!admin) {
      return NextResponse.json(
        { message: '관리자 권한이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { title, content, author, is_pinned } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { message: '제목과 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute(
      'UPDATE notices SET title = ?, content = ?, author = ?, is_pinned = ?, updated_at = NOW() WHERE id = ?',
      [title, content, author || '관리자', is_pinned ? 1 : 0, id]
    ) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: '공지사항을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '공지사항이 수정되었습니다.' });
  } catch (error) {
    console.error('Notice PUT error:', error);
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
    const admin = await isAdminLoggedIn();
    if (!admin) {
      return NextResponse.json(
        { message: '관리자 권한이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const [result] = await pool.execute(
      'DELETE FROM notices WHERE id = ?',
      [id]
    ) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: '공지사항을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '공지사항이 삭제되었습니다.' });
  } catch (error) {
    console.error('Notice DELETE error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
