import React, { useState, useRef, useEffect } from 'react'
import '../styles/ChatWidget.css'

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I'm your Bhavna Corp AI assistant. Ask me anything about our company, policies, or team!", 
      sender: "bot" 
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const messagesEndRef = useRef(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const toggleChat = () => setIsOpen(!isOpen)

  const formatBotMessage = (text) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      // Convert **text** to <strong>text</strong>
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      
      if (line.startsWith('📝 Summary:')) {
        return <div key={i} className="summary-line" dangerouslySetInnerHTML={{ __html: formattedLine }} />
      } else if (line.startsWith('Citations:')) {
        return <div key={i} className="citations-header">{line}</div>
      } else if (line.match(/^\[\d+\]/)) {
        return <div key={i} className="citation-item" dangerouslySetInnerHTML={{ __html: formattedLine }} />
      } else if (line.trim() === '') {
        return <br key={i} />
      } else {
        return <div key={i} className="message-line" dangerouslySetInnerHTML={{ __html: formattedLine }} />
      }
    })
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = { text: inputValue, sender: "user" }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8000/api/query/advanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: userMessage.text,
          top_k: 5,
          summarize: true,
          stream: false
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const data = await response.json()

      let botMessage = data.answer
      if (data.summary) {
        botMessage = `📝 Summary: ${data.summary}\n\n${data.answer}`
      }

      setMessages((prev) => [...prev, { 
        text: botMessage, 
        sender: "bot",
        sources: data.sources
      }])
    } catch (error) {
      console.error("API Error:", error)
      setMessages((prev) => [
        ...prev, 
        { 
          text: "Sorry, I'm having trouble connecting. Please make sure the API server is running:\n\nuvicorn api:app --reload", 
          sender: "bot" 
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage()
  }

  return (
    <>
      <button className="chat-btn" onClick={toggleChat}>
        {isOpen ? "✕" : "💬"}
      </button>

      {isOpen && (
        <div className="chat-box">
          <div className="chat-header">
            Bhavna Corp Assistant
            <span className="close-btn" onClick={toggleChat}>✕</span>
          </div>
          
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`msg ${msg.sender}`}>
                {msg.sender === 'bot' ? (
                  <div className="bot-message-content">
                    {formatBotMessage(msg.text)}
                  </div>
                ) : (
                  <div>{msg.text}</div>
                )}
              </div>
            ))}
            {isLoading && <div className="msg loading">Thinking...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about CEO, policies, leave..."
            />
            <button onClick={handleSendMessage} disabled={isLoading}>
              {isLoading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatWidget
