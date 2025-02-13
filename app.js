const fs = require("fs");
const express = require("express");
const cors = require("cors");
const shortid = require("shortid");


const app = express();
const PORT = 5300;

app.use(express.json());
app.use(cors());

// Simple JSON database (Replace with real DB later)
const DB_FILE = "links.json";
const loadLinks = () => JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
const saveLinks = (links) => fs.writeFileSync(DB_FILE, JSON.stringify(links, null, 2));

// Ensure DB file exists
if (!fs.existsSync(DB_FILE)) saveLinks({});

// Generate short link
app.post("/create", (req, res) => {
    const { longUrl, iosUrl, androidUrl } = req.body;
    const shortCode = shortid.generate();
    const links = loadLinks();
    links[shortCode] = { longUrl, iosUrl, androidUrl };
    saveLinks(links);
    res.json({ shortLink: `http://localhost:${PORT}/${shortCode}` });
});

// Redirect based on platform
app.get("/:code", (req, res) => {
    const links = loadLinks();
    const entry = links[req.params.code];
    if (!entry) return res.status(404).send("Link not found");

    const userAgent = req.headers["user-agent"].toLowerCase();
    if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
        return res.redirect(entry.iosUrl || entry.longUrl);
    }
    if (userAgent.includes("android")) {
        return res.redirect(entry.androidUrl || entry.longUrl);
    }
    res.redirect(entry.longUrl);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));