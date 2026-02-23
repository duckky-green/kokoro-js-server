import express from "express";
import cors from "cors";
import { KokoroTTS } from "kokoro-js";

const app = express();
app.use(cors());
app.use(express.json());

// USE THE LIGHTER 82M MODEL (v0.19)
// This is the most "lightweight" version available for JS
const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-ONNX", {
    device: "cpu",
    dtype: "q8" 
});

app.get("/", (req, res) => res.send("Lightweight Kokoro is Online"));

app.post("/v1/audio/speech", async (req, res) => {
    try {
        const { input, voice = "af_heart" } = req.body;
        // Limit text length to prevent memory spikes during synthesis
        const result = await tts.generate(input.slice(0, 150), { voice });
        
        const audioBuffer = result.audio ? result.audio.buffer : result.buffer;
        res.set("Content-Type", "audio/wav");
        res.send(Buffer.from(audioBuffer));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Lightweight Server running on port ${PORT}`));
