import { GoogleGenAI, Modality, LiveSession } from '@google/genai';
import { decode, encode } from '../utils/audio';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateReadingText(): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Tạo một câu tiếng Việt ngắn, đơn giản, khoảng 4-6 từ, dành cho học sinh lớp 1 đang tập đọc. Chỉ trả về câu đó, không có dấu ngoặc kép hay bất kỳ văn bản nào khác.',
            config: {
                temperature: 1,
                topP: 0.95,
            },
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error in generateReadingText:", error);
        throw new Error("Could not generate text from Gemini API.");
    }
}

export async function textToSpeech(text: string): Promise<Uint8Array> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // A friendly voice
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data returned from API.");
        }
        return decode(base64Audio);
    } catch (error) {
        console.error("Error in textToSpeech:", error);
        throw new Error("Could not convert text to speech via Gemini API.");
    }
}

export async function getReadingFeedback(originalText: string, userText: string): Promise<string> {
    const prompt = `Bạn là một giáo viên tiểu học thân thiện và kiên nhẫn. So sánh văn bản gốc với những gì học sinh đọc. Đưa ra phản hồi cực kỳ ngắn gọn (tối đa 2 câu), tích cực và khuyến khích bằng tiếng Việt cho trẻ 6 tuổi. Luôn bắt đầu bằng một lời khen. Nếu có lỗi, hãy chỉ ra một cách nhẹ nhàng và chỉ ra tối đa 1-2 từ sai.
Văn bản gốc: "${originalText}"
Học sinh đọc: "${userText}"
Phản hồi:`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.5,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error in getReadingFeedback:", error);
        throw new Error("Could not get feedback from Gemini API.");
    }
}


export async function startTranscriptionSession(): Promise<{ session: LiveSession; transcriptionPromise: Promise<string> }> {
    let finalTranscription = '';
    let resolveTranscriptionPromise: (value: string) => void;
    let rejectTranscriptionPromise: (reason?: any) => void;
    let isResolved = false;

    const transcriptionPromise = new Promise<string>((resolve, reject) => {
        resolveTranscriptionPromise = resolve;
        rejectTranscriptionPromise = reject;
    });

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const source = inputAudioContext.createMediaStreamSource(stream);
    const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
    
    let isCleanedUp = false;
    const cleanup = () => {
        if (isCleanedUp) return;
        isCleanedUp = true;
        
        scriptProcessor.disconnect();
        source.disconnect();
        stream.getTracks().forEach(track => track.stop());

        if (inputAudioContext.state !== 'closed') {
            inputAudioContext.close().catch(console.error);
        }
        console.log("Audio resources cleaned up.");
    };
    
    const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => {
                source.connect(scriptProcessor);
                scriptProcessor.connect(inputAudioContext.destination);
            },
            onmessage: (message) => {
                if (message.serverContent?.inputTranscription) {
                    finalTranscription += message.serverContent.inputTranscription.text;
                }
                if (message.serverContent?.turnComplete) {
                    if (!isResolved) {
                        isResolved = true;
                        resolveTranscriptionPromise(finalTranscription.trim());
                    }
                    cleanup();
                }
            },
            onerror: (e) => {
                console.error('Live session error:', e);
                if (!isResolved) {
                    isResolved = true;
                    rejectTranscriptionPromise(e);
                }
                cleanup();
            },
            onclose: (e) => {
                console.log('Live session closed.');
                if (!isResolved) {
                    isResolved = true;
                    resolveTranscriptionPromise(finalTranscription.trim());
                }
                cleanup();
            },
        },
        config: {
            inputAudioTranscription: {},
            responseModalities: [Modality.AUDIO],
        },
    });

    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
        if (isCleanedUp) return;

        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
        const l = inputData.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = inputData[i] * 32768;
        }
        const pcmBlob = {
            data: encode(new Uint8Array(int16.buffer)),
            mimeType: 'audio/pcm;rate=16000',
        };
        sessionPromise.then((session) => {
            if (!isCleanedUp && session) {
                 session.sendRealtimeInput({ media: pcmBlob });
            }
        }).catch(err => {
            console.error("Error sending realtime input:", err);
            cleanup();
        });
    };
    
    const session = await sessionPromise;
    return { session, transcriptionPromise };
}