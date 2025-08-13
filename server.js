import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function fetchOpenTDB(url) {
    // ניסיון ראשון
    let r = await fetch(url);
    let data = await r.json();

    if (data?.response_code === 5) {
        await sleep(5500);
        r = await fetch(url);
        data = await r.json();
    }
    return data;
}

app.get("/api/questions", async (req, res) => {
    try {
        const { amount = "5", type = "", difficulty = "" } = req.query;

        const params = new URLSearchParams();
        params.set("amount", String(amount));
        params.set("encode", "base64");
        if (type) params.set("type", type);
        if (difficulty) params.set("difficulty", difficulty);

        const url = `https://opentdb.com/api.php?${params.toString()}`;
        const data = await fetchOpenTDB(url);

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch questions" });
    }
});

// fallback
app.use((req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Trivia server running at http://localhost:${PORT}`);
});
