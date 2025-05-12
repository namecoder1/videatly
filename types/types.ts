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

export interface ScriptData {
  id: number;
  created_at: string;
  user_id: string;
  idea_id: string;
  content: string;
  tone: string;
  verbosity: string;
  target_audience: string;
  script_type: string;
  duration: string;
  call_to_action: boolean;
  persona: string;
  structure: string;
}

export interface Tool {
	name: string;
	url: string;
	description: string;
}

export interface Sponsorship {
	name: string;
	description: string;
	url?: string;
}

export type ScriptBoxProps = {
	id: number;
	idea_id: string;
	content: string;
	tone: string;
	verbosity: string;
	target_audience: string;
	script_type: string;
	duration: string;
	persona: string;
	structure: string;
	call_to_action: boolean;
	created_at: string;
}

export interface Token {
  tool: string;
  base_tokens: number;
  paid_tokens: number;
}

export interface ScriptSection {
  startTime: string;
  endTime: string;
  points: string[];
  isCollapsed?: boolean;
}

export interface SortableScriptSectionProps {
  section: ScriptSection;
  sectionIndex: number;
  isEditing: boolean;
  onUpdate: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
  onAddPoint: (index: number) => void;
  onRemovePoint: (sectionIndex: number, pointIndex: number) => void;
  onToggleCollapse: (index: number) => void;
}

export interface TodoProps {
  id: string;
  title: string;
  description: string;
  date: string;
  priority: string;
  idea_id: string;
  script_id: string;
  user_id: string;
  status: string;
  start_time: string;
  end_time: string;
  category: string;
}