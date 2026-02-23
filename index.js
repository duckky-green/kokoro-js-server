import { KokoroTTS } from "kokoro-js";
import express from "express";
import cors from "cors"; // 1. Import CORS

const app = express();
app.use(cors()); // 2. Enable CORS for all origins
app.use(express.json());

const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
    device: "cpu",
    dtype: "q8" 
});

app.get("/", (req, res) => res.send("Kokoro 88M (Quantized) is Online"));

// 3. Ensure you are hitting this EXACT path
app.post("/v1/audio/speech", async (req, res) => {
    try {
        const { input, voice = "af_heart" } = req.body;
        const audio = await tts.generate(input, { voice });
        res.set("Content-Type", "audio/wav");
        res.send(Buffer.from(audio.buffer));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(process.env.PORT || 3000);
