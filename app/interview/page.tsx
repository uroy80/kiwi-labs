"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Send,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  AlertCircle,
  MessageSquare,
  AlertTriangle,
  HelpCircle,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useSpeechRecognition, useSpeechSynthesis } from "@/hooks/use-speech"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import VoiceTroubleshoot from "./voice-troubleshoot"
import { KiwiLogo } from "@/components/kiwi-logo"

type UserProfile = {
  name: string
  gender: string
}

type JobDetails = {
  jobTitle: string
  company: string
  jobDescription: string
  requiredSkills: string
  experienceLevel: string
  interviewType: string
  additionalNotes: string
  userProfile?: UserProfile
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
  userProfile?: UserProfile
}

type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
}

// Function to create system message
function createSystemMessage(details: JobDetails | SubjectiveVivaDetails) {
  // Get user's name if available
  const userName = details.userProfile?.name || "the candidate"

  // Check if this is a subjective viva
  if ("subject" in details) {
    return `
    You are Professor Kiwi, an experienced professor from Kiwi Labs conducting a viva examination on the subject of ${details.subject}, specifically focusing on the topic of ${details.topic}.
    
    Student Name: ${userName}
    Subject: ${details.subject}
    Topic: ${details.topic}
    Education Level: ${details.subjectLevel}
    ${details.additionalNotes ? `Additional Notes: ${details.additionalNotes}` : ""}
    ${details.hasProjectDocument ? `The student has submitted a project document: ${details.fileDetails?.name}` : ""}
    
    Follow these rules:
    1. Start by briefly introducing yourself as Professor Kiwi from Kiwi Labs and explain the viva process.
    2. Address the student by their name (${userName}).
    3. Ask one question at a time, waiting for the student's response.
    4. After the student responds, provide brief feedback and then ask a follow-up question or move to the next question.
    5. Stay in character as a professional academic examiner throughout.
    6. Ask a total of 5 questions that are highly relevant to the subject and topic.
    7. Adapt the difficulty based on the education level (${details.subjectLevel}).
    8. If the student has submitted a project document, ask at least 2 questions that might relate to their project work.
    9. When you've asked all 5 questions, tell the student the viva is complete and provide overall feedback.
    
    Your first message should be a brief introduction followed by the first question.
  `
  } else {
    // Original job interview system message
    return `
    You are Kiwi Master, an experienced interviewer from Kiwi Labs conducting a job interview for the position of ${details.jobTitle}${
      details.company ? ` at ${details.company}` : ""
    }.
    
    Candidate Name: ${userName}
    Job Description:
    ${details.jobDescription}
    
    Required Skills:
    ${details.requiredSkills}
    
    Experience Level: ${details.experienceLevel}
    Interview Type: ${details.interviewType}
    ${details.additionalNotes ? `Additional Notes: ${details.additionalNotes}` : ""}
    
    Follow these rules:
    1. Start by briefly introducing yourself as Kiwi Master from Kiwi Labs and explain the interview process.
    2. Address the candidate by their name (${userName}).
    3. Ask one question at a time, waiting for the candidate's response.
    4. After the candidate responds, provide brief feedback and then ask a follow-up question or move to the next question.
    5. Stay in character as a professional interviewer throughout.
    6. Ask a total of 5 questions that are highly relevant to the job description and required skills.
    7. For technical interviews, focus on technical skills and problem-solving.
    8. For behavioral interviews, focus on past experiences and soft skills.
    9. For mixed interviews, include both technical and behavioral questions.
    10. Adapt the difficulty based on the experience level.
    11. When you've asked all 5 questions, tell the candidate the interview is complete and provide overall feedback.
    
    Your first message should be a brief introduction followed by the first question.
  `
  }
}

