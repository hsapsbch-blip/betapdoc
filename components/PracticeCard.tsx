import React from 'react';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { StopIcon } from './icons/StopIcon';

interface PracticeCardProps {
    text: string;
    state: 'IDLE' | 'GENERATING' | 'LISTENING' | 'ANALYSING' | 'SPEAKING' | 'FEEDBACK';
    onListen: () => void;
    onStartReading: () => void;
    onStopReading: () => void;
}

const PracticeCard: React.FC<PracticeCardProps> = ({ text, state, onListen, onStartReading, onStopReading }) => {
    const isListenButtonDisabled = state !== 'IDLE';
    const isRecordButtonDisabled = state === 'GENERATING' || state === 'ANALYSING' || state === 'SPEAKING' || state === 'FEEDBACK';

    const renderRecordButtonContent = () => {
        switch (state) {
            case 'LISTENING':
                return (
                    <>
                        <StopIcon className="w-6 h-6" />
                        <span>Dừng lại</span>
                    </>
                );
            case 'ANALYSING':
                return (
                    <>
                        <LoadingSpinner className="w-6 h-6" />
                        <span>Đang chấm điểm...</span>
                    </>
                );
            case 'GENERATING':
                 return (
                    <>
                        <LoadingSpinner className="w-6 h-6" />
                        <span>Đang lấy chữ mới...</span>
                    </>
                );
            case 'SPEAKING':
                 return (
                    <>
                        <LoadingSpinner className="w-6 h-6" />
                        <span>Đang đọc mẫu...</span>
                    </>
                );
            default:
                return (
                    <>
                        <MicrophoneIcon className="w-6 h-6" />
                        <span>Bắt đầu đọc</span>
                    </>
                );
        }
    };
    
    const handleRecordButtonClick = () => {
        if (state === 'LISTENING') {
            onStopReading();
        } else {
            onStartReading();
        }
    };

    const recordButtonClass = state === 'LISTENING' 
        ? "bg-red-500 hover:bg-red-600"
        : "bg-green-500 hover:bg-green-600";

    return (
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-6 transform transition-transform hover:scale-105 duration-300">
            <div className="min-h-[120px] flex items-center justify-center bg-amber-50 rounded-2xl p-6 mb-6">
                {state === 'GENERATING' ? (
                    <LoadingSpinner className="w-12 h-12 text-orange-400" />
                ) : (
                    <p className="text-4xl md:text-5xl font-bold text-gray-800 text-center tracking-wide">{text}</p>
                )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={onListen}
                    disabled={isListenButtonDisabled}
                    className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-sky-500 text-white font-bold rounded-xl shadow-md hover:bg-sky-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:translate-y-[-2px] disabled:transform-none"
                >
                    <SpeakerIcon className="w-6 h-6" />
                    <span>Nghe đọc mẫu</span>
                </button>
                <button
                    onClick={handleRecordButtonClick}
                    disabled={isRecordButtonDisabled}
                    className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 text-white font-bold rounded-xl shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:translate-y-[-2px] disabled:transform-none ${recordButtonClass}`}
                >
                    {renderRecordButtonContent()}
                </button>
            </div>
        </div>
    );
};

export default PracticeCard;