import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/backend/modules/auth/services/auth.service';
import { LoginRequest, ApiResponse } from '@/backend/types/api.types';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const authService = new AuthService();
    
    const result = await authService.login(body);
    
    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Login successful',
    };
    
    return NextResponse.json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Login failed',
    };
    return NextResponse.json(response, { status: 400 });
  }
}
