import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    // Build query parameters for backend
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    
    const backendUrl = `http://localhost:5000/api/products${params.toString() ? `?${params.toString()}` : ''}`;
    
    console.log('🔄 Fetching products from backend:', backendUrl);
    
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
    
    // Handle backend response format
    if (data.success && data.data && data.data.products) {
      console.log(`✅ Products fetched: ${data.data.products.length} items`);
      return NextResponse.json({
        success: true,
        data: data.data.products
      });
    } else if (data.success && Array.isArray(data.data)) {
      console.log(`✅ Products fetched: ${data.data.length} items`);
      return NextResponse.json({
        success: true,
        data: data.data
      });
    } else {
      console.log('⚠️ Unexpected backend response format:', data);
      return NextResponse.json({
        success: false,
        data: [],
        message: 'No products found'
      });
    }
  } catch (error) {
    console.error('❌ Error in products API route:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products', data: [] },
      { status: 500 }
    );
  }
}
