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

    const backendUrl = `http://localhost:5000/api/cart?phoneNumber=${phoneNumber}`;
    
    console.log('🔄 Fetching cart from backend:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Cart fetched successfully');
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('❌ Error in cart GET API route:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = 'http://localhost:5000/api/cart';
    
    console.log('🔄 Updating cart in backend');
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Cart updated successfully');
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('❌ Error in cart POST API route:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update cart' },
      { status: 500 }
    );
  }
}
