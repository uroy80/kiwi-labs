"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Send, Loader2, Mic, MicOff, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useChat } from "@/hooks/use-ai-chat"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { interviewQuestions } from "@/lib/interview-data"
import { useToast } from "@/hooks/use-toast"
import { useSpeechRecognition, useSpeechSynthesis } from "@/hooks/use-speech"

export default function InterviewPage({ params }: { params: { type: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const interviewType = params.type as keyof typeof interviewQuestions
  const questions = interviewQuestions[interviewType] || []
  const [isComplete, setIsComplete] = useState(false)
  const [questionCount, setQuestionCount] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Speech recognition hook
  const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition()

  // Speech synthesis hook
  const { speak, cancel, hasSynthesisSupport } = useSpeechSynthesis()

  // Get interviewer personality based on interview type
  const getInterviewerPersona = () => {
    switch (interviewType) {
      case "technical":
        return "senior software engineer"
      case "behavioral":
        return "HR manager"
      case "case":
        return "management consultant"
      default:
        return "interviewer"
    }
  }

  // Initial system message to set up the AI interviewer
  const systemMessage = `
    You are an AI ${getInterviewerPersona()} conducting a ${interviewType} interview.
    
    Follow these rules:
    1. Start by briefly introducing yourself and the interview process.
    2. Ask one question at a time, waiting for the candidate's response.
    3. After the candidate responds, provide brief feedback and then ask a follow-up question or move to the next question.
    4. Stay in character as a professional interviewer throughout.
    5. Ask a total of ${questions.length} main questions, tracking how many you've asked.
    6. When you've asked all questions, tell the candidate the interview is complete and provide brief overall feedback.
    
    Your first message should be a brief introduction followed by the first question.
    
    Available main questions for this ${interviewType} interview (use these in order):
    ${questions.map((q, i) => `${i + 1}. ${q.question}`).join("\n")}
  `

  // Use our custom AI chat hook
  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    initialMessages: [
      {
        id: "system-1",
        role: "system",
        content: systemMessage,
      },
    ],
    onFinish: (message) => {
      // Check if the interview is complete
      const lowerContent = message.content.toLowerCase()
      if (
        (lowerContent.includes("interview is complete") ||
          lowerContent.includes("interview has concluded") ||
          lowerContent.includes("end of our interview")) &&
        !isComplete
      ) {
        setIsComplete(true)
      }

      // Count questions to track progress
      if (message.role === "assistant" && message.content.includes("?") && !message.content.startsWith("Could you")) {
        setQuestionCount((prev) => Math.min(prev + 1, questions.length))
      }

      // Speak the assistant's message if speech synthesis is supported
      if (hasSynthesisSupport) {
        speak(message.content, () => setIsSpeaking(false))
        setIsSpeaking(true)
      }
    },
  })

  // Update input with transcript when speech recognition is active
  useEffect(() => {
    if (transcript) {
      setInput(transcript)
    }
  }, [transcript, setInput])

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle recording toggle
  const toggleRecording = async () => {
    if (!hasRecognitionSupport) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please try using Chrome.",
        variant: "destructive",
      })
      return
    }

    if (isListening) {
      stopListening()
    } else {
      await startListening()
      toast({
        title: "Listening...",
        description: "Speak clearly into your microphone.",
      })
    }
  }

  // Toggle AI voice
  const toggleVoice = () => {
    if (isSpeaking) {
      cancel()
      setIsSpeaking(false)
    } else {
      // Replay the last assistant message
      const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant")
      if (lastAssistantMessage && hasSynthesisSupport) {
        speak(lastAssistantMessage.content, () => setIsSpeaking(false))
        setIsSpeaking(true)
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 capitalize">{interviewType} Interview with AI</h1>
        <p className="text-sm text-muted-foreground">
          You are having a real-time conversation with an AI interviewer. Respond naturally as in a real interview.
        </p>
        <div className="mt-2 text-sm text-primary flex items-center">
          <span className="mr-2">Progress:</span>
          {questionCount} of {questions.length} questions
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Interview Session</CardTitle>
          {hasSynthesisSupport && (
            <Button variant="outline" size="sm" onClick={toggleVoice}>
              {isSpeaking ? <VolumeX className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
              {isSpeaking ? "Mute Voice" : "Enable Voice"}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[500px] overflow-y-auto p-1">
            {messages
              .filter((m) => m.role !== "system")
              .map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <Avatar className={`${message.role === "user" ? "ml-2" : "mr-2"} h-8 w-8`}>
                      <AvatarFallback>{message.role === "user" ? "U" : "AI"}</AvatarFallback>
                      {message.role === "user" ? (
                        <AvatarImage src="/user-avatar.png" />
                      ) : (
                        <AvatarImage src="/ai-interviewer.png" />
                      )}
                    </Avatar>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                </div>
              ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex flex-row">
                  <Avatar className="mr-2 h-8 w-8">
                    <AvatarFallback>AI</AvatarFallback>
                    <AvatarImage src="/ai-interviewer.png" />
                  </Avatar>
                  <div className="rounded-lg px-4 py-2 bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <CardFooter>
          {isComplete ? (
            <div className="w-full">
              <div className="bg-muted p-4 rounded-lg mb-4 text-center">
                <h3 className="font-semibold">Interview Complete</h3>
                <p className="text-sm text-muted-foreground">Thank you for participating!</p>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="w-1/2" onClick={() => router.push("/")}>
                  Return Home
                </Button>
                <Button
                  className="w-1/2"
                  onClick={() =>
                    router.push(
                      `/interview/${interviewType}/results?transcript=${encodeURIComponent(
                        JSON.stringify(messages.filter((m) => m.role !== "system")),
                      )}`,
                    )
                  }
                >
                  View Results
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Button
                type="button"
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                onClick={toggleRecording}
                className="flex-shrink-0"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Input
                placeholder={isListening ? "Listening..." : "Type your response..."}
                value={input}
                onChange={handleInputChange}
                className="flex-1"
                disabled={isLoading || isListening}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          )}
        </CardFooter>
      </Card>

      <div className="mt-6 p-4 border rounded-lg bg-muted/30">
        <h3 className="font-semibold mb-2">Interview Tips</h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Speak clearly and concisely, focusing on relevant details</li>
          <li>• Use the STAR method (Situation, Task, Action, Result) for behavioral questions</li>
          <li>• Take a moment to think before responding to difficult questions</li>
          <li>• Ask clarifying questions if you're unsure about what's being asked</li>
          <li>• Use the microphone button to speak your answers instead of typing</li>
        </ul>
      </div>
    </div>
  )
}
