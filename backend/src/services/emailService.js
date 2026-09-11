
const nodemailer = require("nodemailer");


// ============================================================
// SMTP TRANSPORTER
// ============================================================

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",

  port: Number(process.env.MAIL_PORT || 587),

  // Gmail port 587 = STARTTLS
  secure: false,

  requireTLS: true,

  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },

  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 30000,
});


// ============================================================
// CHECK SMTP CONNECTION
// ============================================================

transporter.verify((error) => {
  console.log("====================================");

  if (error) {
    console.error("SMTP CONNECTION ERROR");
    console.error(error);
  } else {
    console.log("SMTP SERVER READY");
  }

  console.log("SMTP USER:", process.env.MAIL_USER);
  console.log("SMTP HOST:", process.env.MAIL_HOST || "smtp.gmail.com");
  console.log("SMTP PORT:", process.env.MAIL_PORT || 587);

  console.log("====================================");
});


// ============================================================
// SEND EMAIL VERIFICATION
// ============================================================

const sendVerificationEmail = async ({
  email,
  firstName,
  token,
}) => {
  if (!email) {
    throw new Error("Email is required");
  }

  if (!token) {
    throw new Error("Verification token is required");
  }

  const frontendUrl =
    process.env.FRONTEND_URL || "http://localhost:5173";

  const verificationUrl =
    `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;

  const name = firstName?.trim() || "User";

  const mailOptions = {
    from: `"AutoBillr" <${process.env.MAIL_USER}>`,
    to: email,

    subject: "AutoBillr Email Verification",

    text: `
Hello ${name},

Please click the link below to verify your email:

${verificationUrl}

This link is valid for 30 minutes.

Thank you,
AutoBillr
`,

    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AutoBillr Email Verification</title>
</head>

<body style="font-family:Arial,sans-serif;background:#f5f7fb;padding:30px;">

  <div style="
    max-width:600px;
    margin:auto;
    background:#ffffff;
    padding:30px;
    border:1px solid #ddd;
    border-radius:10px;
  ">

    <h2 style="color:#1230AE;">
      Welcome to AutoBillr
    </h2>

    <p>Hello ${name},</p>

    <p>
      Please click the button below to verify your email address.
    </p>

    <p>
      <a
        href="${verificationUrl}"
        style="
          display:inline-block;
          padding:12px 20px;
          background:#1230AE;
          color:#ffffff;
          text-decoration:none;
          border-radius:6px;
        "
      >
        Verify Email
      </a>
    </p>

    <p>
      This link is valid for 30 minutes.
    </p>

    <p>
      Thank you,<br>
      <strong>AutoBillr</strong>
    </p>

  </div>

</body>
</html>
`,
  };

  console.log("====================================");
  console.log("SENDING VERIFICATION EMAIL");
  console.log("FROM:", process.env.MAIL_USER);
  console.log("TO:", email);
  console.log("====================================");

  try {
    const info = await transporter.sendMail(mailOptions);

    console.log("====================================");
    console.log("VERIFICATION EMAIL SENT");
    console.log("MESSAGE ID:", info.messageId);
    console.log("ACCEPTED:", info.accepted);
    console.log("REJECTED:", info.rejected);
    console.log("RESPONSE:", info.response);
    console.log("ENVELOPE:", info.envelope);
    console.log("====================================");

    return info;

  } catch (error) {
    console.error("VERIFICATION EMAIL ERROR:", error);
    throw error;
  }
};


// ============================================================
// SEND INVOICE PDF TO CLIENT
// ============================================================