export default function InterviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  // State
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [data, setData] = useState<{
    jobDetails: JobDetails | SubjectiveVivaDetails
    messages: Message[]
    questionCount: number
    isComplete: boolean
    userProfile?: UserProfile
  } | null>(null)

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [textOnlyMode, setTextOnlyMode] = useState(true) // Default to text mode
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [showVoiceInstructions, setShowVoiceInstructions] = useState(true)
  const [showTroubleshooting, setShowTroubleshooting] = useState(false)
  const [micPermissionRequested, setMicPermissionRequested] = useState(false)
  const [voiceInitialized, setVoiceInitialized] = useState(false)
  const [typingIndicator, setTypingIndicator] = useState(false)

  // Speech hooks
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasRecognitionSupport,
    error: speechError,
    networkErrorDetected,
    resetNetworkErrorState,
  } = useSpeechRecognition()

  const { speak, cancel, hasSynthesisSupport, error: synthesisError } = useSpeechSynthesis()

  const activateMicrophone = useCallback(async () => {
    if (textOnlyMode || !hasRecognitionSupport) return

    console.log("Activating microphone...")
    try {
      // First ensure we have microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true })

      // Then start listening
      await startListening()

      toast({
        title: "Listening...",
        description: "Speak clearly into your microphone. Click the mic button again when done.",
      })

      console.log("Microphone activated successfully")
    } catch (err) {
      console.error("Failed to activate microphone:", err)

      // Check if this is a permission error
      if (err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")) {
        toast({
          title: "Microphone Access Required",
          description: "Please allow microphone access in your browser to use voice features.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Microphone Error",
          description: "Could not access your microphone. Please check permissions and try again.",
          variant: "destructive",
        })
      }

      setShowTroubleshooting(true)
    }
  }, [textOnlyMode, hasRecognitionSupport, startListening, toast])

  const handleNetworkFallback = useCallback(() => {
    // If we're already in text-only mode, no need to do anything
    if (textOnlyMode) return

    // Show a toast explaining the fallback
    toast({
      title: "Switching to Text Input",
      description: "Due to network issues with speech recognition, we're temporarily switching to text input mode.",
      variant: "warning",
    })

    // Switch to text-only mode
    setTextOnlyMode(true)

    // Focus the input field to make it easier for the user
    setTimeout(() => {
      const inputField = document.querySelector('input[type="text"]') as HTMLInputElement
      if (inputField) {
        inputField.focus()
      }
    }, 500)
  }, [textOnlyMode, toast])

  // Set text-only mode if network error is detected
  useEffect(() => {
    if (networkErrorDetected) {
      handleNetworkFallback()
    }
  }, [networkErrorDetected, handleNetworkFallback])

  // Check browser support for voice features on mount
  useEffect(() => {
    // If speech recognition is supported, show a toast message about voice features
    if (hasRecognitionSupport && hasSynthesisSupport && !networkErrorDetected) {
      toast({
        title: "Voice Features Available",
        description: "You can use voice for this interview. Click the microphone to speak your answers.",
      })

      // Request microphone permission explicitly
      if (!micPermissionRequested) {
        try {
          navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(() => {
              console.log("Microphone permission granted")
              setMicPermissionRequested(true)
              // Test microphone with a quick listen
              setTimeout(() => {
                testMicrophone()
              }, 2000)
            })
            .catch((err) => {
              console.error("Error requesting microphone permission:", err)
              toast({
                title: "Microphone Access Required",
                description: "Please allow microphone access to use voice features.",
                variant: "destructive",
              })
              setTextOnlyMode(true)
            })
        } catch (err) {
          console.error("Error requesting microphone:", err)
        }
      }
    } else if (!hasRecognitionSupport || !hasSynthesisSupport) {
      // If either feature is not supported, switch to text-only mode
      setTextOnlyMode(true)
      setVoiceEnabled(false)
      toast({
        title: "Voice Features Limited",
        description: "Your browser has limited support for voice features. Using text-only mode.",
        variant: "warning",
      })
    }
  }, [hasRecognitionSupport, hasSynthesisSupport, networkErrorDetected, toast, micPermissionRequested])

  // Update input with transcript when speech recognition is active
  useEffect(() => {
    if (transcript) {
      console.log("Transcript received:", transcript)
      setInput(transcript)
      // Hide voice instructions once user starts speaking
      if (showVoiceInstructions) {
        setShowVoiceInstructions(false)
      }
      setVoiceInitialized(true)
    }
  }, [transcript, showVoiceInstructions])

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [data?.messages, typingIndicator])

  // Initialize data from URL parameters - only runs once
  useEffect(() => {
    async function initialize() {
      if (initialized.current) return

      try {
        const dataParam = searchParams.get("data")
        if (!dataParam) {
          router.push("/")
          return
        }

        const interviewData = JSON.parse(decodeURIComponent(dataParam))
        const systemMessage = createSystemMessage(interviewData)

        // Initialize with system message
        const initialMessages: Message[] = [
          {
            id: "system-1",
            role: "system",
            content: systemMessage,
          },
        ]

        // Set initial data
        setData({
          jobDetails: interviewData,
          messages: initialMessages,
          questionCount: 0,
          isComplete: false,
          userProfile: interviewData.userProfile,
        })

        initialized.current = true

        // Fetch the initial message from the AI
        setIsLoading(true)
        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: [],
              systemMessage,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.details || `API responded with status: ${response.status}`)
          }

          const responseData = await response.json()

          // Add the assistant's initial message
          const assistantMessage: Message = {
            id: responseData.id || Date.now().toString(),
            role: "assistant",
            content: responseData.content,
          }

          setData((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              messages: [...prev.messages, assistantMessage],
            }
          })

          // Speak the assistant's message if speech synthesis is supported and voice is enabled
          if (hasSynthesisSupport && voiceEnabled) {
            setTimeout(() => {
              try {
                speak(assistantMessage.content, () => {
                  setIsSpeaking(false)
                  // Auto-start listening after the AI finishes speaking
                  if (hasRecognitionSupport && !textOnlyMode) {
                    setTimeout(() => {
                      activateMicrophone()
                    }, 500)
                  }
                })
                setIsSpeaking(true)
              } catch (err) {
                console.error("Error speaking initial message:", err)
                setVoiceEnabled(false)
                toast({
                  title: "Voice Disabled",
                  description: "There was an error with speech synthesis. Voice has been disabled.",
                  variant: "destructive",
                })
              }
            }, 1500) // Longer delay to ensure speech synthesis is ready
          }
        } catch (error) {
          console.error("Error fetching initial message:", error)
          setApiError(error instanceof Error ? error.message : String(error))

          // Add a fallback initial message
          const fallbackMessage: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content:
              "Hello! I'm Kiwi Master from Kiwi Labs, and I'll be conducting your interview today. Let's start with the first question: Could you tell me about your understanding of this subject?",
          }

          setData((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              messages: [...prev.messages, fallbackMessage],
            }
          })
        } finally {
          setIsLoading(false)
        }
      } catch (err) {
        console.error("Failed to initialize interview:", err)
        setError("Failed to load interview data. Please try again.")
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [
    searchParams,
    router,
    hasSynthesisSupport,
    speak,
    toast,
    voiceEnabled,
    hasRecognitionSupport,
    textOnlyMode,
    activateMicrophone,
  ])

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }, [])

  // Test microphone function
  const testMicrophone = useCallback(async () => {
    console.log("Testing microphone...")
    try {
      // First ensure we have microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true })

      // Then start a short listening session
      await startListening()

      toast({
        title: "Microphone Test",
        description: "Say something to test your microphone. The text will appear in the input box.",
      })

      // Stop listening after 5 seconds if user doesn't stop it manually
      setTimeout(() => {
        if (isListening) {
          stopListening()
          toast({
            title: "Microphone Test Complete",
            description: transcript
              ? "Your microphone is working! Your speech was detected."
              : "No speech detected. Please try speaking louder or check your microphone settings.",
          })
        }
      }, 5000)
    } catch (err) {
      console.error("Microphone test failed:", err)
      toast({
        title: "Microphone Test Failed",
        description: "Could not access your microphone. Please check permissions and try again.",
        variant: "destructive",
      })
    }
  }, [startListening, stopListening, isListening, toast, transcript])

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!data || !input.trim()) return

      // Stop listening if active
      if (isListening) {
        stopListening()
      }

      // Reset API error
      setApiError(null)

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input,
      }

      // Update messages optimistically
      setData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          messages: [...prev.messages, userMessage],
        }
      })

      setInput("")
      setIsLoading(true)
      setTypingIndicator(true)

      try {
        // Get system message
        const systemMessage = data.messages.find((m) => m.role === "system")?.content

        // Send message to API
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...data.messages, userMessage].filter((m) => m.role !== "system"),
            systemMessage,
          }),
        })

        const responseData = await response.json()

        if (!response.ok) {
          throw new Error(responseData.details || `API responded with status: ${response.status}`)
        }

        // Create assistant message
        const assistantMessage: Message = {
          id: responseData.id || Date.now().toString(),
          role: "assistant",
          content: responseData.content,
        }

        // Check for interview completion
        const lowerContent = assistantMessage.content.toLowerCase()
        const isComplete =
          lowerContent.includes("interview is complete") ||
          lowerContent.includes("interview has concluded") ||
          lowerContent.includes("end of our interview")

        // Count questions
        let newQuestionCount = data.questionCount
        if (
          assistantMessage.role === "assistant" &&
          assistantMessage.content.includes("?") &&
          !assistantMessage.content.startsWith("Could you")
        ) {
          newQuestionCount = Math.min(data.questionCount + 1, 5)
        }

        // Update state with new message
        setTypingIndicator(false)
        setData((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            messages: [...prev.messages, assistantMessage],
            questionCount: newQuestionCount,
            isComplete: isComplete || prev.isComplete,
          }
        })

        // Speak the assistant's message if voice is enabled
        if (hasSynthesisSupport && voiceEnabled) {
          try {
            speak(assistantMessage.content, () => {
              setIsSpeaking(false)
              // Auto-start listening after the AI finishes speaking if not complete
              if (hasRecognitionSupport && !textOnlyMode && !isComplete) {
                setTimeout(() => {
                  activateMicrophone()
                }, 500)
              }
            })
            setIsSpeaking(true)
          } catch (err) {
            console.error("Error speaking assistant message:", err)
            // Don't disable voice entirely on a single error
          }
        }
      } catch (error) {
        console.error("Error in chat:", error)
        setTypingIndicator(false)

        // Set API error for display
        setApiError(error instanceof Error ? error.message : String(error))

        toast({
          title: "Error",
          description: "Failed to get a response. Please try again.",
          variant: "destructive",
        })

        // Add a fallback message if the API fails
        const fallbackMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "I apologize, but I'm having trouble processing your response right now. Could you please try again or rephrase your answer?",
        }

        setData((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            messages: [...prev.messages, fallbackMessage],
          }
        })

        // Speak the fallback message if voice is enabled
        if (hasSynthesisSupport && !synthesisError && voiceEnabled) {
          speak(fallbackMessage.content, () => {
            setIsSpeaking(false)
            // Auto-start listening after the AI finishes speaking
            if (hasRecognitionSupport && !textOnlyMode) {
              setTimeout(() => {
                activateMicrophone()
              }, 500)
            }
          })
          setIsSpeaking(true)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [
      data,
      input,
      toast,
      hasSynthesisSupport,
      speak,
      synthesisError,
      voiceEnabled,
      isListening,
      stopListening,
      hasRecognitionSupport,
      textOnlyMode,
      activateMicrophone,
    ],
  )

  // Handle recording toggle
  const toggleRecording = useCallback(async () => {
    if (!hasRecognitionSupport) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please try using Chrome.",
        variant: "destructive",
      })
      return
    }

    if (networkErrorDetected || speechError) {
      toast({
        title: "Speech Recognition Error",
        description: "Speech recognition is currently unavailable due to errors. Please type your response.",
        variant: "warning",
      })
      return
    }

    if (isListening) {
      console.log("Stopping listening...")
      stopListening()
      // If there's transcript content, automatically submit after stopping
      if (input.trim()) {
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>
        handleSubmit(fakeEvent)
      }
    } else {
      console.log("Starting listening...")
      setInput("")
      // Temporarily enable voice mode for this recording
      const wasTextOnly = textOnlyMode
      if (wasTextOnly) {
        setTextOnlyMode(false)
      }

      await activateMicrophone()

      // After recording finishes, we'll revert to text-only mode if that was the original state
      // This happens in the stop  we'll revert to text-only mode if that was the original state
      // This happens in the stopListening callback
    }
  }, [
    hasRecognitionSupport,
    isListening,
    activateMicrophone,
    stopListening,
    networkErrorDetected,
    speechError,
    input,
    handleSubmit,
    textOnlyMode,
    toast,
  ])

  // Toggle AI voice
  const toggleVoice = useCallback(() => {
    if (!data) return

    // If currently speaking, stop it
    if (isSpeaking) {
      cancel()
      setIsSpeaking(false)
      return
    }

    // Toggle voice enabled state
    const newVoiceState = !voiceEnabled
    setVoiceEnabled(newVoiceState)

    if (newVoiceState) {
      // If enabling voice, play the last assistant message
      const lastAssistantMessage = [...data.messages].reverse().find((m) => m.role === "assistant")
      if (lastAssistantMessage && hasSynthesisSupport) {
        try {
          speak(lastAssistantMessage.content, () => setIsSpeaking(false))
          setIsSpeaking(true)

          toast({
            title: "Voice Enabled",
            description: "The interviewer will now speak responses aloud.",
          })
        } catch (err) {
          console.error("Error enabling voice:", err)
          setVoiceEnabled(false)
          toast({
            title: "Voice Activation Failed",
            description: "There was an error enabling voice. Please try again.",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Voice Enabled",
          description: "The interviewer will now speak responses aloud.",
        })
      }
    } else {
      // If disabling voice, cancel any ongoing speech
      cancel()
      setIsSpeaking(false)

      toast({
        title: "Voice Disabled",
        description: "The interviewer will no longer speak responses aloud.",
      })
    }
  }, [data, isSpeaking, cancel, hasSynthesisSupport, speak, voiceEnabled, toast])

  // Toggle text-only mode
  const toggleTextOnlyMode = useCallback(() => {
    if (isListening) {
      stopListening()
    }

    // If trying to enable speech recognition, show a warning first
    if (textOnlyMode) {
      // Show warning before enabling speech recognition
      toast({
        title: "Speech Recognition Warning",
        description: "Speech recognition may not work in all environments and can cause network errors. Continue?",
        action: (
          <Button
            variant="outline"
            onClick={() => {
              setTextOnlyMode(false)
              toast({
                title: "Speech Recognition Enabled",
                description: "You can now use the microphone button to speak your responses.",
              })
              // Test microphone when enabling
              setTimeout(() => {
                testMicrophone()
              }, 500)
            }}
          >
            Enable Anyway
          </Button>
        ),
        duration: 5000,
      })
    } else {
      // Switching to text-only mode doesn't need confirmation
      setTextOnlyMode(true)
      toast({
        title: "Text-Only Mode Enabled",
        description: "Speech recognition is now disabled. Please type your responses.",
      })
    }
  }, [textOnlyMode, isListening, stopListening, toast, testMicrophone])

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl animate-pulse"></div>
            <KiwiLogo size="xl" className="relative" />
          </div>
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Preparing your interview session...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl animate-pulse"></div>
            <KiwiLogo size="xl" className="relative" />
          </div>
          <p className="text-red-500 mb-4">{error || "Failed to load interview"}</p>
          <Button onClick={() => router.push("/")} className="fancy-button">
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  const { jobDetails, messages, questionCount, isComplete, userProfile } = data

  // Get the user's avatar based on gender
  const userAvatarSrc = userProfile?.gender ? `/${userProfile.gender}-avatar.png` : "/user-avatar.png"

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" className="group" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Button>
        <KiwiLogo />
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          {"subject" in jobDetails ? (
            <>
              <h1 className="text-2xl font-bold gradient-heading">
                {(jobDetails as SubjectiveVivaDetails).subject} Viva
              </h1>
              <Badge variant="outline" className="bg-accent text-accent-foreground font-medium">
                {(jobDetails as SubjectiveVivaDetails).topic}
              </Badge>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold gradient-heading">{jobDetails.jobTitle || "Job"} Interview</h1>
              {jobDetails.company && (
                <Badge variant="outline" className="bg-accent text-accent-foreground font-medium">
                  {jobDetails.company}
                </Badge>
              )}
            </>
          )}
        </div>

        {userProfile && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-gradient-to-r from-accent/30 to-accent/10 rounded-lg">
            <Avatar className="h-8 w-8 border-2 border-primary/20">
              <AvatarImage src={userAvatarSrc || "/placeholder.svg"} alt="User avatar" />
              <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-medium">Candidate: {userProfile.name}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {/* Check if this is a subjective viva or job interview */}
          {"subject" in jobDetails ? (
            <>
              <Badge variant="secondary">{(jobDetails as SubjectiveVivaDetails).subjectLevel}</Badge>
              <Badge variant="secondary">Subjective viva</Badge>
            </>
          ) : (
            <>
              <Badge variant="secondary">
                {jobDetails.experienceLevel ? jobDetails.experienceLevel.replace("-", " ") : "Not specified"}
              </Badge>
              <Badge variant="secondary">{jobDetails.interviewType} interview</Badge>
            </>
          )}

          {textOnlyMode && (
            <Badge variant="outline" className="bg-yellow-100">
              Text-Only Mode
            </Badge>
          )}
          {voiceEnabled ? (
            <Badge variant="outline" className="bg-green-100">
              Voice Enabled
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-100">
              Voice Disabled
            </Badge>
          )}
          {isListening && (
            <Badge variant="outline" className="bg-red-100 animate-pulse">
              Listening...
            </Badge>
          )}
        </div>

        <div className="mt-2 text-sm text-primary">
          <div className="flex items-center mb-1">
            <span className="mr-2">Progress:</span>
            {questionCount} of 5 questions
          </div>
          <div className="relative h-2 bg-primary/20 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
              style={{ width: `${(questionCount / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {apiError && (
        <Alert variant="destructive" className="mb-4 animate-slide-up">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>API Error</AlertTitle>
          <AlertDescription>
            {apiError}
            <div className="mt-2">
              <p className="text-sm">
                Please check that your Google API key is correctly configured and has access to the Gemini API.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {(speechError || networkErrorDetected) && (
        <Alert variant="destructive" className="mb-4 animate-slide-up">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Speech Recognition Error</AlertTitle>
          <AlertDescription>
            {speechError || "Speech recognition is disabled due to network issues."}
            <div className="mt-2 flex gap-2">
              <Button variant="outline" size="sm" onClick={toggleTextOnlyMode}>
                {textOnlyMode ? "Try Speech Recognition" : "Switch to Text-Only Mode"}
              </Button>
              {networkErrorDetected && (
                <Button variant="outline" size="sm" onClick={resetNetworkErrorState}>
                  Reset Speech Recognition
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {networkErrorDetected && (
        <Alert variant="warning" className="mb-4 bg-amber-50 border-amber-200 animate-slide-up">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle>Network Issues Detected</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              We've detected network issues with speech recognition and switched to text input mode.
            </p>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={resetNetworkErrorState}>
                Try Speech Recognition Again
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowTroubleshooting(true)}>
                View Troubleshooting
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {showTroubleshooting && (
        <VoiceTroubleshoot onTestMicrophone={testMicrophone} onClose={() => setShowTroubleshooting(false)} />
      )}

      {!textOnlyMode && showVoiceInstructions && (
        <Alert className="mb-4 bg-blue-50 border-blue-200 animate-slide-up">
          <MessageSquare className="h-4 w-4 text-blue-500" />
          <AlertTitle>Voice Response Instructions</AlertTitle>
          <AlertDescription>
            <p className="mb-2">You can speak your answers instead of typing. Here's how:</p>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>The microphone will automatically activate after the interviewer speaks</li>
              <li>Speak clearly and at a normal pace</li>
              <li>When you're done speaking, click the microphone button again to submit</li>
              <li>You can also edit your response with the keyboard before submitting</li>
            </ol>
          </AlertDescription>
        </Alert>
      )}

      {!voiceInitialized && !textOnlyMode && (
        <Alert className="mb-4 bg-green-50 border-green-200 animate-slide-up">
          <Mic className="h-4 w-4 text-green-500" />
          <AlertTitle>Voice Input Not Detected Yet</AlertTitle>
          <AlertDescription>
            <p className="mb-2">Your browser may need permission to access your microphone.</p>
            <Button onClick={testMicrophone} className="bg-green-600 hover:bg-green-700">
              Click Here to Test Your Microphone
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="fancy-border overflow-hidden animate-slide-up">
        <Card className="border-0">
          <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Interview Session
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                className="ml-1"
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                Voice Help
              </Button>
            </CardTitle>
            {hasSynthesisSupport && !synthesisError && (
              <Button
                variant={voiceEnabled ? "default" : "outline"}
                size="sm"
                onClick={toggleVoice}
                className={voiceEnabled ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {isSpeaking ? <VolumeX className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
                {isSpeaking ? "Stop Speaking" : voiceEnabled ? "Voice On" : "Voice Off"}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[500px] overflow-y-auto p-1">
              {messages
                .filter((m) => m.role !== "system")
                .map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                  >
                    <div className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <Avatar
                        className={`${message.role === "user" ? "ml-2" : "mr-2"} h-8 w-8 border-2 ${message.role === "user" ? "border-primary/20" : "border-secondary/20"}`}
                      >
                        <AvatarFallback>{message.role === "user" ? "U" : "K"}</AvatarFallback>
                        {message.role === "user" ? (
                          <AvatarImage src={userAvatarSrc || "/placeholder.svg"} />
                        ) : (
                          <AvatarImage src="/ai-interviewer.png" />
                        )}
                      </Avatar>
                      <div className={`${message.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}`}>
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      </div>
                    </div>
                  </div>
                ))}
              {typingIndicator && (
                <div className="flex justify-start animate-fade-in">
                  <div className="flex flex-row">
                    <Avatar className="mr-2 h-8 w-8 border-2 border-secondary/20">
                      <AvatarFallback>K</AvatarFallback>
                      <AvatarImage src="/ai-interviewer.png" />
                    </Avatar>
                    <div className="chat-bubble-ai flex items-center">
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {isLoading && !typingIndicator && (
                <div className="flex justify-start animate-fade-in">
                  <div className="flex flex-row">
                    <Avatar className="mr-2 h-8 w-8 border-2 border-secondary/20">
                      <AvatarFallback>K</AvatarFallback>
                      <AvatarImage src="/ai-interviewer.png" />
                    </Avatar>
                    <div className="chat-bubble-ai flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          <CardFooter className="border-t bg-gradient-to-r from-accent/10 to-transparent">
            {isComplete ? (
              <div className="w-full">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg mb-4 text-center">
                  <h3 className="font-semibold gradient-heading">Interview Complete</h3>
                  <p className="text-sm text-muted-foreground">Thank you for participating!</p>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" className="w-1/2 group" onClick={() => router.push("/")}>
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Return Home
                  </Button>
                  <Button
                    className="w-1/2 fancy-button"
                    onClick={() => {
                      const filteredMessages = messages.filter((m) => m.role !== "system")
                      const encodedTranscript = encodeURIComponent(JSON.stringify(filteredMessages))
                      const encodedDetails = encodeURIComponent(JSON.stringify(jobDetails))
                      router.push(`/interview/results?transcript=${encodedTranscript}&job=${encodedDetails}`)
                    }}
                  >
                    View Results
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex w-full gap-2">
                {/* Always show the microphone button regardless of text-only mode */}
                <Button
                  type="button"
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  onClick={toggleRecording}
                  className={`flex-shrink-0 h-12 w-12 ${isListening ? "animate-pulse" : ""}`}
                  disabled={!hasRecognitionSupport || networkErrorDetected || speechError !== null}
                >
                  {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder={isListening ? "Listening... Speak your response" : "Type your response..."}
                    value={input}
                    onChange={handleInputChange}
                    className={`flex-1 h-12 transition-all border-primary/20 focus:border-primary ${isListening ? "pl-4 border-red-300 bg-red-50" : ""}`}
                    disabled={isLoading}
                  />
                  {isListening && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs text-red-500 animate-pulse">Recording...</span>
                    </div>
                  )}
                </div>
                <Button type="submit" disabled={isLoading || !input.trim()} className="h-12 fancy-button">
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Send message</span>
                </Button>
              </form>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Remove the voice response mode indicator since we're in text mode by default */}
      {isListening && (
        <div className="mt-4 p-3 border rounded-lg bg-red-50 border-red-200 animate-slide-up">
          <div className="flex items-center">
            <Mic className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="font-semibold text-red-800">Voice Recording Active</h3>
          </div>
          <p className="text-sm text-red-700 mt-1">
            Listening to your response. Click the microphone button again when you're done speaking.
          </p>
        </div>
      )}

      <div className="mt-6 p-6 rounded-xl bg-gradient-to-r from-accent/30 to-accent/10 fancy-border animate-slide-up">
        <h3 className="font-semibold mb-3 gradient-heading">Interview Tips</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>Speak clearly and concisely, focusing on relevant details</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>Use the STAR method (Situation, Task, Action, Result) for behavioral questions</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>Take a moment to think before responding to difficult questions</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>Ask clarifying questions if you're unsure about what's being asked</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>
              {textOnlyMode
                ? "Type your answers in the input box"
                : "Speak naturally when the microphone is active, or type your response"}
            </span>
          </li>
          {voiceEnabled && (
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>The interviewer will speak responses aloud. Use the voice button to toggle this feature.</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
