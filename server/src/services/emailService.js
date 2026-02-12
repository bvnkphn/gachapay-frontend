// server/src/services/emailService.js - Mock Version
class EmailService {
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
  }

  static async sendPasswordResetOTP(email, otp) {
    // Mock - แสดงใน console แทนการส่งอีเมลจริง
    console.log('\n🔔 ===== MOCK EMAIL SERVICE =====');
    console.log(`📧 To: ${email}`);
    console.log(`📋 Subject: รีเซ็ตรหัสผ่าน - CYBERPAY`);
    console.log(`🔑 OTP Code: ${otp}`);
    console.log(`⏰ Expires: 10 minutes`);
    console.log('================================\n');

    // จำลองการส่งอีเมลสำเร็จ
    return { success: true };
  }

  static async sendEmailVerificationOTP(email, otp) {
    console.log('\n🔔 ===== MOCK EMAIL SERVICE =====');
    console.log(`📧 To: ${email}`);
    console.log(`📋 Subject: ยืนยันอีเมล - CYBERPAY`);
    console.log(`🔑 OTP Code: ${otp}`);
    console.log(`⏰ Expires: 10 minutes`);
    console.log('================================\n');

    return { success: true };
  }
}

module.exports = EmailService;
