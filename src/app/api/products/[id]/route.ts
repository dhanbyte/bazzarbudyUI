import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const backendUrl = `http://localhost:5000/api/products/${id}`;
    
    console.log('🔄 Fetching single product from backend:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, message: 'Product not found' },
          { status: 404 }
        );
      }
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    
    // Handle backend response format
    if (data.success && data.data) {
      console.log(`✅ Product fetched: ${data.data.name}`);
      return NextResponse.json({
        success: true,
        data: data.data
      });
    } else {
      console.log('⚠️ Unexpected backend response format:', data);
      return NextResponse.json({
        success: false,
        message: 'Product not found'
      }, { status: 404 });
    }
  } catch (error) {
    console.error('❌ Error in single product API route:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
