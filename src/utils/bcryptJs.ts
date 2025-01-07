import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
	const salt = await bcrypt.genSalt(SALT_ROUNDS);
	const hashedPassword = await bcrypt.hash(password, salt);
	return hashedPassword;
};

export const validatePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
	const isValid = await bcrypt.compare(password, hashedPassword);
	return isValid;
};