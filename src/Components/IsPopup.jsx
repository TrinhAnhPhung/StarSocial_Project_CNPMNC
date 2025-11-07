import React, { createContext, useContext, useState } from 'react';

const PopupContext = createContext(null);

export function PopupProvider({ children }) {
    const [isPopup, setIsPopup] = useState(true);

    return (
        <PopupContext.Provider value={{ isPopup, setIsPopup }}>
            {children}
        </PopupContext.Provider>
    );
}

export function usePopup() {
    const context = useContext(PopupContext);
    if (!context) {
        throw new Error("usePopup must be used inside PopupProvider");
    }
    return context; // trả về object { isPopup, setIsPopup }
}