const sendInvoiceEmail = async ({
  email,
  clientName,
  invoiceNumber,
  total,
  pdfBuffer,
}) => {

  console.log("====================================");
  console.log("SEND INVOICE EMAIL");
  console.log("====================================");

  console.log("FROM:", process.env.MAIL_USER);
  console.log("TO:", email);
  console.log("CLIENT:", clientName);
  console.log("INVOICE:", invoiceNumber);
  console.log("PDF BUFFER:", !!pdfBuffer);
  console.log("PDF IS BUFFER:", Buffer.isBuffer(pdfBuffer));
  console.log("PDF SIZE:", pdfBuffer?.length);

  console.log("====================================");


  // ----------------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------------

  if (!email) {
    throw new Error("Client email is missing");
  }

  if (!invoiceNumber) {
    throw new Error("Invoice number is missing");
  }

  if (!pdfBuffer) {
    throw new Error("Invoice PDF is missing");
  }

  if (!Buffer.isBuffer(pdfBuffer)) {
    throw new Error("Invoice PDF is not a valid Buffer");
  }

  if (pdfBuffer.length === 0) {
    throw new Error("Invoice PDF is empty");
  }


  // ----------------------------------------------------------
  // CREATE MAIL
  // ----------------------------------------------------------

  const mailOptions = {

    // Gmail authenticated account
    from: `"AutoBillr" <${process.env.MAIL_USER}>`,

    // Database client email
    to: email,

    // Explicit SMTP envelope
    envelope: {
      from: process.env.MAIL_USER,
      to: [email],
    },

    subject: `Invoice ${invoiceNumber} from AutoBillr`,

    // Important Gmail headers
    headers: {
      "X-AutoBillr-Mail": "Invoice",
      "X-AutoBillr-Invoice": invoiceNumber,
    },

    text: `
Hello ${clientName || "Customer"},

Please find your invoice attached to this email.

Invoice Number: ${invoiceNumber}
Total Amount: ${total}

The invoice PDF is attached.

Thank you for using AutoBillr.

Regards,
AutoBillr
`,

    html: `
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8">
  <title>AutoBillr Invoice</title>
</head>

<body style="
  margin:0;
  padding:30px;
  background:#f5f7fb;
  font-family:Arial,sans-serif;
">

  <div style="
    max-width:600px;
    margin:auto;
    background:#ffffff;
    padding:30px;
    border:1px solid #e5e7eb;
    border-radius:10px;
  ">

    <h2 style="
      color:#1230AE;
      margin-bottom:20px;
    ">
      AutoBillr Invoice
    </h2>

    <p>
      Hello ${clientName || "Customer"},
    </p>

    <p>
      Please find your invoice attached to this email.
    </p>

    <div style="
      background:#f5f5f5;
      padding:15px;
      border-radius:8px;
      margin:20px 0;
    ">

      <p>
        <strong>Invoice Number:</strong>
        ${invoiceNumber}
      </p>

      <p>
        <strong>Total Amount:</strong>
        ${total}
      </p>

    </div>

    <p>
      The invoice PDF is attached to this email.
    </p>

    <p>
      Thank you for using AutoBillr.
    </p>

    <p>
      Regards,<br>
      <strong>AutoBillr</strong>
    </p>

  </div>

</body>
</html>
`,

    // --------------------------------------------------------
    // PDF ATTACHMENT
    // --------------------------------------------------------

    attachments: [
      {
        filename: `${invoiceNumber}.pdf`,

        content: pdfBuffer,

        contentType: "application/pdf",

        // Explicitly tell Nodemailer this is a normal attachment
        contentDisposition: "attachment",
      },
    ],
  };


  // ----------------------------------------------------------
  // SEND
  // ----------------------------------------------------------

  console.log("====================================");
  console.log(">>> SENDING INVOICE EMAIL...");
  console.log("SMTP FROM:", process.env.MAIL_USER);
  console.log("SMTP TO:", email);
  console.log("SUBJECT:", mailOptions.subject);
  console.log("PDF FILENAME:", `${invoiceNumber}.pdf`);
  console.log("PDF SIZE:", pdfBuffer.length);
  console.log("====================================");


  try {

    const info = await transporter.sendMail(mailOptions);


    // --------------------------------------------------------
    // RESULT
    // --------------------------------------------------------

    console.log("====================================");
    console.log(">>> INVOICE EMAIL SMTP RESULT");
    console.log("====================================");

    console.log("MESSAGE ID:", info.messageId);

    console.log("FROM:", process.env.MAIL_USER);

    console.log("TO:", email);

    console.log("ACCEPTED:", info.accepted);

    console.log("REJECTED:", info.rejected);

    console.log("RESPONSE:", info.response);

    console.log("ENVELOPE:", info.envelope);

    console.log(
      "PDF ATTACHED:",
      mailOptions.attachments.length > 0
    );

    console.log(
      "PDF SIZE:",
      pdfBuffer.length
    );

    console.log("====================================");


    // --------------------------------------------------------
    // SAFETY CHECK
    // --------------------------------------------------------

    if (
      !info.accepted ||
      !info.accepted.includes(email)
    ) {
      throw new Error(
        `SMTP did not accept recipient: ${email}`
      );
    }


    return info;

  } catch (error) {

    console.error("====================================");
    console.error(">>> INVOICE EMAIL FAILED");
    console.error("====================================");

    console.error("ERROR MESSAGE:", error.message);
    console.error("ERROR CODE:", error.code);
    console.error("ERROR RESPONSE:", error.response);
    console.error("ERROR RESPONSE CODE:", error.responseCode);
    console.error("ERROR COMMAND:", error.command);

    console.error("====================================");

    throw error;
  }
};



