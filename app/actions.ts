import { createClient } from '@/utils/supabase/client';
import { IdeaData, ProfileData } from '@/types/types';
import { parseTags } from '@/utils/supabase/utils';

export const extractField = (message: string, fieldName: string): string => {
  // Log the field we're trying to extract
  console.log('Extracting field:', fieldName);

  // Create a regex that matches the exact field name with emoji
  const regex = new RegExp(
    `\\*\\*${fieldName}\\*\\*\\s*\\n([^\\n]*(?:\\n(?!\\*\\*[^*]+\\*\\*)[^\\n]*)*)`,
    'i'
  );
  
  const match = message.match(regex);
  
  // Log the match result
  console.log('Match result for', fieldName, ':', match ? match[1] : 'no match');

  if (!match) return '';
  
  // Clean up the extracted content
  return match[1]
    .trim()
    .replace(/\*\*/g, '')         // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic
    .replace(/`([^`]+)`/g, '$1')   // Remove code
    .replace(/^[-•*]\s*/gm, '')    // Remove bullet points
    .replace(/^\s+|\s+$/gm, '');   // Trim each line
};

export const extractListField = (message: string, fieldName: string): string[] => {
  const regex = new RegExp(
    `\\*\\*${fieldName}\\*\\*\\s*\\n([^\\n]*(?:\\n(?!\\*\\*[^*]+\\*\\*)[^\\n]*)*)`,
    'i'
  );
  const match = message.match(regex);
  if (!match) return [];

  const lines = match[1].split('\n');
  const items: string[] = [];
  for (const line of lines) {
    // escludi <data> e linee vuote
    if (line.trim().startsWith('<data') || !line.trim()) continue;
    // tronca alla prima riga che sembra una frase di chiusura (inizia con maiuscola e non è una lista)
    if (!/^[-•*]/.test(line.trim()) && /^[A-Z]/.test(line.trim())) break;
    items.push(
      line
        .replace(/\*\*/g, '')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/^[-•*]\s*/g, '')
        .trim()
    );
  }
  return items;
};

export const checkMessageForSave = (message: { role: string, content: string }): boolean => {
  // Log the incoming message for debugging
  console.log('Checking message:', {
    role: message.role,
    contentPreview: message.content.substring(0, 100) + '...',
    hasDataTag: message.content.includes('<data'),
    hasValueAttr: message.content.includes('value="idea-complete"')
  });

  if (message.role !== 'assistant') {
    console.log('Not an assistant message');
    return false;
  }

  // Check for the specific marker that indicates a complete idea
  const hasCompleteMarker = message.content.includes('<data value="idea-complete"');
  console.log('Has complete marker:', hasCompleteMarker);
  
  if (!hasCompleteMarker) {
    console.log('No complete marker found');
    return false;
  }

  // Verify required fields are present
  const extractedData = {
    title: extractField(message.content, '📝 Title'),
    description: extractField(message.content, '📋 Description'),
    meta_description: extractField(message.content, '🔍 Meta-Description'),
    thumbnail_idea: extractField(message.content, '🖼️ Thumbnail Concept')
  };

  // Log extracted fields
  console.log('Extracted fields:', extractedData);

  // Check if all required fields have content
  const hasRequiredFields = Object.values(extractedData).every(value => value.length > 0);
  console.log('Has all required fields:', hasRequiredFields);

  return hasRequiredFields;
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

    const assistantMessages = messages.filter(m => m.role === 'assistant');
    const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];

    if (!lastAssistantMessage) {
      throw new Error('No assistant message found');
    }

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
      sponsorship_opportunities?: string[];
      tools_recommendations?: string[];
    } = {
      title: extractField(lastAssistantMessage.content, '📝 Title'),
      description: extractField(lastAssistantMessage.content, '📋 Description'),
      meta_description: extractField(lastAssistantMessage.content, '🔍 Meta-Description'),
      topics: extractListField(lastAssistantMessage.content, '📚 List of Topics Covered'),
      thumbnail_idea: extractField(lastAssistantMessage.content, '🖼️ Thumbnail Concept'),
      editing_tips: extractField(lastAssistantMessage.content, '✂️ Editing Techniques'),
      music_suggestions: extractField(lastAssistantMessage.content, '🎵 Background Music'),
      sponsorship_opportunities: extractListField(lastAssistantMessage.content, '🤝 Sponsorship Opportunities'),
      tools_recommendations: extractListField(lastAssistantMessage.content, '🛠️ Tools Recommendations'),
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
    console.log('Extracted data:', extractedData);

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