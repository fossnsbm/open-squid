import { NextResponse } from 'next/server';
import { getAllTeams } from '@/app/db/queries';

export async function GET() {
  try {
    const teams = await getAllTeams();
    return NextResponse.json(teams);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}