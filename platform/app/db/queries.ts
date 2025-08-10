// db/queries.ts
import { db } from './index'
import { questions } from './schema'
import { nanoid } from 'nanoid'
import { eq } from "drizzle-orm";

export async function createQuestion(
  question: string,
  options: string[],
  correctAnswer: number
) {
  try {
    const questionData = {
      id: nanoid(), 
      question,
      options,
      correctAnswer,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const [newQuestion] = await db
      .insert(questions)
      .values(questionData)
      .returning()

    return newQuestion
  } catch (error) {
    console.error('Database error creating question:', error)
    throw new Error('Failed to create question in database')
  }
}

// Additional query functions you might need
export async function getQuestions() {
  try {
    return await db.select().from(questions)
  } catch (error) {
    console.error('Database error fetching questions:', error)
    throw new Error('Failed to fetch questions')
  }
}

export async function getQuestionById(id: string) {
  try {
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, id))
    
    return question
  } catch (error) {
    console.error('Database error fetching question:', error)
    throw new Error('Failed to fetch question')
  }
}

export async function deleteQuestion(id: string) {
  try {
    const [deletedQuestion] = await db
      .delete(questions)
      .where(eq(questions.id, id))
      .returning()
    
    return deletedQuestion
  } catch (error) {
    console.error('Database error deleting question:', error)
    throw new Error('Failed to delete question')
  }
}