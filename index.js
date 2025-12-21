const express = require("express");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");
const { Server } = require("socket.io");
const http = require("http");
require("dotenv").config();
require("./config/passport");

const authRoutes = require("./routes/authRoutes");
const skillRoutes = require("./routes/skillRoutes");
const exchangeRoutes = require("./routes/exchangeRoutes");
const uploadRoute = require("./routes/uploadRoutes");
const notificationRoute = require("./routes/notifiacationRoute"); // corrected filename
const reviewRoute = require("./routes/reviewRoute")
const profileRoute = require("./routes/profileRoute")

const app = express();
const port = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || "http://localhost:3000", methods: ["GET","POST"], credentials: true },
  transports: ["websocket", "polling"]
});

// export io so controllers can use it
module.exports = { io }


// Middleware
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/", skillRoutes);
app.use("/", exchangeRoutes);
app.use("/", uploadRoute);
app.use("/", reviewRoute);
app.use("/", profileRoute);
app.use("/", notificationRoute); // corrected

// socket setup
io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  // client should emit 'register_user' with their userId (string or number)
  socket.on("register_user", (userId) => {
    if (!userId) return;
    const room = userId.toString();
    socket.join(room);
    console.log(`👤 user ${room} joined room`);
  });

  socket.on("disconnect", () => {
    console.log(`🔴 User disconnected: ${socket.id}`);
  });
});

// IMPORTANT: listen on `server` (not app) because we attached socket.io to the server
server.listen(port, () => {
  console.log(`✅ API server running at http://localhost:${port}`);
});
