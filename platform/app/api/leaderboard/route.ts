import { type NextRequest, NextResponse } from "next/server";
import { getLeaderBoard } from "@/app/db/queries";

export async function GET(req: NextRequest) {
  try {
    const result = await getLeaderBoard();

       const leaderboard = result.map((row, index) => ({
      id: row.id,
      name: row.name,
      score: Number(row.totalScore) || 0,
      rank: index + 1,
    }));


    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.error();
  }
}
