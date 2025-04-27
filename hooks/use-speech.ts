"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

// Speech Recognition Hook with text-only fallback
export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false)
  const [recognition, setRecognition] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [networkErrorDetected, setNetworkErrorDetected] = useState(false)
  const { toast } = useToast()

  // Check for speech recognition support
  useEffect(() => {
    try {
      const hasSpeechRecognition = "SpeechRecognition" in window || "webkitSpeechRecognition" in window
      setHasRecognitionSupport(hasSpeechRecognition)

      // If we've previously detected a network error, don't enable speech recognition
      if (localStorage.getItem("speechRecognitionNetworkError") === "true") {
        setNetworkErrorDetected(true)
        setError("Speech recognition is disabled due to previous network errors. Using text-only mode.")
      }
    } catch (err) {
      console.error("Error checking speech recognition support:", err)
      setHasRecognitionSupport(false)
    }
  }, [])

  // Clean up recognition instance when component unmounts
  useEffect(() => {
    return () => {
      if (recognition) {
        try {
          recognition.stop()
        } catch (err) {
          console.error("Error stopping recognition:", err)
        }
      }
    }
  }, [recognition])

  const startListening = useCallback(async () => {
    // If we've detected network errors, don't even try to use speech recognition
    if (networkErrorDetected) {
      toast({
        title: "Speech Recognition Disabled",
        description: "Speech recognition is disabled due to network issues. Please use text input instead.",
        variant: "warning",
      })
      return
    }

    if (!hasRecognitionSupport) return

    // Reset state
    setTranscript("")
    setError(null)
    setIsListening(true)

    let retryCount = 0
    const maxRetries = 2
    const attemptRecognition = async () => {
      try {
        // Create speech recognition instance
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognitionInstance = new SpeechRecognition()

        // Set a timeout to abort if it takes too long to initialize
        const timeoutId = setTimeout(() => {
          try {
            if (recognitionInstance) {
              recognitionInstance.abort()
            }
          } catch (e) {
            console.error("Error aborting recognition after timeout:", e)
          }

          if (retryCount < maxRetries) {
            console.log(`Recognition timed out, retrying (${retryCount + 1}/${maxRetries})...`)
            retryCount++
            attemptRecognition()
          } else {
            setError("Speech recognition timed out. Please use text input instead.")
            setIsListening(false)
            // Don't set networkErrorDetected here to allow future attempts
            toast({
              title: "Speech Recognition Error",
              description: "Speech recognition timed out. Please use text input instead for now.",
              variant: "destructive",
            })
          }
        }, 5000) // 5 second timeout

        // Configure recognition
        recognitionInstance.continuous = false // Change to false to avoid some network issues
        recognitionInstance.interimResults = true
        recognitionInstance.lang = "en-US"
        recognitionInstance.maxAlternatives = 1

        recognitionInstance.onresult = (event) => {
          // Clear the timeout since we got a result
          clearTimeout(timeoutId)

          let interimTranscript = ""
          let finalTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          // Add console log for debugging
          console.log("Speech recognition result:", { finalTranscript, interimTranscript })

          setTranscript(finalTranscript || interimTranscript)
        }

        recognitionInstance.onerror = (event) => {
          // Clear the timeout since we got an error
          clearTimeout(timeoutId)

          console.error("Speech recognition error", event.error, event)

          // Handle specific error types
          let errorMessage = "An error occurred with speech recognition."

          if (event.error === "network") {
            errorMessage = "Network error occurred with speech recognition. Try again or use text input."

            // Only mark as network error after multiple failures
            if (retryCount >= maxRetries) {
              // Don't permanently disable, just for this session
              setNetworkErrorDetected(true)
              errorMessage = "Network error persists. Speech recognition temporarily disabled. Please use text input."
            } else {
              // Retry on network error
              retryCount++
              console.log(`Network error, retrying (${retryCount}/${maxRetries})...`)
              setTimeout(() => attemptRecognition(), 1000 * retryCount) // Exponential backoff
              return
            }
          } else {
            switch (event.error) {
              case "not-allowed":
              case "permission-denied":
                errorMessage = "Microphone access was denied. Please allow microphone access to use speech recognition."
                break
              case "no-speech":
                errorMessage = "No speech was detected. Please try speaking again."
                // Don't count no-speech as a failure
                retryCount = 0
                break
              case "aborted":
                errorMessage = "Speech recognition was aborted."
                break
              case "audio-capture":
                errorMessage = "No microphone was found. Please ensure your microphone is connected."
                break
              case "service-not-allowed":
                errorMessage = "Speech recognition service is not allowed. Please try again later."
                break
            }
          }

          setError(errorMessage)
          toast({
            title: "Speech Recognition Issue",
            description: errorMessage,
            variant: event.error === "no-speech" ? "warning" : "destructive",
          })

          setIsListening(false)
        }

        recognitionInstance.onstart = () => {
          console.log("Speech recognition started successfully")
          clearTimeout(timeoutId)
          setIsListening(true)
        }

        recognitionInstance.onend = () => {
          // Clear the timeout since recognition ended
          clearTimeout(timeoutId)
          console.log("Speech recognition ended")
          setIsListening(false)
        }

        // Start recognition with error handling
        try {
          console.log("Starting speech recognition...")
          recognitionInstance.start()
          // Store recognition instance to stop it later
          setRecognition(recognitionInstance)
        } catch (err) {
          // Clear the timeout if we fail to start
          clearTimeout(timeoutId)
          console.error("Error starting speech recognition:", err)

          if (retryCount < maxRetries) {
            retryCount++
            console.log(`Error starting recognition, retrying (${retryCount}/${maxRetries})...`)
            setTimeout(() => attemptRecognition(), 1000 * retryCount)
          } else {
            setError("Failed to start speech recognition. Please use text input instead.")
            setIsListening(false)
            toast({
              title: "Speech Recognition Error",
              description: "Failed to start speech recognition. Please use text input instead.",
              variant: "destructive",
            })
          }
        }
      } catch (err) {
        console.error("Error initializing speech recognition:", err)
        setError("Failed to initialize speech recognition. Please use text input instead.")
        setIsListening(false)
        toast({
          title: "Speech Recognition Error",
          description: "Failed to initialize speech recognition. Please use text input instead.",
          variant: "destructive",
        })
      }
    }

    // Start the recognition process
    await attemptRecognition()
  }, [hasRecognitionSupport, networkErrorDetected, toast])

  const stopListening = useCallback(() => {
    if (recognition) {
      try {
        recognition.stop()
      } catch (err) {
        console.error("Error stopping recognition:", err)
      }
    }
    setIsListening(false)
  }, [recognition])

  // Method to reset network error state (for testing/debugging)
  const resetNetworkErrorState = useCallback(() => {
    localStorage.removeItem("speechRecognitionNetworkError")
    setNetworkErrorDetected(false)
    setError(null)

    // Test if speech recognition works after reset
    const testRecognition = async () => {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const testInstance = new SpeechRecognition()

        // Just a quick test to see if it initializes
        testInstance.continuous = false
        testInstance.interimResults = false

        let testSuccessful = false

        testInstance.onstart = () => {
          testSuccessful = true
          setTimeout(() => testInstance.stop(), 500)
        }

        testInstance.onerror = (event) => {
          console.error("Test recognition error:", event.error)
          if (event.error === "network") {
            toast({
              title: "Network Issues Persist",
              description: "Speech recognition is still experiencing network issues. Try again later.",
              variant: "destructive",
            })
            setNetworkErrorDetected(true)
          }
          testInstance.stop()
        }

        testInstance.onend = () => {
          if (testSuccessful) {
            toast({
              title: "Speech Recognition Reset",
              description: "Speech recognition has been re-enabled successfully.",
            })
          }
        }

        testInstance.start()
      } catch (err) {
        console.error("Error testing speech recognition:", err)
        toast({
          title: "Speech Recognition Test Failed",
          description: "Could not initialize speech recognition. Please try again later.",
          variant: "destructive",
        })
      }
    }

    testRecognition()
  }, [toast])

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasRecognitionSupport,
    error,
    networkErrorDetected,
    resetNetworkErrorState,
  }
}

