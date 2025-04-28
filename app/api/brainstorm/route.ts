import { NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'

export async function POST(req: Request) {
	try {
		const { contentStyle, videoLength, targetInterest, videoType } = await req.json()

		// Validate required fields
		if (!contentStyle || !videoLength) {
			return NextResponse.json(
				{ error: 'Content style and video length are required' },
				{ status: 400 }
			)
		}

		// Create a prompt for the AI
		const prompt = `You are a creative video content strategist who generates engaging video ideas.

Generate 5 creative video ideas based on the following criteria:
- Content Style: ${contentStyle}
- Video Length: ${videoLength}
${targetInterest ? `- Target Interest: ${targetInterest}` : ''}
${videoType ? `- Video Type: ${videoType}` : ''}

For each idea, provide a brief title and a one-sentence description. Format the response as a JSON array of strings, where each string is a video idea in the format "Title: Description".`

		// Call AI API
		const result = await generateObject({
			model: openai('gpt-4o'),
			output: 'no-schema',
			prompt: prompt
		})

		// Parse the response to extract ideas
		let ideas: string[] = []
		
		// Check if result.object exists and is a string
		if (!result.object || typeof result.object !== 'string') {
			console.error('Unexpected response format:', result)
			return NextResponse.json(
				{ error: 'Unexpected response format from AI' },
				{ status: 500 }
			)
		}
		
		try {
			// Try to parse as JSON first
			const parsedResponse = JSON.parse(result.object)
			if (Array.isArray(parsedResponse)) {
				ideas = parsedResponse
			} else {
				// If not an array, split by newlines and filter
				ideas = result.object.split('\n')
					.filter((line: string) => line.trim().length > 0)
					.map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
			}
		} catch (error) {
			// If JSON parsing fails, split by newlines
			ideas = result.object.split('\n')
				.filter((line: string) => line.trim().length > 0)
				.map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
		}

		// If we still don't have any ideas, return an error
		if (ideas.length === 0) {
			return NextResponse.json(
				{ error: 'No ideas were generated' },
				{ status: 500 }
			)
		}

		return NextResponse.json({ ideas })
	} catch (error) {
		console.error('Error generating ideas:', error)
		return NextResponse.json(
			{ error: 'Failed to generate ideas' },
			{ status: 500 }
		)
	}
}
