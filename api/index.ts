import express from "express";
import mealRoutes from "../routes/meal.routes";
import itemsRoutes from "../routes/items.route";
import authRoutes from "../routes/auth.route";
import savedMealsRoutes from "../routes/savedMeals.route";
import cors from "cors";
import cookieParser from "cookie-parser";

const PORT = process.env.PORT || 3001;

const app = express();

export const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://food-calc-rose.vercel.app",
];

// app.use
app.use(
  cors({
    origin: (origin, callback) => {
      // Postman or mobile apps
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);
app.use(express.json());
app.use(cookieParser());

// format json
app.set("json spaces", 2);

// routes
app.use("/meals", mealRoutes);
app.use("/items", itemsRoutes);
app.use("/auth", authRoutes);
app.use("/saved-meals", savedMealsRoutes);

export default app;

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`),
);

module.exports = app;
