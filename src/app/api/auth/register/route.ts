import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = 'http://localhost:5000/api/auth/register';
    
    console.log('🔄 Forwarding register request to backend');
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful');
      return NextResponse.json(data);
    } else {
      console.log('❌ Registration failed:', data.message);
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('❌ Error in register API route:', error);
    return NextResponse.json(
      { success: false, message: 'Registration failed' },
      { status: 500 }
    );
  }
}
