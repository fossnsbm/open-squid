
import { NextResponse } from 'next/server';
import { addPuzzleMarks } from '@/app/db/queries';


interface ScoreInput {
  userId: string;
  score: number | null;
}

export async function POST(request: Request) {
  try {
    const { scores } = await request.json();

    if (!Array.isArray(scores)) {
      return NextResponse.json(
        { message: 'Invalid data format. "scores" must be an array.' },
        { status: 400 }
      );
    }

    if (scores.length === 0) {
      return NextResponse.json(
        { message: 'No scores to save.' },
        { status: 400 }
      );
    }

 
    const validatedScores: { userId: string; score: number }[] = [];
    const errors: { userId: string; error: string }[] = [];

    for (const item of scores) {
      const { userId, score } = item as ScoreInput;

      if (!userId || typeof userId !== 'string') {
        errors.push({ userId: userId || 'unknown', error: 'Invalid or missing userId' });
        continue;
      }

      const numericScore = score === null || score === undefined ? 0 : Number(score);
      if (isNaN(numericScore)) {
        errors.push({ userId, error: 'Score must be a number or null' });
        continue;
      }

      validatedScores.push({ userId, score: numericScore });
    }


    if (validatedScores.length === 0) {
      return NextResponse.json(
        { message: 'No valid scores to save.', errors },
        { status: 400 }
      );
    }

    const savePromises = validatedScores.map(({ userId, score }) =>
      addPuzzleMarks(userId, score).catch((err) => {
        console.error(`Failed to save score for user ${userId}:`, err.message);
        return { error: err.message, userId };
      })
    );

    const results = await Promise.allSettled(savePromises);

    const saved: typeof validatedScores = [];
    const failed: { userId: string; error: string }[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        saved.push(validatedScores[index]);
      } else {
        failed.push({
          userId: validatedScores[index].userId,
          error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
        });
      }
    });

    
    if (failed.length === 0) {
      return NextResponse.json(
        { message: 'All scores saved successfully!', savedCount: saved.length },
        { status: 200 }
      );
    } else if (saved.length === 0) {
      return NextResponse.json(
        { message: 'Failed to save any scores.', errors: failed },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        {
          message: `Partially saved: ${saved.length} success, ${failed.length} failed.`,
          savedCount: saved.length,
          failedCount: failed.length,
          errors: failed,
        },
        { status: 207 } 
      );
    }
  } catch (error) {
    console.error('Unexpected error saving scores:', error);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}