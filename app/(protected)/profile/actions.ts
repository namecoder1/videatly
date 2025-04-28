import { createClient } from "@/utils/supabase/client"

export type ProfileFormData = {
  yt_username: string
  content_style: string
  video_length: string
  target_interest: string
  content_type: string
  experience_level: string
}

export const fetchUserProfile = async (userId: string) => {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', userId)
    .single()
    
  if (error) {
    throw error
  }
  
  return {
    yt_username: data?.yt_username || '',
    content_style: data?.content_style || '',
    video_length: data?.video_length || '',
    target_interest: data?.target_interest || '',
    content_type: data?.content_type || '',
    experience_level: data?.experience_level || ''
  }
}

export const updateUserProfile = async (userId: string, formData: ProfileFormData, originalData: ProfileFormData) => {
  const supabase = createClient()
  
  // Create an object with only the fields that have been changed
  const updatedFields: Record<string, string> = {}
  
  // Compare current form data with original data
  Object.keys(formData).forEach(key => {
    const typedKey = key as keyof ProfileFormData
    if (formData[typedKey] !== originalData[typedKey]) {
      updatedFields[key] = formData[typedKey]
    }
  })
  
  // Only proceed if there are changes
  if (Object.keys(updatedFields).length === 0) {
    return { success: false, message: 'No changes detected' }
  }
  
  const { data, error } = await supabase
    .from('users')
    .update(updatedFields)
    .eq('auth_user_id', userId)
    
  if (error) {
    throw error
  }
  
  return { success: true, data }
} 