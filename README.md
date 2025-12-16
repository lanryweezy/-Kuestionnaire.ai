# Kuestionnaire AI - Intelligent Form Builder

A modern, independent form builder with smart form generation capabilities. Built for easy deployment on Vercel with no external dependencies.

## ✨ Features

- **Smart Form Generation**: Intelligent form creation based on natural language prompts
- **Multiple Question Types**: Text, multiple choice, rating, checkboxes, dropdowns, dates, and sections
- **Real-time Preview**: Instant form preview with live editing
- **Customizable Themes**: Multiple beautiful themes (Nebula, Midnight, Cyberpunk, Sunset)
- **Form Analytics**: Built-in results dashboard and analytics
- **Responsive Design**: Works perfectly on all devices
- **Zero External Dependencies**: No API keys required, fully self-contained

## 🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone <your-repo-url>
cd kuestionnaire-ai

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Deploy to Vercel

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
│   ├── components/          # React components
│   ├── services/           # Business logic and AI service
│   ├── types.ts           # TypeScript type definitions
│   ├── constants.ts       # App constants and icons
│   ├── App.tsx           # Main app component
│   ├── index.css         # Tailwind CSS styles
│   └── index.tsx         # App entry point
├── public/               # Static assets
├── dist/                # Build output (generated)
├── tailwind.config.js   # Tailwind configuration
├── vite.config.ts       # Vite configuration
├── vercel.json          # Vercel deployment config
└── package.json         # Dependencies and scripts
```

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Deployment**: Vercel-ready
- **AI Service**: Local intelligent form generation (no external APIs)

## 🎨 Themes

- **Nebula**: Cosmic blue theme with cyan accents
- **Midnight**: Dark theme with indigo highlights  
- **Cyberpunk**: Bold yellow and black futuristic design
- **Sunset**: Warm orange gradient theme

## 📝 Usage

1. **Create Forms**: Use natural language to describe your form needs
2. **Customize**: Edit questions, add options, set validation rules
3. **Preview**: See exactly how your form will look to users
4. **Share**: Get a shareable link for your form
5. **Analyze**: View responses and analytics in the results dashboard

## 🔧 Configuration

### Environment Variables (Optional)

No environment variables are required for basic functionality. The app works completely offline.

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