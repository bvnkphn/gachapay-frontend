// src/app/checkout/page.tsx (Example Integration)
/**
 * Checkout Page Example with Coupon Integration
 */

'use client';

import React, { useState, useMemo } from 'react';
import CouponValidator from '@/components/CouponValidator';
import { CouponValidationResponse } from '@/lib/coupon-api';

export default function CheckoutPage() {
    const userId = 1; // Get from auth context
    const gameId = 1; // From selected game
    const packageId = 5; // From selected package
    const baseAmount = 1000; // Package price

    const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResponse | null>(null);
    const [orderLoading, setOrderLoading] = useState(false);

    // Calculate final price
    const finalPrice = useMemo(() => {
        if (appliedCoupon?.success && appliedCoupon.data) {
            return appliedCoupon.data.finalAmount;
        }
        return baseAmount;
    }, [appliedCoupon, baseAmount]);

    const discountAmount = useMemo(() => {
        return baseAmount - finalPrice;
    }, [baseAmount, finalPrice]);

    const handleCouponValid = (response: CouponValidationResponse) => {
        setAppliedCoupon(response);
        // Show success toast
        console.log('Coupon applied:', response.data?.code);
    };

    const handleCouponInvalid = (response: CouponValidationResponse) => {
        setAppliedCoupon(response);
        // Show error toast with response.message
        console.error('Coupon invalid:', response.message);
    };

    const handlePlaceOrder = async () => {
        setOrderLoading(true);

        try {
            // Call your order creation API
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    gameId,
                    packageId,
                    couponCode: appliedCoupon?.data?.code,
                    totalAmount: finalPrice,
                    originalAmount: baseAmount,
                    discountAmount,
                }),
            });

            if (response.ok) {
                // Navigate to success page
                console.log('Order placed successfully');
            }
        } catch (error) {
            console.error('Order failed:', error);
        } finally {
            setOrderLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4 space-y-8">
                {/* Order Summary */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b">
                            <span>Package Name</span>
                            <span className="font-medium">Premium Package</span>
                        </div>

                        <div className="flex justify-between items-center pb-4 border-b">
                            <span>Base Price</span>
                            <span className="font-medium">฿{baseAmount.toFixed(2)}</span>
                        </div>

                        {discountAmount > 0 && (
                            <div className="flex justify-between items-center pb-4 border-b">
                                <span className="text-green-600">Discount</span>
                                <span className="font-medium text-green-600">
                                    -฿{discountAmount.toFixed(2)}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-4">
                            <span className="text-lg font-bold">Total</span>
                            <span className="text-2xl font-bold text-blue-600">
                                ฿{finalPrice.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Coupon Section */}
                <CouponValidator
                    userId={userId}
                    gameId={gameId}
                    packageId={packageId}
                    amount={baseAmount}
                    onCouponValid={handleCouponValid}
                    onCouponInvalid={handleCouponInvalid}
                />

                {/* Checkout Button */}
                <button
                    onClick={handlePlaceOrder}
                    disabled={orderLoading}
                    className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    {orderLoading ? 'Processing...' : 'Place Order'}
                </button>
            </div>
        </div>
    );
}
