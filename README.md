# Bhavna Corp Frontend

Beautiful React + Vite frontend with integrated AI chatbot to test the RAG backend.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd bhavna-frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will open at http://localhost:5173

## 🎯 Features

- **Sample Website**: Beautiful landing page with Hero and Features sections
- **AI Chatbot Widget**: Floating chat button that connects to FastAPI backend
- **Responsive Design**: Works on desktop and mobile
- **Modern UI**: Gradient backgrounds, smooth animations, and hover effects

## 🧪 Testing the Chatbot

1. Make sure the backend is running:
   ```bash
   cd ../HuggingFaceChatbot-test
   uvicorn api:app --reload
   ```

2. Open the frontend at http://localhost:5173

3. Click the chat button (💬) in the bottom right

4. Ask questions like:
   - "Who is the CEO of Bhavna corp?"
   - "Tell me about maternity leave"
   - "What are the working hours?"

## 📁 Project Structure

```
bhavna-frontend/
├── src/
│   ├── components/
│   │   ├── Hero.jsx          # Landing page hero section
│   │   ├── Features.jsx      # Features grid
│   │   └── ChatWidget.jsx    # AI chatbot widget
│   ├── styles/
│   │   ├── Hero.css
│   │   ├── Features.css
│   │   └── ChatWidget.css
│   ├── App.jsx               # Main app component
│   ├── App.css
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
├── index.html
├── vite.config.js
└── package.json
```

## 🎨 Customization

### Change API URL
Edit `src/components/ChatWidget.jsx` line 35:
```javascript
const response = await fetch("http://localhost:8000/api/query/advanced", {
```

### Modify Colors
The main gradient colors are in the CSS files:
- Primary: `#667eea`
- Secondary: `#764ba2`

## 🛠️ Built With

- React 18
- Vite 4
- Vanilla CSS (no Tailwind)

## 📝 Notes

- Backend must be running on port 8000
- Frontend runs on port 5173
- CORS is already configured in the backend
