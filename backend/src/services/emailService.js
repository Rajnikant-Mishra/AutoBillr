// // const { Resend } = require("resend");

// // const resend = new Resend(
// //   process.env.RESEND_API_KEY
// // );

// // // =====================================================
// // // SEND VERIFICATION EMAIL
// // // =====================================================

// // const sendVerificationEmail = async ({
// //   email,
// //   firstName,
// //   token,
// // }) => {
// //   if (!email) {
// //     throw new Error(
// //       "Recipient email is required"
// //     );
// //   }

// //   if (!token) {
// //     throw new Error(
// //       "Verification token is required"
// //     );
// //   }

// //   const frontendUrl =
// //     process.env.FRONTEND_URL ||
// //     "http://localhost:5173";

// //   const verificationUrl =
// //     `${frontendUrl}/verify-email?token=${encodeURIComponent(
// //       token
// //     )}`;

// //   const fromEmail =
// //     process.env.RESEND_FROM_EMAIL ||
// //     "AutoBillr <onboarding@resend.dev>";

// //   const name =
// //     firstName?.trim() || "there";

// //   console.log(
// //     ">>> RESEND TO:",
// //     email
// //   );

// //   console.log(
// //     ">>> RESEND FROM:",
// //     fromEmail
// //   );

// //   console.log(
// //     ">>> VERIFICATION URL:",
// //     verificationUrl
// //   );

// //   const { data, error } =
// //     await resend.emails.send({
// //       from: fromEmail,

// //       to: [email],

// //       subject:
// //         "Verify your AutoBillr email address",

// //       html: `
// //         <!DOCTYPE html>

// //         <html>

// //         <head>
// //           <meta charset="UTF-8">
// //           <meta
// //             name="viewport"
// //             content="width=device-width, initial-scale=1.0"
// //           >
// //           <title>
// //             Verify your AutoBillr email
// //           </title>
// //         </head>

// //         <body
// //           style="
// //             margin:0;
// //             padding:0;
// //             background:#f5f7fb;
// //             font-family:Arial,Helvetica,sans-serif;
// //           "
// //         >

// //           <div
// //             style="
// //               max-width:600px;
// //               margin:40px auto;
// //               background:#ffffff;
// //               border-radius:16px;
// //               overflow:hidden;
// //               border:1px solid #e5e7eb;
// //             "
// //           >

// //             <!-- HEADER -->

// //             <div
// //               style="
// //                 padding:28px 32px;
// //                 background:#0f172a;
// //                 color:#ffffff;
// //               "
// //             >

// //               <h1
// //                 style="
// //                   margin:0;
// //                   font-size:24px;
// //                 "
// //               >
// //                 AutoBillr
// //               </h1>

// //             </div>

// //             <!-- CONTENT -->

// //             <div
// //               style="
// //                 padding:40px 32px;
// //               "
// //             >

// //               <h2
// //                 style="
// //                   margin:0 0 16px;
// //                   color:#111827;
// //                   font-size:24px;
// //                 "
// //               >
// //                 Verify your email
// //               </h2>

// //               <p
// //                 style="
// //                   color:#4b5563;
// //                   font-size:15px;
// //                   line-height:1.7;
// //                 "
// //               >
// //                 Hi ${name},
// //               </p>

// //               <p
// //                 style="
// //                   color:#4b5563;
// //                   font-size:15px;
// //                   line-height:1.7;
// //                 "
// //               >
// //                 Thanks for creating your
// //                 AutoBillr account.
// //                 Please verify your email address
// //                 to continue your registration.
// //               </p>

// //               <!-- BUTTON -->

// //               <div
// //                 style="
// //                   text-align:center;
// //                   margin:32px 0;
// //                 "
// //               >

// //                 <a
// //                   href="${verificationUrl}"
// //                   style="
// //                     display:inline-block;
// //                     padding:14px 24px;
// //                     background:#0f9d94;
// //                     color:#ffffff;
// //                     text-decoration:none;
// //                     border-radius:10px;
// //                     font-weight:600;
// //                     font-size:15px;
// //                   "
// //                 >
// //                   Verify Email Address
// //                 </a>

// //               </div>

// //               <p
// //                 style="
// //                   color:#6b7280;
// //                   font-size:13px;
// //                   line-height:1.6;
// //                 "
// //               >
// //                 This verification link will expire
// //                 in
// //                 ${
// //                   process.env
// //                     .EMAIL_VERIFICATION_EXPIRES_MINUTES ||
// //                   30
// //                 }
// //                 minutes.
// //               </p>

