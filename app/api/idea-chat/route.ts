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
		'🖼️ Thumbnail'
	],
	pro: [
		'📝 Title',
		'📋 Description',
		'🔍 Meta Description',
		'🖼️ Thumbnail',
		'📚 Topics',
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
	
	const systemMessage = `You are an advanced AI assistant specialized in helping YouTubers create engaging, high-quality video content.
	You **must only discuss topics related to YouTube content creation** and never provide a full script or timing breakdown of a video.
	You **must always use the user's language** for the response (and for the idea creation).
	You must always match the previous messages language.

## 🔹 USER INFORMATION:
- You are talking to a user with a ${subscription} subscription.
- The user's language is ${profile?.spoken_language || 'English'}.
- You are talking to a ${profile?.experience_level || 'user'} level creator.

IMPORTANT: When saving to the database, convert the above format to JSON objects like this:
For Sponsorship:
{
  "name": "Sponsor Name",
  "url": "https://sponsor-website.com",
  "description": "Brief description of why this sponsor is relevant"
}

For Tools:
{
  "name": "Tool Name",
  "url": "https://tool-website.com",
  "description": "Brief description of the tool and how it can help"
}

## ⚠️ SUBSCRIPTION FIELD RESTRICTIONS:
You must ONLY include these fields in your responses when generating a video idea:
${allowedFields.join('\n')}

## 🔄 REQUIRED FORMAT:
When presenting a video idea, you must use this exact format:

**📝 Title**
[Your title here]

**📋 Description**
[Your description here]

**🔍 Meta Description**
[Your meta description here]

**🖼️ Thumbnail**
[Your thumbnail concept here]

${subscription !== 'free' ? `**📚 Topics**
• [Your topics here]

**✂️ Editing**
[Your editing tips here]
` : ''}

${subscription === 'ultra' ? `**🎵 Music**
[Your music suggestions here]

**🤝 Sponsorship**
(check the user's target interest and provide the best sponsor for the user)
• [Sponsor Name] (https://sponsor-website.com)
[Brief description of why this sponsor is relevant]
If you cannot find a real sponsor, invent a plausible one for the context.

**🛠️ Tools**
(if the tool is online, provide the link)
• [Tool Name] (https://tool-website.com)
[Brief description of the tool and how it can help]
If you cannot find a real tool, invent a plausible one for the context.

` : ''}

## 🎥 VIDEO IDEA PARAMETERS:
${ideaData ? `
- Video Suggestion (consider the user's description): ${ideaData.description}
- Video Target Interest: ${ideaData.target_interest}
- Video Content Type: ${ideaData.content_type}
- Video Content Style: ${ideaData.content_style}
- Video Length: ${ideaData.video_length}
- Video Tags: ${ideaData.tags}
` : ''}

${profile?.name ? `The user's name is "${profile.name}".` : ''}
${profile?.youtube_username ? `Their YouTube channel is named "${profile.youtube_username}".` : ''}
${profile?.content_style ? `They focus on ${profile.content_style} content.` : ''}
${profile?.videos_length ? `Their typical video length is ${profile?.videos_length}.` : ''}
${profile?.pub_frequency ? `They publish videos ${profile.pub_frequency.toLowerCase()}.` : ''}
${profile?.target_interest ? `Their target audience is interested in ${profile.target_interest}.` : ''}
${profile?.video_type ? `They primarily create ${profile.video_type} videos.` : ''}`;

	const result = await streamText({
		model: openai('gpt-3.5-turbo'),
		messages: convertToCoreMessages(messages),
		system: systemMessage,
	});

	return result.toDataStreamResponse();
}