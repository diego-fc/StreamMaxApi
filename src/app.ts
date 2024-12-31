import express from "express";
import cookieParser from "cookie-parser";
import routes from "./routes/autoRoutes"

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use('/auth', routes)

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
