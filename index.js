import { KokoroTTS } from "kokoro-js";
import express from "express";

const app = express();
app.use(express.json());

// Load the 88M (v1.0) model
const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
    device: "cpu" 
});

// OpenAI-Compatible Endpoint
app.post("/v1/audio/speech", async (req, res) => {
    try {
        const { input, voice = "af_heart", speed = 1.0 } = req.body;

        if (!input) return res.status(400).json({ error: "Input text is required" });

        console.log(`Generating: "${input.substring(0, 30)}..." with voice ${voice}`);
        
        const audio = await tts.generate(input, { voice, speed });
        
        res.set("Content-Type", "audio/mpeg"); // Standard audio type
        res.send(Buffer.from(audio.buffer));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 AI TTS Server ready on port ${PORT}`));
