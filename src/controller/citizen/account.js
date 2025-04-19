const { CitizenModel } = require("../../database/models/citizen");

const getAccount = async (req, res) => {
  try {
    const { id } = req.params;

    // Find citizen by ID and select specific fields
    const citizen = await CitizenModel.findById(id)
      .select(
        "first_name last_name phone_number national_id email date_of_birth Government -_id"
      )
      .lean();

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: "Citizen not found",
      });
    }

    // Format the birthday date (optional)
    const formattedCitizen = {
      ...citizen,
      birthday: citizen.date_of_birth?.toISOString().split("T")[0], // Formats as YYYY-MM-DD
    };

    res.status(200).json({
      success: true,
      data: formattedCitizen,
    });
  } catch (error) {
    console.error("Error fetching citizen account:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getAccount,
};
