<div align="center">
  
  # React + Vite Application
  
  A modern React application built with Vite, TypeScript, and TailwindCSS.
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-19.0-61dafb)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-6.2-646cff)](https://vitejs.dev/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38bdf8)](https://tailwindcss.com/)
  
</div>

---

## 📖 About

This project is a React-based web application using modern tooling including:

- **Vite** - Fast build tool and dev server
- **React 19** - Latest version of the UI library
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS 4** - Utility-first CSS framework
- **Motion** - Animation library
- **Lucide React** - Beautiful icons

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** or **bun** (package manager)

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
   
   Edit `.env.local` and add your configuration:
   ```env
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
| `APP_URL` | Application URL | ❌ No |

## 🛠️ Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite 6
- **Language**: TypeScript 5.8
- **Styling**: TailwindCSS 4
- **Animations**: Motion (formerly Framer Motion)
- **Icons**: Lucide React
- **Server**: Express (for API routes)

## 📦 Deployment

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

**Build failures:**
```bash
# Clean and reinstall
npm run clean
rm -rf node_modules package-lock.json
npm install
```

---

<div align="center">
  Made with ❤️ using React and Vite
</div>
