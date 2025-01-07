import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { config } from "../config/env";
import { prisma } from "../lib/prisma";

const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const authHeader = req.headers.authorization;
    const personId = req.headers.id;

    if (!authHeader) {
        return res.status(401).send({ errorMessage: "Token not found!" });
    } else if (!personId || Array.isArray(personId)) {
        return res.status(400).send({ errorMessage: "Invalid or missing user ID!" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decodedToken = jwt.verify(token, config.jwtSecret!);

        const getToken = await prisma.token.findFirst({
            where: {
                personId: personId,
                token: token,
                active: true
            }
        });

        if (!getToken) {
            return res.status(403).send({ errorMessage: "Invalid token!" });
        }

        req.body.user = decodedToken; // Armazena os dados do usuário no corpo da requisição
        next(); // Passa para o próximo middleware
    } catch (err) {
        return res.status(403).send({ errorMessage: "Invalid token!" });
    }
};

export default authenticateToken;
