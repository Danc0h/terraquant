export async function up(queryInterface, Sequelize) {
  // 1️⃣ Create enum if it doesn't exist
  await queryInterface.sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_CarbonBatches_status') THEN
        CREATE TYPE "enum_CarbonBatches_status" AS ENUM('PENDING', 'ACTIVE', 'CLOSED');
      END IF;
    END
    $$;
  `);

  // 2️⃣ Change column type safely
  await queryInterface.sequelize.query(`
    ALTER TABLE "CarbonBatches" 
    ALTER COLUMN "status" TYPE "enum_CarbonBatches_status" 
    USING 
      CASE 
        WHEN "status"='PENDING' THEN 'PENDING'::enum_CarbonBatches_status
        WHEN "status"='ACTIVE' THEN 'ACTIVE'::enum_CarbonBatches_status
        WHEN "status"='CLOSED' THEN 'CLOSED'::enum_CarbonBatches_status
        ELSE 'PENDING'::enum_CarbonBatches_status
      END;
  `);

  // 3️⃣ Set default now that type matches
  await queryInterface.sequelize.query(`
    ALTER TABLE "CarbonBatches" 
    ALTER COLUMN "status" SET DEFAULT 'PENDING';
  `);

  // 4️⃣ Update Companies table columns
  await queryInterface.changeColumn("Companies", "registryBody", {
    type: Sequelize.STRING,
    allowNull: true,
  });
  await queryInterface.changeColumn("Companies", "account_id", {
    type: Sequelize.STRING,
    allowNull: true,
  });
  await queryInterface.changeColumn("Companies", "account_name", {
    type: Sequelize.STRING,
    allowNull: true,
  });
}

export async function down(queryInterface, Sequelize) {
  // Revert Companies columns
  await queryInterface.changeColumn("Companies", "registryBody", {
    type: Sequelize.STRING,
    allowNull: true,
  });
  await queryInterface.changeColumn("Companies", "account_id", {
    type: Sequelize.STRING,
    allowNull: true,
  });
  await queryInterface.changeColumn("Companies", "account_name", {
    type: Sequelize.STRING,
    allowNull: true,
  });

  // Revert CarbonBatches.status to plain string
  await queryInterface.sequelize.query(`
    ALTER TABLE "CarbonBatches"
    ALTER COLUMN "status" TYPE VARCHAR USING "status"::VARCHAR;
  `);

  // Drop enum safely
  await queryInterface.sequelize.query(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_CarbonBatches_status') THEN
        DROP TYPE "enum_CarbonBatches_status";
      END IF;
    END
    $$;
  `);
}
