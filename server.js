require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/pdf/:filename", async (req, res) => {
    try {
        const auth = req.headers.authorization;
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

        res.setHeader("Content-Type", "application/pdf");
        response.data.pipe(res);

    } catch (err) {
        res.status(500).send("Error");
    }
});

app.listen(process.env.PORT || 3000);