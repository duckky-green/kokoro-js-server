import express from "express";
import cors from "cors";
import { KokoroTTS } from "kokoro-js";

const app = express();
app.use(cors());
app.use(express.json());

// Load the most lightweight model (82M) to fit in 512MB RAM
const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-ONNX", {
    device: "cpu",
    dtype: "q8" 
});

// Helper to wrap raw Float32 audio into a WAV file
function encodeWAV(samples, sampleRate = 24000) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 32 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);
    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
}

app.get("/", (req, res) => res.send("Lightweight Kokoro is Online"));

app.post("/v1/audio/speech", async (req, res) => {
    try {
        const { input, voice = "af_heart" } = req.body;
        if (!input) return res.status(400).send("No input");

        // Generate raw audio
        const result = await tts.generate(input.slice(0, 200), { voice });
        
        // Extract the samples (handles different kokoro-js versions)
        const samples = result.audio ? result.audio : result;
        
        // Convert to WAV
        const wavBuffer = encodeWAV(samples);

        res.set("Content-Type", "audio/wav");
        res.send(Buffer.from(wavBuffer));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
