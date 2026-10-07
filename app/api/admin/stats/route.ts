import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/backend/modules/admin/services/admin.service';
import { ApiResponse } from '@/backend/types/api.types';

export async function GET(request: NextRequest) {
  try {
    const adminService = new AdminService();
    const stats = await adminService.getDashboardStats();
    
    const response: ApiResponse = {
      success: true,
      data: stats,
    };
    
    return NextResponse.json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Failed to fetch stats',
    };
    return NextResponse.json(response, { status: 400 });
  }
}
