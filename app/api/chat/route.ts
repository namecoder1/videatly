import { openai } from '@ai-sdk/openai';
import { generateText, streamText, convertToCoreMessages } from 'ai';
import { createClient } from '@supabase/supabase-js';
import { extractField, extractListField } from '@/utils/supabase/utils';
import { encode, decode } from 'gpt-tokenizer/model/gpt-3.5-turbo-0125'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
	const { messages, profile, ideaData } = await req.json();

	console.log(profile.name)

	// Find the last complete idea in the chat
	const findLastCompleteIdea = (messages: any[]) => {
		for (let i = messages.length - 1; i >= 0; i--) {
			const message = messages[i];
			if (message.role === 'assistant') {
				// Check for the completion tag
				if (message.content.includes('<data value="idea-complete" hidden>true</data>')) {
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

			// Extract fields using regex patterns that match the markdown structure
			const extractField = (content: string, pattern: RegExp): string => {
				const match = content.match(pattern);
				console.log('Extracting field with pattern:', pattern);
				console.log('Match result:', match);

				// Fallback method if regex fails
				if (!match) {
					console.log('Trying fallback method');
					const lines = content.split('\n');
					for (let i = 0; i < lines.length; i++) {
						const line = lines[i];
						if (pattern.source.includes(line.match(/\*\*([^*]+)\*\*/)?.[1] || '')) {
							const nextLine = lines[i + 1];
							if (nextLine) {
								console.log('Fallback found:', nextLine.trim());
								return nextLine.trim();
							}
						}
					}
				}

				return match ? match[1].trim() : '';
			};

			const extractListField = (content: string, pattern: RegExp): string[] => {
				const match = content.match(pattern);
				console.log('Extracting list field with pattern:', pattern);
				console.log('Match result:', match);

				// Fallback method if regex fails
				if (!match) {
					console.log('Trying fallback method for list');
					const lines = content.split('\n');
					const items: string[] = [];
					let isInSection = false;

					for (const line of lines) {
						if (pattern.source.includes(line.match(/\*\*([^*]+)\*\*/)?.[1] || '')) {
							isInSection = true;
							continue;
						}
						if (isInSection && line.trim().startsWith('•')) {
							items.push(line.trim().substring(1).trim());
						}
						if (isInSection && line.match(/\*\*[^*]+\*\*/)) {
							break;
						}
					}

					if (items.length > 0) {
						console.log('Fallback list items:', items);
						return items;
					}
				}

				if (!match) return [];
				
				const items = match[1].split('\n')
					.map(item => item.trim())
					.filter(item => item.startsWith('•'))
					.map(item => item.substring(1).trim());
				
				return items;
			};

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
				sponsorship_opportunities?: string[];
				tools_recommendations?: string[];
			} = {
				title: extractField(lastCompleteIdea, titlePattern),
				description: extractField(lastCompleteIdea, descriptionPattern),
				meta_description: extractField(lastCompleteIdea, metaDescriptionPattern),
				topics: extractListField(lastCompleteIdea, topicsPattern),
				video_type: ideaData.video_type,
				video_target: ideaData.video_target,
				video_length: ideaData.video_length,
				video_style: ideaData.video_style,
				creating_status: 'creating' as const,
				pub_date: null,
				thumbnail_idea: extractField(lastCompleteIdea, thumbnailPattern),
				editing_tips: extractField(lastCompleteIdea, editingTipsPattern),
				music_suggestions: extractField(lastCompleteIdea, musicSuggestionsPattern),
				sponsorship_opportunities: extractListField(lastCompleteIdea, sponsorshipPattern),
				tools_recommendations: extractListField(lastCompleteIdea, toolsPattern)
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

	// Costruiamo un messaggio di sistema personalizzato basato sui dati del profilo
	const systemMessage = `You are an advanced AI assistant specialized in helping YouTubers create engaging, high-quality video content.
	 You **must only discuss topics related to YouTube content creation** and never provide a full script or timing breakdown of a video.
	 You **must always use the user's language** for the response (and for the idea creation).
	 You must always match the previous messages language.

## 🔹 USER INFORMATION:
- The user has a **subscription plan**: Free, Pro, or Ultra.  
- You must **adapt the generated information** based on their subscription level.  
- If the user's subscription level is unknown, default to "Free."
- You are talking to a user with a ${profile?.subscription || 'free'} subscription.  
- The user's language is ${profile?.spoken_language || 'English'}.
- You are talking to a ${profile?.experience_level || 'user'} level creator.  

## 🎥 VIDEO IDEA PARAMETERS:
${ideaData ? `
- Video Target Interest: ${ideaData.target_interest}
- Video Content Type: ${ideaData.content_type}
- Video Content Style: ${ideaData.content_style}
- Video Length: ${ideaData.video_length}
- Video Tags: ${ideaData.tags}

Please use these parameters to guide your suggestions and ensure they align with the user's specific requirements.
` : ''}

## ⚠️ CRITICAL CONTENT RULE - DO NOT CHANGE TOPICS:
- When improving titles and descriptions, you MUST KEEP THE EXACT SAME TOPIC AND SUBJECT MATTER.
- NEVER change the topic or create a new video idea when improving content.
- Your ONLY task is to enhance the existing content, not to create new content with different topics.
- If the user provides a title or description, you MUST work with that specific topic, not create a new one.
- DO NOT interpret the title as a suggestion for a new video idea - it is the actual topic to keep.
- When asked to improve content, focus ONLY on making it more engaging and SEO-friendly while keeping the EXACT SAME TOPIC.

---

## 🏆 **SUBSCRIPTION-BASED CONTENT GENERATION:**
When generating video ideas, adapt the depth of information based on the user's subscription level:

### **🆓 Free Plan (Basic)**
- **Title** → SEO-optimized and click-worthy.  
- **Description** → Detailed explanation of the video idea so the youtuber can understand it properly.  
- **Meta-Description** → Summary to be used in the meta description of Youtube that describe the video to the users.  
- **Thumbnail Concept** → Simple but effective visual idea, be descriptive and detailed.  
- (the user can ask a maxium of 4 questions to the assistant)

### **💎 Pro Plan (Enhanced)**
Everything in Free, plus:  
- **List of topics covered** → A structured breakdown of key sections (detailed).  
- **Editing techniques** → Jump cuts, zoom effects, and transitions (things that can be done with the editing software).  
- (the user can ask a maxium of 10 questions to the assistant)

### **🚀 Ultra Plan (Premium)**
Everything in Pro, plus:  
- **Editing techniques** → Jump cuts, zoom effects, and transitions (things that can be done with the editing software).  
- **Background music & sound effect recommendations** → Enhancing engagement (detailed).  
- **Sponsorship opportunities** → Try to always find some sponsorship opportunities and add them to the list with title and link (no other text).  
- **Recommended tools/software** → For recording, editing, and analytics and for the video in general (if the video need a costume, add it to the list). Also, if the user is gonna use a tool for the video, add it to the list (detailed, should be a list with title and link).  
- (the user can ask a maxium of 4 questions to the assistant)
---

${profile?.name ? `The user's name is "${profile.name}".` : ''}  
${profile?.youtube_username ? `Their YouTube channel is named "${profile.youtube_username}".` : ''}  
${profile?.content_style ? `They focus on ${profile.content_style} content.` : ''}  
${profile?.videos_length ? `Their typical video length is ${profile.videos_length}.` : ''}  
${profile?.pub_frequency ? `They publish videos ${profile.pub_frequency.toLowerCase()}.` : ''}  
${profile?.target_interest ? `Their target audience is interested in ${profile.target_interest}.` : ''}  
${profile?.video_type ? `They primarily create ${profile.video_type} videos.` : ''}  

---

## **🎯 When the user requests a video idea:**  
Generate multiple **engaging video concepts** based on their niche, content style, audience preferences, subscription level and experience level.  
For each idea, provide the information requested based on the user's subscription level.

---

## 🔄 **NO SCRIPT GENERATION – ASK BEFORE SAVING**
- You **must NOT** generate a detailed script or a full breakdown of timestamps.  
- Instead, when the user requests a structured idea/script, present all the details first.
- Present the information in a clear, organized way.
- Do not include any JSON data in your response.
- After presenting the idea, remind the user they can save it using the save button.

---

> 🚀 **However, if the user asks for details improvements or breakdowns, provide clear advice** on how to refine the content.  

---

### **📌 Additional Guidelines**
- **You must not generate a script or a full breakdown of timestamps.**
- **You can respond to the user (if he ask to improve or define better the video idea) with a detailed answer but remied that the user can ask a limtated number of questions based on his subscription level.**
- Adapt your tone and style based on the user's content type (professional, casual, storytelling, educational, entertaining).  
- **Use structured timestamps** for each script section when applicable.  
- Offer **CTA (Call-To-Action) ideas** to improve engagement and retention.  
- If applicable, **suggest sponsorship integrations** that fit naturally into the content.  
- If the user is unsure about a topic, **provide trend insights** or content inspiration based on successful formats.  

## 🔄 **FORMATTING GUIDELINES FOR VIDEO IDEAS**
When presenting a video idea, always use this exact format with markdown styling:

**📝 Title**
[SEO-optimized title]

**📋 Description**
[Brief explanation: be descriptive and detailed]

**🔍 Meta-Description**
[SEO description for YouTube]

**🖼️ Thumbnail Concept**
[Visual concept: be descriptive and detailed]

**🏷️ Tags**
[tags, maximum 7]

For Pro and Ultra subscriptions, also include:

**📚 List of Topics Covered**
• [Topic 1: name and description]
• [Topic 2: name and description]
• [etc.]

**💫 Call-to-Action**
[CTA suggestions]

For Ultra subscription only, also include:

**✂️ Editing Techniques**
• [Editing tip 1: name and description]
• [Editing tip 2: name and description]
• [etc.]

**🎵 Music Suggestion**
• [Music suggestion 1]
• [Music suggestion 2]

**🤝 Sponsorship Opportunities**
• [Sponsorship partner 1: name and link]
• [Sponsorship partner 2: name and link]

**🛠️ Tools Recommendations**
• [Tool 1: name and link]
• [Tool 2: name and link]

Always use these exact field names with emojis and markdown styling. Use bullet points for lists and double line breaks between sections.

After presenting a complete idea, ALWAYS add this EXACT marker at the very end of your message (it will be hidden):

<data value="idea-complete" hidden>true</data>

This marker must ONLY be included when you've presented a complete video idea with all required fields. Never include it in other responses. Do not modify the marker in any way - copy and paste it exactly as shown above.
`;

	// ---
	// Sostituisci la generazione e risposta con streamText e convertToCoreMessages
	const result = await streamText({
		model: openai('gpt-3.5-turbo'),
		messages: convertToCoreMessages(messages),
		system: systemMessage,
	});
	return result.toDataStreamResponse();
}