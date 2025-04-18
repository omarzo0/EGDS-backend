const express = require('express');
const ServiceModel = require("../../database/models/services");
const DepartmentModel = require("../../database/models/department");
const { PaymentModel } = require("../../database/models/Payment");
const { CitizenModel } = require("../../database/models/citizen");
const nodemailer = require("nodemailer");
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const { param } = require('../../routes/citizen/counts');

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());

const getPayment = async (req, res) => {
  try {
    const { paymentMethodId, service_id, citizen_id } = req.body;

    // Validate required fields
    if (!paymentMethodId || !service_id || !citizen_id) {
      return res.status(400).json({
        success: false,
        message: "Payment method ID, service ID, and citizen ID are required"
      });
    }

    // Verify the service exists
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
    const citizen = await CitizenModel.findById(citizen_id).select('email first_name last_name');
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
        citizen_id: citizen_id.toString(),
        project: "University Project",
        service_id: service._id.toString(),
        invoice_number: invoiceNumber // Store our custom invoice number
      }
    });

    // Create payment record in database with invoice number
    const paymentRecord = new PaymentModel({
      citizen_id: citizen_id,
      stripe_payment_id: paymentIntent.id,
      service_id: service._id,
      amount_paid: service.fees,
      currency: "EGP",
      invoice_number: invoiceNumber, // Store the invoice number
      payment_date: new Date(),
    });

    await paymentRecord.save();

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
    
    const [citizen, payments] = await Promise.all([
      CitizenModel.findById(id),
      PaymentModel.find({ citizen_id: id })
        .select('invoice_number payment_date amount_paid currency service_id')
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
      // Format the date as "15 May 2023"
      const formattedDate = payment.payment_date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      return {
        invoice_number: payment.invoice_number,
        payment_date: formattedDate, // Now using the formatted date
        amount: payment.amount_paid,
        currency: payment.currency,
        service: {
          name: payment.service_id.name,
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
      error: error.message
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
    getcitizenPayment
  };