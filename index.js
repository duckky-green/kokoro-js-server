// Change this line in your index.js
const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
    device: "cpu",
    dtype: "q4" // Use q4 instead of q8
});

app.post("/v1/audio/speech", async (req, res) => {
    try {
        const { input, voice = "af_heart" } = req.body;
        const result = await tts.generate(input, { voice });

        // IMPORTANT: The result structure in the latest kokoro-js
        // might require result.audio.buffer or just result.buffer
        const audioBuffer = result.audio ? result.audio.buffer : result.buffer;

        if (!audioBuffer) {
            throw new Error("Audio buffer is undefined");
        }

        res.set("Content-Type", "audio/wav");
        res.send(Buffer.from(audioBuffer));
    } catch (err) {
        console.error("Generation Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});
