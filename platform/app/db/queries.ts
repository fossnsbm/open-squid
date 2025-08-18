import { db } from './index'
import { questions, teams ,promptSessions ,promptParticipants,userPrompts} from './schema'
import { nanoid } from 'nanoid'
import { eq ,and} from "drizzle-orm";

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

export async function getAllTeams() {
  try {
    return await db.select().from(teams);
  } catch (error) {
    console.error('Database error fetching teams:', error);
    throw new Error('Failed to fetch teams');
  }
}


export async function getPromptSessions() {
  try {
    return await db
    .select()
    .from(promptSessions)
    .where(eq(promptSessions.action, 'live'));
    
  } catch (error) {
    console.error('Database error fetching prompt sessions:', error);
    throw new Error('Failed to fetch prompt sessions');
  }
}


export async function createPromptSession(
  title: string, 
  action: string,
   duration: number) {
  try {
    const sessionData = {
      id: nanoid(),
      title,
      action,
      duration,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const [newSession] = await db
      .insert(promptSessions)
      .values(sessionData)
      .returning()

    return newSession
  } catch (error) {
    console.error('Database error creating prompt session:', error)
    throw new Error('Failed to create prompt session')
  }
}


export const updatePromptSessionStatus = async (id: string, action: string) => {
  try {
    const [updatedSession] = await db
      .update(promptSessions)
      .set({ action, updatedAt: new Date() })
      .where(eq(promptSessions.id, id))
      .returning();

    return updatedSession;
  } catch (error) {
    console.error('Database error updating prompt session status:', error);
    throw new Error('Failed to update prompt session status');
  }
}


export async function addPromptParticipant(
  promptSessionId: string,
  userId: string
) {
  try {
    const participantData = {
      id: nanoid(),
      promptSessionId,
      userId,
      score: 0,     
      joinedAt: new Date(),
    }

    const [newParticipant] = await db
      .insert(promptParticipants)
      .values(participantData)
      .returning()

    return newParticipant
  } catch (error) {
    console.error('Database error adding quiz participant:', error)
    throw new Error('Failed to add quiz participant')
  }
}

export async function  saveUserPrompt(
  userId: string,
  sessionId: string,
  imageUrl: string,
  description: string
) {
  try {

     const [team] = await db
      .select({ name: teams.name })
      .from(teams)
      .where(eq(teams.id, userId))

    if (!team) {
      throw new Error("User not found in teams table")
    }

    const promptData = {
      id: nanoid(),
      userId,
      sessionId, 
      userName: team.name,
      imageUrl,
      description,
      createdAt: new Date(),
    }

    const [newPrompt] = await db
      .insert(userPrompts)
      .values(promptData)
      .returning()

    return newPrompt
  } catch (error) {
    console.error('Database error saving user prompt:', error)
    throw new Error('Failed to save user prompt')
  }
}


export async function getPromptSubmissions() {
  try {
    return await db
      .select()
      .from(userPrompts)
      
  } catch (error) {
    console.error('Database error fetching prompt submissions:', error)
    throw new Error('Failed to fetch prompt submissions')
  }
}

export async function getPromptParticipants(sessionId: string) {
  try {
    return await db
      .select()
      .from(promptParticipants)
      .where(eq(promptParticipants.promptSessionId, sessionId))
  } catch (error) {
    console.error('Database error fetching prompt participants:', error)
    throw new Error('Failed to fetch prompt participants')
  }
}


export async function updatePromptScore(
  userId: string,
  sessionId: string,
  score: number
) {
  try {
    const [updatedParticipant] = await db
      .update(promptParticipants)
      .set({ score, updatedAt: new Date() })
      .where(
        and(
          eq(promptParticipants.userId, userId),
          eq(promptParticipants.promptSessionId, sessionId)
        )
      )
      .returning()

    return updatedParticipant
  } catch (error) {
    console.error('Database error updating prompt score:', error)
    throw new Error('Failed to update prompt score')
  }
}

export async function checkPromptSubmission
(userId:string,
  sessionId:string
){
  try{
    const existing = await db
      .select()
      .from(userPrompts)
      .where(
        and(
          eq(userPrompts.userId, userId),
          eq(userPrompts.sessionId, sessionId)
        )
      )
      .limit(1)

    return existing.length > 0 ? existing[0] : null

  }catch(error){


  }
}

