import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Process Wallet Payment
 * POST /api/payments/process-wallet-payment
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const token = request.headers.get('authorization');

        const response = await fetch(`${BACKEND_URL}/payments/process-wallet-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token || '',
            },
            body: JSON.stringify(body),
        });

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
