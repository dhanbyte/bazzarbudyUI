import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = 'http://localhost:5000/api/auth/login';
    
    console.log('🔄 Forwarding login request to backend');
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful');
      return NextResponse.json(data);
    } else {
      console.log('❌ Login failed:', data.message);
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('❌ Error in login API route:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    );
  }
}
