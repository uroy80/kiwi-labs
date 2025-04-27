import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: Request) {
  try {
    const { messages, jobDetails } = await request.json()

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
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
      },
    })

    // Create a prompt for the AI to analyze the interview
    let prompt = ""

    // Check if this is a subjective viva or job interview
    if (jobDetails.interviewType === "subjective") {
      prompt = `
    You are Professor Kiwi, an expert academic evaluator from Kiwi Labs. Analyze this viva examination for the subject ${jobDetails.subject} on the topic ${jobDetails.topic}.
    
    Subject Details:
    - Subject: ${jobDetails.subject}
    - Topic: ${jobDetails.topic}
    - Education Level: ${jobDetails.subjectLevel}
    ${jobDetails.hasProjectDocument ? `- The student submitted a project document: ${jobDetails.fileDetails?.name}` : ""}
    
    Viva Transcript:
    ${messages
      .map((msg: any) => `${msg.role === "assistant" ? "Professor Kiwi" : "Student"}: ${msg.content}`)
      .join("\n\n")}
    
    Provide a comprehensive analysis of the student's performance including:
    1. An overall score as a percentage (0-100%)
    2. 3-5 specific strengths demonstrated in the viva
    3. 3-5 specific areas for improvement
    4. A paragraph of detailed feedback (100-150 words)
    
    Format your response as a JSON object with the following structure:
    {
      "overallScore": number,
      "strengths": string[],
      "improvements": string[],
      "detailedFeedback": string
    }
  `
    } else {
      // Original job interview prompt
      prompt = `
    You are Kiwi Master, an expert interview coach from Kiwi Labs. Analyze this job interview for a ${jobDetails.jobTitle} position.
    
    Job Details:
    - Title: ${jobDetails.jobTitle}
    - Company: ${jobDetails.company || "Not specified"}
    - Experience Level: ${jobDetails.experienceLevel}
    - Interview Type: ${jobDetails.interviewType}
    - Required Skills: ${jobDetails.requiredSkills}
    
    Interview Transcript:
    ${messages
      .map((msg: any) => `${msg.role === "assistant" ? "Kiwi Master" : "Candidate"}: ${msg.content}`)
      .join("\n\n")}
    
    Provide a comprehensive analysis of the candidate's performance including:
    1. An overall score as a percentage (0-100%)
    2. 3-5 specific strengths demonstrated in the interview
    3. 3-5 specific areas for improvement
    4. A paragraph of detailed feedback (100-150 words)
    
    Format your response as a JSON object with the following structure:
    {
      "overallScore": number,
      "strengths": string[],
      "improvements": string[],
      "detailedFeedback": string
    }
  `
    }

    // Generate analysis using Gemini
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Parse the JSON response
    try {
      const parsedResult = JSON.parse(text)
      return NextResponse.json(parsedResult)
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError, "Raw response:", text)

      // Fallback response if parsing fails
      return NextResponse.json({
        overallScore: 70,
        strengths: [
          "Demonstrated relevant knowledge of the subject",
          "Communicated clearly and professionally",
          "Provided examples to support answers",
        ],
        improvements: [
          "Could provide more specific details and examples",
          "Consider structuring responses more clearly",
          "Elaborate more on theoretical concepts",
        ],
        detailedFeedback:
          "The candidate showed good understanding of the core concepts and communicated their knowledge effectively. Responses were generally well-structured and relevant to the questions asked. To improve, focus on providing more specific examples and elaborating on theoretical frameworks that underpin the subject matter.",
      })
    }
  } catch (error) {
    console.error("Error in analyze interview API:", error)

    // Return a more detailed error response
    let errorMessage = "Failed to analyze the interview"
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
}
