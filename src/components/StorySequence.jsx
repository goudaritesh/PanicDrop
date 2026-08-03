import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const storyLines = [
  "Oh, so you're ready to order? 😏",
  "Are you sure you can handle this speed? ⚡",
  "We literally drop it before you finish paying... 📦💨",
  "Alright, buckle up. 🚀"
]

export default function StorySequence({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (currentIndex < storyLines.length) {
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1)
      }, 2000) // Display each line for 2 seconds
      return () => clearTimeout(timer)
    } else {
      // Story finished, navigate to login after a brief pause
      const endTimer = setTimeout(() => {
        if (onComplete) onComplete()
        navigate('/login')
      }, 500)
      return () => clearTimeout(endTimer)
    }
  }, [currentIndex, navigate, onComplete])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        {currentIndex < storyLines.length && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="text-center px-6"
          >
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]">
              {storyLines[currentIndex]}
            </h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
