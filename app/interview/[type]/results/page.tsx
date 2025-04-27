"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Check, Home, RefreshCw, MessageSquare, ThumbsDown, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { interviewQuestions } from "@/lib/interview-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"

type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
}

export default function ResultsPage({ params }: { params: { type: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [transcript, setTranscript] = useState<Message[]>([])
  const [feedback, setFeedback] = useState<{
    overallScore: number
    strengths: string[]
    improvements: string[]
    detailedFeedback: string
  } | null>(null)
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false)

  const interviewType = params.type as keyof typeof interviewQuestions
  const questions = interviewQuestions[interviewType] || []

  useEffect(() => {
    const transcriptParam = searchParams.get("transcript")
    if (transcriptParam) {
      try {
        const parsedTranscript = JSON.parse(decodeURIComponent(transcriptParam))
        setTranscript(parsedTranscript)
        generateInterviewFeedback(parsedTranscript)
      } catch (error) {
        console.error("Failed to parse transcript:", error)
      }
    }
  }, [searchParams])

  const generateInterviewFeedback = async (messages: Message[]) => {
    setIsGeneratingFeedback(true)
    try {
      // Simplified feedback generation for demonstration
      // In a real app, you would use the AI SDK to analyze the interview transcript
      const userResponses = messages.filter((m) => m.role === "user").map((m) => m.content)

      // Simulated feedback generation based on response length and keywords
      const wordCount = userResponses.reduce((count, response) => {
        return count + response.split(/\s+/).length
      }, 0)

      const averageWords = wordCount / userResponses.length

      // Simple scoring algorithm
      let score = 0
      if (averageWords < 20) score = 5
      else if (averageWords < 50) score = 7
      else score = 8

      // Keyword analysis (very simple)
      const keywords = ["experience", "project", "team", "learned", "challenge", "solution"]
      const keywordUsage = keywords.reduce((count, keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, "gi")
        const matches = userResponses.join(" ").match(regex) || []
        return count + matches.length
      }, 0)

      score += Math.min(keywordUsage / 2, 2) // Max 2 bonus points for keywords

      // Generate strengths and improvements
      const strengths = []
      const improvements = []

      if (averageWords >= 30) strengths.push("Provided detailed answers")
      else improvements.push("Provide more detailed responses with examples")

      if (keywordUsage >= 3) strengths.push("Used relevant terminology")
      else improvements.push("Include more industry-specific terminology")

      if (userResponses.some((r) => r.length > 100)) strengths.push("Gave comprehensive answers to complex questions")
      if (userResponses.every((r) => r.length < 200)) improvements.push("Elaborate more on complex topics")

      // Add default strengths/improvements
      if (strengths.length < 2) strengths.push("Engaged with all questions")
      if (improvements.length < 2) improvements.push("Practice more structured responses using the STAR method")

      const detailedFeedback = `
        Your interview responses showed ${averageWords < 30 ? "limited" : averageWords < 50 ? "adequate" : "good"} detail.
        
        You used relevant terminology ${keywordUsage < 3 ? "sparingly" : "effectively"}.
        
        Your communication style was ${averageWords < 30 ? "concise but could benefit from more detail" : "appropriately detailed"}.
        
        To improve, focus on providing specific examples from your experience and quantifying your achievements where possible.
      `

      setFeedback({
        overallScore: Math.round(score * 10),
        strengths,
        improvements,
        detailedFeedback: detailedFeedback.trim(),
      })
    } catch (error) {
      console.error("Failed to generate feedback:", error)
      toast({
        title: "Error",
        description: "Failed to generate interview feedback.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingFeedback(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard.",
    })
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Button variant="outline" onClick={() => router.push(`/interview/${interviewType}`)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          New Interview
        </Button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 capitalize">{interviewType} Interview Results</h1>
        <p className="text-muted-foreground">Review your performance and get AI-generated feedback</p>
      </div>

      {feedback ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Performance Analysis</CardTitle>
            <CardDescription>AI-generated feedback on your interview performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full border-8 border-primary flex items-center justify-center mb-4">
                <span className="text-3xl font-bold">{feedback.overallScore}%</span>
              </div>

              <p className="text-center max-w-md mb-6">{feedback.detailedFeedback}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <ThumbsUp className="h-5 w-5 text-green-500 mr-2" />
                    <h3 className="font-medium">Strengths</h3>
                  </div>
                  <ul className="space-y-1">
                    {feedback.strengths.map((strength, i) => (
                      <li key={i} className="text-sm flex">
                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <ThumbsDown className="h-5 w-5 text-amber-500 mr-2" />
                    <h3 className="font-medium">Areas to Improve</h3>
                  </div>
                  <ul className="space-y-1">
                    {feedback.improvements.map((improvement, i) => (
                      <li key={i} className="text-sm">
                        • {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8 p-8 flex justify-center items-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Analyzing your interview responses...</p>
          </div>
        </Card>
      )}

      <h2 className="text-2xl font-bold mb-4">Interview Transcript</h2>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Conversation with AI Interviewer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[400px] overflow-y-auto p-2">
            {transcript.map((message) => (
              <div key={message.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{message.role === "user" ? "U" : "AI"}</AvatarFallback>
                  {message.role === "user" ? (
                    <AvatarImage src="/user-avatar.png" />
                  ) : (
                    <AvatarImage src="/ai-interviewer.png" />
                  )}
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{message.role === "user" ? "You" : "AI Interviewer"}</span>
                  <div className="mt-1 text-sm">{message.content}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Button
              className="h-auto py-4 flex flex-col items-center"
              onClick={() => router.push(`/interview/${interviewType}`)}
            >
              <MessageSquare className="h-6 w-6 mb-2" />
              <span className="font-medium">Practice Again</span>
              <span className="text-xs text-muted-foreground mt-1">Try another interview in this category</span>
            </Button>

            <Button
              className="h-auto py-4 flex flex-col items-center"
              variant="outline"
              onClick={() => router.push("/")}
            >
              <Home className="h-6 w-6 mb-2" />
              <span className="font-medium">Explore Other Categories</span>
              <span className="text-xs text-muted-foreground mt-1">Try different types of interviews</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