const sendReminderEmail = async ({
  email,
  clientName,
  invoiceNumber,
  total,
  dueDate,
}) => {
  if (!email) {
    throw new Error("Client email is missing");
  }

  if (!invoiceNumber) {
    throw new Error("Invoice number is missing");
  }

  const mailOptions = {
    from: `"AutoBillr" <${process.env.MAIL_USER}>`,
    to: email,
    envelope: {
      from: process.env.MAIL_USER,
      to: [email],
    },
    subject: `Payment Reminder: Invoice ${invoiceNumber} - AutoBillr`,
    headers: {
      "X-AutoBillr-Mail": "Reminder",
      "X-AutoBillr-Invoice": invoiceNumber,
    },
    text: `
Hello ${clientName || "Customer"},

This is a gentle reminder regarding your pending invoice:

Invoice Number: ${invoiceNumber}
Total Amount: ${total}
Due Date: ${dueDate || "Due upon receipt"}

Please arrange for the payment at your earliest convenience. If you have already made the payment, please disregard this notice.

Thank you for your business.

Regards,
AutoBillr
`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Payment Reminder</title>
</head>
<body style="margin:0;padding:30px;background:#f5f7fb;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:auto;background:#ffffff;padding:30px;border:1px solid #e5e7eb;border-radius:10px;">
    <h2 style="color:#EAB308;margin-bottom:16px;">
      Payment Reminder
    </h2>
    <p>Hello ${clientName || "Customer"},</p>
    <p>This is a gentle reminder regarding your pending invoice with AutoBillr.</p>
    
    <div style="background:#fffbeb;padding:16px;border-left:4px solid #EAB308;border-radius:4px;margin:20px 0;">
      <p style="margin:4px 0;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
      <p style="margin:4px 0;"><strong>Total Amount:</strong> ${total}</p>
      <p style="margin:4px 0;"><strong>Due Date:</strong> ${dueDate || "Due upon receipt"}</p>
    </div>

    <p>Please arrange for the payment at your earliest convenience.</p>
    <p style="font-size:12px;color:#6b7280;">If you have already processed this payment, please disregard this email.</p>
    
    <p style="margin-top:24px;">Regards,<br><strong>AutoBillr Team</strong></p>
  </div>
</body>
</html>
`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(">>> REMINDER EMAIL SENT TO:", email, "MESSAGE ID:", info.messageId);
    return info;
  } catch (error) {
    console.error(">>> REMINDER EMAIL ERROR:", error);
    throw error;
  }
};


module.exports = {
  sendVerificationEmail,
  sendInvoiceEmail,
  sendReminderEmail,
};


