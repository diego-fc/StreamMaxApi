import express from "express";
import Auth from "../controllers/auth/authController";
import authenticateToken from "../middlewares/authMiddleware";

const router = express.Router()

router.post("/register", (req, res) => Auth.register(req, res));
router.post("/login", (req, res) => Auth.login(req, res));
router.post("/refresh", (req, res) => Auth.refresh(req, res));
router.post("/logout", (req, res) => Auth.logout(req, res));
router.get("/protected", authenticateToken, (req: any, res: any) => {
	console.log("🚀 ~ router.get ~ req:", req)
	res.send(`Bem-vindo, ${req.body.user.userName}`);
});

export default router
