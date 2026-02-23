import { NextResponse } from 'next/server';
import { parsePhysicsProblem } from '@/lib/ai/nl-parser';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { problemText } = await req.json();

        if (!problemText) {
            return NextResponse.json(
                { error: 'Problem text is required' },
                { status: 400 }
            );
        }

        const interpretation = await parsePhysicsProblem(problemText);
        interpretation.problemText = problemText; // Add original text
        return NextResponse.json({ success: true, interpretation });
    } catch (error: any) {
        console.error('API Route Error [parse-nl]:', error);

        // Log to file for debugging
        try {
            const logPath = path.join(process.cwd(), 'lib', 'ai', 'error_log.txt');
            fs.appendFileSync(logPath, `${new Date().toISOString()} - ${error.message}\n${error.stack}\n\n`);
        } catch (logErr) {
            console.error('Failed to write to log file:', logErr);
        }

        return NextResponse.json(
            {
                error: 'Failed to parse problem',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
