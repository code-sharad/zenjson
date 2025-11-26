import React from 'react';
import './globals.css';

export const metadata = {
  title: 'ZenJSON | Minimalist Formatter',
  description: 'A minimalist, intelligent JSON formatter and validator with AI-powered repair capabilities.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    background: '#09090b', // Zinc 950
                    surface: '#18181b', // Zinc 900
                    border: '#27272a', // Zinc 800
                    primary: '#6366f1', // Indigo 500
                    primaryHover: '#4f46e5', // Indigo 600
                    text: '#e4e4e7', // Zinc 200
                    muted: '#a1a1aa', // Zinc 400
                    error: '#ef4444', // Red 500
                    success: '#10b981', // Emerald 500
                  },
                  fontFamily: {
                    mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
                    sans: ['Inter', 'system-ui', 'sans-serif'],
                  }
                },
              },
            }
          `
        }} />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-text font-sans antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}