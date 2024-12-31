import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

export const config = {
  jwtSecret: process.env.JWT_SECRET,
  refreshSecret: process.env.REFRESH_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION,
  refreshExpiration: process.env.REFRESH_EXPIRATION,
};
