import jwt from "jsonwebtoken";

export const generateToken = (company) => {
  return jwt.sign(
    {
      id: company.id,
      role: company.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
};
