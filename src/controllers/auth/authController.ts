import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
import { generateAccessToken, generateRefreshToken, verifyAccessToken } from "../../utils/jws";

interface User {
	id: string
	userName: string;
	password: string;
}

class Auth {
	private users: User[] = []; // Simulação de banco de dados
	private refreshTokens: string[] = []; // Armazenamento temporário de refresh tokens

	public async register(req: any, res: any): Promise<void> {
		const body = req.body;
		if (!body.userName || !body.password) {
			res.status(400).send("Require fields!");
			return;
		}

		const hashedPassword = await bcrypt.hash(body.password, 10);
		this.users.push({ id: uuidv4(), userName: body.userName, password: hashedPassword });
		res.status(201).send("Created user!");
	}

	public async login(req: any, res: any): Promise<void> {
		const { userName, password } = req.body;
		const user = this.users.find((u) => u.userName === userName);

		if (!user) {
			res.status(404).send({ errorMessage: "User not found!" });
			return;
		}

		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			res.status(401).send({ errorMessage: "Invalid password!" });
			return;
		}

		const userPayload = { userName, id: user.id };
		const accessToken = generateAccessToken(userPayload);
		const refreshToken = generateRefreshToken(userPayload);
		this.refreshTokens.push(refreshToken);

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
		});

		const response = {
			id: user.id,
			userName: user.userName,
			accessToken,
		}

		res.json(response);
	}

	// Atualização do access token usando o refresh token
	public refresh(req: any, res: any): void {
		const refreshToken = req.cookies.refreshToken;

		if (!refreshToken) {
			res.status(401).send({ errorMessage: "Refresh token not found!" });
			return;
		}

		if (!this.refreshTokens.includes(refreshToken)) {
			res.status(403).send({ errorMessage: "Invalid refresh token!" });
			return;
		}

		try {
			const user = verifyAccessToken(refreshToken);

			const newAccessToken = generateAccessToken({ username: user.userName, id: user.id });

			res.json({
				accessToken: newAccessToken,
				username: user.userName,
				id: user.id
			});
		} catch (err: any) {
			res.status(403).send({ errorMessage: err.message });
		}
	}

	// Logout do usuário
	public logout(req: any, res: any): void {
		const refreshToken = req.cookies.refreshToken;
		if (!refreshToken) {
			res.status(400).send({ errorMessage: "Nenhum refresh token para remover!" });
			return;
		}

		const index = this.refreshTokens.indexOf(refreshToken);
		if (index > -1) this.refreshTokens.splice(index, 1);

		res.clearCookie("refreshToken");
		res.send({ message: "Logout efetuado com sucesso!" });
	}
}

export default new Auth();