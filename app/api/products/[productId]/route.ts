import { NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/lib/db/queries';
import type { UpdateProductRequest, GetProductResponse, ErrorResponse } from '@/lib/types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId: productIdStr } = await params;
    const productId = parseInt(productIdStr, 10);

    if (isNaN(productId)) {
      const errorResponse: ErrorResponse = {
        error: '유효하지 않은 제품 ID입니다',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const product = await getProductById(productId);

    if (!product) {
      const errorResponse: ErrorResponse = {
        error: '제품을 찾을 수 없습니다',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const response: GetProductResponse = product;

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error getting product:', error);

    const errorResponse: ErrorResponse = {
      error: '제품 조회에 실패했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId: productIdStr } = await params;
    const productId = parseInt(productIdStr, 10);

    if (isNaN(productId)) {
      const errorResponse: ErrorResponse = {
        error: '유효하지 않은 제품 ID입니다',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const body: UpdateProductRequest = await request.json();

    // Check if product exists
    const product = await getProductById(productId);
    if (!product) {
      const errorResponse: ErrorResponse = {
        error: '제품을 찾을 수 없습니다',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Update product
    await updateProduct(productId, body);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);

    const errorResponse: ErrorResponse = {
      error: '제품 업데이트에 실패했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId: productIdStr } = await params;
    const productId = parseInt(productIdStr, 10);

    if (isNaN(productId)) {
      const errorResponse: ErrorResponse = {
        error: '유효하지 않은 제품 ID입니다',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Check if product exists
    const product = await getProductById(productId);
    if (!product) {
      const errorResponse: ErrorResponse = {
        error: '제품을 찾을 수 없습니다',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Delete product
    await deleteProduct(productId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);

    const errorResponse: ErrorResponse = {
      error: '제품 삭제에 실패했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
