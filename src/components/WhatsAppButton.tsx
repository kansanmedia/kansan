type WhatsAppIconProps = {
  className?: string;
};

export function WhatsAppIcon({ className = 'h-6 w-6' }: WhatsAppIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2C6.59 2 2.17 6.42 2.17 11.86c0 1.74.45 3.44 1.31 4.94L2 22l5.35-1.4a9.8 9.8 0 0 0 4.68 1.19h.01c5.44 0 9.86-4.42 9.86-9.86a9.8 9.8 0 0 0-2.85-7.02Zm-7.02 15.2h-.01a8.16 8.16 0 0 1-4.16-1.14l-.3-.18-3.17.83.85-3.09-.2-.32a8.17 8.17 0 0 1-1.26-4.35c0-4.5 3.66-8.16 8.17-8.16 2.18 0 4.24.84 5.78 2.39a8.1 8.1 0 0 1 2.39 5.78c0 4.5-3.67 8.16-8.09 8.24Zm4.47-6.11c-.24-.12-1.4-.69-1.62-.77-.22-.08-.38-.12-.54.12-.16.24-.62.77-.76.92-.14.16-.27.18-.51.06-.24-.12-1-.37-1.91-1.18-.7-.62-1.18-1.39-1.32-1.63-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.31-.74-1.79-.2-.48-.4-.42-.54-.43h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.09 3.62.57.25 1.02.4 1.37.51.58.18 1.11.15 1.53.09.46-.07 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/15551234567"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-50 flex items-center justify-center"
      aria-label="Chat on WhatsApp"
    >
      <WhatsAppIcon className="h-6 w-6" />
    </a>
  );
}
