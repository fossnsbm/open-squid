import { db } from './index'

import { questions ,quizSessions ,quizParticipants, users ,userAnswers ,teams,promptSessions,promptParticipants,userPrompts ,puzzleMarks} from './schema'
import { nanoid } from 'nanoid'
import { eq ,sql,desc,and} from "drizzle-orm";

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

export async function createQuizSession(
  title: string,
  timePerQuestion: number = 10
) {
  try {
    // Get total questions count
    const totalQuestionsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(questions)
    
    const totalQuestions = totalQuestionsResult[0]?.count || 0

    const sessionData = {
      id: nanoid(),
      title,
      status: 'pending' as const,
      currentQuestionIndex: 0,
      timePerQuestion,
      totalQuestions,
      startedAt: null,
      endedAt: null,
      createdAt: new Date(),
    }

    const [newSession] = await db
      .insert(quizSessions)
      .values(sessionData)
      .returning()

    return newSession
  } catch (error) {
    console.error('Database error creating quiz session:', error)
    throw new Error('Failed to create quiz session in database')
  }
}

// Get all quiz sessions
export async function getQuizSessions() {
  try {
    return await db
      .select()
      .from(quizSessions)
      .orderBy(desc(quizSessions.createdAt))
  } catch (error) {
    console.error('Database error fetching quiz sessions:', error)
    throw new Error('Failed to fetch quiz sessions')
  }
}

export async function getQuizSessionById(id: string) {
  try {
    const [session] = await db
      .select()
      .from(quizSessions)
      .where(eq(quizSessions.id, id))
    
    return session
  } catch (error) {
    console.error('Database error fetching quiz session:', error)
    throw new Error('Failed to fetch quiz session')
  }
}

export async function deleteQuizSession(id: string) {
  try {
    const [deletedSession] = await db
      .delete(quizSessions)
      .where(eq(quizSessions.id, id))
      .returning()
    
    return deletedSession
  } catch (error) {
    console.error('Database error deleting quiz session:', error)
    throw new Error('Failed to delete quiz session')
  }
}

// Update quiz session status and/or current question index
export async function updateQuizSession(
  id: string,
  updates: {
    status?: string;
    currentQuestionIndex?: number;
    startedAt?: Date | null;
    endedAt?: Date | null;
  }
) {
  try {
    const [updatedSession] = await db
      .update(quizSessions)
      .set(updates)
      .where(eq(quizSessions.id, id))
      .returning()
    
    return updatedSession
  } catch (error) {
    console.error('Database error updating quiz session:', error)
    throw new Error('Failed to update quiz session')
  }
}
     
   //2
// Update only status
export async function updateQuizSessionStatus(
  id: string, 
  status: string, 
  currentQuestionIndex?: number
) {
  try {
    const updateData: any = { status }
    
    // Set timestamps based on status
    if (status === 'live') {
      updateData.startedAt = new Date()
    } else if (status === 'completed') {
      updateData.endedAt = new Date()
    }

    if (typeof currentQuestionIndex === 'number') {
      updateData.currentQuestionIndex = currentQuestionIndex
    }

    const [updatedSession] = await db
      .update(quizSessions)
      .set(updateData)
      .where(eq(quizSessions.id, id))
      .returning()
    
    return updatedSession
  } catch (error) {
    console.error('Database error updating quiz session status:', error)
    throw new Error('Failed to update quiz session status')
  }
}

// Get quiz sessions by status
export async function getQuizSessionsByStatus(status: string) {
  try {
    return await db
      .select()
      .from(quizSessions)
      .where(eq(quizSessions.status, status))
      .orderBy(desc(quizSessions.createdAt))
  } catch (error) {
    console.error('Database error fetching quiz sessions by status:', error)
    throw new Error('Failed to fetch quiz sessions by status')
  }
}

// Update current question index
export async function updateCurrentQuestionIndex(id: string, questionIndex: number) {
  try {
    const [updatedSession] = await db
      .update(quizSessions)
      .set({ currentQuestionIndex: questionIndex })
      .where(eq(quizSessions.id, id))
      .returning()
    
    return updatedSession
  } catch (error) {
    console.error('Database error updating question index:', error)
    throw new Error('Failed to update question index')
  }
}

// Complete quiz session
export async function completeQuizSession(id: string) {
  try {
    const [completedSession] = await db
      .update(quizSessions)
      .set({ 
        status: 'completed',
        endedAt: new Date()
      })
      .where(eq(quizSessions.id, id))
      .returning()
    
    return completedSession
  } catch (error) {
    console.error('Database error completing quiz session:', error)
    throw new Error('Failed to complete quiz session')
  }
}

