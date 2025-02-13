const express = require("express");
const cors = require("cors");
const shortid = require("shortid");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// In-memory storage (Replace with a database in production)
const links = {};

// Generate short link
app.post("/create", (req, res) => {
    const { longUrl, iosUrl, androidUrl } = req.body;
    if (!longUrl) {
        return res.status(400).json({ error: "longUrl is required" });
    }

    const shortCode = shortid.generate();
    links[shortCode] = { longUrl, iosUrl, androidUrl };
    res.json({ shortLink: `${req.protocol}://${req.get("host")}/${shortCode}` });
});

// Redirect based on platform
app.get("/:code", (req, res) => {
    const entry = links[req.params.code];
    if (!entry) return res.status(404).send("Link not found");

    const userAgent = req.headers["user-agent"]?.toLowerCase() || "";
    if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
        return res.redirect(entry.iosUrl || entry.longUrl);
    }
    if (userAgent.includes("android")) {
        return res.redirect(entry.androidUrl || entry.longUrl);
    }
    res.redirect(entry.longUrl);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
