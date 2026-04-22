'use client';

import React, { useState } from 'react';
import { Wallet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface GachaWalletPaymentProps {
    walletBalance: number;
    finalPrice: number;
    orderId: number;
    onPaymentSuccess: () => void;
    onPaymentFail: (error: string) => void;
    onCancel: () => void;
}

export default function GachaWalletPayment({
    walletBalance,
    finalPrice,
    orderId,
    onPaymentSuccess,
    onPaymentFail,
    onCancel,
}: GachaWalletPaymentProps) {
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    const canProcess = walletBalance >= finalPrice;
    const balanceAfter = walletBalance - finalPrice;

    const handleConfirmPayment = async () => {
        if (!canProcess) {
            setError('ยอดเงินไม่เพียงพอ | Insufficient balance');
            setStatus('error');
            return;
        }

        setProcessing(true);
        setStatus('processing');
        setError(null);

        try {
            // Call backend to process payment
            const response = await fetch('/api/payments/process-wallet-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    amount: finalPrice,
                    paymentMethod: 'gacha_wallet',
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setStatus('success');
                // Call success callback after 2 seconds
                setTimeout(() => {
                    onPaymentSuccess();
                }, 2000);
            } else {
                throw new Error(data.message || 'Payment processing failed');
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Payment processing failed';
            setError(errorMsg);
            setStatus('error');
            onPaymentFail(errorMsg);
        } finally {
            setProcessing(false);
        }
    };

    if (status === 'success') {
        return (
            <div className="space-y-4">
                <div className="text-center py-8">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-green-600 mb-2">การชำระเงินสำเร็จ</h3>
                    <p className="text-gray-600 text-sm">Payment processed successfully</p>
                    <p className="text-xs text-gray-500 mt-2">กำลังไปยังหน้าถัดไป...</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="space-y-4">
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-red-700 font-medium">การชำระเงินล้มเหลว</p>
                            <p className="text-red-600 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                    >
                        ย้อนกลับ | Back
                    </button>
                    <button
                        onClick={handleConfirmPayment}
                        disabled={processing || !canProcess}
                        className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                        ลองใหม่ | Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Wallet Information */}
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                    <Wallet className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">รายละเอียดการชำระเงินจาก Gacha Wallet</h4>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-gray-700">ยอดคงเหลือปัจจุบัน</span>
                        <span className="font-semibold text-gray-900">฿{walletBalance.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-gray-700">จำนวนที่ชำระเงิน</span>
                        <span className="font-semibold text-gray-900">-฿{finalPrice.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center pt-3 bg-gray-50 p-3 rounded">
                        <span className="font-bold text-gray-900">ยอดคงเหลือหลังชำระ</span>
                        <span className="text-lg font-bold text-blue-600">฿{balanceAfter.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Warning if balance is low */}
            {balanceAfter < 100 && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="text-amber-700 text-sm">
                        ⚠️ ยอดเงินคงเหลือของคุณจะต่ำหลังจากการชำระเงินนี้
                    </p>
                </div>
            )}

            {/* Confirmation */}
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-700 text-sm mb-3">ท่านตกลงที่จะชำระเงินด้วย Gacha Wallet หรือไม่?</p>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded" required />
                    <span className="text-sm text-gray-600">
                        ฉันยอมรับการตัดยอดจากกระเป๋าเงิน Gacha ของฉัน
                    </span>
                </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
                <button
                    onClick={onCancel}
                    disabled={processing}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 transition"
                >
                    ยกเลิก | Cancel
                </button>
                <button
                    onClick={handleConfirmPayment}
                    disabled={processing || !canProcess}
                    className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                    {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                    {processing ? 'กำลังประมวลผล...' : 'ยืนยันการชำระเงิน | Confirm Payment'}
                </button>
            </div>
        </div>
    );
}
