import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"

import { config } from "../config/env"

const authenticateToken = (req: Request, res: Response, next: NextFunction): any => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        // Envia a resposta sem retornar, porque middlewares devem retornar `void`
        return res.status(401).send("Token not found!");
    }

    const token = authHeader.split(" ")[1];
    console.log("🚀 ~ authenticateToken ~ token:", token)
    jwt.verify(token, config.jwtSecret!, (err: any, user: any) => {
        console.log("🚀 ~ jwt.verify ~ err:", err)
        if (err) {
            // Envia a resposta sem retornar
            return res.status(403).send("Invalid token!");
        }
        console.log("🚀 ~ jwt.verify ~ user:", user)
        req.body.user = user; // Armazena os dados do usuário no corpo da requisição
        // Passa para o próximo middleware
        next();
    });
};

export default authenticateToken;
