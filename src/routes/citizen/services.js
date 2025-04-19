const express = require("express");
const { changeLanguage } = require("../../middleware/language");
const {
  getAllServices,
  getServicesByDepartment,
  getServiceById,
} = require("../../controller/citizen/services");

const router = express.Router();

router.get("/services-list", changeLanguage, getAllServices);
router.get(
  "/by-department/:departmentId",
  changeLanguage,
  getServicesByDepartment
);
router.get("/services-list/:serviceId", changeLanguage, getServiceById);
module.exports = router;
