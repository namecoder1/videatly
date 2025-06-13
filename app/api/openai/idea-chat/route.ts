import { openai } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages } from 'ai';
import { createClient } from '@supabase/supabase-js';
import { extractField, extractListField, extractToolObjects, extractSponsorshipObjects } from '@/lib/extraction';
import { Tool, Sponsorship } from '@/types/types';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Define allowed fields per subscription level
const SUBSCRIPTION_FIELDS = {
	free: [
		'📝 Title',
		'📋 Description',
		'🔍 Meta Description',
		'🖼️ Thumbnail',
		'🎵 Music',
	],
	pro: [
		'📝 Title',
		'📋 Description',
		'🔍 Meta Description',
		'🖼️ Thumbnail',
		'📚 Topics',
		'🎵 Music',
		'✂️ Editing'
	],
	ultra: [
		'📝 Title',
		'📋 Description',
		'🔍 Meta Description',
		'🖼️ Thumbnail',
		'📚 Topics',
		'✂️ Editing',
		'🎵 Music',
		'🤝 Sponsorship',
		'🛠️ Tools'
	]
};

export async function POST(req: Request) {
	const { messages, profile, ideaData } = await req.json();
	console.log('Received request:', {
		hasMessages: messages?.length > 0,
		hasProfile: !!profile,
		hasIdeaData: !!ideaData,
		lastMessagePreview: messages[messages.length - 1]?.content.substring(0, 100)
	});

	// Find the last complete idea in the chat
	const findLastCompleteIdea = (messages: any[]) => {
		for (let i = messages.length - 1; i >= 0; i--) {
			const message = messages[i];
			if (message.role === 'assistant') {
				// Check for the completion tag
				if (message.content.includes('<data value="idea-complete" hidden></data>')) {
					return message.content;
				}
			}
		}
		return null;
	};

	// Add a flag to the last message to check if it's a save request
	const lastMessage = messages[messages.length - 1];
	const isSaveRequest = lastMessage.content.toLowerCase().includes('save this idea');

	if (isSaveRequest) {
		try {
			const lastCompleteIdea = findLastCompleteIdea(messages);
			if (!lastCompleteIdea) {
				return new Response(JSON.stringify({
					role: 'assistant',
					content: 'No complete idea found to save.'
				}), {
					headers: { 'Content-Type': 'application/json' }
				});
			}

			// Define regex patterns that match the markdown structure
			const titlePattern = /\*\*📝[^*]*\*\*\s*\n([\s\S]*?)(?=\n\s*\*\*|$)/;
			const descriptionPattern = /\*\*📋[^*]*\*\*\s*\n([\s\S]*?)(?=\n\s*\*\*|$)/;
			const metaDescriptionPattern = /\*\*🔍[^*]*\*\*\s*\n([\s\S]*?)(?=\n\s*\*\*|$)/;
			const topicsPattern = /\*\*📚[^*]*\*\*\s*\n([\s\S]*?)(?=\n\s*\*\*|$)/;
			const thumbnailPattern = /\*\*🖼️[^*]*\*\*\s*\n([\s\S]*?)(?=\n\s*\*\*|$)/;
			const editingTipsPattern = /\*\*✂️[^*]*\*\*\s*\n([\s\S]*?)(?=\n\s*\*\*|$)/;
			const musicSuggestionsPattern = /\*\*🎵[^*]*\*\*\s*\n([\s\S]*?)(?=\n\s*\*\*|$)/;
			const sponsorshipPattern = /\*\*🤝[^*]*\*\*\s*\n([\s\S]*?)(?=\n\s*\*\*|$)/;
			const toolsPattern = /\*\*🛠️[^*]*\*\*\s*\n([\s\S]*?)(?=\n\s*\*\*|$)/;

			console.log('Last complete idea content:', lastCompleteIdea);
			console.log('Topics pattern:', topicsPattern);
			console.log('Sponsorship pattern:', sponsorshipPattern);

			// Extract fields based on subscription level
			const baseFields: {
				title: string;
				description: string;
				meta_description: string;
				topics: string[];
				video_type: any;
				video_target: any;
				video_length: any;
				video_style: any;
				creating_status: "creating";
				pub_date: null;
				tags?: string[];
				thumbnail_idea?: string;
				editing_tips?: string;
				music_suggestions?: string;
				sponsorship_opportunities?: Sponsorship[];
				tools_recommendations?: Tool[];
			} = {
				title: extractField(lastCompleteIdea, titlePattern),
				description: extractField(lastCompleteIdea, descriptionPattern),
				meta_description: extractField(lastCompleteIdea, metaDescriptionPattern),
				topics: extractListField(lastCompleteIdea, topicsPattern, 'string_array') as string[],
				video_type: ideaData.video_type,
				video_target: ideaData.video_target,
				video_length: ideaData.video_length,
				video_style: ideaData.video_style,
				creating_status: 'creating' as const,
				pub_date: null,
				thumbnail_idea: extractField(lastCompleteIdea, thumbnailPattern),
				editing_tips: extractField(lastCompleteIdea, editingTipsPattern),
				music_suggestions: extractField(lastCompleteIdea, musicSuggestionsPattern),
				sponsorship_opportunities: extractSponsorshipObjects(lastCompleteIdea, sponsorshipPattern),
				tools_recommendations: extractToolObjects(lastCompleteIdea, toolsPattern),
			};

			// Add debug logging
			console.log('Extracted topics:', baseFields.topics);
			console.log('Extracted sponsorships:', baseFields.sponsorship_opportunities);
			console.log('Extracted fields:', baseFields);

			// Keep the original tags from the user, don't modify them
			if (ideaData.tags && ideaData.tags.length > 0) {
				baseFields.tags = ideaData.tags.slice(0, 7); // Limit to 7 tags
			}

			const updateData = {
				...baseFields
			};

			const supabase = createClient(
				process.env.NEXT_PUBLIC_SUPABASE_URL!,
				process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
			);

			const { error } = await supabase
				.from('ideas')
				.update(updateData)
				.eq('id', ideaData.id);

			if (error) throw error;

			return new Response(JSON.stringify({
				role: 'assistant',
				content: 'Great! I\'ve saved all the details of your video idea. You can now proceed to create your script or check your saved ideas later.'
			}), {
				headers: { 'Content-Type': 'application/json' }
			});
		} catch (error) {
			console.error('Error saving idea:', error);
			return new Response(JSON.stringify({
				role: 'assistant',
				content: 'Sorry, there was an error saving your idea. Please try again.'
			}), {
				headers: { 'Content-Type': 'application/json' }
			});
		}
	}

	const subscription = profile?.subscription || 'free';
	const allowedFields = SUBSCRIPTION_FIELDS[subscription as keyof typeof SUBSCRIPTION_FIELDS];
	
	const systemMessage = `You are an advanced AI assistant specialized in helping YouTubers create **highly specific, creative, and valuable video content ideas**.

🎯 Your mission:
- Generate a YouTube video idea that is **original**, **detailed**, and **useful** to the creator.
- Every section must contain **clear, non-generic information** the creator can actually use.

⚠️ STRICT RULES:
- Do **NOT** be vague. Avoid phrases like "explore the topic of…" or "talk about the importance of…"
- DO be specific. Use real-world references, detailed examples, and creative angles.
- You **MUST ONLY talk about YouTube-related content creation.**
- You must respond in the same language the user is using (detected: ${profile?.spoken_language === 'it' ? 'Italian' : profile?.spoken_language === 'en' ? 'English' : profile?.spoken_language === 'es' ? 'Spanish' : profile?.spoken_language === 'fr' ? 'French' : 'English'}).
- You must match the tone and style from the user's previous messages.
- If the user didn't provide information, **invent plausible and creative content** that fits their profile.
- Always follow the required structure below. No exceptions.

## 🔹 USER INFORMATION:
- Subscription: ${subscription}
- Spoken language: ${profile?.spoken_language === 'it' ? 'Italian' : profile?.spoken_language === 'en' ? 'English' : profile?.spoken_language === 'es' ? 'Spanish' : profile?.spoken_language === 'fr' ? 'French' : 'English'}
- Experience level: ${profile?.experience_level || 'user'}

If included, take into account:
${profile?.youtube_username ? `• Channel: "${profile.youtube_username}"` : ''}
${profile?.content_style ? `• Content style: ${profile.content_style}` : ''}
${profile?.video_type ? `• Video type: ${profile.video_type}` : ''}
${profile?.target_interest ? `• Target interest: ${profile.target_interest}` : ''}
${profile?.videos_length ? `• Typical video length: ${profile.videos_length}` : ''}
${profile?.pub_frequency ? `• Publishing frequency: ${profile.pub_frequency.toLowerCase()}` : ''}

## 📦 FORMAT: YOU MUST ALWAYS USE THIS STRUCTURE EXACTLY

**📝 Title**  
A YouTube-ready, specific, compelling title.  
❌ Bad: "The Secrets of Quantum Physics"  
✅ Good: "How Quantum Entanglement Could Break the Internet (Explained Simply)"

**📋 Description**  
Summarize the unique value of the video in a specific way. Mention the tone and delivery style too.  
❌ Bad: "This video explains quantum physics and mysterious phenomena."  
✅ Good: "This video breaks down quantum entanglement using real-world analogies (like twins texting) and shows why tech companies fear its implications. Delivered in a fast-paced, playful tone."

**🔍 Meta Description**  
A 1-sentence, SEO-friendly summary. Include keywords and make it scroll-stopping.

**🖼️ Thumbnail**  
Describe a compelling thumbnail concept with visual composition and mood.  
✅ Good: "A glitchy photo of a smartphone being torn in half by lightning, with text: 'Quantum Kills Wi-Fi?'"

${subscription !== 'free' ? `**📚 Topics**
• 3–6 specific themes or concepts the video will cover.
• Use phrasing that reflects what viewers will *learn*, *realize*, or *see*.

**✂️ Editing**
Suggest visual storytelling techniques, transitions, overlays, or pacing that match the video's tone and topic.
` : ''}

${subscription === 'ultra' ? `**🎵 Music**
Suggest a specific type of background music and how it should shift across scenes.

**🤝 Sponsorship**
Provide a brand or imaginary sponsor *relevant* to the video content and audience.
• [Sponsor Name] (https://sponsor-website.com)  
[Short description of why this sponsor fits perfectly with the video]

**🛠️ Tools**
List 1–2 tools the creator could show or use in the video.  
• [Tool Name] (https://tool-link.com)  
[Short sentence about how this tool is useful in the video's context]
` : ''}

## 🧠 IDEA PARAMETERS:
${ideaData ? `
- Suggested Theme: ${ideaData.description}
- Target Interest: ${ideaData.video_target}
- Content Type: ${ideaData.video_type}
- Content Style: ${ideaData.video_style}
- Video Length: ${ideaData.video_length}
- Tags: ${ideaData.tags}
` : 'Use your creativity to generate a fitting idea.'}

✅ ALWAYS fill in every field.  
✅ NEVER leave placeholders or vague phrases.  
✅ Your goal is to inspire a script, not just describe a theme.

🎯 Final output must be a fully filled, usable video idea in the format above — and nothing else.`;

	const result = await streamText({
		model: openai('gpt-3.5-turbo'),
		messages: convertToCoreMessages(messages),
		temperature: 0.1,
		system: systemMessage,
	});

	return result.toDataStreamResponse();
}