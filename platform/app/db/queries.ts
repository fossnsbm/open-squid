// db/queries.ts
import { db } from './index'
import { questions ,quizSessions ,quizParticipants, users ,userAnswers} from './schema'
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



    //1
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
         .from(users)
         .orderBy(desc(users.createdAt))
        
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


// export async function getQuizParticipants(sessionId: string): Promise<(QuizParticipant & { user_name: string })[]> {
//   const result = await db
//     .select({
//       id: quizParticipants.id,
//       quizSessionId: quizParticipants.quizSessionId,
//       userId: quizParticipants.userId,
//       score: quizParticipants.score,
//       totalQuestionsAnswered: quizParticipants.totalQuestionsAnswered,
//       joinedAt: quizParticipants.joinedAt,
//       user_name: users.name,
//     })
//     .from(quizParticipants)
//     .innerJoin(users, eq(quizParticipants.userId, users.id))
//     .where(eq(quizParticipants.quizSessionId, sessionId))
//     .orderBy(desc(quizParticipants.score), quizParticipants.joinedAt)

//   return result.map(r => ({
//     ...r,
//     quiz_session_id: r.quizSessionId,
//     user_id: r.userId,
//     total_questions_answered: r.totalQuestionsAnswered,
//     joined_at: r.joinedAt,
//   })) as any
// }

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
