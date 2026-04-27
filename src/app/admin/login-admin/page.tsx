'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Eye, EyeOff, Mail, Lock, Gamepad2 } from 'lucide-react';
import { useAdminAuth } from '@/hooks/use-admin-auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        { email, password }
      );

      if (res.data.requireOtp) {
        // Admin - redirect to OTP page
        router.push(`/admin/verify-otp?userId=${res.data.userId}`);
      } else {
        // Regular user - save token and redirect
        setAuth(res.data.user, res.data.token);
        router.push('/admin');
      }
    } catch (err) {
      setError('Email หรือ Password ไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/30">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">
            <span className="text-white">GameTopUp </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Admin</span>
          </h1>
        </div>

        {/* Card */}
        <div className="bg-[#1a1a2e] rounded-2xl p-8 shadow-xl border border-white/5">
          <h2 className="text-xl font-bold text-white text-center mb-1">เข้าสู่ระบบ</h2>
          <p className="text-gray-400 text-sm text-center mb-6">กรอก Email และ Password เพื่อเข้าสู่ระบบ</p>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div>
              <label className="text-gray-300 text-sm mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0f0f1a] text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 transition placeholder:text-gray-600"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-300 text-sm mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0f0f1a] text-white pl-10 pr-12 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 transition placeholder:text-gray-600"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-cyan-400 hover:text-cyan-300 transition"
              >
                ลืมรหัสผ่าน?
              </button>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}