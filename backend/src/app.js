const express = require("express");
const cors = require("cors");
const path = require("path");
const passport = require("./config/passport");

const corsOptions = require("./config/cors");
const v1Routes = require("./routes/v1");

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API TryOn opérationnelle",
  });
});

app.use("/api/v1", v1Routes);

module.exports = app;