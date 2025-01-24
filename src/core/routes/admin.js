const express = require("express");
const { registerAdmin, loginAdmin, protect } = require("../Controller/admin");
const router = express.Router();

// Register route
router.post("/register", registerAdmin);

// Login route
router.post("/login", loginAdmin);

// Protected Route Example (only accessible by super admin)
router.get("/dashboard", protect(["super admin", "admin"]), (req, res) => {
  res.json({ message: "Welcome to the dashboard" });
});

// Admins can access this route, but only super admins can perform this action
router.delete("/delete/:id", protect(["super admin"]), async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await Admin.findByIdAndDelete(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting admin", error: err.message });
  }
});

module.exports = router;
