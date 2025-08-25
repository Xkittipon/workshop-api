import express from "express";
import morgan from "morgan";
import { readdirSync } from "fs";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// middleware
app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" }));

// ⚡️ ตั้งค่า CORS แบบละเอียด
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // ถ้าใช้ cookie / auth
  })
);

// routes
await Promise.all(
  readdirSync("./routes").map(async (c) => {
    const route = await import(`./routes/${c}`);
    const handler = route.default || route;

    if (typeof handler !== "function") {
      throw new TypeError(`Route in ${c} is not a valid router`);
    }

    app.use("/api", handler);
  })
);

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
