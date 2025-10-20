import React from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface RewardModalProps {
    sticker: string;
    onClose: () => void;
}

const RewardModal: React.FC<RewardModalProps> = ({ sticker, onClose }) => {
    return (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in-fast rounded-3xl">
            <div className="bg-white rounded-3xl shadow-2xl p-8 m-4 text-center transform scale-up-animation max-w-sm w-full relative">
                 <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Đóng"
                >
                    <CloseIcon className="w-8 h-8" />
                </button>
                <h2 className="text-3xl font-bold text-orange-500 mb-4">Tuyệt vời!</h2>
                <p className="text-lg text-gray-700 mb-6">Con nhận được một hình dán mới!</p>
                <div className="text-8xl animate-tada">{sticker}</div>
                <button
                    onClick={onClose}
                    className="mt-8 px-8 py-3 bg-green-500 text-white font-bold rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-110"
                >
                    Tiếp tục nào!
                </button>
            </div>
        </div>
    );
};


const styles = `
    @keyframes fadeInFast {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    .animate-fade-in-fast {
        animation: fadeInFast 0.3s ease-out forwards;
    }

    @keyframes scale-up {
        from { transform: scale(0.7); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
    .scale-up-animation {
        animation: scale-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    
    @keyframes tada {
        0% {transform: scale(1);}
        10%, 20% {transform: scale(0.9) rotate(-3deg);}
        30%, 50%, 70%, 90% {transform: scale(1.1) rotate(3deg);}
        40%, 60%, 80% {transform: scale(1.1) rotate(-3deg);}
        100% {transform: scale(1) rotate(0);}
    }
   .animate-tada {
      animation: tada 1s ease-in-out;
   }
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);


export default RewardModal;
