export interface TagsInputProps {
	name: string;
	label: string;
	placeholder: string;
	description?: string;
	addTags: string;
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
  id: string;
  auth_user_id: string;
  email: string;
  subscription: 'free' | 'pro' | 'ultra';
  subscription_status?: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'payment_failed';
  subscription_start?: string | null;
  subscription_end?: string | null;
  subscription_renewal?: boolean | null;
  created_at?: string;
  updated_at?: string;
  name?: string;
  experience_level?: string;
  youtube_username?: string;
  content_style?: string;
  videos_length?: string;
  pub_frequency?: string;
  target_interest?: string;
  video_type?: string;
  tokens_available?: number;
  spoken_language?: string;
  pending_subscription?: 'free' | 'pro' | 'ultra' | null;
}

// Update IdeaData interface to match the database schema
export interface IdeaData {
  id: string;
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
  id: string;
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
	id: string;
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
  priority: string;
  idea_id: string;
  script_id?: string;
  user_id: string;
  status: string;
  start_date: string;
  end_date: string;
  category: string;
  created_at?: string;
}

export interface IdeaWithScripts extends IdeaData {
  scripts: ScriptData[];
}



export interface TodoFormProps extends React.ComponentProps<"form"> {
  onSubmit: (formData: any) => void;
  mode: 'create' | 'update';
  todo?: TodoProps;
  handleDelete: () => void;
  ideas?: IdeaWithScripts[];
  onIdeaSelect?: (idea: IdeaWithScripts) => void;
  ideaId: string;
  dict: any;
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  className?: string;
  context?: 'calendar' | 'production';
}

interface PaymentMetadata {
  type: 'subscription' | 'tokens';
  price_id: string;
  invoice_pdf: string;
  invoice_number: string;
  hosted_invoice_url?: string;
}

export interface PaymentWithMetadata {
  id: string;
  auth_user_id: string;
  email: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  product: string;
  stripe_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_invoice_id: string;
  stripe_payment_intent_id: string;
  created_at: string;
  metadata: PaymentMetadata;
}

export interface ProductionData {
  id: string;
  created_at: string;
  idea_id: string;
  script_id: string;
  user_id: string;
  status: string;
  video_url: string;
}

export interface UserData {
  name?: string;
  email?: string;
  accessToken?: string;
  tokenExpiry?: number;
  refreshToken?: string;
}

export interface VideoData {
  id: string;
  title: string;
  publishedAt: string;
  thumbnails?: any;
  analytics?: {
    views: number;
    likes: number;
    comments: number;
    estimatedMinutesWatched: number;
    averageViewDuration: number;
  };
}

export interface CachedVideoData {
  videos: VideoData[];
  timestamp: number;
}