// Start quiz session
export async function startQuizSession(id: string) {
  try {
    const [startedSession] = await db
      .update(quizSessions)
      .set({ 
        status: 'live',
        startedAt: new Date(),
        currentQuestionIndex: 0
      })
      .where(eq(quizSessions.id, id))
      .returning()
    
    return startedSession
  } catch (error) {
    console.error('Database error starting quiz session:', error)
    throw new Error('Failed to start quiz session')
  }
}



export async function addQuizParticipant(
  quizSessionId: string,
  userId: string
) {
  try {
    const participantData = {
      id: nanoid(),
      quizSessionId,
      userId,
      score: 0,
      totalQuestionsAnswered: 0,       
      joinedAt: new Date(),
    }

    const [newParticipant] = await db
      .insert(quizParticipants)
      .values(participantData)
      .returning()

    return newParticipant
  } catch (error) {
    console.error('Database error adding quiz participant:', error)
    throw new Error('Failed to add quiz participant')
  }
}


export async function getQuizParticipants(quizSessionId: string) {
  try {
    return await db
      .select()
      .from(quizParticipants)
      .where(eq(quizParticipants.quizSessionId, quizSessionId))
      .orderBy(desc(quizParticipants.joinedAt))
  } catch (error) {
    console.error('Database error fetching quiz participants:', error)
    throw new Error('Failed to fetch quiz participants')
  }
}

export async function getUsers() {
  try{
    return await db
        .select()
         .from(teams)
        .where(eq(teams.role, 'user'))
         .orderBy(desc(teams.createdAt))
        
  }catch(error){

    console.error('Database error fetching users :', error)
    throw new Error('Failed to fetch users ')
  }
}


export async function saveUserAnswer(
  userId: string,
  quizSessionId: string,
  questionId: string,
  selectedAnswer: number,
  isCorrect: boolean,
  responseTime?: number
) {
  try {
    const answerData = {
      id: nanoid(),
      userId,
      quizSessionId,
      questionId,
      selectedAnswer,
      isCorrect,
      responseTime,
      answeredAt: new Date(),
    }

    const [newAnswer] = await db
      .insert(userAnswers)
      .values(answerData)
      .returning()

    return newAnswer
  } catch (error) {
    console.error('Database error saving user answer:', error)
    throw new Error('Failed to save user answer in database')
  }
}
 

export async function getActiveQuizSession() {
  try {
    const [activeSession] = await db
      .select()
      .from(quizSessions)
      .where(eq(quizSessions.status, 'live'))
      .orderBy(desc(quizSessions.startedAt))
      .limit(1)
    
    return activeSession
  } catch (error) {
    console.error('Database error fetching active quiz session:', error)
    throw new Error('Failed to fetch active quiz session')
  }
}

export async function updateParticipantScore(
  quizSessionId: string,
  userId: string,
  score: number
) {
  try {
    const result = await db
      .update(quizParticipants)
      .set({ 
        score: score,
      })
      .where(
        and(
          eq(quizParticipants.quizSessionId, quizSessionId),
          eq(quizParticipants.userId, userId)
        )
      )
      .returning();

    return result[0];
  } catch (error) {
    console.error("Error updating participant score:", error);
    throw error;


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

export async function addPuzzleMarks(
  userId: string,
  score: number
){
  try {
    const markData = {
      id: nanoid(),
      userId,
      score,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const [newMark] = await db
      .insert(puzzleMarks)
      .values(markData)
      .returning()

    return newMark
  } catch (error) {
    console.error('Database error adding puzzle mark:', error)
    throw new Error('Failed to add puzzle mark')
  }
}

export async function getLeaderBoard() {
  try {
    
    const totalScore = sql<number>`COALESCE(SUM(${quizParticipants.score}), 0) + 
                         COALESCE(SUM(${promptParticipants.score}), 0) + 
                         COALESCE(SUM(${puzzleMarks.score}), 0)`.as('totalScore');

    const leaderboard = await db
      .select({
        id: teams.id,
        name: teams.name,
        totalScore, 
      })
      .from(teams)
      .leftJoin(quizParticipants, eq(teams.id, quizParticipants.userId))
      .leftJoin(promptParticipants, eq(teams.id, promptParticipants.userId))
      .leftJoin(puzzleMarks, eq(teams.id, puzzleMarks.userId))
      .groupBy(teams.id, teams.name)
      .orderBy(desc(totalScore)); 

    return leaderboard;
  } catch (error) {
    console.error('Database error fetching leaderboard:', error);
    throw new Error('Failed to fetch leaderboard');
  }
}
