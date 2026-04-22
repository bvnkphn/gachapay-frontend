'use client';

import React from 'react';
import { CheckCircle, Download, Copy, Home, MoreVertical } from 'lucide-react';

interface PaymentSuccessProps {
    orderId: number;
    gameName: string;
    packageName: string;
    amount: number;
    paymentMethod: string;
    createdAt: string;
    onDownloadReceipt?: () => void;
    onGoHome: () => void;
    onViewOrder: () => void;
}

export default function PaymentSuccess({
    orderId,
    gameName,
    packageName,
    amount,
    paymentMethod,
    createdAt,
    onDownloadReceipt,
    onGoHome,
    onViewOrder,
}: PaymentSuccessProps) {
    const [copied, setCopied] = React.useState(false);

    const handleCopyOrderId = () => {
        navigator.clipboard.writeText(orderId.toString());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const date = new Date(createdAt);
    const formattedDate = date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const methodLabel = {
        gacha_wallet: '🎁 Gacha Wallet',
        promptpay: '📱 PromptPay',
        truemoney: '💳 TrueMoney Wallet',
    }[paymentMethod] || paymentMethod;

    return (
        <div className="space-y-6 py-4">
            {/* Success Header */}
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 animate-pulse bg-green-400 rounded-full opacity-20 w-24 h-24" />
                        <CheckCircle className="w-24 h-24 text-green-500" />
                    </div>
                </div>

                <div>
                    <h1 className="text-3xl font-bold text-gray-900">ชำระเงินสำเร็จ</h1>
                    <p className="text-gray-600 mt-1">Payment Successful</p>
                </div>
            </div>

            {/* Order Details Card */}
            <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 overflow-hidden shadow-lg">
                {/* Header */}
                <div className="bg-green-600 text-white px-6 py-4">
                    <p className="text-sm opacity-90">หมายเลขคำสั่งซื้อ</p>
                    <div className="flex items-center justify-between mt-2">
                        <p className="font-mono text-2xl font-bold">{orderId}</p>
                        <button
                            onClick={handleCopyOrderId}
                            className={`p-2 rounded-lg transition ${
                                copied ? 'bg-green-700' : 'hover:bg-green-700'
                            }`}
                        >
                            <Copy className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Game Info */}
                    <div className="pb-4 border-b border-green-200">
                        <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">เกมที่เลือก</p>
                        <p className="text-lg font-bold text-gray-900">{gameName}</p>
                        <p className="text-sm text-gray-600 mt-1">{packageName}</p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Amount */}
                        <div>
                            <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">จำนวนเงิน</p>
                            <p className="text-2xl font-bold text-green-600">฿{amount.toFixed(2)}</p>
                        </div>

                        {/* Payment Method */}
                        <div>
                            <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">ช่องทาง</p>
                            <p className="text-sm font-semibold text-gray-900">{methodLabel}</p>
                        </div>

                        {/* Date */}
                        <div className="col-span-2">
                            <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">วันเวลา</p>
                            <p className="text-sm text-gray-900">
                                {formattedDate} <span className="text-gray-600">เวลา {formattedTime}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Information */}
            <div className="space-y-3">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-blue-700 text-sm">
                        ✓ ยอดเงินจะถูกเติมเข้าบัญชีเกมของคุณโดยอัตโนมัติ
                    </p>
                </div>

                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="text-amber-700 text-sm">
                        ℹ️ บันทึกหมายเลขคำสั่งซื้อเพื่อการอ้างอิงในอนาคต
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
                <button
                    onClick={onViewOrder}
                    className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                    <MoreVertical className="w-4 h-4" />
                    ดูรายละเอียดคำสั่งซื้อ
                </button>

                {onDownloadReceipt && (
                    <button
                        onClick={onDownloadReceipt}
                        className="w-full py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        ดาวน์โหลดใบเสร็จ
                    </button>
                )}

                <button
                    onClick={onGoHome}
                    className="w-full py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                    <Home className="w-4 h-4" />
                    กลับไปหน้าหลัก
                </button>
            </div>

            {/* Footer Message */}
            <div className="text-center">
                <p className="text-xs text-gray-500">
                    ขอบคุณที่ใช้บริการ Gacha Pay | Thank you for using Gacha Pay
                </p>
            </div>
        </div>
    );
}
