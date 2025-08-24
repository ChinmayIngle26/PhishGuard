
import { getUserReputation } from '@/services/reputation';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const GetReputationSchema = z.object({
  uid: z.string().min(1, { message: 'User ID is required.' }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedFields = GetReputationSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json({ success: false, error: 'Invalid input.', data: null }, { status: 400 });
    }

    const { uid } = validatedFields.data;
    const reputation = await getUserReputation(uid);
    
    return NextResponse.json({ success: true, error: null, data: reputation });

  } catch (error) {
    console.error('API Error in /api/get-reputation:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch user reputation.', data: null }, { status: 500 });
  }
}
