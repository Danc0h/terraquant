import express from "express";
import { v4 as uuidv4 } from "uuid";
import { Project, CarbonBatch, Company } from "../../models/index.js";
import { createBatch } from "../../services/trading/carbonBatchservice.js";

const router = express.Router();

router.post("/seed", async (req, res) => {
  try {
    const { companyId } = req.body;

    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    /*
    ============================================
    1️⃣ INTERNAL VERIFIED PROJECT
    ============================================
    */

    let verifiedProject = await Project.findOne({
      where: { company_id: company.id, name: "Dev Verified Project" },
    });

    if (!verifiedProject) {
      verifiedProject = await Project.create({
        id: uuidv4(),
        company_id: company.id,
        name: "Dev Verified Project",
        country: "Kenya",
        methodology: "REDD+",
        verified_status: "VERIFIED",
        lifecycle_status: "ACTIVE",
      });

      console.log("✅ Created internal VERIFIED project");
    } else {
      console.log("♻️ Reusing internal VERIFIED project");
    }

    /*
    ============================================
    2️⃣ INTERNAL UNVERIFIED PROJECT
    ============================================
    */

    let unverifiedProject = await Project.findOne({
      where: { company_id: company.id, name: "Dev Unverified Project" },
    });

    if (!unverifiedProject) {
      unverifiedProject = await Project.create({
        id: uuidv4(),
        company_id: company.id,
        name: "Dev Unverified Project",
        country: "India",
        methodology: "Solar",
        verified_status: "PENDING",
        lifecycle_status: "ACTIVE",
      });

      console.log("✅ Created internal UNVERIFIED project");
    } else {
      console.log("♻️ Reusing internal UNVERIFIED project");
    }

    /*
    ============================================
    3️⃣ VERIFIED PROJECT BATCH
    ============================================
    */

    let verifiedBatch = await CarbonBatch.findOne({
      where: { project_id: verifiedProject.id },
    });

    if (!verifiedBatch) {
      verifiedBatch = await createBatch(company.id, verifiedProject.id, {
        vintage_year: 2024,
        total_quantity: 1000,
        available_quantity: 1000,
        price_per_unit_usd: 6,
        issuance_date: new Date(),
        status: "ACTIVE",
      });

      console.log("✅ Created internal VERIFIED batch");
    } else {
      console.log("♻️ Reusing internal VERIFIED batch");
    }

    /*
    ============================================
    4️⃣ UNVERIFIED PROJECT BATCH
    ============================================
    */

    let unverifiedBatch = await CarbonBatch.findOne({
      where: { project_id: unverifiedProject.id },
    });

    if (!unverifiedBatch) {
      unverifiedBatch = await createBatch(company.id, unverifiedProject.id, {
        vintage_year: 2024,
        total_quantity: 500,
        available_quantity: 500,
        price_per_unit_usd: 4,
        issuance_date: new Date(),
        status: "ACTIVE",
      });

      console.log("✅ Created internal UNVERIFIED batch");
    } else {
      console.log("♻️ Reusing internal UNVERIFIED batch");
    }

    return res.json({
      success: true,
      message: "Internal dev seed complete",
      data: {
        verifiedProject,
        unverifiedProject,
        verifiedBatch,
        unverifiedBatch,
      },
    });
  } catch (err) {
    console.error("Dev seed error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;
