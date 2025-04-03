const { InvoiceModel } = require("../../database/models/bills");

// Get all invoices
const getAllInvoices = async (req, res) => {
  try {
    const invoices = await InvoiceModel.find()
      .populate("citizen_id")
      .populate("department_id")
      .populate("payment_id");
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching invoices",
      error: error.message,
    });
  }
};

// Get invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await InvoiceModel.findById(req.params.id)
      .populate("citizen_id")
      .populate("department_id")
      .populate("payment_id");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching invoice",
      error: error.message,
    });
  }
};

// Get invoices by citizen ID
const getInvoicesByCitizen = async (req, res) => {
  try {
    const invoices = await InvoiceModel.find({
      citizen_id: req.params.citizenId,
    })
      .populate("department_id")
      .populate("payment_id");

    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching citizen invoices",
      error: error.message,
    });
  }
};

// Update invoice status
const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const invoice = await InvoiceModel.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    invoice.status = status;
    const updatedInvoice = await invoice.save();

    res.status(200).json({
      message: "Invoice status updated",
      invoice: updatedInvoice,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating invoice status",
      error: error.message,
    });
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  getInvoicesByCitizen,
  updateInvoiceStatus,
};
