import { sequelize, Company, CompanyWallet } from "../models/index.js";

const run = async () => {
  try {
    await sequelize.authenticate();

    const companies = await Company.findAll({
      include: {
        model: CompanyWallet,
      },
    });

    console.log(JSON.stringify(companies, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
};

run();
