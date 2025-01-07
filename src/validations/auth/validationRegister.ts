import { z } from "zod";

export const registerSchema = z.object({
	userName: z.string().nonempty("Username is required"),
	email: z.string().nonempty("Email is required")
		.refine((value) => {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			return emailRegex.test(value);
		}, {
			message: "Email is invalid"
		}),
	taxId: z.string().nonempty("TaxId is required"),
	password: z.string().nonempty("Password is required")
});