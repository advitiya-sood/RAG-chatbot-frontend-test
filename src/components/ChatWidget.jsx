import React, { useState, useRef, useEffect } from 'react'
import '../styles/ChatWidget.css'

const MAX_CHARS = 200

const STARTER_QUESTIONS = [
  "What's the leave policy?",
  "Tell me about employee benefits",
  "Who is the CEO of Bhavna Corp?",
]

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I'm your Bhavna Corp AI assistant. Ask me anything about our company policies, leave, benefits, or team!", 
      sender: "bot",
      time: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversationHistory, setConversationHistory] = useState([])
  const [copiedIndex, setCopiedIndex] = useState(null)
  
  const messagesEndRef = useRef(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const toggleChat = () => setIsOpen(!isOpen)

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleCopy = (text, index) => {
    // Strip citation block before copying
    const cleanText = text.replace(/\n\nCitation:[\s\S]*$/, '').trim()
    navigator.clipboard.writeText(cleanText).then(() => {
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    })
  }

  const handleClearChat = () => {
    setMessages([{
      text: "Hello! I'm your Bhavna Corp AI assistant. Ask me anything about our company policies, leave, benefits, or team!",
      sender: "bot",
      time: new Date()
    }])
    setConversationHistory([])
  }

  // Renders markdown-like formatting into React elements
  const formatBotMessageWithHover = (text, sources = []) => {
    const lines = text.split('\n')
    const elements = []
    let i = 0

    while (i < lines.length) {
      const line = lines[i]

      // Citation section
      if (line.startsWith('Citation:') || line.startsWith('Citations:')) {
        const citationMatch = lines[i + 1] && lines[i + 1].match(/^\[\d+\]/)
        
        // Find source that matches this citation
        // The simple logic: if we have sources, and this is citation [1], it corresponds to sources[0]
        // This assumes citations are always [1] for the top source as per our backend logic
        let sourcePreview = null
        if (citationMatch && sources && sources.length > 0) {
            sourcePreview = sources[0].preview
        }

        elements.push(
          <div key={i} className="citation-section">
            <span className="citation-label">📎 Source</span>
            {citationMatch && (
              <div className="citation-wrapper">
                <span className="citation-text">{lines[i + 1].replace(/^\[\d+\]\s*/, '')}</span>
                {sourcePreview && (
                  <div className="source-tooltip">
                    <div className="tooltip-header">Passage Preview</div>
                    <div className="tooltip-content">"...{sourcePreview}..."</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
        i += 2
        continue
      }

      if (line.match(/^\[\d+\]/)) { i++; continue }

      // Bullet list
      if (line.match(/^[-•]\s/)) {
        const bulletLines = []
        while (i < lines.length && lines[i].match(/^[-•]\s/)) {
          bulletLines.push(lines[i].replace(/^[-•]\s/, ''))
          i++
        }
        elements.push(
          <ul key={`ul-${i}`} className="message-list">
            {bulletLines.map((b, j) => (
              <li key={j} dangerouslySetInnerHTML={{ __html: renderInline(b) }} />
            ))}
          </ul>
        )
        continue
      }

      // Numbered list
      if (line.match(/^\d+\.\s/)) {
        const numLines = []
        while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
          numLines.push(lines[i].replace(/^\d+\.\s/, ''))
          i++
        }
        elements.push(
          <ol key={`ol-${i}`} className="message-list">
            {numLines.map((item, j) => (
              <li key={j} dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
            ))}
          </ol>
        )
        continue
      }

      if (line.trim() === '') {
        elements.push(<div key={i} className="msg-spacer" />)
        i++
        continue
      }

      elements.push(
        <p key={i} className="message-line" dangerouslySetInnerHTML={{ __html: renderInline(line) }} />
      )
      i++
    }

    return elements
  }

  const renderInline = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
  }

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return

    const userMessage = { text, sender: "user", time: new Date() }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    if (text === "I am not satisfied with responses and wanted to speak to HR") {
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          text: "Sure, you can reach out to respective location HR SPOC and discuss your concerns",
          sender: "bot",
          time: new Date()
        }])
      }, 500)
      return
    }

    setIsLoading(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"
      const response = await fetch(`${API_URL}/api/query/advanced`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: text,
          top_k: 5,
          summarize: false,
          stream: false,
          conversation_history: conversationHistory.slice(-6)
        }),
      })

      if (response.status === 429) {
        throw new Error("You're chatting too fast! Please wait a moment.")
      }

      if (!response.ok) throw new Error(`API error: ${response.statusText}`)

      const data = await response.json()

      const defaultFollowUp = "I am not satisfied with responses and wanted to speak to HR"
      const followUps = data.follow_up_questions ? [...data.follow_up_questions] : []
      if (!followUps.includes(defaultFollowUp)) {
        followUps.push(defaultFollowUp)
      }

      setMessages((prev) => [...prev, { 
        text: data.answer, 
        sender: "bot",
        sources: data.sources,
        followUpQuestions: followUps,
        time: new Date()
      }])

      setConversationHistory((prev) => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: data.answer }
      ])
    } catch (error) {
      console.error("API Error:", error)
      setMessages((prev) => [
        ...prev, 
        { 
          text: "Sorry, I'm having trouble connecting to the server. Please try again in a moment.", 
          sender: "bot",
          time: new Date()
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = () => sendMessage(inputValue)
  const handleStarterClick = (q) => sendMessage(q)
  const handleKeyPress = (e) => { if (e.key === 'Enter') handleSendMessage() }

  const showStarters = messages.length === 1 && !isLoading

  return (
    <>
      <button className="chat-btn" onClick={toggleChat}>
        {isOpen ? "✕" : "💬"}
      </button>

      {isOpen && (
        <div className="chat-box">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">B</div>
              <div>
                <div className="chat-title">Bhavna Corp Assistant</div>
                <div className="chat-status">● Online</div>
              </div>
            </div>
            <div className="header-actions">
              <button className="clear-btn" onClick={handleClearChat} title="Clear chat">🗑️</button>
              <span className="close-btn" onClick={toggleChat}>✕</span>
            </div>
          </div>
          
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`msg-wrapper ${msg.sender}`}>
                <div className={`msg ${msg.sender}`}>
                  {msg.sender === 'bot' ? (
                    <div className="bot-message-content">
                      {formatBotMessageWithHover(msg.text, msg.sources)}
                    </div>
                  ) : (
                    <div>{msg.text}</div>
                  )}
                </div>
                <div className={`msg-meta ${msg.sender}`}>
                  {msg.sender === 'bot' && (
                    <button 
                      className={`copy-btn ${copiedIndex === index ? 'copied' : ''}`}
                      onClick={() => handleCopy(msg.text, index)}
                      title="Copy answer"
                    >
                      {copiedIndex === index ? '✓ Copied' : '⎘ Copy'}
                    </button>
                  )}
                  {msg.time && <span className="msg-time">{formatTime(msg.time)}</span>}
                </div>
                
                {/* Render follow-up questions if this is the last message and they exist */}
                {msg.sender === 'bot' && msg.followUpQuestions && msg.followUpQuestions.length > 0 && index === messages.length - 1 && (
                  <div className="follow-up-chips">
                    {msg.followUpQuestions.map((q, i) => (
                      <button key={i} className="starter-chip" onClick={() => handleStarterClick(q)}>
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Starter question chips */}
            {showStarters && (
              <div className="starter-chips">
                {STARTER_QUESTIONS.map((q, i) => (
                  <button key={i} className="starter-chip" onClick={() => handleStarterClick(q)}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="msg-wrapper bot">
                <div className="msg bot">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <div className="input-wrapper">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.slice(0, MAX_CHARS))}
                onKeyPress={handleKeyPress}
                placeholder="Ask about policies, leave..."
                disabled={isLoading}
              />
              <span className={`char-counter ${inputValue.length > MAX_CHARS * 0.85 ? 'warn' : ''}`}>
                {inputValue.length}/{MAX_CHARS}
              </span>
            </div>
            <button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
              {isLoading ? "…" : "Send"}
            </button>
          </div>
          <div className="chat-footer">Powered by comprehensive company documentation</div>
        </div>
      )}
    </>
  )
}

export default ChatWidget
