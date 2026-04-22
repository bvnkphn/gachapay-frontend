'use client';

import React from 'react';
import { XCircle, AlertTriangle, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';

interface PaymentFailedProps {
    orderId: number;
    gameName: string;
    packageName: string;
    amount: number;
    paymentMethod: string;
    failureReason: string;
    onRetry: () => void;
    onChangeMethod: () => void;
    onContactSupport: () => void;
    onGoBack: () => void;
}

export default function PaymentFailed({
    orderId,
    gameName,
    packageName,
    amount,
    paymentMethod,
    failureReason,
    onRetry,
    onChangeMethod,
    onContactSupport,
    onGoBack,
}: PaymentFailedProps) {
    const methodLabel = {
        gacha_wallet: '🎁 Gacha Wallet',
        promptpay: '📱 PromptPay',
        truemoney: '💳 TrueMoney Wallet',
    }[paymentMethod] || paymentMethod;

    const getFailureDetails = (reason: string) => {
        const reasons: Record<string, { title: string; description: string; suggestion: string }> = {
            insufficient_balance: {
                title: 'ยอดเงินไม่เพียงพอ',
                description: 'ยอดเงินในบัญชีของคุณไม่เพียงพอสำหรับการชำระเงินนี้',
                suggestion: 'โปรดเติมเงินเข้าบัญชีแล้วลองอีกครั้ง',
            },
            qr_expired: {
                title: 'QR Code หมดอายุ',
                description: 'QR Code สำหรับการชำระเงินหมดอายุแล้ว',
                suggestion: 'โปรดขอ QR Code ใหม่และสแกนในเวลาที่กำหนด',
            },
            payment_declined: {
                title: 'การชำระเงินถูกปฏิเสธ',
                description: 'ธนาคารหรือผู้ให้บริการชำระเงินของคุณปฏิเสธการทำรายการ',
                suggestion: 'โปรดตรวจสอบกับธนาคารของคุณและลองใหม่',
            },
            network_error: {
                title: 'ข้อผิดพลาดในการเชื่อมต่อ',
                description: 'เกิดปัญหาในการเชื่อมต่อกับระบบ',
                suggestion: 'โปรดตรวจสอบการเชื่อมต่อ Internet แล้วลองอีกครั้ง',
            },
            timeout: {
                title: 'หมดเวลาในการชำระเงิน',
                description: 'การชำระเงินใช้เวลานานเกินไปและหมดเวลา',
                suggestion: 'โปรดลองชำระเงินอีกครั้ง',
            },
        };

        return reasons[reason] || {
            title: 'การชำระเงินล้มเหลว',
            description: failureReason,
            suggestion: 'โปรดลองใหม่หรือติดต่อฝ่ายสนับสนุน',
        };
    };

    const details = getFailureDetails(failureReason);

    return (
        <div className="space-y-6 py-4">
            {/* Error Header */}
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <XCircle className="w-24 h-24 text-red-500" />
                </div>

                <div>
                    <h1 className="text-3xl font-bold text-gray-900">การชำระเงินล้มเหลว</h1>
                    <p className="text-gray-600 mt-1">Payment Failed</p>
                </div>
            </div>

            {/* Failure Details Card */}
            <div className="rounded-2xl bg-red-50 border border-red-200 p-6 space-y-4">
                <div className="flex gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h2 className="text-lg font-bold text-red-700">{details.title}</h2>
                        <p className="text-red-600 text-sm mt-1">{details.description}</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-red-200">
                    <p className="text-sm text-red-700">
                        💡 <span className="font-medium">คำแนะนำ:</span> {details.suggestion}
                    </p>
                </div>
            </div>

            {/* Order Summary */}
            <div className="rounded-lg bg-white border border-gray-200 p-6 space-y-4">
                <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide">รายละเอียดคำสั่งซื้อ</p>

                <div className="space-y-3">
                    <div className="flex justify-between items-start pb-3 border-b">
                        <div>
                            <p className="text-xs text-gray-600 mb-1">เกม</p>
                            <p className="font-semibold text-gray-900">{gameName}</p>
                            <p className="text-xs text-gray-600 mt-1">{packageName}</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-gray-700">จำนวนเงิน</span>
                        <span className="font-semibold text-gray-900">฿{amount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-gray-700">ช่องทาง</span>
                        <span className="font-semibold text-gray-900">{methodLabel}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-gray-700">หมายเลขคำสั่งซื้อ</span>
                        <span className="font-mono font-semibold text-gray-900">{orderId}</span>
                    </div>
                </div>
            </div>

            {/* Warning Messages */}
            <div className="space-y-3">
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="text-amber-700 text-sm">
                        ℹ️ คำสั่งซื้อของคุณยังคงรอการชำระเงิน
                    </p>
                </div>

                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-blue-700 text-sm">
                        💬 หากปัญหายังคงเกิดขึ้น กรุณาติดต่อฝ่ายสนับสนุนของเรา
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
                <button
                    onClick={onRetry}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    ลองชำระเงินอีกครั้ง
                </button>

                <button
                    onClick={onChangeMethod}
                    className="w-full py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                    เลือกช่องทางอื่น
                </button>

                <button
                    onClick={onContactSupport}
                    className="w-full py-3 px-4 border-2 border-amber-300 text-amber-700 rounded-lg font-semibold hover:bg-amber-50 transition flex items-center justify-center gap-2"
                >
                    <HelpCircle className="w-4 h-4" />
                    ติดต่อฝ่ายสนับสนุน
                </button>

                <button
                    onClick={onGoBack}
                    className="w-full py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    ย้อนกลับ
                </button>
            </div>
        </div>
    );
}
