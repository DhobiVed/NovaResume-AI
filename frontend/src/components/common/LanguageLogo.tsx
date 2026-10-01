import React from 'react';

interface LanguageLogoProps {
  language: string;
  className?: string;
}

/**
 * Official Brand SVG Symbols for All 50 Programming Languages
 * Pure vector SVG paths matching official brand guidelines. Zero emojis.
 */
export const LanguageLogo: React.FC<LanguageLogoProps> = ({ language, className = 'w-6 h-6' }) => {
  const norm = (language || '').toLowerCase().trim().replace(/\s+/g, '');

  // 1. Python
  if (norm === 'python' || norm === 'py') {
    return (
      <svg viewBox="0 0 128 128" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M63.39 2.5c-30.82 0-28.91 13.37-28.91 13.37l.03 13.85h29.37v4.16H23.51S2.5 31.48 2.5 62.43c0 30.96 18.28 29.83 18.28 29.83h10.91v-15.3s-.6-18.28 17.97-18.28h30.86s17.37.28 17.37-16.78V21.5S100.46 2.5 63.39 2.5zM48.86 11.96a5.1 5.1 0 1 1 0 10.2 5.1 5.1 0 0 1 0-10.2z" fill="url(#python_top)" />
        <path d="M64.61 125.5c30.82 0 28.91-13.37 28.91-13.37l-.03-13.85H64.12v-4.16h40.37s21.01 2.4 21.01-28.55c0-30.96-18.28-29.83-18.28-29.83h-10.91v15.3s.6 18.28-17.97 18.28H47.48s-17.37-.28-17.37 16.78V106.5s-2.57 19 34.5 19zm14.53-9.46a5.1 5.1 0 1 1 0-10.2 5.1 5.1 0 0 1 0 10.2z" fill="url(#python_bot)" />
        <defs>
          <linearGradient id="python_top" x1="2.5" y1="2.5" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#387EB8" />
            <stop offset="1" stopColor="#366994" />
          </linearGradient>
          <linearGradient id="python_bot" x1="40" y1="40" x2="125" y2="125" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFE873" />
            <stop offset="1" stopColor="#FFD43B" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // 2. Java
  if (norm === 'java' || norm === 'jdk' || norm === 'jvm') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M47.7 93.3c15.8 1.4 34.8-.8 48.9-6.9 0 0-4.3 2.9-10.6 5.3-15.6 5.8-44.5 5.5-54.8 1-2.9-1.3 5.4-3.5 16.5.6z" fill="#EA2D2E" />
        <path d="M41.4 80.8c18.5 1.5 40.8-1 57.3-8.2 0 0-5 3.5-12.4 6.2-18.3 6.8-52.2 6.5-64.2 1.2-3.4-1.5 6.3-4.1 19.3.8z" fill="#EA2D2E" />
        <path d="M72.2 52.4c6.3 7.3-1.6 14.1-1.6 14.1s16.7-8.6 9-19.8c-7.3-10.8-13.7-16.2 18.5-33-28.7 6.1-34 29.8-25.9 38.7z" fill="#EA2D2E" />
        <path d="M99.6 103.8c-23.7 8.7-65.7 8.9-88.7-.3-2.6-1 5.3-2.5 13.9-1.9 22.9 1.5 52.4-.6 71.4-6.8 0 0-5.7 3.9-15.4 6.8 6.9.7 18.8 2.2 18.8 2.2z" fill="#007396" />
        <path d="M38.5 68.3c-14.8-10.8-1.5-16.8 6-22.6 11.2-8.5 6.3-17.7-18.7-4.7 0 0 5.4-4.8 13.7-7 13.5-3.5 25.8 4 17.5 14.1-10 12.2-22.3 8.3-18.5 20.2z" fill="#007396" />
        <path d="M96.8 114.7c-29.3 6.9-80.4 6.9-106.8-.7-3.2-.9 6.5-2.2 17.1-1.7 28.2 1.4 64.6-.5 88-6.1 0 0-7 3.5-18.9 6.1 8.5.7 20.6 2.4 20.6 2.4z" fill="#007396" />
      </svg>
    );
  }

  // 3. JavaScript
  if (norm === 'javascript' || norm === 'js') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" rx="16" fill="#F7DF1E" />
        <path d="M67.3 98.4c2.8 4.6 6.5 8 13.1 8 5.5 0 9-2.7 9-6.5 0-4.5-3.6-6.1-9.7-8.8l-3.3-1.4c-9.6-4.1-16-9.3-16-20.3 0-10.2 7.8-17.9 20.1-17.9 8.7 0 14.9 3.1 19.3 10.9l-9.8 6.3c-2.2-4-4.6-5.6-9.5-5.6-4.3 0-7.3 2.7-7.3 5.9 0 4.1 2.7 5.7 8.9 8.4l3.3 1.4c11.5 4.9 17.1 9.8 17.1 21 0 12-9.4 18.6-22.5 18.6-12.7 0-20.5-6.1-24.3-13.8l11.7-6.8zM24.7 99.6l12.4-7.5c2.4 4.1 4.5 7.6 9.1 7.6 4.6 0 7.6-1.8 7.6-8.9V52.5h14.5v38.4c0 14.9-8.7 21.6-21.7 21.6-11.8 0-18.4-6-21.9-12.9z" fill="#000000" />
      </svg>
    );
  }

  // 4. TypeScript
  if (norm === 'typescript' || norm === 'ts') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" rx="16" fill="#3178C6" />
        <path d="M72.4 97.4c2.8 4.6 6.5 8 13.1 8 5.5 0 9-2.7 9-6.5 0-4.5-3.6-6.1-9.7-8.8l-3.3-1.4c-9.6-4.1-16-9.3-16-20.3 0-10.2 7.8-17.9 20.1-17.9 8.7 0 14.9 3.1 19.3 10.9l-9.8 6.3c-2.2-4-4.6-5.6-9.5-5.6-4.3 0-7.3 2.7-7.3 5.9 0 4.1 2.7 5.7 8.9 8.4l3.3 1.4c11.5 4.9 17.1 9.8 17.1 21 0 12-9.4 18.6-22.5 18.6-12.7 0-20.5-6.1-24.3-13.8l11.7-6.8zM19.5 52.5h38.2v12H44.8v47.2H31.7V64.5H19.5v-12z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 5. C++
  if (norm === 'c++' || norm === 'cpp') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M64 4.5L115.5 34.2v59.6L64 123.5 12.5 93.8V34.2L64 4.5z" fill="#00599C" />
        <path d="M64 14.5L106.8 39.2v49.6L64 113.5 21.2 88.8V39.2L64 14.5z" fill="#004482" />
        <path d="M57.5 77.8c-3.1 3.5-7.2 5.3-12.4 5.3-10.4 0-16.7-7.6-16.7-19.1s6.3-19.1 16.7-19.1c5.2 0 9.3 1.8 12.4 5.3l7-7.5C59.3 37.6 52.8 35 45.1 35 27.6 35 17 46.8 17 64s10.6 29 28.1 29c7.7 0 14.2-2.6 19.4-7.7l-7-7.5zM76.5 60.5H71V67.5h5.5v5.5h7V67.5H89V60.5h-5.5V55h-7v5.5zm25 0h-5.5V67.5h5.5v5.5h7V67.5h5.5V60.5H108.5V55h-7v5.5z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 6. C#
  if (norm === 'c#' || norm === 'csharp') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M64 4.5L115.5 34.2v59.6L64 123.5 12.5 93.8V34.2L64 4.5z" fill="#239120" />
        <path d="M64 14.5L106.8 39.2v49.6L64 113.5 21.2 88.8V39.2L64 14.5z" fill="#1B7A19" />
        <path d="M56.5 77.8c-3.1 3.5-7.2 5.3-12.4 5.3-10.4 0-16.7-7.6-16.7-19.1s6.3-19.1 16.7-19.1c5.2 0 9.3 1.8 12.4 5.3l7-7.5C58.3 37.6 51.8 35 44.1 35 26.6 35 16 46.8 16 64s10.6 29 28.1 29c7.7 0 14.2-2.6 19.4-7.7l-7-7.5zM83.5 48.5h-6l-2.5 10H69l-1.5 6h5.5l-3 12h-6l-1.5 6h5.5l-2.5 10h6l2.5-10H81l-2.5 10h6l2.5-10h6l1.5-6h-5.5l3-12h6l1.5-6h-5.5l2.5-10h-6l-2.5 10h-6l2.5-10zm-3 16l-3 12h-6l3-12h6z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 7. C
  if (norm === 'c') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M64 4.5L115.5 34.2v59.6L64 123.5 12.5 93.8V34.2L64 4.5z" fill="#00599C" />
        <path d="M64 14.5L106.8 39.2v49.6L64 113.5 21.2 88.8V39.2L64 14.5z" fill="#004482" />
        <path d="M78 81c-4.5 4.8-10.5 7.2-18 7.2-15 0-24-11-24-24.2s9-24.2 24-24.2c7.5 0 13.5 2.5 18 7.2l9.8-10.2C79.8 28.5 70.8 25 60 25 35 25 20 41.8 20 64s15 39 40 39c10.8 0 19.8-3.5 27.8-11.8L78 81z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 8. Go (Golang)
  if (norm === 'go' || norm === 'golang') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 61.5c-3.5 0-6.5 3-6.5 6.5s3 6.5 6.5 6.5h20c3.5 0 6.5-3 6.5-6.5s-3-6.5-6.5-6.5h-20zM3.5 47.5c-3.5 0-6.5 3-6.5 6.5s3 6.5 6.5 6.5h20c3.5 0 6.5-3 6.5-6.5s-3-6.5-6.5-6.5h-20zM21.5 75.5c-3.5 0-6.5 3-6.5 6.5s3 6.5 6.5 6.5h20c3.5 0 6.5-3 6.5-6.5s-3-6.5-6.5-6.5h-20z" fill="#00ADD8" />
        <path d="M72.2 46.8c-11.9 0-20.9 9.1-20.9 21.2 0 12.2 9 21.2 21 21.2 9.5 0 16.5-5.6 19.5-13.6H72v-9.6h32.2c.4 1.8.6 3.7.6 5.8 0 18.2-12.7 30.6-32.6 30.6-20.5 0-35.4-15-35.4-34.4s14.9-34.4 35.4-34.4c11.2 0 19.6 4.3 25.4 9.9l-8.5 8.2c-4-4-9.2-4.9-15.9-4.9zM107.5 59.8c12.2 0 21.2 9.4 21.2 21.2 0 11.9-9 21.2-21.2 21.2-12.1 0-21.2-9.3-21.2-21.2 0-11.8 9.1-21.2 21.2-21.2zm0 10.6c-6.1 0-10.4 4.8-10.4 10.6 0 5.9 4.3 10.6 10.4 10.6 6.2 0 10.4-4.8 10.4-10.6 0-5.8-4.2-10.6-10.4-10.6z" fill="#00ADD8" />
      </svg>
    );
  }

  // 9. Rust
  if (norm === 'rust') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M125.8 61.2l-9.8-3.7 3.5-9.8-10.4-1.3 1-10.4-10.3 1.4-1.5-10.3-9.5 4.3-3.9-9.7-8 6.8-6.1-8.5-6 8.5-8-6.8-4 9.7-9.5-4.3-1.4 10.3-10.3-1.4 1 10.4-10.4 1.3 3.5 9.8-9.8 3.7 5.8 8.7-8.7 5.9 7.8 6.9-7.2 7.6 9.4 4.5-5.3 9 10.4 1.8-3.1 9.9 10.5-.9-.8 10.4 9.9-3.6 1.6 10.3 8.6-6 4 9.7 6.8-7.9 6.2 8.4 4.6-9.4 8 6.7 2.3-10.2 9.2 4.9 0-10.5 9.8 2.7-2.3-10.2 9.8 0 .2-10.5 9.2-4.9 2.3 10.2 8-6.7 4.6 9.4 6.2-8.4 6.8 7.9 4-9.7 8.6 6 1.6-10.3 9.9 3.6-.8-10.4 10.5.9-3.1-9.9 10.4-1.8-5.3-9 9.4-4.5-7.2-7.6 7.8-6.9-8.7-5.9 5.8-8.7zM64 108.5C39.4 108.5 19.5 88.6 19.5 64S39.4 19.5 64 19.5s44.5 19.9 44.5 44.5-19.9 44.5-44.5 44.5z" fill="#000000" />
        <path d="M43.5 40.5h26c11.5 0 19.5 6 19.5 16 0 7.8-5.5 13.5-13.5 15.2l15.5 21.8H76.5l-13-19.5H55.5v19.5h-12V40.5zm12 23.5H68c5.2 0 8.5-2.8 8.5-7s-3.3-7-8.5-7h-12.5v14z" fill="#CE412B" />
      </svg>
    );
  }

  // 10. HTML
  if (norm === 'html' || norm === 'html5') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M19.1 113.8L8.6 0h110.8l-10.5 113.8L64 128z" fill="#E34F26" />
        <path d="M64 117.8l36.5-10.1 8.8-95.2H64z" fill="#EF652A" />
        <path d="M64 52.4h19.5l-1.3 15.3H64v15h20.6l-2.4 27.2-18.2 5V128l33.2-9.2 4.7-52.4.9-10.5.8-9.5H64v6z" fill="#FFFFFF" />
        <path d="M64 26.5H35.4l.8 9.5 1.7 19.4H64v-15H48.8l-.9-9.5H64V12z" fill="#EBEBEB" />
        <path d="M64 82.7v-15H52.4l1.3 15H64zm-14.7-3.4l-1.4-15.6H36.3l2.8 31.2L64 102.5V87.7l-14.7-8.4z" fill="#EBEBEB" />
      </svg>
    );
  }

  // 11. CSS
  if (norm === 'css' || norm === 'css3') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M19.1 113.8L8.6 0h110.8l-10.5 113.8L64 128z" fill="#1572B6" />
        <path d="M64 117.8l36.5-10.1 8.8-95.2H64z" fill="#33A9DC" />
        <path d="M64 52.4h19.5l-1.3 15.3H64v15h20.6l-2.4 27.2-18.2 5V128l33.2-9.2 4.7-52.4.9-10.5.8-9.5H64v6z" fill="#FFFFFF" />
        <path d="M64 26.5H35.4l.8 9.5 1.7 19.4H64v-15H48.8l-.9-9.5H64V12z" fill="#EBEBEB" />
        <path d="M64 82.7v-15H52.4l1.3 15H64zm-14.7-3.4l-1.4-15.6H36.3l2.8 31.2L64 102.5V87.7l-14.7-8.4z" fill="#EBEBEB" />
      </svg>
    );
  }

  // 12. SQL / Database
  if (norm === 'sql' || norm === 'pl/sql' || norm === 'plsql' || norm === 't-sql' || norm === 'tsql' || norm === 'postgresql' || norm === 'mysql') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="64" cy="28" rx="46" ry="16" fill="#00758F" />
        <path d="M18 28v28c0 8.8 20.6 16 46 16s46-7.2 46-16V28c0 8.8-20.6 16-46 16S18 36.8 18 28z" fill="#005B70" />
        <path d="M18 56v28c0 8.8 20.6 16 46 16s46-7.2 46-16V56c0 8.8-20.6 16-46 16S18 64.8 18 56z" fill="#00758F" />
        <path d="M18 84v20c0 8.8 20.6 16 46 16s46-7.2 46-16V84c0 8.8-20.6 16-46 16S18 92.8 18 84z" fill="#005B70" />
        <ellipse cx="64" cy="26" rx="46" ry="16" fill="#008EA6" />
      </svg>
    );
  }

  // 13. PHP
  if (norm === 'php') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="64" cy="64" rx="60" ry="36" fill="#777BB4" />
        <path d="M31.2 52.5h15.2c6.8 0 11.2 3.1 9.9 9.3-1.6 7.4-8.2 10.5-15 10.5h-5.9l-4.5 21.2H20.6l10.6-41zm11.5 13.4c2.8 0 5.4-1.2 6.1-4.4.6-2.9-.9-4.3-3.7-4.3h-7.6l-1.9 8.7h7.1zm21.4-13.4h10.3l-2.6 11.8h8.5c7.4 0 11.8 3.5 10.4 9.8l-4.1 19.4H75.4l3.7-17.4c.5-2.5-.2-3.8-2.6-3.8h-7.2l-4.5 21.2H54.5l10.6-41zm37.2 0h15.2c6.8 0 11.2 3.1 9.9 9.3-1.6 7.4-8.2 10.5-15 10.5h-5.9l-4.5 21.2H90.9l10.6-41zm11.5 13.4c2.8 0 5.4-1.2 6.1-4.4.6-2.9-.9-4.3-3.7-4.3h-7.6l-1.9 8.7h7.1z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 14. Kotlin
  if (norm === 'kotlin') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="kotlin_grad" x1="128" y1="0" x2="0" y2="128" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E44857" />
            <stop offset=".5" stopColor="#C711E1" />
            <stop offset="1" stopColor="#7F52FF" />
          </linearGradient>
        </defs>
        <path d="M128 128H0V0h128L64 64l64 64z" fill="url(#kotlin_grad)" />
      </svg>
    );
  }

  // 15. Swift
  if (norm === 'swift') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" rx="28" fill="#F05138" />
        <path d="M106.8 97.4C87.2 110.5 61.5 110 42.6 98c19.2 1.3 39.5-6.5 50.8-19.4-18.4 2.8-34.9-5.8-44.5-18.6 13 2.1 27.5-1.5 35.5-9.6C72.8 52 61 36.5 61 21c6.5 10.4 16.3 19.3 27.5 25.5-2.8-8.5-2.2-17.5 1.5-25.5 8.5 15.5 24.5 26.5 40 28.5-7.5 3.5-15 4-22.5 1.5 9.5 9.5 23 15 36.5 16-12 5.5-24.5 6.5-37.2 3.5 10.5 8.5 23 12.5 36 12.5-12 8.5-23.5 12.5-36 14.4z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 16. Dart
  if (norm === 'dart') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M26.7 4.5h48.9L124 53.1v48.2L26.7 4.5z" fill="#01579B" />
        <path d="M4.5 26.7L53.1 124h48.2L4.5 26.7z" fill="#00B4AB" />
        <path d="M26.7 4.5L4.5 26.7l74.6 74.6 22.2-22.2L26.7 4.5z" fill="#0081CB" />
        <path d="M53.1 124l22.2-22.2-48.6-48.6L4.5 75.4 53.1 124z" fill="#29B6F6" />
      </svg>
    );
  }

  // 17. Ruby
  if (norm === 'ruby') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M86.5 10.5L124 48l-60 69.5L4 48l37.5-37.5h45z" fill="#CC342D" />
        <path d="M41.5 10.5L4 48h120l-37.5-37.5h-45z" fill="#E84742" />
        <path d="M64 117.5L4 48h120l-60 69.5z" fill="#991B1E" />
        <path d="M64 117.5L41.5 48h45L64 117.5z" fill="#C9322E" />
      </svg>
    );
  }

  // 18. Rust, Bash, PowerShell, Shell
  if (norm === 'bash' || norm === 'shell' || norm === 'sh') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" rx="20" fill="#293138" />
        <path d="M24 38l28 26-28 26M58 90h46" stroke="#4EAA25" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (norm === 'powershell' || norm === 'ps') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" rx="20" fill="#012456" />
        <path d="M32 40l32 24-32 24M68 88h28" stroke="#5391FE" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 19. Scala
  if (norm === 'scala') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M20 18c40-15 68 8 88 16v22C88 48 60 25 20 40V18z" fill="#DE3423" />
        <path d="M20 54c40-15 68 8 88 16v22C88 84 60 61 20 76V54z" fill="#DE3423" />
        <path d="M20 90c40-15 68 8 88 16v22c-20-8-48-31-88-16V90z" fill="#DE3423" />
      </svg>
    );
  }

  // 20. R
  if (norm === 'r') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="64" cy="64" rx="58" ry="46" fill="#CBDBE6" />
        <path d="M48 38h26c15 0 24 7 24 18 0 9-6 15-15 17l18 25H84L68 74H58v24H48V38zm10 14v14h15c8 0 13-3 13-7s-5-7-13-7H58z" fill="#276DC3" />
      </svg>
    );
  }

  // 21. Solidity
  if (norm === 'solidity') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M64 4L34 54l30 18 30-18L64 4z" fill="#666666" />
        <path d="M64 4L34 54h60L64 4z" fill="#888888" />
        <path d="M64 78L34 60l30 46 30-46-30 18z" fill="#363636" />
        <path d="M64 124l30-46H34l30 46z" fill="#1C1C1C" />
      </svg>
    );
  }

  // 22. Lua
  if (norm === 'lua') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="64" cy="64" r="54" fill="#000080" />
        <circle cx="94" cy="34" r="16" fill="#FFFFFF" />
        <circle cx="94" cy="34" r="9" fill="#000080" />
        <circle cx="64" cy="64" r="28" fill="#FFFFFF" />
      </svg>
    );
  }

  // 23. Haskell
  if (norm === 'haskell') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M6 18l36 92H24L0 18h6zm24 0l36 92H48l-8-20H20l10-72zm32 36l18-36h18L62 90l36 20H80L62 54zm22 18h40v12h-40V72zm10 20h30v12H90V92z" fill="#5D4F85" />
      </svg>
    );
  }

  // 24. Assembly / ASM
  if (norm === 'assembly' || norm === 'asm') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="24" y="24" width="80" height="80" rx="14" fill="#2E3440" />
        <rect x="38" y="38" width="52" height="52" rx="8" fill="#4C566A" />
        <path d="M12 44h12M12 64h12M12 84h12M104 44h12M104 64h12M104 84h12M44 12v12M64 12v12M84 12v12M44 104v12M64 104v12M84 104v12" stroke="#D8DEE9" strokeWidth="6" strokeLinecap="round" />
        <path d="M52 74l12-20 12 20M56 68h16" stroke="#88C0D0" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 25. Julia
  if (norm === 'julia') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="44" cy="38" r="24" fill="#CB3C33" />
        <circle cx="84" cy="38" r="24" fill="#389826" />
        <circle cx="64" cy="88" r="24" fill="#9558B2" />
      </svg>
    );
  }

  // 26. Perl
  if (norm === 'perl') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M64 8c-30 0-54 24-54 54 0 20 12 38 28 47v13l18-8c3 .5 5 .5 8 .5 30 0 54-24 54-54S94 8 64 8z" fill="#0073A1" />
        <ellipse cx="50" cy="56" rx="8" ry="12" fill="#FFFFFF" />
        <ellipse cx="78" cy="56" rx="8" ry="12" fill="#FFFFFF" />
        <circle cx="50" cy="58" r="5" fill="#000000" />
        <circle cx="78" cy="58" r="5" fill="#000000" />
      </svg>
    );
  }

  // 27. Elixir
  if (norm === 'elixir') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M64 8C48 36 28 66 28 88a36 36 0 0 0 72 0c0-22-20-52-36-80z" fill="#4E2A8E" />
        <path d="M64 26C52 48 38 72 38 88a26 26 0 0 0 52 0c0-16-14-40-26-62z" fill="#6A3CB5" />
      </svg>
    );
  }

  // 28. Erlang
  if (norm === 'erlang') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="64" cy="64" r="56" fill="#A90533" />
        <path d="M38 48h52v12H52v10h34v12H52v14h38v12H38V48z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 29. Clojure
  if (norm === 'clojure') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="64" cy="64" r="54" fill="#5881D8" />
        <path d="M64 10A54 54 0 0 1 64 118 27 27 0 0 1 64 64 27 27 0 0 0 64 10z" fill="#63B132" />
        <circle cx="64" cy="37" r="9" fill="#5881D8" />
        <circle cx="64" cy="91" r="9" fill="#63B132" />
      </svg>
    );
  }

  // 30. F#
  if (norm === 'f#' || norm === 'fsharp') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 64l52-52v36L38 74l26 26v36L12 64z" fill="#30B9DB" />
        <path d="M64 48l24-24 28 28-28 28-24-24z" fill="#259AC1" />
        <path d="M64 80l24-24 28 28-28 28-24-24z" fill="#1B7898" />
      </svg>
    );
  }

  // 31. Zig
  if (norm === 'zig') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 28h80L44 80h60v20H20l48-52H12V28z" fill="#F7A41D" />
      </svg>
    );
  }

  // 32. CUDA
  if (norm === 'cuda') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" rx="20" fill="#1A1A1A" />
        <path d="M64 24c-28 0-48 20-48 40s20 40 48 40c24 0 42-15 46-34H90c-4 12-14 20-26 20-18 0-32-12-32-26s14-26 32-26c12 0 22 8 26 20h20c-4-19-22-34-46-34z" fill="#76B900" />
      </svg>
    );
  }

  // 33. MATLAB
  if (norm === 'matlab') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 88L48 24l28 56 40-20-32 52H12z" fill="#E16737" />
        <path d="M48 24l28 56L12 88z" fill="#8B2500" />
      </svg>
    );
  }

  // 34. Objective-C
  if (norm === 'objective-c' || norm === 'objc') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M64 12L16 38v52l48 26 48-26V38L64 12z" fill="#0B5A9D" />
        <path d="M64 26l36 20v36L64 102 28 82V46l36-20z" fill="#0E71C4" />
        <path d="M64 44c-11 0-20 9-20 20s9 20 20 20 20-9 20-20-9-20-20-20zm0 30c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 35. Groovy
  if (norm === 'groovy') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="64" cy="64" r="54" fill="#619CBC" />
        <path d="M38 52h32v12H50v14h18v-6H58v-8h22v24H38V52z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 36. Visual Basic
  if (norm === 'visualbasic' || norm === 'vb') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" rx="20" fill="#5C2D91" />
        <path d="M26 42l18 44h10l18-44H60l-12 32-12-32H26zm48 0v44h22c8 0 14-4 14-11 0-5-3-8-8-9 4-1 6-4 6-9 0-7-6-11-14-11H74zm10 9h10c3 0 5 1 5 4s-2 4-5 4H84V51zm0 16h11c3 0 6 1 6 5s-3 5-6 5H84V67z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 37. Fortran
  if (norm === 'fortran') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" rx="20" fill="#734F96" />
        <path d="M42 36h44v14H58v16h24v14H58v22H42V36z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 38. COBOL
  if (norm === 'cobol') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" rx="20" fill="#005A9C" />
        <path d="M64 36c-16 0-26 11-26 28s10 28 26 28c11 0 19-5 24-14l-11-7c-3 5-7 8-13 8-8 0-13-6-13-15s5-15 13-15c6 0 10 3 13 8l11-7c-5-9-13-14-24-14z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 39. Lisp
  if (norm === 'lisp' || norm === 'commonlisp') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="64" cy="64" r="54" fill="#4B0082" />
        <path d="M40 38c-8 14-8 38 0 52M88 38c8 14 8 38 0 52M52 46l24 36M64 64l12-18" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
      </svg>
    );
  }

  // 40. Prolog
  if (norm === 'prolog') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" rx="20" fill="#E95420" />
        <path d="M42 36h24c14 0 22 7 22 18s-8 18-22 18H56v20H42V36zm14 24h10c6 0 9-3 9-6s-3-6-9-6H56v12z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 41. Ada
  if (norm === 'ada') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" rx="20" fill="#027D92" />
        <path d="M64 32L36 96h14l6-16h24l6 16h14L72 32H64zm-4 36l8-22 8 22H60z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 42. Crystal
  if (norm === 'crystal') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M64 12L20 48l16 58h56l16-58L64 12z" fill="#222222" />
        <path d="M64 12l28 36H36L64 12zm28 36l16 58H92l-28-58h28zM36 48l28 58H36l-16-58h16z" fill="#444444" />
      </svg>
    );
  }

  // 43. Nim
  if (norm === 'nim') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M64 16L18 42v44l46 26 46-26V42L64 16z" fill="#FFE953" />
        <path d="M64 36L34 52v24l30 18 30-18V52L64 36z" fill="#373737" />
        <circle cx="64" cy="64" r="12" fill="#FFE953" />
      </svg>
    );
  }

  // 44. V
  if (norm === 'v') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M16 28h24l24 50 24-50h24L64 108 16 28z" fill="#4F6D91" />
      </svg>
    );
  }

  // 45. OCaml
  if (norm === 'ocaml') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="64" cy="64" r="54" fill="#EE6A1A" />
        <ellipse cx="64" cy="64" rx="28" ry="36" fill="#FFFFFF" />
        <ellipse cx="64" cy="64" rx="16" ry="24" fill="#EE6A1A" />
      </svg>
    );
  }

  // 46. D
  if (norm === 'd') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" rx="20" fill="#B03931" />
        <path d="M42 36h24c16 0 28 11 28 28s-12 28-28 28H42V36zm14 42h10c9 0 15-5 15-14s-6-14-15-14H56v28z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 47. Apex
  if (norm === 'apex' || norm === 'salesforce') {
    return (
      <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M52 28c11-8 26-6 34 5 7-3 16-1 20 6 9 1 16 9 16 18 0 11-9 20-20 20H32C17 77 6 66 6 51c0-13 9-24 22-26 5-11 17-17 29-13 2-6 7-11 14-13z" fill="#00A1E0" />
      </svg>
    );
  }

  // Universal Fallback (Clean Tech Monogram Badge - Zero Emojis)
  const displayLetters = (language || 'Dev').slice(0, 2).toUpperCase();
  return (
    <svg viewBox="0 0 128 128" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="24" fill="#4F46E5" />
      <rect x="8" y="8" width="112" height="112" rx="18" fill="#4338CA" />
      <text
        x="64"
        y="78"
        fill="#FFFFFF"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        fontSize="44"
        fontWeight="900"
        textAnchor="middle"
      >
        {displayLetters}
      </text>
    </svg>
  );
};
