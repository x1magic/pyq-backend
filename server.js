require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// ✅ Home route (Cannot GET fix)
app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

// ✅ PDF route
app.get("/pdf/:filename", async (req, res) => {
    try {
        const auth = req.headers.authorization;

        // 🔐 Auth check
        if (auth !== process.env.AUTH_TOKEN) {
            return res.status(401).send("Unauthorized");
        }

        const fileName = req.params.filename;

        const url = `https://api.github.com/repos/${process.env.REPO_OWNER}/${process.env.REPO_NAME}/contents/pdfs/${fileName}`;

        const response = await axios.get(url, {
            headers: {
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
                Accept: "application/vnd.github.v3.raw"
            },
            responseType: "stream"
        });

        // 📄 Send PDF
        res.setHeader("Content-Type", "application/pdf");
        response.data.pipe(res);

    } catch (err) {
        console.error("Error:", err.message);

        // Better error message
        if (err.response?.status === 404) {
            return res.status(404).send("File not found");
        }

        res.status(500).send("Server Error");
    }
});

// ▶️ Start server
app.listen(process.env.PORT || 5000, () => {
    console.log("Server running...");
});