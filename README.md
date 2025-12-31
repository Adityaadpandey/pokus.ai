# 🧪 pokus.ai

A multi-agent AI system featuring two specialized assistants: a **Medicine Finder** that locates pharmacies and verifies medicine availability, and a **Travel Planner** that creates comprehensive travel itineraries with real-world data.

## ✨ Features

### 🏥 Medicine Finder
- Search for pharmacies by location and medicine name
- Simulate phone calls to verify stock availability
- Get detailed pharmacy information (addresses, hours, prices)
- Find alternative medicines when primary options are unavailable

### ✈️ Travel Planner
- Research destinations with real-world data
- Find transport options (trains, flights)
- Search accommodations and dining options
- Generate comprehensive itineraries with specific details (train numbers, hotel contacts, prices)

### 🤖 Smart Routing
- Coordinator agent automatically routes requests to the appropriate specialist
- Sequential tool execution for accurate, step-by-step processing
- Real-time WebSocket communication between frontend and server

## 🏗️ Architecture

```
![alt](./image.png)

```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Bun runtime, TypeScript, WebSocket |
| **AI Framework** | OpenAI Agents SDK, GPT-5.2 |
| **HTTP Client** | Axios |

## 📦 Installation

### Prerequisites
- [Bun](https://bun.sh) (v1.2.15 or later)
- [Node.js](https://nodejs.org) (v18 or later)
- OpenAI API key

### Server Setup

```bash
cd server
bun install
```

### Frontend Setup

```bash
cd frontend
npm install
# or
bun install
```

## ⚙️ Configuration

Create a `.env` file in the `server` directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## 🚀 Usage

### Start the Server

```bash
cd server
bun run src/index.ts
```

### Start the Frontend

```bash
cd frontend
npm run dev
# or
bun run dev
```

### Example Interactions

**Medicine Finder:**
```
User: Find paracetamol near downtown Seattle
Agent: [Searches pharmacies, simulates calls to verify stock, returns specific pharmacy details]
```

**Travel Planner:**
```
User: Plan a 3-day trip from New York to Boston
Agent: [Researches transport, accommodations, dining, generates complete itinerary]
```

## 📁 Project Structure

```
pokus.ai/
├── server/
│   ├── src/
│   │   ├── index.ts              # Server entry point
│   │   ├── agents/
│   │   │   ├── coordinator.ts    # Routes requests to specialists
│   │   │   ├── medicine.ts       # Medicine finder agent
│   │   │   └── travel.ts         # Travel planner agent
│   │   ├── tools/
│   │   │   ├── medicineTools.ts  # Pharmacy search tools
│   │   │   └── travelTools.ts    # Transport/accommodation tools
│   │   └── services/
│   │       ├── searchService.ts  # External API integration
│   │       └── travelService.ts  # Travel data searches
│   └── package.json
├── frontend/
│   ├── app/
│   │   └── page.tsx              # Main page
│   ├── components/
│   │   └── AgentChat.tsx         # Chat interface
│   └── package.json
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source. See the repository for license details.

---

**Repository:** [https://github.com/Adityaadpandey/pokus.ai](https://github.com/Adityaadpandey/pokus.ai)
