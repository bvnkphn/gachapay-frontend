'use client';

import React, { useEffect, useState } from 'react';
import { Copy, Download, AlertCircle, Clock, Loader2, ArrowLeft } from 'lucide-react';

interface QRCodeDisplayProps {
    orderId: number;
    amount: number;
    paymentMethod: 'promptpay' | 'truemoney';
    qrCodeUrl: string;
    referenceNumber: string;
    expiryTime?: number; // in seconds
    onPaymentComplete?: () => void;
    onCancel: () => void;
    onReportIssue: () => void;
}

export default function QRCodeDisplay({
    orderId,
    amount,
    paymentMethod,
    qrCodeUrl,
    referenceNumber,
    expiryTime = 180, // 3 minutes default
    onPaymentComplete,
    onCancel,
    onReportIssue,
}: QRCodeDisplayProps) {
    const [timeLeft, setTimeLeft] = useState(expiryTime);
    const [copied, setCopied] = useState(false);
    const [isExpired, setIsExpired] = useState(false);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isWarning = timeLeft < 60;

    useEffect(() => {
        if (timeLeft <= 0) {
            setIsExpired(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleCopyReference = () => {
        navigator.clipboard.writeText(referenceNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadQR = () => {
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `qr-${orderId}.png`;
        link.click();
    };

    const methodLabel = paymentMethod === 'promptpay' ? 'PromptPay' : 'TrueMoney Wallet';
    const methodEmoji = paymentMethod === 'promptpay' ? '📱' : '💳';

    if (isExpired) {
        return (
            <div className="space-y-4">
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-red-700 font-semibold">QR Code หมดอายุ | QR Code Expired</p>
                            <p className="text-red-600 text-sm mt-1">
                                โปรดเลือกช่องทางการชำระเงินใหม่หรือลองอีกครั้ง
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        ย้อนกลับ | Back
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                        โหลดใหม่ | Refresh
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Payment Method Header */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">ช่องทางการชำระเงิน | Payment Method</p>
                <p className="text-lg font-bold text-gray-900">
                    {methodEmoji} {methodLabel}
                </p>
            </div>

            {/* QR Code Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 flex flex-col items-center">
                <p className="text-sm text-gray-600 mb-4">สแกน QR Code ด้านล่าง | Scan QR Code Below</p>
                <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-48 h-48 rounded-lg shadow-md"
                />
                <p className="text-xs text-gray-500 mt-4">ใช้แอปธนาคารของคุณในการสแกน</p>
            </div>

            {/* Payment Details */}
            <div className="p-4 rounded-lg bg-white border border-gray-200 space-y-3">
                <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-700">จำนวนเงิน</span>
                    <span className="font-semibold text-gray-900 text-lg">฿{amount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-700">หมายเลขคำสั่งซื้อ</span>
                    <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-gray-900">{referenceNumber}</span>
                        <button
                            onClick={handleCopyReference}
                            className="p-1 hover:bg-gray-100 rounded transition"
                            title="Copy reference number"
                        >
                            <Copy className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Countdown Timer */}
                <div className={`flex justify-between items-center pt-3 ${isWarning ? 'text-red-600' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${isWarning ? 'text-red-600 animate-pulse' : 'text-gray-600'}`} />
                        <span className="font-medium">เวลาหมดอายุ</span>
                    </div>
                    <span className={`font-mono font-bold text-lg ${isWarning ? 'text-red-600' : 'text-gray-900'}`}>
                        {minutes}:{seconds.toString().padStart(2, '0')}
                    </span>
                </div>

                {isWarning && (
                    <p className="text-xs text-red-600 mt-2">
                        ⚠️ QR Code จะหมดอายุเร็วๆ นี้ โปรดสแกนโดยเร็ว
                    </p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={handleDownloadQR}
                    className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    บันทึก QR
                </button>

                <button
                    onClick={handleCopyReference}
                    className={`py-2 px-4 border rounded-lg font-medium transition ${
                        copied
                            ? 'bg-green-50 border-green-300 text-green-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    {copied ? '✓ คัดลอก' : 'คัดลอก Ref'}
                </button>
            </div>

            {/* Support Section */}
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 space-y-3">
                <p className="text-sm font-medium text-amber-900">หากมีปัญหาในการชำระเงิน?</p>
                <button
                    onClick={onReportIssue}
                    className="w-full py-2 px-4 border border-amber-300 text-amber-700 rounded-lg font-medium hover:bg-amber-100 transition"
                >
                    ติดต่อฝ่ายสนับสนุน | Report Issue
                </button>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
                <button
                    onClick={onCancel}
                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    ย้อนกลับ
                </button>
            </div>
        </div>
    );
}
