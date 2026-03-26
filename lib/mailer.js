import nodemailer from "nodemailer";

export async function sendResetEmail(to, link) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.GMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      // refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
  });

  await transporter.sendMail({
    from: `"Support" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Reset Your Password",
    html: `
      <div>
        <h2>Reset Password</h2>
        <p>Click below to reset your password:</p>
        <a href="${link}">${link}</a>
      </div>
    `,
  });
}