import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');
    
    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      );
    }

    const backendUrl = `http://localhost:5000/api/wishlist?phoneNumber=${phoneNumber}`;
    
    console.log('🔄 Fetching wishlist from backend:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Wishlist fetched successfully');
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('❌ Error in wishlist GET API route:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = 'http://localhost:5000/api/wishlist';
    
    console.log('🔄 Updating wishlist in backend');
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Wishlist updated successfully');
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('❌ Error in wishlist POST API route:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update wishlist' },
      { status: 500 }
    );
  }
}
