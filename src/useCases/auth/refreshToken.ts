import { prisma } from "../../lib/prisma";
import { verifyAccessToken, generateAccessToken, decodeAccessToken, generateRefreshToken } from "../../utils/jws";

interface IRefreshTokenProps {
	token: string;
	id: string;
}

interface IResponse {
	message?: string;
	errorMessage?: string;
	refreshToken?: string
	data?: {
		id: string;
		accessToken: string;
		userName: string
	};
	statusCode: number;
}

export const refreshToken = async ({ token, id }: IRefreshTokenProps): Promise<IResponse> => {
	if (!token || !id) {
		return { errorMessage: "Refresh token not found!", statusCode: 401 };
	}

	const getToken = await prisma.token.findFirst({
		where: {
			personId: id,
			active: true,
		}
	});

	if (!getToken) {
		return { errorMessage: "Invalid refresh token!", statusCode: 403 };
	}

	if (new Date() > new Date(getToken.expiresAt)) {
		return { errorMessage: "Refresh token expired!", statusCode: 403 };
	}

	try {
		const user = verifyAccessToken(token);

		if (!user || user.tokenType !== "refresh") {
			return { errorMessage: "Invalid token type!", statusCode: 403 };
		}

		const userPayload = {
			userName: user.userName,
			id: user.id,
			personId: user.personId,
			emailOrCpf: user.emailOrCpf,
		};

		const newAccessToken = generateAccessToken(userPayload);
		const newRefreshToken = generateRefreshToken({ ...userPayload, tokenType: "refresh" }); // Rotação

		const decodedToken = decodeAccessToken(newAccessToken);
		const expiresAt = new Date(decodedToken?.exp! * 1000).toISOString();

		await prisma.token.create({
			data: {
				expiresAt,
				token: newRefreshToken,
				personId: id,
			},
		});

		await prisma.token.update({
			where: {
				id: getToken.id,
			},
			data: {
				active: false,
			},
		});

		return {
			message: "Access token refreshed",
			statusCode: 200,
			refreshToken: newRefreshToken,
			data: {
				id: user.id,
				accessToken: newAccessToken,
				userName: user.userName,
			},
		};
	} catch (err: any) {
		return { errorMessage: err.message, statusCode: 500 };
	}
};
