# 🧬 OMEGA-1 AGENTIC SYSTEM FILE TREE

## PROJECT STRUCTURE

```text
void-weaver/
├── README.md
├── INSTALLATION_GUIDE.md
├── .env.example
├── .env
├── .gitignore
│
├── backend/                          # 🧠 THE BRAIN
│   ├── __init__.py
│   ├── requirements.txt
│   ├── server.py                     # FastAPI Bridge
│   ├── agent/
│   │   ├── __init__.py
│   │   ├── agent_graph.py           # 🎯 CORE LOGIC
│   │   ├── state.py                 # Agent State Definition
│   │   ├── nodes/
│   │   │   ├── __init__.py
│   │   │   ├── planner.py           # Node 1: Breaks goals
│   │   │   ├── executor.py          # Node 2: Calls tools
│   │   │   └── reflector.py         # Node 3: Self-correction
│   │   └── tools/
│   │       ├── __init__.py
│   │       ├── base.py              # Tool base class
│   │       ├── web_search.py        # Tool 1: Web search
│   │       └── file_writer.py       # Tool 2: File operations
│   ├── memory/
│   │   ├── __init__.py
│   │   ├── manager.py               # MemoryManager Class
│   │   └── embeddings.py            # Vector operations
│   └── config/
│       ├── __init__.py
│       └── settings.py              # Configuration
│
├── frontend/                         # 🎭 THE FACE
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── components.json
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # 🎯 MAIN INTERFACE
│   │   ├── globals.css
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts         # API Route
│   ├── components/
│   │   ├── ui/                      # Shadcn/UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── agent/
│   │   │   ├── StatusSteps.tsx      # 🔄 Dynamic status
│   │   │   ├── DataCard.tsx         # 📊 Data rendering
│   │   │   ├── ApprovalButton.tsx   # ✅ Permission requests
│   │   │   └── ChatInterface.tsx    # 💬 Main chat UI
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── ai.ts                    # Vercel AI SDK setup
│   │   └── supabase.ts              # Client setup
│   └── hooks/
│       ├── useAIState.ts            # 🧠 AI state management
│       └── useUIState.ts            # 🎨 UI state management
│
├── supabase/                         # 🧬 MEMORY LAYER
│   ├── migrations/
│   │   └── 20240101_create_memories.sql
│   └── functions/
│       └── vector_search.sql
│
└── docs/
    ├── API.md
    ├── ARCHITECTURE.md
    └── DEPLOYMENT.md
```

## 🎯 CORE ARCHITECTURE FLOW

- **User Input** → Frontend (Next.js)
- **API Bridge** → Backend (FastAPI)
- **Agent Loop** → LangGraph (ReAct Pattern)
- **Memory Retrieval** → Supabase (pgvector)
- **Tool Execution** → Web Search + File Writer
- **Dynamic UI** → Generative Components
- **Result Streaming** → Real-time Updates

## 🔧 TECHNOLOGY STACK INTEGRATION

- **Frontend**: Next.js 15 + Vercel AI SDK = Streaming UI
- **Backend**: FastAPI + LangGraph = Stateful Agents
- **Memory**: Supabase + pgvector = Long-term Context
- **LLM**: OpenAI/Claude = Reasoning Engine
- **UI**: Shadcn/UI + Tailwind = Modern Interface
