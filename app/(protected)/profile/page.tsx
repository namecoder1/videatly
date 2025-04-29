'use client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { VideoContentStyle, VideoLength, VideoTargetInterest, VideoType, ExperienceLevel } from "@/types/enum"
import CustomIcon from '@/components/ui/custom-icon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Info, User, Save, Youtube, HelpCircle, Loader2, Languages } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { createClient } from "@/utils/supabase/client"
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { fetchUserProfile, updateUserProfile, type ProfileFormData } from './actions'
import SearchableSelect from "@/components/blocks/(protected)/searchable-select"
import Link from "next/link"

const ProfilePage = () => {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [formData, setFormData] = useState<ProfileFormData>({
    yt_username: '',
    content_style: '',
    video_length: '',
    target_interest: '',
    content_type: '',
    experience_level: ''
  })
  const [originalData, setOriginalData] = useState<ProfileFormData>({
    yt_username: '',
    content_style: '',
    video_length: '',
    target_interest: '',
    content_type: '',
    experience_level: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      try {
        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          // Fetch user profile data
          const profileData = await fetchUserProfile(user.id)
          setFormData(profileData)
          setOriginalData(profileData)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast({
          title: 'Error fetching user data',
          description: 'An error occurred while fetching your profile data',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()

    const fetchProfileData = async () => {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('spoken_language')
          .eq('auth_user_id', user?.id)
          .single()
        setProfileData(userData)
      } catch (error) {
        console.error('Error fetching profile data:', error)
        toast({
          title: 'Your language is not set',
          description: 'Please set your language in the /settings page',
          variant: 'destructive'
        })
      }
    }
    fetchProfileData()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!user) return
    
    try {
      const result = await updateUserProfile(user.id, formData, originalData)
      
      if (!result.success) {
        toast({
          title: 'No changes detected',
          description: 'No changes were made to your profile'
        })
        return
      }
      
      // Update original data to reflect the new state
      setOriginalData({...formData})
      // Reload the page to reflect changes
      router.refresh()
      toast({
        title: 'Profile updated successfully',
        description: 'Your profile data has been updated successfully',
        variant: 'success'
      })
    } catch (error) {
      console.error('Error in submission:', error)
      toast({
        title: 'Error in submission',
        description: 'An error occurred while updating your profile data',
        variant: 'destructive'
      })
    }
  }

	return (
		<section>
			<div className='flex flex-col'>
        <div className='flex items-center gap-3'>
          <CustomIcon icon={<User />} color='red' />
          <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>Profile</h1>
        </div>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">Customize your profile settings to improve your video recommendations</p>
        <Separator className='my-4 sm:my-6' />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <Card className="shadow-sm h-fit">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Youtube className="h-5 w-5 text-red-500" />
                YouTube Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin" /></div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                    <div className='flex flex-col gap-2'>
                      <Label htmlFor='yt_username'>YouTube Username</Label>
                      <Input id='yt_username' placeholder='Enter your YouTube username' name='yt_username' value={formData.yt_username} onChange={handleChange} />
                    </div>
                    

                    <SearchableSelect
                      name="contentStyle"
                      label="Content Style"
                      placeholder="Select a style"
                      searchPlaceholder="Search content style..."
                      options={Object.values(VideoContentStyle)}
                      value={formData.content_style}
                      onChange={(value) => handleSelectChange("content_style", value)}
                      required
                    />

                    <SearchableSelect
                      name="videoLength"
                      label="Video Length"
                      placeholder="Select a length"
                      searchPlaceholder="Search video length..."
                      options={Object.values(VideoLength)}
                      value={formData.video_length}
                      onChange={(value) => handleSelectChange("video_length", value)}
                      required
                    />
                    
                    <SearchableSelect
                      name="targetInterest"
                      label="Target Interest"
                      placeholder="Select a interest"
                      searchPlaceholder="Search target interest..."
                      options={Object.values(VideoTargetInterest)}
                      value={formData.target_interest}
                      onChange={(value) => handleSelectChange("target_interest", value)}
                      required
                    />
                    
                    <SearchableSelect
                      name="videoType"
                      label="Video Type"
                      placeholder="Select a type"
                      searchPlaceholder="Search video type..."
                      options={Object.values(VideoType)}
                      value={formData.content_type}
                      onChange={(value) => handleSelectChange("content_type", value)}
                      required
                    />
                    
                    
                    <SearchableSelect
                      name="experienceLevel"
                      label="Experience Level"
                      placeholder="Select a level"
                      searchPlaceholder="Search experience level..."
                      options={Object.values(ExperienceLevel)}
                      value={formData.experience_level}
                      onChange={(value) => handleSelectChange("experience_level", value)}
                      required
                    />

                  </div>
                  
                  <div className="flex justify-end mt-4 sm:mt-6">
                    <Button type="submit" className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {!profileData?.spoken_language && !loading && (
            <Card className='mt-4 bg-blue-50/50 border-blue-200'>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Languages size={20} className="text-blue-600" />
                  Language Setting Required
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className='text-sm text-muted-foreground'>
                  To personalize your experience, please set your preferred language in the settings page.
                </p>
              </CardContent>
              <CardFooter className="flex justify-end pt-0">
                <Button 
                  variant='default' 
                  className="bg-blue-600 hover:bg-blue-700"
                  asChild
                >
                  <Link href='/settings'>
                    <Languages className="mr-2 h-4 w-4" />
                    Set Language
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
        
      <Card className=" lg:h-fit">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Understanding Your Options
          </CardTitle>
          <CardDescription className="text-sm">
            A guide to help you choose the right settings for your videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="font-medium text-base sm:text-lg mb-1 sm:mb-2">Video Length</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Choose the appropriate duration for your content based on your platform and message complexity. Shorter videos work well for social media and quick engagement, while longer formats allow for more detailed exploration of topics.
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium text-base sm:text-lg mb-1 sm:mb-2">Target Interest</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                This setting helps define your video's primary purpose and audience appeal. Whether you're looking to entertain, educate, inspire, or raise awareness, selecting the right target interest ensures your content resonates with your intended audience and achieves your communication goals.
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium text-base sm:text-lg mb-1 sm:mb-2">Video Type</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                The format structure determines how your content is presented to viewers. Different video types serve different purposes - from sharing knowledge and personal experiences to providing analysis or clarifying complex topics. Choose a format that best delivers your message and matches your content creation strengths.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
		</section>
	)
}

export default ProfilePage