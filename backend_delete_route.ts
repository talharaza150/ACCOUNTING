import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { pool } from '@/lib/database';
import { authenticateRequest, requireAdmin } from '@/middleware/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const fileId = params.id;

    // Get file information first
    const fileResult = await pool.query(
      'SELECT * FROM files WHERE id = $1 AND is_active = true',
      [fileId]
    );

    if (fileResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const file = fileResult.rows[0];

    // Check permissions: Admin can delete any file, client can only delete their own files
    if (!requireAdmin(auth.user) && file.assigned_to !== auth.user!.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Mark file as inactive (soft delete) instead of hard delete
    await pool.query(
      'UPDATE files SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [fileId]
    );

    // Log the deletion action
    await pool.query(
      'INSERT INTO file_access_logs (file_id, user_id, action, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
      [
        fileId,
        auth.user!.id,
        'delete',
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      ]
    );

    // Optionally delete the physical file (commented out for safety - keeping files for recovery)
    // try {
    //   await unlink(file.file_path);
    // } catch (error) {
    //   console.warn('Could not delete physical file:', error);
    // }

    return NextResponse.json({
      message: 'File deleted successfully',
      fileId: fileId
    });

  } catch (error) {
    console.error('File deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}