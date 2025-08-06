"use client"

import { useEffect } from "react"

interface ToastProps {
  message: string
  type: "success" | "error"
  onClose: () => void
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
        type === "success" ? "bg-pink-600 text-white" : "bg-red-500 text-white"
      }`}
    >
      {message}
    </div>
  )
}
