
---

# Plain English Converter

**A powerful, AI-driven web application that transforms complex legal, medical, and technical jargon into clear, accessible language.**

Built with performance and developer experience in mind, this application leverages a multi-model AI architecture to handle text, image (vision), and voice inputs seamlessly.

[View Live Demo](https://tools.theqexle.site/)

---

## Features

* **Multi-Modal Input Support**
* **Text:** Direct input with real-time metrics (word count, read time).
* **Vision:** Drag-and-drop image analysis using Google Gemini 2.5 Vision.
* **Voice:** Real-time speech-to-text transcription via Whisper Large v3.


* **Persona-Based Conversion:** Customize the output tone with presets like *ELI5 (Explain Like I'm 5)*, *Professional*, *Roast Mode*, and *Flowchart*.
* **Global Accessibility:** Support for 11+ output languages.
* **Interactive Clarification:** Context-aware Q&A chat to ask follow-up questions about the simplified text.
* **Smart History:** LocalStorage persistence with a searchable history of past conversions.
* **High Performance:** Debounced search, auto-growing inputs, and server-side processing for low latency.

---

## Architecture and Tech Stack

This project is built on a modern, scalable architecture designed for speed and maintainability.

### Frontend

* **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **UI Components:** [Shadcn/ui](https://ui.shadcn.com/) (Radix Primitives) and Lucide React

### AI and Backend Services

* **LLM Processing:** [Groq](https://groq.com/) (Llama 3.3 70B) for ultra-fast text simplification.
* **Vision Analysis:** [Google Gemini 2.5](https://deepmind.google/technologies/gemini/) for reading text from images.
* **Speech-to-Text:** [Whisper Large v3](https://openai.com/research/whisper) for high-accuracy audio transcription.
* **Text-to-Speech:** [Cartesia](https://cartesia.ai/) for synthesis.

### System Flow

`User Input` -> `Next.js Server Action` -> `AI Model Router (Groq/Gemini/Whisper)` -> `Streamed Response`

---

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

* Node.js 18.17 or later
* npm, yarn, or pnpm

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/plain-english-converter.git
cd plain-english-converter

```


2. **Install dependencies:**
```bash
npm install
# or
yarn install

```


3. **Set up Environment Variables:**
Create a `.env.local` file in the root directory and add your API keys:
```env
GROQ_API_KEY=your_groq_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
# Add other keys as required by your implementation

```


4. **Run the development server:**
```bash
npm run dev

```


5. **Open the app:**
Visit [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser.

---

## Design System

The application follows a strictly typed design system prioritizing dark mode aesthetics (`#000000` background) with high-contrast accents:

* **Primary Accent:** Lime Green (`#ccff00`)
* **Typography:** Inter (Sans-serif) and Space Mono (Monospace)
* **Interaction:** 3D hover states and fluid transitions.

---

## Contributing

Contributions are welcome. Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## Author

**Susitha Lwis**

* **Role:** Product Designer & Full Stack Developer
* **Contact:** [iamsusithalwis@gmail.com](mailto:iamsusithalwis@gmail.com)

---

## License

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.