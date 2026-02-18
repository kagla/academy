import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdminLoggedIn } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [rows] = await pool.execute(
      'SELECT * FROM success_stories WHERE id = ?',
      [id]
    ) as any;

    if (rows.length === 0) {
      return NextResponse.json(
        { message: '합격 수기를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Success story GET error:', error);
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
    const { student_name, school_name, content, year } = await request.json();

    if (!student_name || !content) {
      return NextResponse.json(
        { message: '학생 이름과 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute(
      'UPDATE success_stories SET student_name = ?, school_name = ?, content = ?, year = ?, updated_at = NOW() WHERE id = ?',
      [student_name, school_name || null, content, year || new Date().getFullYear(), id]
    ) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: '합격 수기를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '합격 수기가 수정되었습니다.' });
  } catch (error) {
    console.error('Success story PUT error:', error);
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
      'DELETE FROM success_stories WHERE id = ?',
      [id]
    ) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: '합격 수기를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '합격 수기가 삭제되었습니다.' });
  } catch (error) {
    console.error('Success story DELETE error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
