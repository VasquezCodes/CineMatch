import { NextRequest, NextResponse } from 'next/server';
import { getPersonProfile } from '@/features/person/actions';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');

    if (!name) {
        return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 });
    }

    try {
        const profile = await getPersonProfile(name);
        return NextResponse.json(profile);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error', details: error }, { status: 500 });
    }
}
