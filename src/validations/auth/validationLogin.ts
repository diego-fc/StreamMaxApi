import { z } from "zod";

export const loginSchema = z.object({
	emailOrCpf: z.string().nonempty("Email or CPF is required")
		.refine((value) => {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
			return emailRegex.test(value) || cpfRegex.test(value);
		}, {
			message: "Email or CPF is invalid"
		}),
	password: z.string().nonempty("Password is required")
});