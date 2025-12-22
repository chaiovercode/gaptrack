# GapTrack 🚀

**GapTrack** is a dedicated job application tracker and relationship management tool designed to give you an edge in your job search while keeping your data completely private.

Every interaction, application, and resume analysis happens right on your device. Whether you want to use powerful cloud AI or stay 100% offline with local models, GapTrack works the way you want it to.

## ✨ Key Features

- **🔒 privacy-First & Local-Only**:
  - Your data is stored locally in your browser (LocalStorage) or directly in a folder on your computer (via File System Access API).
  - No database, no backend, no tracking. You own your data.

- **🤖 Flexible AI Integration**:
  - **Completely Local (Ollama)**: Use local LLMs like Llama 3 or Mistral via [Ollama](https://ollama.com/) for 100% offline, private analysis.
  - **Cloud Power**: Optional integration with **Google Gemini** or **OpenAI** if you prefer cloud-based models.

- **📊 Smart Gap Analysis**:
  - Upload your resume (PDF) and Paste a Job Description.
  - GapTrack uses AI to analyze the "gap" between your skills and the job requirements, offering tailored advice to bridge it.

- **💼 Job Application Tracker**:
  - Manage applications with a clean **Kanban Board** or **List View**.
  - Track statuses (Applied, Interview, Offer, Rejected).
  - Link specific contacts to job applications.

- **📇 Network Management**:
  - Track professional contacts and networking leads.
  - link contacts to specific job opportunities.

- **📝 Resume Roast & Analysis**:
  - Get feedback on your resume in "Professional" or "Roast" mode to improve your chances.

## 🛠 Tech Stack

GapTrack is built with modern web technologies, focusing on performance and simplicity:

- **Frontend Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: **Vanilla CSS** with a custom "Neo-Brutalist" design system. No heavy CSS frameworks—just pure, efficiently written CSS variables and utility classes.
- **PDF Processing**: `pdfjs-dist` for client-side PDF text extraction.
- **AI Service Layer**: Custom abstraction layer making it easy to switch between OpenAI, Gemini, and Ollama.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- (Optional) [Ollama](https://ollama.com/) installed if you want to use local AI.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chaiovercode/gaptrack.git
   cd gaptrack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

### AI Setup

When you first launch the app, navigate to **Settings** to configure your AI provider:

- **For Ollama**: Ensure Ollama is running (`ollama serve`). The app defaults to `http://localhost:11434`.
- **For Gemini/OpenAI**: Enter your API key. Keys are stored **only** in your browser's local storage and are never sent to any other server.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

MIT
