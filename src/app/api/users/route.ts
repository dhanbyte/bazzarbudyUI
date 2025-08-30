import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = 'http://localhost:5000/api/users';
    
    console.log('🔄 Fetching users from backend:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Users fetched: ${data.data?.length || 0} items`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error in users API route:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users', data: [] },
      { status: 500 }
    );
  }
}
