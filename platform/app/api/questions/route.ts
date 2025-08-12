import { type NextRequest, NextResponse } from "next/server"
 import { getQuestions ,createQuestion} from "@/app/db/queries"


export async function GET() {
  try {
    const questions = await getQuestions()
    return NextResponse.json(questions)
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json(
      { error: "Failed to fetch questions", details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, options, correctAnswer } = body

    // Validate required fields
    if (!question || !options || !Array.isArray(options) || options.length !== 4) {
      return NextResponse.json(
        { error: "Invalid question data. Question and 4 options are required." },
        { status: 400 }
      )
    }

    if (correctAnswer < 0 || correctAnswer > 3) {
      return NextResponse.json(
        { error: "Correct answer must be between 0 and 3" },
        { status: 400 }
      )
    }

    const newQuestion = await createQuestion(question, options, correctAnswer)

    return NextResponse.json(newQuestion, { status: 201 })
  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json(
      { error: "Failed to create question", details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}