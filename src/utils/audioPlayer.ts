// 1. In-memory cache mapping question text/hash to a local Blob URL
const audioCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;

interface SpeakOptions {
    voice?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
}

export const playQuestionAudio = async (
    text: string,
    apiBaseUrl: string,
    options: SpeakOptions = {}
): Promise<void> => {
    try {
        // 1. Stop any currently playing audio (prevents overlapping speech)
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }

        // 2. Cache Hit: Audio already exists in memory! (0ms latency)
        if (audioCache.has(text)) {
            const cachedUrl = audioCache.get(text)!;
            currentAudio = new Audio(cachedUrl);

            if (options.onStart) options.onStart();
            currentAudio.onended = () => options.onEnd?.();
            currentAudio.onerror = (e) => options.onError?.(e);

            await currentAudio.play();
            return;
        }

        // 3. Cache Miss: Fetch from Render backend once
        if (options.onStart) options.onStart();

        const response = await fetch(`${apiBaseUrl}/interview/speak`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", // Sends JWT auth cookie
            body: JSON.stringify({
                text,
                voice: options.voice || "en-IN-NeerjaNeural",
            }),
        });

        if (!response.ok) {
            throw new Error(`TTS server error: ${response.status}`);
        }

        // 4. Convert response stream into a local Blob URL
        const audioBlob = await response.blob();
        const blobUrl = URL.createObjectURL(audioBlob);

        // 5. Store in cache for instant future replays
        audioCache.set(text, blobUrl);

        // 6. Play the audio
        currentAudio = new Audio(blobUrl);
        currentAudio.onended = () => options.onEnd?.();
        currentAudio.onerror = (e) => options.onError?.(e);

        await currentAudio.play();
    } catch (error) {
        console.error("Audio playback error:", error);
        if (options.onError) options.onError(error);
    }
};

// Call this when the candidate starts speaking to instantly cut off the AI's voice
export const stopQuestionAudio = () => {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
};
