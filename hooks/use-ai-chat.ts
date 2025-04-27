"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

export type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
}

export function useChat({
  initialMessages = [],
  onFinish,
}: {
  initialMessages?: Message[]
  onFinish?: (message: Message) => void
} = {}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!input.trim()) {
        return
      }

      // Add user message to state
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input,
      }

      // Optimistically update UI
      setMessages((current) => [...current, userMessage])
      setInput("")
      setIsLoading(true)

      try {
        // Send message to API endpoint
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].filter((message) => message.role !== "system"),
            systemMessage: messages.find((message) => message.role === "system")?.content,
          }),
        })

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`)
        }

        const responseData = await response.json()

        // Add assistant message to state
        const assistantMessage: Message = {
          id: responseData.id || Date.now().toString(),
          role: "assistant",
          content: responseData.content,
        }

        setMessages((current) => [...current, assistantMessage])

        // Call onFinish callback if provided
        if (onFinish) {
          onFinish(assistantMessage)
        }
      } catch (error) {
        console.error("Error in chat:", error)
        toast({
          title: "Error",
          description: "Failed to get a response. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [input, messages, onFinish, toast],
  )

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    setInput,
  }
}
