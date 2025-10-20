import React from 'react';
import { NextIcon } from './icons/NextIcon';

interface FeedbackDisplayProps {
    feedback: string;
    userTranscription: string;
    showNextButton: boolean;
    onNext: () => void;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedback, userTranscription, showNextButton, onNext }) => {
    if (!feedback) return null;

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 animate-fade-in">
            {userTranscription && (
                <div className="mb-4">
                    <h3 className="font-bold text-lg text-gray-600">Con đã đọc:</h3>
                    <p className="text-gray-800 text-xl italic p-3 bg-gray-100 rounded-lg">"{userTranscription}"</p>
                </div>
            )}
            <div>
                <h3 className="font-bold text-lg text-green-700">Cô giáo nhận xét:</h3>
                <p className="text-green-800 text-xl p-3 bg-green-100 rounded-lg">{feedback}</p>
            </div>
            {showNextButton && (
                <div className="mt-6 text-center">
                    <button
                        onClick={onNext}
                        className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-orange-500 text-white font-bold rounded-full shadow-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-110"
                    >
                        <span>Bài tiếp theo</span>
                        <NextIcon className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    );
};

// Add fade-in animation to Tailwind config if not present, or define it in a style tag for simplicity.
// For this project, we can inject it via index.html or a simple style block.
// Let's add it via CSS in JS for simplicity here.
const styles = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
        animation: fadeIn 0.5s ease-out forwards;
    }
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);


export default FeedbackDisplay;