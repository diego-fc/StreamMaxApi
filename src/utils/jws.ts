import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config/env"

export const generateAccessToken = (payload: any) => {
	if (!config.jwtSecret) {
		throw new Error("JWT secret is not defined!");
	}

	return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiration });
};

export const generateRefreshToken = (payload: any) => {
	if (!config.refreshSecret) {
		throw new Error("Refresh secret is not defined!");
	}

	return jwt.sign(payload, config.refreshSecret, { expiresIn: config.refreshExpiration });
};

export const verifyAccessToken = (refreshToken: string) => {
	try {
		const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET!);
		return decoded as JwtPayload;
	} catch (err) {
		throw new Error("Token inválido ou expirado!");
	}
};

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken };
