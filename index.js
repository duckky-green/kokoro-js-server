import express from "express";
import cors from "cors";
import { KokoroTTS } from "kokoro-js";

const app = express();
app.use(cors());
app.use(express.json());

// Initialize 88M (v1.0) with q4 for memory safety on Render Free
const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
    device: "cpu",
    dtype: "q4" 
});

app.get("/", (req, res) => res.send("Kokoro 88M Server is Online"));

app.post("/v1/audio/speech", async (req, res) => {
    try {
        const { input, voice = "af_heart" } = req.body;
        if (!input) return res.status(400).json({ error: "No input provided" });

        const result = await tts.generate(input, { voice });
        
        // Handle result structure
        const audioBuffer = result.audio ? result.audio.buffer : result.buffer;

        if (!audioBuffer) throw new Error("Audio generation failed");

        res.set("Content-Type", "audio/wav");
        res.send(Buffer.from(audioBuffer));
    } catch (err) {
        console.error("TTS Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
