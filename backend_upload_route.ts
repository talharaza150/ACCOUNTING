import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { pool } from '@/lib/database';
import { authenticateRequest, requireAdmin } from '@/middleware/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const assignedTo = formData.get('assignedTo') as string;
    const categoryId = formData.get('categoryId') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // For admin users, assignedTo is required and can be any user
    // For client users, they can only upload files for themselves
    let finalAssignedTo = assignedTo;
    
    if (requireAdmin(auth.user)) {
      if (!assignedTo) {
        return NextResponse.json(
          { error: 'Assigned user is required for admin uploads' },
          { status: 400 }
        );
      }
      
      // Verify assigned user exists
      const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [assignedTo]);
      if (userCheck.rows.length === 0) {
        return NextResponse.json(
          { error: 'Assigned user not found' },
          { status: 400 }
        );
      }
    } else {
      // Client users can only upload files for themselves
      finalAssignedTo = auth.user!.id;
    }

    // Create unique filename
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    
    // Create upload directory if it doesn't exist
    const uploadDir = process.env.UPLOAD_DIR || '/root/portal2/uploads';
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = join(uploadDir, uniqueFilename);
    
    // Write file to disk
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Save file info to database
    const result = await pool.query(
      `INSERT INTO files (filename, original_name, file_path, file_size, mime_type, category_id, uploaded_by, assigned_to, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING id, filename, original_name, file_size, created_at`,
      [
        uniqueFilename,
        file.name,
        filePath,
        file.size,
        file.type || 'application/octet-stream',
        categoryId || null,
        auth.user!.id,
        finalAssignedTo,
        description || null
      ]
    );

    // Log the upload action
    await pool.query(
      'INSERT INTO file_access_logs (file_id, user_id, action, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
      [
        result.rows[0].id,
        auth.user!.id,
        'upload',
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      ]
    );

    return NextResponse.json({
      message: 'File uploaded successfully',
      file: result.rows[0]
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}