require("dotenv").config();
const mongoose = require("mongoose");
const {
  AdminModel,
  AdminRole,
} = require("../EGDS-backend/src/database/models/admin");
const bcrypt = require("bcryptjs");
const { Config } = require("./src/config");

mongoose
  .connect(Config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected!"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const generateAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const newAdmin = new AdminModel({
      first_name: "mohamed",
      last_name: "yasser",
      email: "mohamedyasser@gmail.com",
      password: hashedPassword,
      phone_number: "01018102203",
      national_id: "30312030400299",
      age: 21,
      birthday_date: new Date("2003-01-01"),
      role: AdminRole.SUPER_ADMIN,
      languagePreference: "en",
    });

    await newAdmin.save();
    console.log(" Admin Created Successfully!");
  } catch (error) {
    console.error(" Error Creating Admin:", error.message);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
generateAdmin();
