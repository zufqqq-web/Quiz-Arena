<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
  
  # React + Vite + Gemini AI Example

  A modern React application built with Vite, TypeScript, TailwindCSS, and Google Gemini AI integration.

  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-19.0-61dafb)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-6.2-646cff)](https://vitejs.dev/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38bdf8)](https://tailwindcss.com/)

  **[View in AI Studio](https://ai.studio/apps/dd6f2a28-1dcc-43c1-a4bf-45a32ebe3f05)**

</div>

---

## 📖 About

This project is a React-based web application that leverages Google's Gemini AI API for intelligent features. It uses modern tooling including:

- **Vite** - Fast build tool and dev server
- **React 19** - Latest version of the UI library
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS 4** - Utility-first CSS framework
- **Gemini AI** - Google's generative AI integration
- **Motion** - Animation library
- **Lucide React** - Beautiful icons

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** or **bun** (package manager)
- **Gemini API Key** - Get yours from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository** (if needed):
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or using bun
   bun install
   ```

3. **Configure environment variables**:
   
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Gemini API key:
   ```env
   GEMINI_API_KEY="your-actual-api-key-here"
   APP_URL="http://localhost:3000"
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3000`

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run TypeScript type checking |
| `npm run clean` | Remove build artifacts (`dist/`, `server.js`) |

## 🏗️ Project Structure

```
├── src/
│   ├── components/    # Reusable React components
│   ├── data/          # Static data and configurations
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Main application component
│   ├── main.tsx       # Application entry point
│   └── types.ts       # TypeScript type definitions
├── .env.example       # Environment variables template
├── index.html         # HTML entry point
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── vite.config.ts     # Vite configuration
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | ✅ Yes |
| `APP_URL` | Application URL (auto-set in AI Studio) | ❌ No |

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Navigate to the API key section
4. Create a new API key
5. Copy and paste it into your `.env.local` file

## 🛠️ Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite 6
- **Language**: TypeScript 5.8
- **Styling**: TailwindCSS 4
- **AI Integration**: @google/genai
- **Animations**: Motion (formerly Framer Motion)
- **Icons**: Lucide React
- **Server**: Express (for API routes)

## 📦 Deployment

### Deploy to Cloud Run via AI Studio

This project is designed to work seamlessly with Google AI Studio:

1. Open your app in [AI Studio](https://ai.studio/apps/dd6f2a28-1dcc-43c1-a4bf-45a32ebe3f05)
2. Configure secrets in the Secrets panel
3. Deploy directly from the interface

### Manual Deployment

1. Build the production bundle:
   ```bash
   npm run build
   ```

2. The output will be in the `dist/` directory

3. Deploy `dist/` to your preferred hosting platform

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 🆘 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**API Key errors:**
- Ensure your `.env.local` file exists and contains a valid `GEMINI_API_KEY`
- Check that there are no extra quotes or spaces around the key value

**Build failures:**
```bash
# Clean and reinstall
npm run clean
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

For issues related to AI Studio, visit the [AI Studio documentation](https://ai.studio/docs).

---

<div align="center">
  Made with ❤️ using React, Vite, and Gemini AI
</div>
