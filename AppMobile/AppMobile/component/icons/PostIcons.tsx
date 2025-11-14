import React from 'react';
import Svg, { Path } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
};

export const HeartIcon = ({ isLiked, size = 28, color }: { isLiked: boolean; size?: number; color?: string }) => {
  const fillColor = isLiked ? (color || '#FF3040') : 'none';
  const strokeColor = isLiked ? (color || '#FF3040') : (color || '#000');
  
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path
        d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
      />
    </Svg>
  );
};

export const CommentIcon = ({ size = 28, color = '#000' }: IconProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </Svg>
);

export const ShareIcon = ({ size = 28, color = '#000' }: IconProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path
      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
    />
  </Svg>
);

export const BookmarkIcon = ({ size = 28, color = '#000' }: IconProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path
      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
    />
  </Svg>
);

export const MoreIcon = ({ size = 20, color = '#000' }: IconProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path
      d="M12 12h.01M19 12h.01M5 12h.01"
    />
  </Svg>
);

