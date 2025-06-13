import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { openai } from "@ai-sdk/openai"
import { convertToCoreMessages, generateText } from "ai"

export async function POST(request: Request) {
	try {
		const supabase = await createClient()
		const { scriptData, ideaData, lang, timezone, today, subscription, productionId } = await request.json()

		const sysMessage = `
You are an expert project manager specializing in YouTube video productions.

IMPORTANT:
- The user has a ${subscription} subscription.
- If free, create 3 tasks. If pro or ultra, create 5 tasks.
- All responses must be written in this language: ${lang === 'en' ? 'English' : lang === 'it' ? 'Italian' : lang === 'es' ? 'Spanish' : 'French'}.
- Use the following user timezone for all scheduling: ${timezone}.

Your task is to create a detailed list of production tasks based on the provided video idea and script.
Each task must be scheduled between ${today} and the ${ideaData.pub_date}.
Consider a proper distribution of tasks between the start and end date and each task's possible duration.
The working hours are from 05:00 to 00:00 (midnight), and time should be divided into 30-minute slots.
Example time slots: 08:00, 08:30, 09:00, 09:30, etc.

For each task, estimate how long it will take and allocate time accordingly.
All tasks must be formatted in JSON. For each task, provide the following fields:

- title: short and clear task title, in ${lang}
- description: a detailed explanation of the task, in ${lang}
- start_date: UTC datetime when the task starts (format: YYYY-MM-DD HH:mm:ss+00)
- end_date: UTC datetime when the task ends (format: YYYY-MM-DD HH:mm:ss+00)
- priority: one of ["low", "medium", "high"], depending on importance
- status: always "pending"
- category: one of ["pre-production", "production", "post-production", "other"]
- idea_id: use the provided idea_id
- script_id: use the provided script_id
- user_id: use the provided user_id

Make sure to convert all times from the user timezone (${timezone}) to UTC in the start_date and end_date fields.

Here is the context you should use to generate the tasks:
---
Idea:
- Title: ${ideaData.title}
- Description: ${ideaData.description}
- Publication date: ${ideaData.pub_date}
- Idea ID: ${ideaData.id}
- User ID: ${ideaData.user_id}

Script:
- Script ID: ${scriptData.id}
- Persona: ${scriptData.persona}
- Script type: ${scriptData.script_type}
- Structure: ${scriptData.structure}
- Target audience: ${scriptData.target_audience}
- Duration: ${scriptData.duration}
- Tone: ${scriptData.tone}
- Content: ${JSON.stringify(scriptData.content)}

Return only a valid JSON array (no markdown or text) — one object per task.
`

		const result = await generateText({
			model: openai('gpt-4-turbo-preview'),
			system: sysMessage,
			prompt: "Generate the production tasks as requested above."
		})

		// Pulizia output AI per estrarre solo l'array JSON
		let jsonText = result.text.trim()

		// Rimuovi blocchi markdown se presenti
		if (jsonText.startsWith('```')) {
			jsonText = jsonText.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim()
		}

		// Trova la prima parentesi quadra e l'ultima
		const firstBracket = jsonText.indexOf('[')
		const lastBracket = jsonText.lastIndexOf(']')
		if (firstBracket !== -1 && lastBracket !== -1) {
			jsonText = jsonText.substring(firstBracket, lastBracket + 1)
		}

		const tasks = JSON.parse(jsonText)

		// Insert todos into database
		const { error: todosError } = await supabase
			.from('todos')
			.insert(tasks.map((task: any) => ({
				...task,
				idea_id: ideaData.id,
				script_id: scriptData.id,
				user_id: ideaData.user_id
			})))
			.select()

		if (todosError) throw todosError

		// Update production status to completed
		const { error: updateError } = await supabase
			.from('production')
			.update({ status: 'creating' })
			.eq('id', productionId)

		if (updateError) throw updateError

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error in todo generation:', error)
		return NextResponse.json({ error: 'Failed to generate todos' }, { status: 500 })
	}
}