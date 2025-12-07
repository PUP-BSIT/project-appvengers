# Frontend ↔ Backend ↔ n8n Communication Flow

## High-Level Overview

The iBudget chatbot uses a **proxy architecture** where the frontend communicates with the backend, which then forwards requests to n8n AI. This provides security, authentication, and data enrichment.

```
┌─────────────────┐    HTTP POST    ┌─────────────────┐    HTTP POST    ┌─────────────────┐
│   Frontend      │ ──────────────► │   Backend       │ ──────────────► │   n8n AI        │
│   (Angular)     │                 │   (Spring Boot) │                 │   (Workflow)    │
│                 │ ◄────────────── │                 │ ◄────────────── │                 │
└─────────────────┘    JSON         └─────────────────┘    JSON         └─────────────────┘
```

## Detailed Communication Flow

### Step 1: User Initiates Chat (Frontend → Backend)

**Frontend Code:**
```typescript
// frontend/ibudget/src/app/chatbot-sidebar/chatbot.service.ts
sendMessage(message: string): Observable<any> {
    return this.http.post(this.apiUrl, {
        message: message,
        sessionId: this.sessionId  // Unique per browser session
    });
}
```

**HTTP Request:**
```
POST /api/chatbot/message
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "message": "What's my financial summary?",
  "sessionId": "chat-m5x7k2a1-b3c4d5e6"
}
```

### Step 2: Backend Processes Request (Backend Internal)

**Backend Controller:**
```java
// backend/.../controller/ChatbotController.java
@PostMapping("/message")
public ResponseEntity<Object> sendMessage(
        @RequestBody Map<String, String> payload,
        Authentication auth) {

    String message = payload.get("message");
    String userEmail = auth.getName();        // From JWT token
    String sessionId = payload.get("sessionId");

    // Fetch user's financial context
    UserFinancialContext userContext = userContextService.buildUserContext(userEmail);

    // Send to n8n
    Object response = chatbotService.sendMessage(message, userEmail, sessionId);
    return ResponseEntity.ok(response);
}
```

### Step 3: Backend → n8n Communication

**Backend Service:**
```java
// backend/.../service/ChatbotService.java
public Object sendMessage(String message, String userEmail, String sessionId) {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("X-N8N-Secret", n8nWebhookSecret);  // Authentication

    Map<String, Object> body = new HashMap<>();
    body.put("message", message);
    body.put("sessionId", sessionId);
    body.put("userContext", userContext);  // Rich financial data

    HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

    // Send to n8n webhook
    ResponseEntity<Object> response = restTemplate.postForEntity(
        n8nWebhookUrl, request, Object.class);

    return response.getBody();
}
```

**HTTP Request to n8n:**
```
POST https://n8n-j3he.onrender.com/webhook/3359fb07-339e-465f-9a4b-afc19a8e8f0b
X-N8N-Secret: <secret_key>
Content-Type: application/json

{
  "message": "What's my financial summary?",
  "sessionId": "chat-m5x7k2a1-b3c4d5e6",
  "userContext": {
    "username": "kaelvxDev",
    "totalIncome": 15000.00,
    "totalExpenses": 5500.00,
    "remainingBudget": 9500.00,
    "expensesByCategory": [...],
    "activeBudgets": [...],
    "savingsGoals": [...],
    "recentTransactions": [...]
  }
}
```

### Step 4: n8n Processes and Responds

**n8n Workflow:**
1. **Webhook Node** receives the request
2. **Postgres Memory Node** uses `sessionId` to retrieve conversation history
3. **AI Agent Node** processes the message with:
   - System prompt containing `userContext`
   - Conversation history from memory
   - User's question
4. **AI generates personalized response**
5. **Response sent back** through the webhook

### Step 5: Response Flows Back (n8n → Backend → Frontend)

**Response Flow:**
```
n8n Response → Backend → Frontend
     ↓            ↓        ↓
  JSON         JSON     JSON
  object       object   object
```

## Key Communication Concepts

### 1. Authentication & Security

