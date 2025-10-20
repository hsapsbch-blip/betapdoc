
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="mb-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-orange-500" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                Bé Tập Đọc
            </h1>
            <p className="text-lg text-amber-700 mt-2">Cùng Gemini học đọc thật vui!</p>
        </header>
    );
};

export default Header;
