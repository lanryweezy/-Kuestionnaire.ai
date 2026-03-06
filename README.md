# Kuestionnaire AI - Intelligent Form Builder

A modern, AI-powered form builder with Supabase authentication and cloud storage. Build intelligent forms with Google sign-in and sync across devices.

## ✨ Features

- **🔐 Google Authentication**: Secure sign-in with Google via Supabase Auth
- **☁️ Cloud Storage**: Sync forms across devices with Supabase PostgreSQL
- **🤖 Smart Form Generation**: AI-powered form creation from natural language
- **📊 Multiple Question Types**: Text, multiple choice, rating, checkboxes, dropdowns, dates
- **🎨 Real-time Preview**: Instant form preview with live editing
- **🌈 Customizable Themes**: Beautiful themes (Nebula, Midnight, Cyberpunk, Sunset)
- **📈 Form Analytics**: Built-in results dashboard and analytics
- **📱 Responsive Design**: Works perfectly on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works great)
- Google Cloud Console project (for OAuth)

### Setup Supabase

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Note your project URL and anon key from Settings → API

2. **Set Up Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable "Google Sign-In" API
   - Create OAuth 2.0 credentials (Web application)
   - Add authorized redirect URI: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret

3. **Configure Supabase Auth**
   - In Supabase Dashboard: Authentication → Providers → Google
   - Enable Google provider
   - Paste Client ID and Client Secret
   - Save changes

4. **Run Database Schema**
   - In Supabase Dashboard: SQL Editor
   - Copy contents of `supabase-schema.sql`
   - Paste and run to create tables, RLS policies, and triggers

### Local Development

```bash
# Clone the repository
git clone <your-repo-url>
cd kuestionnaire-ai

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your Supabase credentials
# VITE_SUPABASE_URL=your_supabase_project_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# VITE_GEMINI_API_KEY=your_api_key_here

# Start development server
npm run dev

# Open http://localhost:3000
```

### Deploy to Vercel

1. **Set Environment Variables in Vercel**
   - Go to your Vercel project settings
   - Add environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_GEMINI_API_KEY`

2. **Deploy**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

Or manually:

```bash
# Build the project
npm run build

# Deploy to Vercel
npx vercel --prod
```

## 📁 Project Structure

```
kuestionnaire-ai/
├── src/
│   ├── components/          # React components (Login, Dashboard, etc.)
│   ├── pages/              # Page components (AuthCallback)
│   ├── store/              # Zustand stores (useStore, useAuthStore)
│   ├── lib/                # Library configurations (supabase.ts)
│   ├── services/           # Business logic and AI service
│   ├── types.ts           # TypeScript type definitions
│   ├── constants.ts       # App constants and icons
│   ├── App.tsx           # Main app component
│   ├── index.css         # Tailwind CSS styles
│   └── index.tsx         # App entry point
├── public/               # Static assets
├── supabase-schema.sql   # Database schema for Supabase
├── dist/                # Build output (generated)
├── tailwind.config.js   # Tailwind configuration
├── vite.config.ts       # Vite configuration
├── vercel.json          # Vercel deployment config
└── package.json         # Dependencies and scripts
```

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Backend/Auth**: Supabase (PostgreSQL + Auth)
- **Build Tool**: Vite
- **Deployment**: Vercel-ready
- **AI Service**: Google Generative AI

## 🎨 Themes

- **Nebula**: Cosmic blue theme with cyan accents
- **Midnight**: Dark theme with indigo highlights  
- **Cyberpunk**: Bold yellow and black futuristic design
- **Sunset**: Warm orange gradient theme

## 📝 Usage

1. **Sign In**: Click "Sign in with Google" to authenticate
2. **Create Forms**: Use natural language to describe your form needs
3. **Customize**: Edit questions, add options, set validation rules
4. **Preview**: See exactly how your form will look to users
5. **Share**: Get a shareable link for your form
6. **Analyze**: View responses and analytics in the results dashboard

All forms are automatically synced to your Supabase database and accessible across devices.

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```env
VITE_GEMINI_API_KEY=your_api_key_here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Required for production:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

**Optional:**
- `VITE_GEMINI_API_KEY` - Google AI API key for form generation

### Customization

- **Themes**: Edit `src/constants.ts` to modify or add new themes
- **Question Types**: Extend `src/types.ts` to add new question types
- **AI Logic**: Modify `src/services/geminiService.ts` to customize form generation

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
```

### Deploy Options

1. **Vercel** (Recommended): Zero-config deployment
2. **Netlify**: Drag and drop the `dist` folder
3. **GitHub Pages**: Enable Pages in repository settings
4. **Any Static Host**: Upload the `dist` folder contents

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Create an [Issue](../../issues) for bug reports or feature requests
- Check the [Discussions](../../discussions) for community support

---

**Made with ❤️ for the developer community**