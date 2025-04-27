import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google-generative-ai"

export async function POST(request: Request) {
  try {
    const { messages, systemMessage } = await request.json()

    // Check if API key is available
    if (!process.env.GOOGLE_API_KEY) {
      console.error("GOOGLE_API_KEY is not defined")
      return NextResponse.json(
        {
          error: "API key is not configured",
          details: "Please set the GOOGLE_API_KEY environment variable",
        },
        { status: 500 },
      )
    }

    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)

    // Get the Gemini Flash model for faster responses
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // For the first message, we need to generate an introduction
    const isFirstMessage = messages.length === 0

    if (isFirstMessage) {
      // Generate the initial message with introduction and first question
      const prompt = `${systemMessage}

      Based on the above instructions, introduce yourself as the interviewer and ask the first question.
      Keep your introduction brief and professional.`

      try {
        const result = await model.generateContent(prompt)
        const response = result.response
        const text = response.text()

        return NextResponse.json({
          id: Date.now().toString(),
          role: "assistant",
          content: text,
        })
      } catch (error) {
        console.error("Error generating initial message:", error)
        return NextResponse.json({
          id: Date.now().toString(),
          role: "assistant",
          content:
            "Hello! I'm Kiwi Master from Kiwi Labs, and I'll be conducting your interview today. Let's start with the first question: Could you tell me about your experience with the technologies mentioned in the job requirements?",
        })
      }
    }

    // For subsequent messages, use the generateContent method instead of chat
    try {
      // Get the last user message
      const lastUserMessage = messages.filter((msg: any) => msg.role === "user").pop()

      if (!lastUserMessage) {
        return NextResponse.json({
          id: Date.now().toString(),
          role: "assistant",
          content: "I'm ready to help with your interview. What would you like to discuss?",
        })
      }

      // Create a prompt that includes context from previous messages
      let prompt = systemMessage ? `${systemMessage}\n\n` : ""

      // Add conversation history
      for (const msg of messages) {
        prompt += `${msg.role === "user" ? "Candidate" : "Interviewer"}: ${msg.content}\n\n`
      }

      // Add instruction for the AI
      prompt += `Based on the conversation above, provide the next interviewer response.`

      // Generate content
      const result = await model.generateContent(prompt)
      const response = result.response
      const text = response.text()

      return NextResponse.json({
        id: Date.now().toString(),
        role: "assistant",
        content: text,
      })
    } catch (error) {
      console.error("Error in chat API:", error)

      // Return a more detailed error response
      let errorMessage = "Failed to process the request"
      let errorDetails = error instanceof Error ? error.message : String(error)

      // Check for specific error types
      if (errorDetails.includes("API key")) {
        errorMessage = "API key error"
        errorDetails = "There was an issue with the API key. Please check your configuration."
      } else if (errorDetails.includes("quota")) {
        errorMessage = "API quota exceeded"
        errorDetails = "The API quota has been exceeded. Please try again later."
      } else if (errorDetails.includes("permission")) {
        errorMessage = "Permission denied"
        errorDetails = "The API key doesn't have permission to access this resource."
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorDetails,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json(
      {
        error: "Failed to process the request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
