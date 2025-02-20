import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();
        
        const imageResponse = await fetch(url);
        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        
        return new NextResponse(Buffer.from(imageBuffer), {
            headers: {
                'Content-Type': 'image/jpeg',
            },
        });
    } catch (error) {
        console.error('Error proxying image:', error);
        return NextResponse.json(
            { error: 'Failed to fetch image' },
            { status: 500 }
        );
    }
}