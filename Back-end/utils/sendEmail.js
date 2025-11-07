// ✅ ĐÃ SỬA: Chuyển sang CommonJS
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const nodemailer = require("nodemailer");
const fs = require("fs");

// ✅ ĐÃ SỬA: Định nghĩa hàm
const sendEmail = async function(to, subject, html) {
  try {
    const gmailUser = "talamhao2005@gmail.com"; // 🔁 Thay bằng Gmail thật
    const gmailPass = "qrrdvraovywwxssp";   // 🔁 App Password nếu bật xác minh 2 bước

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const textVersion = html.replace(/<[^>]*>?/gm, "").trim();

    const info = await transporter.sendMail({
      from: `"StarSocial" <${gmailUser}>`, 
      to,
      subject,
      text: textVersion,
      html,
    });

    const mailPath = `./email_${Date.now()}.txt`;
    fs.writeFileSync(mailPath, `To: ${to}\nSubject: ${subject}\n\n${textVersion}`);

    console.log("📩 Email sent successfully!");
    console.log("Người nhận:", to);
    console.log("Gửi từ Gmail:", gmailUser);
    console.log("File lưu:", mailPath);

    return { success: true };
  } catch (error) {
    console.error(" Lỗi gửi email:", error);
    throw error;
  }
}

// ✅ ĐÃ SỬA: Export bằng CommonJS
export default sendEmail;
