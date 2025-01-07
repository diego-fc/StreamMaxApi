import { generateAccessToken, generateRefreshToken, verifyAccessToken } from "../../utils/jws";
import { register } from "../../useCases/auth/register";
import { login } from "../../useCases/auth/login";
import { loginSchema } from "../../validations/auth/validationLogin";
import { registerSchema } from "../../validations/auth/validationRegister";
import { refreshToken } from "../../useCases/auth/refreshToken";
import { logout } from "../../useCases/auth/logout";

interface User {
	id: string
	emailOrCpf: string;
	password: string;
}

class Auth {
	private users: User[] = []; // Simulação de banco de dados
	private refreshTokens: string[] = []; // Armazenamento temporário de refresh tokens

	public async register(req: any, res: any): Promise<void> {
		try {
			const validationResult = registerSchema.safeParse(req.body);

			if (!validationResult.data?.userName || !validationResult.data.password) {
				return res.status(400).send(validationResult);
			}

			const result = await register(validationResult.data);
			res.status(result?.statusCode).send({ message: result.message });
		} catch (error: any) {
			return res.status(500).send({ errorMessage: error.message as string });
		}
	}

	public async login(req: any, res: any): Promise<void> {
		const validationResult = loginSchema.safeParse(req.body);

		if (!validationResult.success) {
			res.status(400).send({ errorMessage: validationResult.error.errors.map(err => err.message).join(", ") });
			return;
		}

		const result = await login(req);

		res.cookie("refreshToken", result.refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
		});

		res.status(result.statusCode).send({
			...(result.message && { message: result.message }),
			...(result.errorMessage && { errorMessage: result.errorMessage }),
			data: result.data
		});
	}

	// Atualização do access token usando o refresh token
	public async refresh(req: any, res: any): Promise<void> {
		const { id } = req.headers;
		const token = req.cookies.refreshToken;

		try {
			const result = await refreshToken({ token, id: id });

			res.cookie("refreshToken", result.refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
			});

			res.status(result.statusCode).json({
				...(result.message && { message: result.message }),
				...(result.errorMessage && { errorMessage: result.errorMessage }),
				data: result.data
			});
		} catch (err: any) {
			res.status(403).send({ errorMessage: err.message });
		}
	}

	// Logout do usuário
	public async logout(req: any, res: any): Promise<void> {
		const refreshToken = req.cookies.refreshToken;
		const id = req.headers.id;

		const result = await logout(refreshToken, id);


		res.clearCookie("refreshToken");
		res.status(result.statusCode).send({
			...(result.message && { message: result.message }),
			...(result.errorMessage && { message: result.errorMessage }),
		});
	}
}

export default new Auth();