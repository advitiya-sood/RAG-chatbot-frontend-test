import React from 'react'
import '../styles/Features.css'

function Features() {
  const features = [
    {
      title: '🤖 AI-Powered',
      description: 'Advanced RAG technology for accurate answers'
    },
    {
      title: '⚡ Fast Response',
      description: 'Get instant answers to your questions'
    },
    {
      title: '📚 Knowledge Base',
      description: 'Powered by comprehensive company documentation'
    },
    {
      title: '🔒 Secure',
      description: 'Your data is safe and encrypted'
    }
  ]

  return (
    <div className="features">
      <h2>Why Choose Us?</h2>
      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Features