// //               <p
// //                 style="
// //                   color:#9ca3af;
// //                   font-size:12px;
// //                   line-height:1.6;
// //                 "
// //               >
// //                 If you did not create an
// //                 AutoBillr account, you can safely
// //                 ignore this email.
// //               </p>

// //             </div>

// //             <!-- FOOTER -->

// //             <div
// //               style="
// //                 padding:20px 32px;
// //                 border-top:1px solid #e5e7eb;
// //                 background:#fafafa;
// //               "
// //             >

// //               <p
// //                 style="
// //                   margin:0;
// //                   color:#9ca3af;
// //                   font-size:12px;
// //                   text-align:center;
// //                 "
// //               >
// //                 © ${new Date().getFullYear()}
// //                 AutoBillr.
// //                 All rights reserved.
// //               </p>

// //             </div>

// //           </div>

// //         </body>

// //         </html>
// //       `,
// //     });

// //   if (error) {
// //     console.error(
// //       ">>> RESEND ERROR:",
// //       error
// //     );

// //     throw new Error(
// //       error.message ||
// //         "Failed to send email"
// //     );
// //   }

// //   console.log(
// //     ">>> RESEND EMAIL ID:",
// //     data?.id
// //   );

// //   return data;
// // };

// // module.exports = {
// //   sendVerificationEmail,
// // };

// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASSWORD,
//   },
// });

// const sendVerificationEmail = async ({ email, firstName, token }) => {
//   if (!email) {
//     throw new Error("Recipient email is required");
//   }

//   if (!token) {
//     throw new Error("Verification token is required");
//   }

//   const frontendUrl =
//     process.env.FRONTEND_URL || "http://localhost:5173";

//   const verificationUrl = `${frontendUrl}/verify-email?token=${encodeURIComponent(
//     token
//   )}`;

//   const name = firstName?.trim() || "there";

//   console.log(">>> SENDING AUTHENTIC EMAIL TO:", email);
//   console.log(">>> VERIFICATION URL:", verificationUrl);

//   const mailOptions = {
//     from: `"AutoBillr" <${process.env.MAIL_USER}>`,
//     to: email,
//     subject: "Verify your AutoBillr email address",
//     html: `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Verify your AutoBillr email</title>
//       </head>
//       <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;">
//         <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
//           <div style="padding:28px 32px;background:#0f172a;color:#ffffff;">
//             <h1 style="margin:0;font-size:24px;">AutoBillr</h1>
//           </div>
//           <div style="padding:40px 32px;">
//             <h2 style="margin:0 0 16px;color:#111827;font-size:24px;">Verify your email</h2>
//             <p style="color:#4b5563;font-size:15px;line-height:1.7;">Hi ${name},</p>
//             <p style="color:#4b5563;font-size:15px;line-height:1.7;">Thanks for creating your AutoBillr account. Please verify your email address to continue your registration.</p>
//             <div style="text-align:center;margin:32px 0;">
//               <a href="${verificationUrl}" style="display:inline-block;padding:14px 24px;background:#0f9d94;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;">Verify Email Address</a>
//             </div>
//             <p style="color:#6b7280;font-size:13px;line-height:1.6;">This link will expire in 30 minutes.</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `,
//   };

//   const info = await transporter.sendMail(mailOptions);
//   console.log(">>> EMAIL DELIVERED SUCCESSFULLY! MESSAGE ID:", info.messageId);
//   return info;
// };

// module.exports = {
//   sendVerificationEmail,
// };

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const sendVerificationEmail = async ({ email, firstName, token }) => {
  if (!email || !token) {
    throw new Error("Email and token are required");
  }

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verificationUrl = `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
  const name = firstName?.trim() || "User";

  const mailOptions = {
    from: `"AutoBillr" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "AutoBillr Email Verification",
    text: `Hello ${name},\n\nPlease click the link below to verify your email:\n${verificationUrl}\n\nThis link is valid for 30 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #1f2937;">
        <h2>Verify your email address</h2>
        <p>Hello ${name},</p>
        <p>Click the link below to complete your registration on AutoBillr:</p>
        <p style="margin: 25px 0;">
          <a href="${verificationUrl}" style="background-color: #0f9d94; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Verify Email Address
          </a>
        </p>
        <p style="font-size: 13px; color: #6b7280;">Direct link: <br/><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p style="font-size: 12px; color: #9ca3af;">This link will expire in 30 minutes.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(">>> EMAIL DELIVERED SUCCESSFULLY! ID:", info.messageId);
  return info;
};

module.exports = {
  sendVerificationEmail,
};