import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Check Payment Status
 * GET /api/payments/check-status?orderId=123
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const orderId = searchParams.get('orderId');
        const token = request.headers.get('authorization');

        if (!orderId) {
            return NextResponse.json(
                { success: false, message: 'Order ID is required' },
                { status: 400 }
            );
        }

        const response = await fetch(
            `${BACKEND_URL}/payments/check-status?orderId=${orderId}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': token || '',
                },
            }
        );

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Server error',
            },
            { status: 500 }
        );
    }
}
