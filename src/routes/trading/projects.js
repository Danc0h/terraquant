import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../../middleware/authMiddleware.js";
import * as projectService from "../../services/trading/projectService.js";
import { logAction } from "../../services/trading/auditLogService.js";
import { Op } from "sequelize";

const router = express.Router();

// Create a new project
router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const companyId = req.company.id;
    const project = await projectService.createProject(companyId, req.body);

    await logAction(companyId, "CREATE_PROJECT", "Project", project.id, {
      name: project.name,
      country: project.country,
    });

    res.status(201).json({ success: true, project });
  }),
);

// List all projects owned by company
import { Project, CarbonBatch } from "../../models/index.js";

export const listCompanyProjects = async (companyId) => {
  return await Project.findAll({
    where: { company_id: companyId },
    include: [
      {
        model: CarbonBatch,
        as: "batches",
        required: false, // include even if no batches
      },
    ],
    order: [["created_at", "DESC"]],
  });
};
// List all projects (for buyers or public)
export const listAllProjects = async () => {
  return await Project.findAll({
    where: {
      lifecycle_status: "ACTIVE",
    },
    include: [
      {
        model: CarbonBatch,
        as: "batches",
        where: {
          status: "ACTIVE",
          available_quantity: {
            [Op.gt]: 0,
          },
        },
        required: true, // only return projects that HAVE sellable batches
      },
    ],
    order: [["created_at", "DESC"]],
  });
};

// Get single project
router.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const project = await projectService.getProjectById(
      req.params.id,
      req.company?.id, // optional company context
    );

    res.status(200).json({ success: true, project });
  }),
);

export default router;
