export default function manifest() {
  return {
    name: 'Custom Calc',
    short_name: 'CustomCalc',
    description: '高度な関数電卓アプリ',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/custom-calc-192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/custom-calc-512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  }
} 