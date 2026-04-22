import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Get Wallet Balance
 * GET /api/wallets/balance
 */
export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization');

        const response = await fetch(`${BACKEND_URL}/wallets/me/balance`, {
            method: 'GET',
            headers: {
                'Authorization': token || '',
            },
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Server error',
                data: { balance: 0 },
            },
            { status: 500 }
        );
    }
}
