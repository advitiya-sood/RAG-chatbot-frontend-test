import React from 'react'
import '../styles/Hero.css'

function Hero() {
  return (
    <div className="hero">
      <div className="hero-content">
        <h1>Welcome to Tech</h1>
        <p>Empowering businesses with AI-powered solutions</p>
        <button className="cta-button">Get Started</button>
      </div>
      <div className="hero-gradient"></div>
    </div>
  )
}

export default Hero
