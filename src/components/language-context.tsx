"use client";
import { createContext, useContext, useState } from "react";

export type Lang = "th" | "en";

const translations = {
  th: {
    platform: "แพลตฟอร์มเติมเกมอันดับ 1",
    fast: "เติมไว",
    fastDesc: "รับไอเทมภายใน 1-5 นาที",
    safe: "ปลอดภัย 100%",
    safeDesc: "ระบบความปลอดภัยระดับสูง",
    support: "ซัพพอร์ต",
    supportDesc: "ทีมงานพร้อมช่วยเหลือ",
    always: "24/7",
    alwaysDesc: "บริการตลอด 24 ชั่วโมง",
    search: "ค้นหาเกม...",
    login: "เข้าสู่ระบบ",
    register: "สมัครสมาชิก",
    noAccount: "ยังไม่มีบัญชี?",
    forgot: "ลืมรหัสผ่าน?",
    email: "Email",
    password: "Password",
    divider: "หรือ",
    google: "Google",
    facebook: "Facebook",
    logoDesc: "เข้าสู่ระบบเพื่อเติมเกมได้ทันที",
    errorEmpty: "กรุณากรอก Email และ Password",
    errorEmail: "รูปแบบ Email ไม่ถูกต้อง",
    errorPassword: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
    errorLogin: "Email หรือรหัสผ่านไม่ถูกต้อง",
    success: "เข้าสู่ระบบสำเร็จ"
  },
  en: {
    platform: "#1 Game Top-up Platform",
    fast: "Fast",
    fastDesc: "Receive items in 1-5 minutes",
    safe: "100% Safe",
    safeDesc: "High security system",
    support: "Support",
    supportDesc: "Our team is ready to help",
    always: "24/7",
    alwaysDesc: "Service available 24/7",
    search: "Search games...",
    login: "Login",
    register: "Register",
    noAccount: "Don't have an account?",
    forgot: "Forgot password?",
    email: "Email",
    password: "Password",
    divider: "OR",
    google: "Google",
    facebook: "Facebook",
    logoDesc: "Login to top up your game instantly",
    errorEmpty: "Please enter Email and Password",
    errorEmail: "Invalid Email format",
    errorPassword: "Password must be at least 8 characters",
    errorLogin: "Incorrect Email or Password",
    success: "Login successful"
  }
};

const LanguageContext = createContext({
  lang: "th" as Lang,
  setLang: (l: Lang) => {},
  t: translations.th,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("th");
  const t = translations[lang];
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
