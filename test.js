
import express from "express";
import ejs from "ejs";
import pg from "pg";
import multer from "multer";
import bodyParser from "body-parser";
import bcrypt, { hash } from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

const app = express();
const port = 4000;
const saltRounds = 12;
env.config();

// Create a middleware function to check if a user is authenticated
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false } // Set to true if using https
    })
);

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST, 
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});
db.connect();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

// --- ROUTES ---

app.get("/", (req, res) => {
    res.render("index", { user: req.user });
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/create", isLoggedIn, (req, res) => {
    res.render("create");
});

app.get("/sign", (req, res) => {
    res.render("sign");
});

// Profile route is now protected
app.get("/profile", isLoggedIn, async (req, res) => {
    try {
        // req.user is populated by Passport after authentication
        const user = req.user;
        console.log(user)
        res.render("profile", { user });
    } catch (error) {
        console.error(error);
        res.render("profile", { error: "Something went wrong." });
    }
});

app.post("/signup", async (req, res) => {
    const { fullname, username, email, password } = req.body;
    try {
        const result = await db.query("SELECT * FROM users WHERE email = $1 OR username = $2", [email, username]);

        if (result.rows.length > 0) {
            res.render("sign", { error: "User already exists with this email/username." });
        } else {
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if (err) {
                    console.error("Error hashing password:", err);
                    return res.render("sign", { error: "An error occurred during signup." });
                }
                try {
                    const result = await db.query(
                        "INSERT INTO users (username, email, fullname, hash_password) VALUES ($1, $2, $3, $4) RETURNING *",
                        [username, email, fullname, hash]
                    );
                    const user = result.rows[0];
                    req.login(user, (err) => {
                        if (err) return console.log(err);
                        res.redirect("/profile");
                    });
                } catch (err) {
                    console.error("Error inserting user:", err);
                    res.render("sign", { error: "Something went wrong with the database. Please try again." });
                }
            });
        }
    } catch (err) {
        console.error("Signup error:", err);
        res.render("sign", { error: "Something went wrong." });
    }
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
}));

app.get("/dashboard", isLoggedIn, (req, res) => {
      try {
        // req.user is populated by Passport after authentication
        const user = req.user;
        console.log(user)
        res.render("dashboard", { user });
    } catch (error) {
        console.error(error);
        res.render("dashboard", { error: "Something went wrong." });
    }
    // res.render("dashboard");
});

// Profile picture upload is now protected
app.post("/post", isLoggedIn, upload.single("file"), async (req, res) => {
    try {
        const imagepath = req.file.filename;
        const userId = req.user.id; // Corrected to use req.user.id

        await db.query(
            "UPDATE users SET img_url = $1 WHERE id = $2",
            [imagepath, userId]
        );

        // Passport will automatically update the session, but we can manually
        // update the req.user object for the current request
        req.user.img_url = imagepath;

        res.redirect("/profile");
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong while uploading");
    }
});

app.get("/skills", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM skills");
        const skills = result.rows;
        res.render("skill", { skill: skills });
    } catch (error) {
        console.error(error);
        res.render("skill.ejs", { error: "Something went wrong." });
    }
});

app.post("/create-skill", isLoggedIn, upload.single("file"), async (req, res) => {
    const { skillname, skilldesc, category, skilllevel } = req.body;
    const validChars = /^[a-zA-Z0-9\s]+$/;

    if (skillname.length < 2 || skillname.length > 50 || !validChars.test(skillname)) {
        return res.render("create", { error: "Skill name must be between 2 and 50 characters and contain valid characters." });
    }
    if (skilldesc.length < 10 || skilldesc.length > 500 || !validChars.test(skilldesc)) {
        return res.render("create", { error: "Description must be between 10 and 500 characters and contain valid characters." });
    }
    if (category.length < 2 || category.length > 30 || !validChars.test(category)) {
        return res.render("create", { error: "Category must be between 2 and 30 characters and contain valid characters." });
    }

    const userId = req.user.id; // Corrected to use req.user.id
    const imagepath = req.file.filename;

    try {
        await db.query(
            "INSERT INTO skills (title, description, category, level, skill_img, user_id) VALUES ($1, $2, $3, $4, $5, $6)",
            [skillname, skilldesc, category, skilllevel, imagepath, userId]
        );
        res.redirect("/skills");
    } catch (error) {
        console.error("Error creating skill:", error);
        res.render("create.ejs", { error: "Something went wrong with the database. Please try again." });
    }
});

app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return console.log(err);
        }
        res.redirect("/");
    });
});

// --- PASSPORT SETUP ---

passport.use(
    new Strategy(async function verify(emailOrUsername, password, cb) {
        try {
            const result = await db.query(
                "SELECT * FROM users WHERE email = $1 OR username = $2", // Corrected query
                [emailOrUsername, emailOrUsername]
            );
            
            if (result.rows.length > 0) {
                const user = result.rows[0];
                const storedhashPassword = user.hash_password;

                bcrypt.compare(password, storedhashPassword, (err, isValid) => {
                    if (err) {
                        return cb(err);
                    }
                    if (isValid) {
                        return cb(null, user);
                    } else {
                        return cb(null, false); // Return false on invalid password
                    }
                });
            } else {
                return cb(null, false); // Return false on user not found
            }
        } catch (error) {
            return cb(error);
        }
    })
);

passport.serializeUser((user, cb) => {
    cb(null, user.id); // Only store user ID in session
});

passport.deserializeUser(async (id, cb) => {
    try {
        const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
        if (result.rows.length > 0) {
            cb(null, result.rows[0]); // Fetch full user object by ID
        } else {
            cb(null, false); // User not found
        }
    } catch (err) {
        cb(err);
    }
});

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
