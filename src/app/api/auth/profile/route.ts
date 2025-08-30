import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const backendUrl = 'http://localhost:5000/api/auth/profile';
    
    console.log('🔄 Fetching user profile from backend');
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Profile fetched successfully');
      return NextResponse.json(data);
    } else {
      console.log('❌ Profile fetch failed:', data.message);
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('❌ Error in profile API route:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
