const express = require('express');
const ServiceModel = require("../../database/models/services");
const DepartmentModel = require("../../database/models/department");
const { PaymentModel } = require("../../database/models/Payment");
const { CitizenModel } = require("../../database/models/citizen");
const nodemailer = require("nodemailer");
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const { param } = require('../../routes/citizen/counts');
const speakeasy = require('speakeasy');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());

const paymentOTP = async (req, res) => {
  try {
    const { id, service_id } = req.params;

    // Validate ID input
    if (!id) {
      return res.status(400).json({
        status: "error",
        error: { code: 400, message: "User ID is required" },
      });
    }

    // Find user by ID
    const citizen = await CitizenModel.findById(id);
    if (!citizen || !citizen.email) {
      return res.status(404).json({
        status: "error",
        error: { code: 404, message: "Citizen not found or email missing" },
      });
    }

    const service = await ServiceModel.findById(service_id);
    if (!service) {
      return res.status(404).json({
        status: "error",
        error: { code: 404, message: "service not found" },
      });
    }


    // Generate TOTP
    const secret = speakeasy.generateSecret({ length: 20 }).base32;
    const otp = speakeasy.totp({
      secret: secret,
      encoding: "base32",
      step: 600, // 10 minutes expiry
    });

    // Generate unique transaction reference
    const transactionReference = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create payment record
    const paymentRecord = new PaymentModel({
      citizen_id: citizen._id,
      otp: otp, // Store the actual OTP, not the secret
      otpSecret: secret, // Store the secret for verification
      otpExpiry: Date.now() + 10 * 60 * 1000,
      transaction_reference: transactionReference, // Add unique reference
      status: 'pending', // Track payment status
      service_id: service._id
    });

    await paymentRecord.save();

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Verify SMTP connection
    try {
      await transporter.verify();
      console.log("SMTP connection verified");
    } catch (verifyError) {
      console.error("SMTP connection failed:", verifyError);
      return res.status(503).json({
        status: "error",
        error: {
          code: 503,
          message: "Email service is currently unavailable",
        },
      });
    }

    // Email content
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: citizen.email.toLowerCase(),
      subject: "Payment Verification OTP - E-Government Documentation System",
      text: `Your OTP for payment verification is: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Payment Verification Request</h2>
          <p>You requested an OTP for payment verification in the E-Government Documentation System.</p>
          <p style="font-size: 18px; font-weight: bold;">Your OTP code is: <span style="color: #e74c3c;">${otp}</span></p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #7f8c8d;">E-Government Documentation System Team</p>
        </div>
      `,
      headers: {
        "X-Mailer": "Node.js",
        "X-Priority": "1",
      },
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      status: "success",
      data: {
        message: "OTP sent successfully",
      },
    });
  } catch (err) {
    console.error("Payment OTP error:", err);

    // Handle specific error cases
    let statusCode = 500;
    let message = "Internal Server Error";

    if (err.code === "ESOCKET" || err.code === "ECONNECTION") {
      statusCode = 503;
      message = "Email service is currently unavailable";
    }

    return res.status(statusCode).json({
      status: "error",
      error: {
        code: statusCode,
        message: message,
      },
    });
  }
};



