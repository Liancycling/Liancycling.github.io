// Shared tailwind config extracted from multiple HTML files
// This file should be loaded after the CDN script: <script src="https://cdn.tailwindcss.com"></script>
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: '#165DFF',
        secondary: '#FF6B00',
        dark: '#1E293B',
        light: '#F8FAFC'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    }
  }
};
