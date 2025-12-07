# iBudget Context-Aware Chatbot: Implementation Guide

## What Was the Problem?

The iBudget chatbot was a basic AI assistant that could only give general financial advice. It couldn't see the user's actual financial data, so it would say things like:

**Before:** "I don't have access to your financial data. Can you tell me your income and expenses?"

**After:** "Hi kaelvxDev! I can see you have ₱15,000 in income and ₱5,500 in expenses, leaving you with ₱9,500 available. Your biggest expense is Food at ₱3,000."

## What Does the Solution Do?

The context-aware chatbot now:
1. **Sees real user data** - Income, expenses, budgets, savings goals
2. **Remembers conversations** - Multi-turn chat within the same session
3. **Gives personalized advice** - Based on actual financial situation
4. **Maintains privacy** - Each user sees only their own data

## How It Works (Simple Explanation)

### The Data Flow

```
User's Browser → iBudget App → Backend Server → n8n AI → Back to User
```

1. **User opens chatbot** → Gets a unique session ID (like a conversation room number)
2. **User asks question** → Frontend sends message + session ID to backend
3. **Backend gets user data** → Fetches income, expenses, budgets from database
4. **Backend packages everything** → Sends message + session ID + financial data to n8n
5. **n8n AI processes** → Uses financial data to give personalized response
6. **Response comes back** → AI remembers previous messages in the conversation

### Key Components

#### 1. Frontend (Angular) - The Chat Interface

**File:** `frontend/ibudget/src/app/chatbot-sidebar/chatbot.service.ts`

**What it does:**
- Creates a unique session ID when user opens the app
- Sends messages with this session ID
- Example: `sessionId: "chat-m5x7k2a1-b3c4d5e6"`

**Why?** So the AI can remember the conversation across multiple messages.

#### 2. Backend (Spring Boot) - The Data Collector

**Three main parts:**

**ChatbotController** - The receptionist
- Receives messages from frontend
- Gets user's email from login token
- Passes everything to the service

**UserContextService** - The data gatherer
- Queries the database for user's financial data
- Calculates totals, categories, budgets, savings
- Packages it into a structured format

**ChatbotService** - The messenger
- Takes message + session ID + financial data
- Sends it all to n8n AI service

#### 3. n8n Workflow - The AI Brain

**What it does:**
- Receives the payload from backend
- Uses session ID to remember conversation history
- Gives AI access to user's financial data
- Returns personalized response

## The Technical Details (For Your Professor)

### Data Structure Sent to AI

```json
{
  "message": "What's my financial summary?",
  "sessionId": "chat-m5x7k2a1-b3c4d5e6",
  "userContext": {
    "username": "kaelvxDev",
    "totalIncome": 15000.00,
    "totalExpenses": 5500.00,
    "remainingBudget": 9500.00,
    "expensesByCategory": [
      {"category": "Food", "amount": 3000},
      {"category": "Transportation", "amount": 1500}
    ],
    "activeBudgets": [
      {
        "categoryName": "Food",
        "limitAmount": 5000,
        "spentAmount": 3000,
        "remainingAmount": 2000
      }
    ],
    "savingsGoals": [
      {
        "name": "Emergency Fund",
        "targetAmount": 50000,
        "currentAmount": 12000,
        "progressPercent": 24.0
      }
    ]
  }
}
```

### How Session Memory Works

**Problem:** Without session IDs, every message was a new conversation.

**Solution:** Each browser session gets a unique ID that persists until page refresh.

**Result:** AI can remember:
- "What's my budget?" → Shows budget data
- "What about savings?" → Remembers you asked about budget, now shows savings

### Security & Privacy

- **Authentication:** Only logged-in users can access their own data
- **Session isolation:** Each user has their own session ID
- **Data freshness:** Financial data is fetched fresh for each message
- **No data storage:** AI doesn't store user data between sessions

## Why This Matters

### For Users
- **Personalized experience:** AI knows their actual financial situation
- **Better advice:** Can suggest specific actions based on real data
- **Natural conversation:** Can have multi-turn discussions

### For the Application
- **Competitive advantage:** Most chatbots give generic advice
- **User engagement:** More useful = more usage
- **Educational value:** Helps users understand their finances better

### For Students (Your Project)
- **Technical achievement:** Complex integration of multiple systems
- **Real-world application:** Solves actual user needs
- **Scalable architecture:** Can be extended with more features

## Files Changed

### Frontend
- `frontend/ibudget/src/app/chatbot-sidebar/chatbot.service.ts` - Added session ID generation

### Backend
- `backend/.../controller/ChatbotController.java` - Added session ID handling
- `backend/.../service/ChatbotService.java` - Added user context to payload
- `backend/.../service/UserContextService.java` - **NEW** - Data aggregation service
- `backend/.../dto/UserFinancialContext.java` - **NEW** - Data structure

### Documentation
- `documents/markdown/iBudget_AI_Agent_System_Prompt.md` - Updated AI instructions
- `documents/microservice/ibudget n8n chatbot http node (RAG with MEMORY).json` - Workflow config

## Testing the Implementation

1. **Start backend:** `cd backend/appvengers && ./mvnw spring-boot:run`
2. **Start frontend:** `cd frontend/ibudget && npm start`
3. **Login to app** with test user
4. **Open chatbot** and ask: "What's my financial summary?"
5. **AI should respond** with your actual financial data

## Future Enhancements

- **Voice input:** Add speech-to-text
- **File uploads:** Let users upload bank statements
- **Multi-language:** Support different languages
- **Advanced analytics:** Trend analysis over time
- **Integration:** Connect to actual bank APIs

---

## Summary for Your Professor

"This project implements a context-aware AI chatbot that provides personalized financial advice by integrating real user data from the iBudget application. The system uses a three-tier architecture (Frontend → Backend → AI) with session management for conversation continuity. Key technical achievements include secure data aggregation, real-time context injection, and privacy-preserving session isolation. The solution demonstrates advanced full-stack development skills and addresses a real user need for personalized financial guidance."</content>
<parameter name="filePath">C:\kaelDev\Programming\AppDev101\project-appvengers\CHATBOT_IMPLEMENTATION_GUIDE.md