import { KokoroTTS } from "kokoro-js";
import express from "express";

const app = express();
app.use(express.json());

// CRITICAL: Use 'q8' or 'q4' for Render Free Tier (512MB)
// This reduces the model's RAM footprint to ~80MB-100MB
const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
    device: "cpu",
    dtype: "q8" // Options: "q8", "q4", "fp16". Use "q8" for best balance.
});

app.get("/", (req, res) => res.send("Kokoro 88M (Quantized) is Online"));

app.post("/v1/audio/speech", async (req, res) => {
    try {
        const { input, voice = "af_heart" } = req.body;
        // Optimization: Keep text short per request to avoid memory spikes
        const audio = await tts.generate(input, { voice });
        res.set("Content-Type", "audio/wav");
        res.send(Buffer.from(audio.buffer));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(process.env.PORT || 3000);
