import { createClient } from '@/utils/supabase/client';
import { IdeaData, ProfileData, ScriptData, Sponsorship, Tool } from '@/types/types';
import { extractSponsorshipObjects, extractToolObjects, parseTags } from '@/lib/extraction';

const extractField = (message: string, fieldName: string): string => {
  // Create a regex that matches the emoji and captures everything until the next emoji field or end
  // This makes it language-independent since we match on emoji
  const emojiMap: { [key: string]: string } = {
    '📝 Title': '📝',
    '📋 Description': '📋',
    '🔍 Meta Description': '🔍',
    '🖼️ Thumbnail': '🖼️',
    '✂️ Editing': '✂️',
    '🎵 Music': '🎵',
    '🤝 Sponsorship': '🤝',
    '🛠️ Tools': '🛠️',
    '📚 Topics': '📚'
  };

  const emoji = emojiMap[fieldName];
  if (!emoji) {
    return '';
  }

  // First try to find the section with the emoji
  const sectionRegex = new RegExp(`\\*\\*${emoji}[^*]*\\*\\*[\\s\\S]*?(?=\\n\\s*\\*\\*[📝📋🔍🖼️✂️🎵🤝🛠️📚]|$)`, 'g');
  const section = message.match(sectionRegex);
  

  if (!section) return '';

  // Then extract the content after the header
  const contentRegex = new RegExp(`\\*\\*${emoji}[^*]*\\*\\*\\s*\\n([^]*?)(?=\\n\\s*\\*\\*|$)`, 's');
  const match = section[0].match(contentRegex);


  if (!match) return '';

  // Clean up the extracted content
  const cleaned = match[1]
    .trim()
    .replace(/\*\*/g, '')         // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic
    .replace(/`([^`]+)`/g, '$1')   // Remove code
    .replace(/^[-•*]\s*/gm, '')    // Remove bullet points
    .replace(/^\s+|\s+$/gm, '')    // Trim each line
    .split('\n')[0];              // Take only the first line for single-line fields

  
  return cleaned;
};

const extractListField = (message: string, fieldName: string): string[] => {

  // Create a regex that matches the emoji and captures everything until the next emoji field
  const emojiMap: { [key: string]: string } = {
    '📚 Topics': '📚',
    '🤝 Sponsorship': '🤝',
    '🛠️ Tools': '🛠️',
  };

  const emoji = emojiMap[fieldName];
  if (!emoji) {
    console.log('No emoji found for field:', fieldName);
    return [];
  }

  // First find the section
  const sectionRegex = new RegExp(`\\*\\*${emoji}[^*]*\\*\\*[\\s\\S]*?(?=\\n\\s*\\*\\*[📝📋🔍🖼️✂️🎵🤝🛠️📚]|$)`, 'g');
  const section = message.match(sectionRegex);


  if (!section) return [];

  // Then extract the content
  const contentRegex = new RegExp(`\\*\\*${emoji}[^*]*\\*\\*\\s*\\n([^]*?)(?=\\n\\s*\\*\\*|$)`, 's');
  const match = section[0].match(contentRegex);


  if (!match) return [];

  const content = match[1].trim();
  const items = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('•') || line.startsWith('-') || line.startsWith('*'))
    .map(line => 
      line
        .replace(/^[•\-*]\s*/, '')  // Remove bullet points
        .replace(/\*\*/g, '')       // Remove bold
        .replace(/\*([^*]+)\*/g, '$1') // Remove italic
        .replace(/`([^`]+)`/g, '$1')   // Remove code
        .trim()
    )
    .filter(line => line.length > 0);


  return items;
};

export const isValidIdeaMessage = (content: string): boolean => {
  // Check if the message contains all required fields
  const requiredFields = [
    '📝 Title',
    '📋 Description',
    '🔍 Meta Description',
    '🖼️ Thumbnail'
  ];

  // Check if all required fields are present and have content
  const hasAllFields = requiredFields.every(field => {
    const value = extractField(content, field);
    return value && value.length > 0;
  });

  return hasAllFields;
};

export const checkMessageForSave = (message: { role: string, content: string }): boolean => {
  if (message.role !== 'assistant') {
    return false;
  }

  return isValidIdeaMessage(message.content);
};

