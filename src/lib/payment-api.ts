// src/lib/payment-api.ts
/**
 * Payment API Client
 * Handles order preparation for payment and payment processing
 */

import { api } from './api';

export interface PlayerInformation {
    userId: number;
    email: string;
    gameUid?: string;
}

export interface OrderAmounts {
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
}

export interface PaymentOrderData {
    orderId: number;
    orderDetails: {
        gameName: string;
        packageName: string;
        packageDescription?: string;
    };
    packageId: number;
    playerInformation: PlayerInformation;
    email: string;
    couponCode?: string;
    amounts: OrderAmounts;
    createdAt: string;
    status: string;
}

export interface PreparePaymentResponse {
    success: boolean;
    message: string;
    data?: PaymentOrderData;
    errors?: string[];
}

/**
 * Prepare order data for payment page
 * ดึงข้อมูลคำสั่งซื้อที่เตรียมไว้สำหรับหน้าชำระเงิน
 * @param orderId - Order ID
 * @param userId - User ID
 * @returns Payment order data with all required information
 */
export const prepareOrderForPayment = async (
    orderId: number,
    userId: number
): Promise<PreparePaymentResponse> => {
    try {
        const response = await api.get(`/orders/prepare-payment?orderId=${orderId}&userId=${userId}`);
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to prepare order for payment',
            errors: [error instanceof Error ? error.message : 'Unknown error'],
        };
    }
};

/**
 * Validate top-up data before creating order
 * ตรวจสอบข้อมูลการเติมเกมก่อนสร้างคำสั่งซื้อ
 * @param userId - User ID
 * @param validationData - Top-up validation data
 * @returns Validation response
 */
export const validateTopup = async (
    userId: number,
    validationData: {
        gameId: number;
        packageId: number;
        email: string;
        playerFields: Array<{ key: string; value: string }>;
        couponCode?: string;
    }
) => {
    try {
        const response = await api.post(`/orders/validate-topup?userId=${userId}`, validationData);
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Validation failed',
            errors: [error instanceof Error ? error.message : 'Unknown error'],
        };
    }
};

/**
 * Create order with validation
 * สร้างคำสั่งซื้อพร้อมกับการตรวจสอบข้อมูล
 * @param userId - User ID
 * @param validationData - Top-up validation data
 * @returns Created order response
 */
export const createOrderWithValidation = async (
    userId: number,
    validationData: {
        gameId: number;
        packageId: number;
        email: string;
        playerFields: Array<{ key: string; value: string }>;
        couponCode?: string;
    }
) => {
    try {
        const response = await api.post(
            `/orders/create-with-validation?userId=${userId}`,
            validationData
        );
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to create order',
            errors: [error instanceof Error ? error.message : 'Unknown error'],
        };
    }
};

/**
 * Process wallet payment
 * ประมวลผลการชำระเงินจากกระเป๋าเงิน Gacha
 */
export const processWalletPayment = async (
    orderId: number,
    amount: number
) => {
    try {
        const response = await api.post('/payments/process-wallet-payment', {
            orderId,
            amount,
            paymentMethod: 'gacha_wallet',
        });
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Wallet payment failed',
            errors: [error instanceof Error ? error.message : 'Unknown error'],
        };
    }
};

/**
 * Generate QR Code for payment
 * สร้าง QR Code สำหรับการชำระเงิน
 */
export const generateQRCode = async (
    orderId: number,
    amount: number,
    method: 'promptpay' | 'truemoney'
) => {
    try {
        const response = await api.post('/payments/generate-qr', {
            orderId,
            amount,
            method,
        });
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to generate QR code',
            errors: [error instanceof Error ? error.message : 'Unknown error'],
        };
    }
};

/**
 * Check payment status
 * ตรวจสอบสถานะการชำระเงิน
 */
export const checkPaymentStatus = async (orderId: number) => {
    try {
        const response = await api.get(`/payments/check-status?orderId=${orderId}`);
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to check payment status',
            errors: [error instanceof Error ? error.message : 'Unknown error'],
        };
    }
};

/**
 * Get wallet balance
 * ดึงยอดเงินในกระเป๋า Gacha
 */
export const getWalletBalance = async () => {
    try {
        const response = await api.get('/wallets/me/balance');
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to fetch wallet balance',
            data: { balance: 0 },
        };
    }
};
