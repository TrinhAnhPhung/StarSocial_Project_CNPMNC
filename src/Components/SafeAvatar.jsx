import React, { useState } from "react";

/**
 * Ảnh avatar an toàn:
 * - Fallback đúng 1 lần nếu lỗi (ngăn vòng lặp onError).
 * - Cố định kích thước để tránh layout shift.
 */
export default function SafeAvatar({
  src,
  alt = "",
  size = 40,
  fallback = "/default-avatar.png", // đặt file này trong /public
  className = "",
  style,
}) {
  const [useFallback, setUseFallback] = useState(false);

  const handleError = (e) => {
    e.currentTarget.onerror = null; // chặn loop
    setUseFallback(true);
  };

  return (
    <img
      src={useFallback ? fallback : src}
      alt={alt}
      onError={handleError}
      referrerPolicy="no-referrer"
      loading="lazy"
      decoding="async"
      width={size}
      height={size}
      className={`rounded-full object-cover block ${className}`}
      style={{ width: size, height: size, ...style }}
    />
  );
}
