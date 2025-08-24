import express from "express";
import morgan from "morgan";
const app = express();
import { readdirSync } from "fs";
import cors from "cors";

// const authRouter = require("./routes/auth");
// const categoryRouter = require("./routes/category");

// middleware to parse JSON bodies
app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" }));
app.use(cors());
const router = express.Router();

// app.use("/", authRouter); // use the auth router for /register route
// app.use("/", categoryRouter); // use the category router for /category route

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

// app.post("/", (req, res) => {
//   res.send("Welcome to the API");
// });

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
