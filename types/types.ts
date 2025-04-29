export interface TagsInputProps {
	name: string;
	label: string;
	placeholder: string;
	description?: string;
}

export interface SearchableSelectProps {
	name: string;
	label: string;
	placeholder: string;
	searchPlaceholder: string;
	options: string[];
	required?: boolean;
	value?: string;
	onChange?: (value: string) => void;
}


// Define ProfileData interface since the import doesn't exist
export interface ProfileData {
  auth_user_id: string;
  name?: string;
  email?: string;
  subscription?: string;
  experience_level?: string;
  youtube_username?: string;
  content_style?: string;
  videos_length?: string;
  pub_frequency?: string;
  target_interest?: string;
  video_type?: string;
  tokens_available?: number;
  spoken_language?: string;
}

// Update IdeaData interface to match the database schema
export interface IdeaData {
  id: number;
  created_at: string;
  user_id: string;
  pub_date?: string;
  tags?: string[];
  editing_tips?: string;
  description: string;
  video_type: string;
  video_target: string;
  video_length: string;
  video_style: string;
  title: string;
  creating_status: string;
  text?: string;
  thumbnail_idea?: string;
  meta_description?: string;
  topics?: string[];
}

export interface Tool {
	name: string;
	url: string;
}

export interface Sponsorship {
	name: string;
	description: string;
	url?: string;
}

export type ScriptBoxProps = {
	idea_id: string;
	content: string;
	tone: string;
	verbosity: string;
	target: string;
	type: string;
	duration: string;
	persona: string;
	structure: string;
}