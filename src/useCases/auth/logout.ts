import { prisma } from '../../lib/prisma';

interface IResponse {
	data?: {
		id: string;
		userName: string;
		accessToken: string;
	}
	message?: string;
	errorMessage?: string;
	statusCode: number;
}

export const logout = async (token: string, personId: string): Promise<IResponse> => {
	try {

		if (!token && !personId) {
			return { errorMessage: "Token notfound", statusCode: 401 }
		}

		const getTokens = await prisma.token.findMany({
			where: {
				personId: personId,
				active: true
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

		return { message: 'successful logout', statusCode: 200 };
	} catch (error) {
		return { statusCode: 500, errorMessage: error as string };
	}
};