const getPayment = async (req, res) => {
  try {
    const { paymentMethodId, service_id, id, otp } = req.body;

    // Validate required fields including OTP
    if (!paymentMethodId || !service_id || !id || !otp) {
      return res.status(400).json({
        success: false,
        message: "Payment method ID, service ID, citizen ID, and OTP are required"
      });
    }

    // Get citizen's details including OTP secret
    const citizen = await CitizenModel.findById(id);
    if (!citizen || !citizen.email) {
      return res.status(404).json({
        success: false,
        message: "Citizen not found"
      });
    }

    // Get the payment record (newest first)
    const payment = await PaymentModel.findOne({ citizen_id: id })
      .sort({ createdAt: -1 })
      .select('otpSecret otpExpiry otp status') // Add status to selection
      .limit(1);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "No OTP found for this user"
      });
    }

    // Check if payment was already completed
    if (payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: "This payment was already processed"
      });
    }

    // Verify OTP
    if (!payment.otpSecret || !payment.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "No OTP requested or OTP expired"
      });
    }

    if (payment.otpExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one."
      });
    }

    const isValidOTP = speakeasy.totp.verify({
      secret: payment.otpSecret,
      encoding: 'base32',
      token: otp,
      window: 1,
      step: 600
    });

    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please enter the correct code."
      });
    }

    // Rest of your existing payment processing logic
    const service = await ServiceModel.findById(service_id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    const department = await DepartmentModel.findById(service.department_id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }

    // Validate service fee
    if (typeof service.fees !== 'number' || service.fees <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid service fee amount"
      });
    }

    // Get citizen's details from database
    if (!citizen || !citizen.email) {
      return res.status(404).json({
        success: false,
        message: "Citizen not found or email missing"
      });
    }

    // Generate invoice number (custom format)
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const invoiceDate = new Date();
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

    // Create and confirm payment intent with receipt email
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(service.fees * 100), // Convert to cents
      currency: "EGP",
      payment_method: paymentMethodId,
      receipt_email: citizen.email,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      metadata: {
        citizen_id: id.toString(),
        project: "University Project",
        service_id: service._id.toString(),
        invoice_number: invoiceNumber // Store our custom invoice number
      }
    });

    // Update payment record with payment details
    const updatedPayment = await PaymentModel.findByIdAndUpdate(
      payment._id,
      {
        otp: "used",
        otpSecret: "used",
        stripe_payment_id: paymentIntent.id,
        amount_paid: service.fees,
        currency: "EGP",
        invoice_number: invoiceNumber,
        payment_date: new Date(),
        status: 'completed'
      },
      { new: true }
    );
    await updatedPayment.save();
    // Send bilingual confirmation email if SMTP is configured
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      try {
        // Generate the PDF invoice first
        const pdfBytes = await generateInvoicePDF({
          invoiceNumber,
          invoiceDate,
          dueDate,
          service,
          department,
          citizen,
          amount: service.fees,
          currency: "EGP"
        });

        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT || 587,
          secure: process.env.EMAIL_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });

        const paymentDate = new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const mailOptions = {
          from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
          to: citizen.email,
          subject: 'Payment Confirmation / تأكيد الدفع',
          html: `
            <div style="font-family: Arial, 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto;">
  <!-- English Section -->
  <div style="margin-bottom: 30px; direction: ltr; text-align: left;">
    <h1 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Payment Confirmation</h1>
    <p>Dear Valued Customer,</p>
    <p>We have successfully processed your payment of <strong>${service.fees} EGP</strong> for the service: <strong>${service.name}</strong>.</p>
    <p><strong>Invoice Number: </strong>${invoiceNumber}</p>
    <p><strong>Payment Date: </strong>${paymentDate}</p>
    <p><strong>Processing Time: </strong>${service.processing_time}</p>
    
    <p>An official receipt has been sent to this email address from our payment processor.</p>
    <p>If you have any questions, please contact our support team.</p>
    <p style="margin-top: 20px;">Best regards,<br><strong>${process.env.EMAIL_FROM_NAME}</strong></p>
  </div>
  
  <!-- Arabic Section -->
  <div style="direction: rtl; text-align: right; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
    <h1 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">تأكيد الدفع</h1>
    <p>عميلنا الكريم،</p>
    <p>لقد تمت معالجة دفعتك البالغة <strong>${service.fees} جنيه مصري</strong> للخدمة: <strong>${service.name}</strong> بنجاح.</p>
    <p><strong>رقم الفاتورة: </strong> ${invoiceNumber}</p>
    <p><strong>تاريخ الدفع: </strong> ${paymentDate}</p>
    <p><strong>مدة العملية: </strong>${service.processing_time}</p>

    <p>تم إرسال إيصال رسمي إلى هذا البريد الإلكتروني من نظام الدفع لدينا.</p>
    <p>إذا كان لديك أي استفسارات، يرجى التواصل مع فريق الدعم.</p>
    <p style="margin-top: 20px;">مع أطيب التحيات،<br><strong>${process.env.EMAIL_FROM_NAME}</strong></p>
  </div>
  
  <div style="margin-top: 30px; font-size: 12px; color: #7f8c8d; text-align: center; border-top: 1px solid #eee; padding-top: 15px;">
    <p>This is an automated message. Please do not reply to this email.</p>
    <p style="direction: rtl;">هذه رسالة آلية. لا ترد على هذا البريد الإلكتروني.</p>
  </div>
</div>
          `,
          attachments: [{
            filename: `Invoice_${invoiceNumber}.pdf`,
            content: pdfBytes,
            contentType: 'application/pdf',
            cid: 'invoicePdf' // Content ID for inline reference
          }]
        };

        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      data: {
        id: paymentIntent.id,
        amount: service.fees,
        currency: "EGP",
        status: paymentIntent.status,
        invoice_number: invoiceNumber,
        receipt_email: citizen.email,
        created: new Date(paymentIntent.created * 1000),
        service: {
          id: service._id,
          name: service.name,
          description: service.description
        }
      }
    });

  } catch (error) {
    console.error("Payment processing error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Transaction reference conflict - please try again",
        error: "Duplicate transaction reference"
      });
    }

    if (error.type?.includes('Stripe')) {
      return res.status(400).json({
        success: false,
        message: "Payment processing failed",
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const getcitizenPayment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, check and update any expired pending payments
    const now = new Date();
    await PaymentModel.updateMany(
      { 
        citizen_id: id,
        status: 'pending',
        otpExpiry: { $lt: now } // Find payments where otpExpiry is less than current time
      },
      { $set: { status: 'failed',
        otp: "expired",
        otpSecret: "expired"
       } }
    );

    // Then fetch the updated payment data
    const [citizen, payments] = await Promise.all([
      CitizenModel.findById(id),
      PaymentModel.find({ citizen_id: id })
        .select('status invoice_number payment_date amount_paid currency service_id')
        .populate('service_id', 'name')
    ]);

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: "Citizen not found",
      });
    }

    if (!payments || payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No payments found for this citizen",
      });
    }

    // Format the response with formatted date
    const formattedPayments = payments.map(payment => {
      const paymentDate = payment.payment_date instanceof Date 
        ? payment.payment_date 
        : new Date();
      
      const formattedDate = paymentDate.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      return {
        invoice_number: payment.invoice_number,
        payment_date: formattedDate,
        amount: payment.amount_paid,
        currency: payment.currency,
        status: payment.status,
        service: {
          name: payment.service_id?.name || 'Unknown Service',
        }
      };
    });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: formattedPayments
    });

  } catch (error) {
    console.error("Error fetching citizen payments:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// Helper function to generate PDF invoice using pdf-lib
async function generateInvoicePDF({ invoiceNumber, invoiceDate, dueDate, service, department, citizen, amount, currency }) {
  const { PDFDocument, rgb } = require('pdf-lib');
  const { StandardFonts } = require('pdf-lib');
  
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();
  const margin = 50;
  const lineHeight = 20;
  const sectionGap = 30;
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Current y-position tracker
  let y = height - margin;

  // Draw invoice header
  page.drawText('INVOICE', {
    x: margin,
    y: y,
    size: 24,
    font: boldFont,
    color: rgb(0, 0, 0)
  });
  y -= lineHeight * 2;

  // Invoice details
  page.drawText(`Invoice Number: ${invoiceNumber}`, {
    x: margin,
    y: y,
    size: 12,
    font: font
  });
  y -= lineHeight;

  page.drawText(`Date: ${invoiceDate.toLocaleDateString()}`, {
    x: margin,
    y: y,
    size: 12,
    font: font
  });
  y -= lineHeight;

  page.drawText(`Due Date: ${dueDate.toLocaleDateString()}`, {
    x: margin,
    y: y,
    size: 12,
    font: font
  });
  y -= lineHeight * 1.5;

  // Draw line separator
  page.drawLine({
    start: { x: margin, y: y },
    end: { x: width - margin, y: y },
    thickness: 1,
    color: rgb(0, 0, 0)
  });
  y -= sectionGap;

  // Bill to section
  page.drawText('Bill to:', {
    x: margin,
    y: y,
    size: 14,
    font: boldFont
  });
  y -= lineHeight;

  page.drawText(`Full Name: ${citizen.first_name} ${citizen.last_name}`, {
    x: margin,
    y: y,
    size: 12,
    font: font
  });
  y -= lineHeight;

  page.drawText(`Phone Number: ${citizen.phone_number}`, {
    x: margin,
    y: y,
    size: 12,
    font: font
  });
  y -= lineHeight;

  page.drawText(`Email: ${citizen.email}`, {
    x: margin,
    y: y,
    size: 12,
    font: font
  });
  y -= sectionGap;

  // Service details
  page.drawText('Service Details:', {
    x: margin,
    y: y,
    size: 14,
    font: boldFont
  });
  y -= lineHeight;

  page.drawText(`Department: ${department.name}`, {
    x: margin,
    y: y,
    size: 12,
    font: font
  });
  y -= lineHeight;

  page.drawText(`Description: ${department.description}`, {
    x: margin,
    y: y,
    size: 12,
    font: font
  });
  y -= lineHeight;

  page.drawText(`Service: ${service.name}`, {
    x: margin,
    y: y,
    size: 12,
    font: font
  });
  y -= lineHeight;

  page.drawText(`Processing Time: ${service.processing_time}`, {
    x: margin,
    y: y,
    size: 12,
    font: font
  });
  y -= sectionGap;

  // Amount section
  page.drawText(`Amount Due: ${amount} ${currency}`, {
    x: margin,
    y: y,
    size: 16,
    font: boldFont,
    color: rgb(0.8, 0, 0) // Red color for amount
  });
  y -= sectionGap * 2;

  // Footer
  page.drawText('Thank you for your business!', {
    x: margin,
    y: margin,
    size: 12,
    font: font
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

module.exports = {
    getPayment,
    getcitizenPayment,
    paymentOTP
  };