export const saveIdea = async (
  id: string, 
  ideaData: IdeaData, 
  messages: { role: string, content: string }[]
): Promise<{ success: boolean, error?: string }> => {
  const supabase = createClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Authentication required');
    }

    // Find the last valid idea message
    const lastValidMessage = messages
      .filter(m => m.role === 'assistant')
      .reverse()
      .find(m => isValidIdeaMessage(m.content));

    if (!lastValidMessage) {
      throw new Error('No valid idea found');
    }

    // Debug logs
    console.log('=== DEBUG: FULL MESSAGE ===');
    console.log(lastValidMessage.content);
    console.log('=== DEBUG: MESSAGE COUNT ===');
    console.log('Total messages:', messages.length);
    console.log('Assistant messages:', messages.filter(m => m.role === 'assistant').length);

    const sponsorshipPattern = /\*\*🤝[^*]*\*\*\s*\n([\s\S]*?)(?=\n\s*\*\*|$)/;
    const toolsPattern = /\*\*🛠️[^*]*\*\*\s*\n([\s\S]*?)(?=\n\s*\*\*|$)/;

    // Extract all fields from AI message
    const extractedData: {
      title: string;
      description: string;
      meta_description: string;
      topics: string[];
      editing_tips?: string;
      video_type: string;
      video_target: string;
      video_length: string;
      video_style: string;
      creating_status: "created";
      pub_date: null;
      tags?: string[];
      thumbnail_idea?: string;
      music_suggestions?: string;
      sponsorship_opportunities?: Sponsorship[];
      tools_recommendations?: Tool[];
    } = {
      title: extractField(lastValidMessage.content, '📝 Title'),
      description: extractField(lastValidMessage.content, '📋 Description'),
      meta_description: extractField(lastValidMessage.content, '🔍 Meta Description'),
      topics: extractListField(lastValidMessage.content, '📚 Topics'),
      thumbnail_idea: extractField(lastValidMessage.content, '🖼️ Thumbnail'),
      editing_tips: extractField(lastValidMessage.content, '✂️ Editing'),
      music_suggestions: extractField(lastValidMessage.content, '🎵 Music'),
      sponsorship_opportunities: extractSponsorshipObjects(lastValidMessage.content, sponsorshipPattern),
      tools_recommendations: extractToolObjects(lastValidMessage.content, toolsPattern),
      video_type: ideaData.video_type,
      video_target: ideaData.video_target,
      video_length: ideaData.video_length,
      video_style: ideaData.video_style,
      creating_status: 'created' as const,
      pub_date: null
    };

    // Keep the original tags from the user, don't modify them
    const tagsArray = parseTags(ideaData.tags || '');
    if (tagsArray.length > 0) {
      extractedData.tags = tagsArray.slice(0, 7);
    }

    // Log the extracted data for debugging
    console.log('=== DEBUG: EXTRACTION RESULTS ===');
    Object.entries(extractedData).forEach(([key, value]) => {
      console.log(`${key}:`, value);
      if (typeof value === 'string') {
        console.log(`${key} length:`, value.length);
      }
    });

    // Verify that required fields are not empty
    const missingFields = [];
    if (!extractedData.title) missingFields.push('Title');
    if (!extractedData.description) missingFields.push('Description');
    if (!extractedData.meta_description) missingFields.push('Meta Description');
    if (!extractedData.thumbnail_idea) missingFields.push('Thumbnail');

    if (missingFields.length > 0) {
      throw new Error(`Required fields are missing: ${missingFields.join(', ')}`);
    }

    // Update the idea
    const { error: updateError } = await supabase
      .from('ideas')
      .update(extractedData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating idea:', updateError);
      throw updateError;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error saving idea:', error);
    return { 
      success: false, 
      error: error.message === 'No tokens available' 
        ? "You need tokens to save ideas. Please upgrade your plan or wait for your tokens to refresh."
        : error.message.includes('Required fields are missing')
        ? error.message
        : "Failed to save the idea"
    };
  }
};

export const deleteIdea = async (id: string): Promise<{ success: boolean, error?: string }> => {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting idea:', error);
    return { success: false, error: "Failed to delete the idea" };
  }
};

export const fetchIdeaData = async (id: string): Promise<{ data: IdeaData | null, error?: string }> => {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return { data };
  } catch (error: any) {
    console.error('Error fetching idea:', error);
    return { data: null, error: error.message };
  }
};

export const fetchUserProfile = async (): Promise<{ data: ProfileData | null, error?: string }> => {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    // Verifichiamo che l'utente abbia almeno un ID
    if (!data?.id) {
      throw new Error('Invalid user profile data');
    }

    // Recupera i token disponibili per l'utente per il tool 'ideas'
    const { data: tokens, error: tokensError } = await supabase
      .from('tokens')
      .select('base_tokens, paid_tokens')
      .eq('tool', 'ideas')
      .single();

    let tokens_available = 0;
    if (!tokensError && tokens) {
      tokens_available = (tokens.base_tokens || 0) + (tokens.paid_tokens || 0);
    }

    return { data: { ...data, tokens_available } };
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return { data: null, error: error.message };
  }
}; 


export const fetchScriptData = async (id: string): Promise<{ data: ScriptData | null, error?: string }> => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return { data };
  } catch (error: any) {
    console.error('Error fetching script:', error);
    return { data: null, error: error.message };
  }
}


export const deleteScript = async (id: number): Promise<{ success: boolean; error?: string }> => {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from('scripts')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting script:', error);
    return { success: false, error: error.message };
  }
}