const express = require("express");
const app = express();
const cors = require("cors");
const body = require("body-parser");
const connectDB = require("./db");
const authRoutes = require("./routes/auth");

app.use(cors());
app.use(body.json());

connectDB();

app.use("/auth", authRoutes);

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
