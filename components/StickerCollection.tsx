import React from 'react';

interface StickerCollectionProps {
    stickers: string[];
}

const StickerCollection: React.FC<StickerCollectionProps> = ({ stickers }) => {
    if (stickers.length === 0) {
        return null;
    }

    return (
        <div className="mb-6 bg-white/70 backdrop-blur-sm rounded-full shadow-md px-6 py-3">
            <div className="flex items-center justify-center gap-4">
                <span className="text-xl font-bold text-amber-800">Bộ sưu tập hình dán:</span>
                <div className="flex items-center gap-2">
                    {stickers.map((sticker, index) => (
                        <span key={index} className="text-4xl animate-bounce-in" style={{ animationDelay: `${index * 100}ms` }}>
                            {sticker}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

const styles = `
    @keyframes bounce-in {
        0% {
            opacity: 0;
            transform: scale(0.3);
        }
        50% {
            opacity: 1;
            transform: scale(1.05);
        }
        70% {
            transform: scale(0.9);
        }
        100% {
            transform: scale(1);
        }
    }
    .animate-bounce-in {
        display: inline-block;
        animation: bounce-in 0.6s ease-out forwards;
        opacity: 0;
    }
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default StickerCollection;
