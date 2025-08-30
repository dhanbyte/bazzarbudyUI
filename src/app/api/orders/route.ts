import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = 'http://localhost:5000/api/orders';
    
    console.log('🔄 Fetching orders from backend:', backendUrl);
    
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
    console.log(`✅ Orders fetched: ${data.data?.length || 0} items`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error in orders API route:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders', data: [] },
      { status: 500 }
    );
  }
}