// Update the useSpeechSynthesis hook with better error handling and fallbacks

// Speech Synthesis Hook
export function useSpeechSynthesis() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [hasSynthesisSupport, setHasSynthesisSupport] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if browser supports speech synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        // Test if speech synthesis is actually working
        const testUtterance = new SpeechSynthesisUtterance("test")
        testUtterance.volume = 0 // Mute the test
        testUtterance.onend = () => {
          setIsReady(true)
          setHasSynthesisSupport(true)
        }
        testUtterance.onerror = () => {
          console.warn("Speech synthesis test failed")
          setHasSynthesisSupport(false)
          setError("Speech synthesis is not available in your browser")
        }

        // Set a timeout in case the event never fires
        const timeout = setTimeout(() => {
          setIsReady(true)
          setHasSynthesisSupport(true)
        }, 1000)

        // Try to speak the test utterance
        window.speechSynthesis.speak(testUtterance)

        // Get available voices
        const updateVoices = () => {
          const availableVoices = window.speechSynthesis.getVoices()
          setVoices(availableVoices)
          if (availableVoices.length > 0) {
            setHasSynthesisSupport(true)
          }
        }

        // Chrome loads voices asynchronously
        window.speechSynthesis.onvoiceschanged = updateVoices
        updateVoices()

        return () => {
          clearTimeout(timeout)
          window.speechSynthesis.onvoiceschanged = null
          // Cancel any ongoing speech when component unmounts
          try {
            window.speechSynthesis.cancel()
          } catch (err) {
            console.error("Error canceling speech synthesis:", err)
          }
        }
      } catch (err) {
        console.error("Error initializing speech synthesis:", err)
        setHasSynthesisSupport(false)
        setError("Failed to initialize speech synthesis")
      }
    } else {
      setHasSynthesisSupport(false)
      setError("Speech synthesis is not supported in your browser")
    }
  }, [])

  // Select a good voice for the interviewer
  const getPreferredVoice = () => {
    if (!voices.length) return null

    // Try to find a natural-sounding English voice
    const preferredVoices = [
      // Look for specific high-quality voices first
      voices.find((voice) => voice.name.includes("Google") && voice.name.includes("US")),
      voices.find((voice) => voice.name.includes("Microsoft") && voice.name.includes("Natural")),
      // Fall back to any English US voice
      voices.find((voice) => voice.lang === "en-US"),
      // Last resort: any English voice
      voices.find((voice) => voice.lang.startsWith("en")),
      // Ultimate fallback: just use the first voice
      voices[0],
    ]

    return preferredVoices.find(Boolean) || null
  }

  // Split text into smaller chunks to improve reliability
  const splitTextIntoChunks = (text: string): string[] => {
    // Split by sentences to create manageable chunks
    const sentences = text.split(/(?<=[.!?])\s+/)
    const chunks: string[] = []
    let currentChunk = ""

    for (const sentence of sentences) {
      // If adding this sentence would make the chunk too long, start a new chunk
      if (currentChunk.length + sentence.length > 200) {
        if (currentChunk) chunks.push(currentChunk)
        currentChunk = sentence
      } else {
        currentChunk += (currentChunk ? " " : "") + sentence
      }
    }

    if (currentChunk) chunks.push(currentChunk)
    return chunks
  }

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!hasSynthesisSupport || !isReady) {
        if (onEnd) onEnd()
        return
      }

      setError(null)

      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel()

        // Split text into smaller chunks for more reliable synthesis
        const textChunks = splitTextIntoChunks(text)
        let chunkIndex = 0

        const speakNextChunk = () => {
          if (chunkIndex >= textChunks.length) {
            if (onEnd) onEnd()
            return
          }

          const chunk = textChunks[chunkIndex]
          const utterance = new SpeechSynthesisUtterance(chunk)

          // Set voice
          const voice = getPreferredVoice()
          if (voice) utterance.voice = voice

          // Set properties
          utterance.rate = 1.0
          utterance.pitch = 1.0
          utterance.volume = 1.0

          // Set callbacks
          utterance.onend = () => {
            chunkIndex++
            speakNextChunk()
          }

          utterance.onerror = (event) => {
            console.error("Speech synthesis error:", event)

            // Log more details about the error
            console.log("Error details:", {
              chunk,
              chunkIndex,
              voiceName: voice?.name || "No voice selected",
              errorMessage: event instanceof Error ? event.message : "Unknown error",
            })

            // Try to continue with the next chunk despite the error
            chunkIndex++
            speakNextChunk()
          }

          // Add a small delay between chunks for more natural speech
          setTimeout(() => {
            try {
              window.speechSynthesis.speak(utterance)
            } catch (err) {
              console.error("Error speaking chunk:", err)
              chunkIndex++
              speakNextChunk()
            }
          }, 50)
        }

        // Start speaking the first chunk
        speakNextChunk()
      } catch (err) {
        console.error("Error in speech synthesis:", err)
        setError("Failed to initialize speech synthesis. Please try again.")
        if (onEnd) onEnd()
      }
    },
    [hasSynthesisSupport, isReady],
  )

  const cancel = useCallback(() => {
    if (hasSynthesisSupport) {
      try {
        window.speechSynthesis.cancel()
      } catch (err) {
        console.error("Error canceling speech synthesis:", err)
      }
    }
  }, [hasSynthesisSupport])

  return {
    speak,
    cancel,
    voices,
    hasSynthesisSupport,
    error,
    isReady,
  }
}

// Add type definitions for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}
