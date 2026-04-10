import {
  Company,
  Project,
  OwnershipLedger,
  CarbonBatch,
  CompanyWallet,
} from "../../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { sequelize } from "../../models/index.js";

/**
 * Signup a new company
 */
export const signupCompany = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { name, email, password, registryBody, account_name, account_id } =
      req.body;

    const existing = await Company.findOne({ where: { email } });

    if (existing) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Email exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const company = await Company.create(
      {
        id: uuidv4(),
        name,
        email,
        password: hashedPassword,
        registryBody: registryBody || null,
        account_id: account_id || null,
        account_name: account_name || null,
      },
      { transaction: t },
    );

    // ============================
    // CREATE WALLET
    // ============================

    await CompanyWallet.create(
      {
        company_id: company.id,
        currency: "USD",
        balance: 0,
      },
      { transaction: t },
    );

    await t.commit();

    const token = generateToken(company.id);

    res.status(201).json({
      success: true,
      company,
      token,
    });
  } catch (err) {
    await t.rollback();

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
/**
 * Login company
 */
export const loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;
    const company = await Company.findOne({ where: { email } });
    if (!company)
      return res
        .status(404)
        .json({ success: false, message: "Invalid credentials" });

    const match = await bcrypt.compare(password, company.password);
    if (!match)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const token = generateToken(company.id);
    res.status(200).json({ success: true, company, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get current logged-in company
 */

export const getMe = async (req, res) => {
  try {
    const company = await Company.findByPk(req.company.id, {
      include: [
        {
          model: Project,
          as: "projects",
          include: [
            {
              model: CarbonBatch,
              as: "batches",
            },
          ],
        },
        {
          model: OwnershipLedger,
          as: "holdings",
          include: [
            {
              model: CarbonBatch,
              as: "batch",
              include: [{ model: Project, as: "project" }],
            },
          ],
        },
      ],
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // ===============================
    // AGGREGATE PORTFOLIO POSITIONS
    // ===============================
    const aggregated = {};
    let totalPortfolioValue = 0;
    let totalCreditsOwned = 0;

    company.holdings?.forEach((ledger) => {
      if (!ledger.batch) return;

      const batchId = ledger.batch_id;
      const quantity = parseFloat(ledger.quantity);
      const unitPrice = parseFloat(ledger.batch.price_per_unit_usd);

      if (!aggregated[batchId]) {
        aggregated[batchId] = {
          batchId,
          projectId: ledger.batch.project_id,
          projectName: ledger.batch.project?.name || "Unknown Project",
          vintageYear: ledger.batch.vintage_year,
          unitPrice,
          quantity: 0,
          value: 0,
        };
      }

      aggregated[batchId].quantity += quantity;
      aggregated[batchId].value =
        aggregated[batchId].quantity * aggregated[batchId].unitPrice;

      totalCreditsOwned += quantity;
    });

    const portfolio = Object.values(aggregated);

    portfolio.forEach((position) => {
      totalPortfolioValue += position.value;
    });

    // ===============================
    // RESPONSE
    // ===============================
    res.status(200).json({
      success: true,
      company,
      portfolio,
      portfolioSummary: {
        totalCreditsOwned,
        totalPortfolioValue,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * JWT generator
 */
const generateToken = (companyId) => {
  return jwt.sign({ id: companyId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
