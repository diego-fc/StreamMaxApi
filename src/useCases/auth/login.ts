import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { validatePassword } from '../../utils/bcryptJs';
import { decodeAccessToken, generateAccessToken, generateRefreshToken } from '../../utils/jws';

interface IResponse {
	data?: {
		id: string;
		userName: string;
		accessToken: string;
	}
	refreshToken?: string
	message?: string;
	errorMessage?: string;
	statusCode: number;
}

export const login = async (req: Request): Promise<IResponse> => {
	const { emailOrCpf, password } = req.body;
	try {

		const existingUser = await prisma.user.findUnique({
			where: { email: emailOrCpf },
		});

		if (!existingUser) {
			return { errorMessage: "User not found!", statusCode: 404 };
		}

		const isMatch = await validatePassword(password, existingUser.password);

		if (!isMatch) {
			return { errorMessage: "Invalid password!", statusCode: 401 };
		}

		const userPayload = {
			emailOrCpf,
			id: existingUser.id,
			personId: existingUser.personId,
			userName: existingUser.userName,
		};

		const accessToken = generateAccessToken(userPayload);
		const refreshToken = generateRefreshToken({ ...userPayload, tokenType: "refresh" });
		const decodedToken = decodeAccessToken(accessToken);
		const expiresAt = new Date(decodedToken?.exp! * 1000).toISOString();

		const getTokens = await prisma.token.findMany({
			where: {
				personId: existingUser.personId,
				active: true,
			}
		});

		await prisma.token.updateMany({
			where: {
				id: {
					in: getTokens.map(token => token.id)
				}
			},
			data: {
				active: false
			}
		});

		await prisma.token.create({
			data: {
				token: refreshToken,
				expiresAt: expiresAt,
				personId: existingUser.personId,
			}
		});

		const data = {
			id: existingUser.personId,
			userName: existingUser.userName,
			accessToken,
		}


		return {
			message: 'successful login',
			refreshToken,
			data,
			statusCode: 200
		};
	} catch (error) {
		return { statusCode: 500, errorMessage: error as string };
	}
};