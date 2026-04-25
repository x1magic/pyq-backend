require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// ✅ JSON data load
const rgpvData = require("./data/rgpv.json");
const davvData = require("./data/davv.json");

// ✅ Home route
app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});


// =======================
// 📄 PDF FETCH (GitHub)
// =======================
app.get("/pdf/:uni/:filename", async (req, res) => {
    try {
        const auth = req.headers.authorization;

        // 🔐 Auth check
        if (auth !== process.env.AUTH_TOKEN) {
            return res.status(401).send("Unauthorized");
        }

        const { uni, filename } = req.params;

        // 👉 uni = rgpv या davv
        const url = `https://api.github.com/repos/${process.env.REPO_OWNER}/${process.env.REPO_NAME}/contents/pdfs/${uni}/${filename}`;

        const response = await axios.get(url, {
            headers: {
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
                Accept: "application/vnd.github.v3.raw"
            },
            responseType: "arraybuffer"
        });

        res.setHeader("Content-Type", "application/pdf");
        res.send(response.data);

    } catch (err) {
        console.error("Error:", err.message);

        if (err.response?.status === 404) {
            return res.status(404).send("File not found");
        }

        res.status(500).send("Server Error");
    }
});


// =======================
// 📚 DATA ROUTES
// =======================

// RGPV
app.get("/rgpv", (req, res) => {
    res.json(rgpvData);
});

// DAVV
app.get("/davv", (req, res) => {
    res.json(davvData);
});


// =======================
// 🔍 SEARCH ROUTES
// =======================

// RGPV Search
app.get("/search/rgpv", (req, res) => {
    const q = (req.query.q || "").toLowerCase();

    const result = rgpvData.filter(item =>
        item.subject_name.toLowerCase().includes(q) ||
        item.subject_code.toLowerCase().includes(q) ||
        item.keywords.some(k => k.toLowerCase().includes(q))
    );

    res.json(result);
});


// DAVV Search (student_year + paper_year support)
app.get("/search/davv", (req, res) => {
    const q = (req.query.q || "").toLowerCase().trim();

    const result = davvData.filter(item => {
        // सब data को एक string में flatten कर दो
        const fullText = [
            item.name,
            item.subject_name,
            item.student_year,
            item.paper_year,
            ...(item.course || []),
            ...(item.exam_month || []),
            ...(item.keywords || []),
            ...(item.tags || [])
        ]
            .join(" ")
            .toLowerCase();

        return fullText.includes(q);
    });

    res.json(result);
});


// ▶️ Start server
app.listen(process.env.PORT || 5000, () => {
    console.log("Server running...");
});