import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser(process.env.SESSION_SECRET ?? "ethioobiz-secret"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple signed-cookie session middleware
app.use((req: any, _res, next) => {
  const raw = (req as any).signedCookies?.session;
  try {
    req.session = raw ? JSON.parse(raw) : {};
  } catch {
    req.session = {};
  }
  next();
});

app.use("/api", router);

export default app;
