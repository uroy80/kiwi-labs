"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Check,
  Home,
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
  Loader2,
  Download,
  Share,
  Award,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { KiwiLogo } from "@/components/kiwi-logo"

type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
}

type JobDetails = {
  jobTitle: string
  company: string
  jobDescription: string
  requiredSkills: string
  experienceLevel: string
  interviewType: string
  additionalNotes: string
  userProfile?: {
    name: string
    gender: string
  }
}

type SubjectiveVivaDetails = {
  subject: string
  topic: string
  subjectLevel: string
  additionalNotes: string
  hasProjectDocument: boolean
  interviewType: string
  fileDetails?: {
    name: string
    type: string
    size: number
  } | null
  userProfile?: {
    name: string
    gender: string
  }
}

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [transcript, setTranscript] = useState<Message[]>([])
  const [jobDetails, setJobDetails] = useState<JobDetails | SubjectiveVivaDetails | null>(null)
  const [feedback, setFeedback] = useState<{
    overallScore: number
    strengths: string[]
    improvements: string[]
    detailedFeedback: string
  } | null>(null)
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false)
  const [userProfile, setUserProfile] = useState<{ gender: string; name: string } | null>(null)

  useEffect(() => {
    const transcriptParam = searchParams.get("transcript")
    const jobParam = searchParams.get("job")

    if (transcriptParam && jobParam) {
      try {
        const parsedTranscript = JSON.parse(decodeURIComponent(transcriptParam))
        const parsedJob = JSON.parse(decodeURIComponent(jobParam))
        setTranscript(parsedTranscript)
        setJobDetails(parsedJob)

        // Extract user profile if available
        if (parsedJob.userProfile) {
          setUserProfile(parsedJob.userProfile)
        }

        generateInterviewFeedback(parsedTranscript, parsedJob)
      } catch (error) {
        console.error("Failed to parse data:", error)
        toast({
          title: "Error",
          description: "Failed to load interview results. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      router.push("/")
    }
  }, [searchParams, router, toast])

  const generateInterviewFeedback = async (messages: Message[], job: JobDetails | SubjectiveVivaDetails) => {
    setIsGeneratingFeedback(true)
    try {
      // In a real app, this would call the AI API to analyze the interview
      const response = await fetch("/api/analyze-interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          jobDetails: job,
        }),
      })

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()
      setFeedback(data)
    } catch (error) {
      console.error("Failed to generate feedback:", error)
      toast({
        title: "Error",
        description: "Failed to generate interview feedback.",
        variant: "destructive",
      })

      // Fallback feedback if API fails
      setFeedback({
        overallScore: 75,
        strengths: [
          "Provided detailed responses to technical questions",
          "Demonstrated good communication skills",
          "Used relevant examples from past experience",
        ],
        improvements: [
          "Could provide more specific metrics and outcomes",
          "Consider structuring responses using the STAR method",
          "Elaborate more on problem-solving approaches",
        ],
        detailedFeedback:
          "Overall, you demonstrated good knowledge of the required skills and communicated your experience effectively. Your responses were generally well-structured and relevant to the questions asked. To improve, focus on quantifying your achievements and providing more concrete examples of your problem-solving process.",
      })
    } finally {
      setIsGeneratingFeedback(false)
    }
  }

  if (!jobDetails || !transcript.length) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl animate-pulse"></div>
            <KiwiLogo size="xl" className="relative" />
          </div>
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Analyzing your interview performance...</p>
        </div>
      </div>
    )
  }

  // Get the user's avatar based on gender
  const userAvatarSrc = userProfile?.gender ? `/${userProfile.gender}-avatar.png` : "/user-avatar.png"

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" className="group" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Button>

        <KiwiLogo />
      </div>

      <div className="text-center mb-8">
        {jobDetails.interviewType === "subjective" ? (
          <>
            <div className="inline-flex items-center justify-center p-1 bg-primary/10 rounded-full mb-4">
              <Award className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Results</span>
            </div>
            <h1 className="text-3xl font-bold mb-2 gradient-heading">
              {(jobDetails as SubjectiveVivaDetails).subject} Viva Results
            </h1>
            <div className="flex justify-center items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-accent text-accent-foreground font-medium">
                {(jobDetails as SubjectiveVivaDetails).topic}
              </Badge>
              <Badge variant="secondary">{(jobDetails as SubjectiveVivaDetails).subjectLevel}</Badge>
              <Badge variant="secondary">Subjective viva</Badge>
            </div>
          </>
        ) : (
          <>
            <div className="inline-flex items-center justify-center p-1 bg-primary/10 rounded-full mb-4">
              <Award className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Results</span>
            </div>
            <h1 className="text-3xl font-bold mb-2 gradient-heading">{jobDetails.jobTitle} Interview Results</h1>
            <div className="flex justify-center items-center gap-2 mb-2">
              {jobDetails.company && (
                <Badge variant="outline" className="bg-accent text-accent-foreground font-medium">
                  {jobDetails.company}
                </Badge>
              )}
              <Badge variant="secondary">{jobDetails.experienceLevel.replace("-", " ")}</Badge>
              <Badge variant="secondary">{jobDetails.interviewType} interview</Badge>
            </div>
          </>
        )}
        <p className="text-muted-foreground">Review your performance and get AI-generated feedback</p>
      </div>

      {userProfile && (
        <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-gradient-to-r from-accent/30 to-accent/10 rounded-lg max-w-md mx-auto">
          <Avatar className="h-8 w-8 border-2 border-primary/20">
            <AvatarImage src={userAvatarSrc || "/placeholder.svg"} alt="User avatar" />
            <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">Candidate: {userProfile.name}</span>
        </div>
      )}

      {feedback ? (
        <div className="fancy-border overflow-hidden animate-slide-up mb-8">
          <Card className="border-0">
            <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <CardTitle>Performance Analysis</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <Share className="h-4 w-4 mr-2" />
                    Share Results
                  </Button>
                </div>
              </div>
              <CardDescription>AI-generated feedback on your interview performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
                  <div className="relative w-36 h-36 rounded-full border-8 border-primary flex items-center justify-center bg-white">
                    <span className="text-4xl font-bold gradient-heading">{feedback.overallScore}%</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-accent/30 to-accent/10 p-6 rounded-xl mb-8 max-w-2xl mx-auto">
                  <p className="text-center">{feedback.detailedFeedback}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="bg-green-50 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center mb-4">
                      <ThumbsUp className="h-6 w-6 text-green-500 mr-2" />
                      <h3 className="font-medium text-lg">Strengths</h3>
                    </div>
                    <ul className="space-y-3">
                      {feedback.strengths.map((strength, i) => (
                        <li key={i} className="flex">
                          <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-amber-50 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center mb-4">
                      <ThumbsDown className="h-6 w-6 text-amber-500 mr-2" />
                      <h3 className="font-medium text-lg">Areas to Improve</h3>
                    </div>
                    <ul className="space-y-3">
                      {feedback.improvements.map((improvement, i) => (
                        <li key={i} className="flex">
                          <div className="h-5 w-5 flex items-center justify-center text-amber-500 mr-3 flex-shrink-0">
                            •
                          </div>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="mb-8 p-8 flex justify-center items-center fancy-border animate-slide-up">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p>Analyzing your interview responses...</p>
          </div>
        </Card>
      )}

      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-1 bg-primary/10 rounded-full mb-4">
          <MessageSquare className="h-5 w-5 text-primary mr-2" />
          <span className="text-sm font-medium text-primary">Transcript</span>
        </div>
        <h2 className="text-2xl font-bold gradient-heading">Interview Transcript</h2>
      </div>

      <div className="fancy-border overflow-hidden animate-slide-up mb-8">
        <Card className="border-0">
          <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle>Conversation with AI Interviewer</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto p-2">
              {transcript.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <Avatar className="h-8 w-8 border-2 border-primary/20">
                    <AvatarFallback>{message.role === "user" ? "U" : "K"}</AvatarFallback>
                    {message.role === "user" ? (
                      <AvatarImage src={userAvatarSrc || "/placeholder.svg"} />
                    ) : (
                      <AvatarImage src="/ai-interviewer.png" />
                    )}
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {message.role === "user"
                        ? userProfile?.name || "You"
                        : jobDetails.interviewType === "subjective"
                          ? "Professor Kiwi"
                          : "Kiwi Master"}
                    </span>
                    <div className="mt-1 text-sm bg-accent/20 p-3 rounded-lg">{message.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-1 bg-primary/10 rounded-full mb-4">
          <Sparkles className="h-5 w-5 text-primary mr-2" />
          <span className="text-sm font-medium text-primary">Next Steps</span>
        </div>
        <h2 className="text-2xl font-bold gradient-heading">Continue Your Journey</h2>
      </div>

      <div className="fancy-border overflow-hidden animate-slide-up">
        <Card className="border-0">
          <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Button
                className="h-auto py-6 flex flex-col items-center fancy-button"
                onClick={() =>
                  router.push(
                    jobDetails.interviewType === "subjective" ? "/create-subjective-viva" : "/create-interview",
                  )
                }
              >
                <MessageSquare className="h-8 w-8 mb-3" />
                <span className="font-medium text-lg">Practice Again</span>
                <span className="text-xs mt-1">
                  Try another {jobDetails.interviewType === "subjective" ? "viva" : "interview"} with different
                  requirements
                </span>
              </Button>

              <Button
                className="h-auto py-6 flex flex-col items-center"
                variant="outline"
                onClick={() => router.push("/")}
              >
                <Home className="h-8 w-8 mb-3" />
                <span className="font-medium text-lg">Return Home</span>
                <span className="text-xs mt-1">Go back to the main page</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
