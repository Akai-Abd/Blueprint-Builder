<div align="center">
  <img src="./public/logo.png" alt="Blueprint Builder Logo" width="120" height="120" />
  
  <h1 style="margin: 0;">🚀 Blueprint Builder</h1>
  
  <p>
    <strong>The Ultimate AI-Powered Project Generation Platform</strong>
  </p>
  
  <p>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16.2-000000?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.2-0A7EA4?style=for-the-badge&logo=react&logoColor=white" alt="React" /></a>
    <a href="https://sdk.vercel.ai/"><img src="https://img.shields.io/badge/AI_SDK-7.0-8A2BE2?style=for-the-badge&logo=vercel" alt="AI SDK" /></a>
    <a href="https://docs.pmnd.rs/zustand/getting-started/introduction"><img src="https://img.shields.io/badge/Zustand-5.0-F96F20?style=for-the-badge" alt="Zustand" /></a>
  </p>

  <p>
    <a href="#-introduction">Introduction</a> •
    <a href="#-key-features">Features</a> •
    <a href="#-technology-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a>
  </p>
</div>

<br/>

> **Blueprint Builder** is a cutting-edge platform designed to accelerate your development workflow. By leveraging the power of state-of-the-art Large Language Models (LLMs), it dynamically generates project structures, code snippets, and architectures in seconds. Say goodbye to boilerplate code and hello to rapid prototyping!

## ✨ Introduction

Whether you're building a web app, a backend service, or exploring new ideas, Blueprint Builder empowers you to turn your vision into reality instantly. The system is designed to integrate seamlessly into modern workflows, providing an exceptional blend of speed, aesthetic quality, and code robustness.

---

## 🌟 Key Features

<details>
<summary><b>🤖 Multi-Model AI Intelligence</b></summary>
<br/>
Seamless integration with leading LLMs including <b>OpenAI</b>, <b>Anthropic</b>, <b>Google Gemini</b>, <b>Cohere</b>, <b>Mistral</b>, and <b>Groq</b>. Pick the best model for your specific generation task.
</details>

<details>
<summary><b>⚡ Blazing Fast Next.js 16</b></summary>
<br/>
Built on the robust Next.js App Router for unparalleled performance, server-side rendering, and advanced SEO capabilities.
</details>

<details>
<summary><b>🐻 Effortless State Management</b></summary>
<br/>
Powered by Zustand for clean, scalable, and highly reactive global state without the boilerplate of traditional state managers.
</details>

<details>
<summary><b>🎨 Modern & Responsive UI</b></summary>
<br/>
A breathtaking, carefully crafted interface that provides an exceptional user experience on any device, featuring dark mode, fluid micro-animations, and glassmorphism.
</details>

<details>
<summary><b>🔍 Advanced Search & 📦 Instant Export</b></summary>
<br/>
Instant filtering and finding with <code>fuse.js</code>. Package your generated blueprints into ready-to-use <code>.zip</code> archives via <code>jszip</code> with a single click.
</details>

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19 | Core foundation and routing |
| **Styling** | Vanilla CSS / CSS Modules | Tailored custom aesthetics and animations |
| **State** | Zustand | Lightweight and fast global state management |
| **AI Integration** | Vercel AI SDK (`ai`, `@ai-sdk/*`) | Unified API for multiple LLM providers |
| **Testing** | Vitest, React Testing Library | Blazing-fast unit and component testing |

---

## 🚀 Getting Started

Follow these simple steps to run Blueprint Builder locally:

### 1. Clone the repository
```bash
git clone https://github.com/your-username/blueprint-builder.git
cd blueprint-builder
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up Environment Variables
Create a `.env.local` file in the root directory and add your API keys:
```env
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_API_KEY=your_google_api_key
# Add other keys as needed for Groq, Cohere, Mistral, etc.
```

### 4. Run the Development Server
```bash
npm run dev
```
> Open [http://localhost:3000](http://localhost:3000) in your browser to start building!

---

## 🧪 Testing

Blueprint Builder uses **Vitest** for blazing-fast unit testing.

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

---

## 🤝 Contributing

Contributions make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. **Fork** the Project
2. **Create** your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your Changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the Branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<hr/>
<div align="center">
  <sub>Built By Akai ❤️ Blueprint Builder </sub>
</div>