| Component | Authentication Method |
|-----------|----------------------|
| **Frontend → Backend** | JWT Bearer Token (from login) |
| **Backend → n8n** | X-N8N-Secret header (webhook secret) |
| **User Data Access** | Email from JWT → Database queries |

### 2. Data Enrichment

**Frontend sends:** Basic message + session ID
**Backend adds:** Complete financial context (income, expenses, budgets, savings)
**n8n receives:** Rich, personalized data for AI processing

### 3. Session Management

**Session ID Flow:**
```
Frontend generates → Sent with each message → n8n uses for memory → Conversation continuity
```

**Why this works:**
- **Per-browser session:** New ID each time user refreshes
- **Memory persistence:** n8n stores conversation history per session ID
- **Privacy:** Each user has isolated conversation history

### 4. Error Handling

**If backend can't fetch user data:**
```json
{
  "message": "What's my summary?",
  "sessionId": "chat-abc123",
  "userContextError": "Could not fetch user financial data"
}
```

**If n8n fails:**
```json
{
  "error": "Failed to communicate with chatbot service."
}
```

## Visual Communication Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND (Angular - localhost:4200)                                        │
│                                                                             │
│ User: "What's my financial summary?"                                        │
│                                                                             │
│ HTTP POST /api/chatbot/message                                              │
│ Headers: Authorization: Bearer <jwt>                                        │
│ Body: { message, sessionId }                                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND (Spring Boot - localhost:8081)                                      │
│                                                                             │
│ 1. Validate JWT token → Extract user email                                 │
│ 2. Query database → Get financial data                                     │
│ 3. Enrich payload → Add userContext                                        │
│                                                                             │
│ HTTP POST https://n8n-j3he.onrender.com/webhook/...                         │
│ Headers: X-N8N-Secret: <secret>                                             │
│ Body: { message, sessionId, userContext }                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ n8n WORKFLOW (Cloud)                                                     │
│                                                                             │
│ 1. Webhook receives enriched payload                                       │
│ 2. Postgres Memory: Load conversation history (by sessionId)               │
│ 3. AI Agent: Process with system prompt + userContext + history            │
│ 4. Generate personalized response                                          │
│                                                                             │
│ HTTP Response: { AI response }                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ RESPONSE FLOWS BACK: n8n → Backend → Frontend                              │
│                                                                             │
│ Frontend displays: "Hi kaelvxDev! You have ₱15,000 income..."              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Why This Architecture?

### Advantages:
1. **Security:** User data never leaves backend (except to authenticated n8n)
2. **Authentication:** JWT validation ensures only logged-in users can chat
3. **Data Enrichment:** Backend adds rich context before sending to AI
4. **Scalability:** n8n can be scaled independently
5. **Maintainability:** Clear separation of concerns

### Technical Benefits:
- **CORS Handling:** Backend proxy avoids browser CORS issues
- **Error Isolation:** Backend can handle n8n failures gracefully
- **Data Validation:** Backend ensures data integrity before sending
- **Rate Limiting:** Can be implemented at backend level

## For Your Professor: Key Points to Emphasize

**Communication Patterns:**
- **Synchronous HTTP:** Request-response flow
- **Authentication:** JWT (frontend→backend) + Secret (backend→n8n)
- **Data Flow:** Basic → Enriched → Processed → Response

**Security Layers:**
- **Frontend:** JWT from login session
- **Backend:** Validates JWT, fetches user data
- **n8n:** Validates webhook secret

**Data Transformation:**
- **Input:** Simple message + session ID
- **Processing:** Add 50+ data points of financial context
- **Output:** Personalized AI response with real user data

**Session Continuity:**
- **Frontend:** Generates persistent session ID
- **n8n:** Uses session ID as memory key
- **Result:** Multi-turn conversations with memory

This architecture demonstrates enterprise-level integration patterns, security best practices, and scalable system design.</content>
<parameter name="filePath">C:\kaelDev\Programming\AppDev101\project-appvengers\COMMUNICATION_FLOW_GUIDE.md