const express = require('express');
const ServiceModel = require("../../database/models/services");
const { PaymentModel } = require("../../database/models/Payment");

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
  
      // Validate service fee
      if (typeof service.fees !== 'number' || service.fees <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid service fee amount"
        });
      }
  
      // Create and confirm payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(service.fees * 100), // Convert to cents
        currency: "EGP",
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        },
        metadata: {
          citizen_id: citizen_id.toString(),
          project: "University Project",
          service_id: service._id.toString()
        }
      });
  
      // Generate unique transaction reference
      const transactionReference = `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  
      // Create payment record in database
      const paymentRecord = new PaymentModel({
        citizen_id: citizen_id,
        stripe_payment_id: paymentIntent.id,
        service_id: service._id,
        amount_paid: service.fees,
        currency: "EGP",
        transaction_reference: transactionReference,
        payment_date: new Date()
      });
  
      await paymentRecord.save();
  
      res.status(200).json({
        success: true,
        message: "Payment processed successfully",
        data: {
          id: paymentIntent.id,
          amount: service.fees,
          currency: "EGP",
          status: paymentIntent.status,
          transaction_reference: transactionReference,
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
      
      // Handle duplicate key error specifically
      if (error.code === 11000) {
        // Regenerate reference and retry if needed
        const transactionReference = `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        try {
          const paymentRecord = new PaymentModel({
            ...req.paymentData, // Assuming you stored the data
            transaction_reference: transactionReference
          });
          await paymentRecord.save();
          return res.status(200).json({
            success: true,
            message: "Payment processed successfully after retry",
            data: { transaction_reference: transactionReference }
          });
        } catch (retryError) {
          return res.status(400).json({
            success: false,
            message: "Transaction reference conflict - please try again",
            error: "Duplicate transaction reference"
          });
        }
      }
  
      // Handle other Stripe errors
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

module.exports = {
    getPayment,
  };