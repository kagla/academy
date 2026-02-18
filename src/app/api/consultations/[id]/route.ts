import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdminLoggedIn } from '@/lib/auth';

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
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { message: '상태를 입력해주세요.' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute(
      'UPDATE consultations SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    ) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: '상담 신청을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '상담 상태가 업데이트되었습니다.' });
  } catch (error) {
    console.error('Consultation PUT error:', error);
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
      'DELETE FROM consultations WHERE id = ?',
      [id]
    ) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: '상담 신청을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '상담 신청이 삭제되었습니다.' });
  } catch (error) {
    console.error('Consultation DELETE error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
