import bcrypt from "bcryptjs";
import { prisma } from '../../lib/prisma';

interface IRegisterProps {
	taxId: string;
	userName: string;
	email: string;
	password: string;
	address?: {
		street: string;
		number: string;
		city: string;
		state: string;
		postalCode: string;
	}
}

interface IResponse {
	message?: string;
	errorMessage?: string;
	statusCode: number;
}

export const register = async (props: IRegisterProps): Promise<IResponse> => {
	try {
		const { userName, email, taxId, password, address } = props;

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email }
		});
		if (existingUser) {
			return { errorMessage: 'User already exists', statusCode: 400 };
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		await prisma.person.create({
			data: {
				name: userName,
				email: email,
				taxId: taxId,
				users: {
					create: {
						password: hashedPassword,
						email: email,
						userName: userName,
					}
				},
				// address: {
				// 	create: {
				// 		street: address.street as string,
				// 		number: address.number as string,
				// 		city: address.city as string,
				// 		state: address.state as string,
				// 		postalCode: address.postalCode as string,
				// 	}
				// }
			}
		})

		return { message: 'Created user', statusCode: 201 };
	} catch (error) {
		return { statusCode: 500, errorMessage: error as string };
	}
};