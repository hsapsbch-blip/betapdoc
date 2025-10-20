import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateReadingText, textToSpeech, getReadingFeedback, startTranscriptionSession } from './services/geminiService';
import type { LiveSession } from '@google/genai';
import { decodePCMToAudioBuffer } from './utils/audio';

import Header from './components/Header';
import StickerCollection from './components/StickerCollection';
import PracticeCard from './components/PracticeCard';
import FeedbackDisplay from './components/FeedbackDisplay';
import RewardModal from './components/RewardModal';

type AppState = 'IDLE' | 'GENERATING' | 'LISTENING' | 'ANALYSING' | 'SPEAKING' | 'FEEDBACK';

const STICKERS = ['🦄', '🚀', '🦖', '🦁', '🍓', '🎉', '🌈', '⭐', '🤖', '🦋', '🎈', '🏆'];
const REWARD_THRESHOLD = 3;

const App: React.FC = () => {
    const [currentText, setCurrentText] = useState<string>('');
    const [userTranscription, setUserTranscription] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [appState, setAppState] = useState<AppState>('IDLE');
    const [completedCount, setCompletedCount] = useState<number>(0);
    const [collectedStickers, setCollectedStickers] = useState<string[]>([]);
    const [showReward, setShowReward] = useState<string | null>(null);

    const sessionRef = useRef<LiveSession | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    const getAudioContext = useCallback(() => {
        // If the context exists and is not in a 'closed' state, return it.
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            return audioContextRef.current;
        }
        // Otherwise, create a new AudioContext. This handles the initial creation
        // and recreation after the context has been closed for any reason.
        console.log("Creating or recreating AudioContext for speech output.");
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        return audioContextRef.current;
    }, []);

    const speakText = async (textToSpeak: string) => {
        if (!textToSpeak) return;

        setAppState('SPEAKING');
        try {
            const audioData = await textToSpeech(textToSpeak);
            const audioContext = getAudioContext();
            const audioBuffer = await decodePCMToAudioBuffer(audioData, audioContext);
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start();
            
            return new Promise<void>(resolve => {
                source.onended = () => resolve();
            });
        } catch (error) {
            console.error("Error with text-to-speech:", error);
            throw error;
        }
    };

    const handleGenerateNewText = useCallback(async () => {
        setAppState('GENERATING');
        setFeedback('');
        setUserTranscription('');
        setCurrentText('');
        try {
            const newText = await generateReadingText();
            setCurrentText(newText);
        } catch (error) {
            console.error("Error generating new text:", error);
            setFeedback("Ôi, đã có lỗi xảy ra khi tạo chữ mới. Con thử lại nhé!");
        } finally {
            setAppState('IDLE');
        }
    }, []);

    useEffect(() => {
        handleGenerateNewText();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleListen = async () => {
        if (!currentText || appState !== 'IDLE') return;
        try {
            await speakText(currentText);
        } catch (error) {
            setFeedback("Lỗi rồi! Không thể đọc chữ cho con nghe được.");
        } finally {
            setAppState('IDLE');
        }
    };

    const processTranscription = async (transcription: string) => {
        setAppState('ANALYSING');
        let feedbackToSpeak = '';

        if (!transcription.trim()) {
            feedbackToSpeak = "Tiếc quá, cô chưa nghe con đọc gì cả. Con thử lại nhé!";
            setFeedback(feedbackToSpeak);
        } else {
            try {
                const readingFeedback = await getReadingFeedback(currentText, transcription);
                feedbackToSpeak = readingFeedback;
                setFeedback(feedbackToSpeak);
                
                const newCount = completedCount + 1;
                setCompletedCount(newCount);
                
                if (newCount > 0 && newCount % REWARD_THRESHOLD === 0) {
                    const stickerIndex = (newCount / REWARD_THRESHOLD - 1) % STICKERS.length;
                    const newSticker = STICKERS[stickerIndex];
                    setCollectedStickers(prev => [...prev, newSticker]);
                    setShowReward(newSticker);
                }
            } catch (error) {
                console.error("Error getting feedback:", error);
                feedbackToSpeak = "Có lỗi khi nhận xét bài đọc của con. Thử lại sau nhé!";
                setFeedback(feedbackToSpeak);
            }
        }
        
        try {
            await speakText(feedbackToSpeak);
        } catch (speechError) {
            console.error("Failed to speak feedback:", speechError);
        } finally {
            if (!showReward) { // Only set to FEEDBACK if no reward modal is showing
                setAppState('FEEDBACK');
            }
        }
    };
    
    const handleCloseRewardModal = () => {
        setShowReward(null);
        setAppState('FEEDBACK');
    }

    const handleStartReading = async () => {
        if (appState !== 'IDLE') return;
        setAppState('LISTENING');
        setFeedback('');
        setUserTranscription('');

        try {
             const { session, transcriptionPromise } = await startTranscriptionSession();
             sessionRef.current = session;
             
             transcriptionPromise.then(finalTranscription => {
                 sessionRef.current = null;
                 setUserTranscription(finalTranscription);
                 processTranscription(finalTranscription);
             }).catch(error => {
                 console.error("Transcription promise rejected:", error);
                 if (sessionRef.current) {
                    sessionRef.current.close();
                    sessionRef.current = null;
                 }
                 setFeedback("Có lỗi khi ghi âm. Con thử lại nhé.");
                 setAppState('IDLE');
             });
        } catch (error) {
             console.error("Error starting transcription session:", error);
             setFeedback("Không thể nghe được con đọc. Con hãy chắc chắn đã cho phép dùng micro nhé.");
             setAppState('IDLE');
             if (sessionRef.current) {
                sessionRef.current.close();
                sessionRef.current = null;
            }
        }
    };

    const handleUserStop = () => {
        if (sessionRef.current) {
            sessionRef.current.close();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-100 to-orange-200 flex flex-col items-center justify-center p-4 font-sans">
            <Header />
            <StickerCollection stickers={collectedStickers} />
            <main className="w-full max-w-2xl relative">
                {showReward && <RewardModal sticker={showReward} onClose={handleCloseRewardModal} />}
                <PracticeCard
                    text={currentText}
                    state={appState}
                    onListen={handleListen}
                    onStartReading={handleStartReading}
                    onStopReading={handleUserStop}
                />
                <FeedbackDisplay
                    feedback={feedback}
                    userTranscription={userTranscription}
                    onNext={handleGenerateNewText}
                    showNextButton={appState === 'FEEDBACK'}
                />
            </main>
        </div>
    );
};

export default App;