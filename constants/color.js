export const COLORS = {
    primary: '#3498db',
    primaryDark: '#2980b9',
    secondary: '#2ecc71',
    danger: '#e74c3c',
    warning: '#f1c40f',
    info: '#3498db',
    success: '#2ecc71',
    white: '#ffffff',
    black: '#000000',
    gray: '#95a5a6',
    lightGray: '#ecf0f1',
    darkGray: '#34495e',
    transparent: 'transparent',
    
    light: {
        background_color: '#ffffff',
        card_background: '#f8f9fa',
        text_primary: '#1a1a1a',
        text_secondary: '#757575',
        border_color: '#e0e0e0',
        input_background: '#f5f5f5',
        icon_color: '#262626',
        tab_active: '#3498db',
        tab_inactive: '#bdc3c7',
        // Legacy support
        Text_color: '#1a1a1a',
        Text_color_blue_primary: '#3498db',
        Text_color_blue_secondary: '#739EC9',
        Text_color_purple: '#391ED6',
    },
    dark: {
        background_color: '#121212',
        card_background: '#1e1e1e',
        text_primary: '#ffffff',
        text_secondary: '#b0b0b0',
        border_color: '#333333',
        input_background: '#2c2c2c',
        icon_color: '#ffffff',
        tab_active: '#3498db',
        tab_inactive: '#7f8c8d',
        // Legacy support
        Text_color: '#ffffff',
        Text_color_blue_primary: '#3498db',
        Text_color_blue_secondary: '#739EC9',
        Text_color_purple: '#391ED6',
    }
};

export const SIZES = {
    // Global Sizing
    base: 8,
    font: 14,
    radius: 12,
    padding: 24,
    margin: 24,

    // Font Sizes
    h1: 30,
    h2: 22,
    h3: 16,
    h4: 14,
    body1: 30,
    body2: 22,
    body3: 16,
    body4: 14,
    small: 12,

    // App Dimensions
    width: '100%',
    height: '100%',
};

export const FONTS = {
    h1: { fontSize: SIZES.h1, fontWeight: 'bold' },
    h2: { fontSize: SIZES.h2, fontWeight: 'bold' },
    h3: { fontSize: SIZES.h3, fontWeight: 'bold' },
    h4: { fontSize: SIZES.h4, fontWeight: 'bold' },
    body1: { fontSize: SIZES.body1, fontWeight: 'normal' },
    body2: { fontSize: SIZES.body2, fontWeight: 'normal' },
    body3: { fontSize: SIZES.body3, fontWeight: 'normal' },
    body4: { fontSize: SIZES.body4, fontWeight: 'normal' },
    small: { fontSize: SIZES.small, fontWeight: 'normal' },
};

export const SHADOWS = {
    light: {
        shadowColor: COLORS.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 2,
    },
    medium: {
        shadowColor: COLORS.black,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.15,
        shadowRadius: 6.27,
        elevation: 5,
    },
    dark: {
        shadowColor: COLORS.black,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 9.11,
        elevation: 8,
    },
};
