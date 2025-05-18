'use client'

import { VideoContentStyle, VideoLength, VideoTargetInterest, VideoType, ExperienceLevel } from "@/types/enum"
import CustomIcon from '@/components/ui/custom-icon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Save, Youtube, HelpCircle, Languages, Video, TargetIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { createClient } from "@/utils/supabase/client"
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { fetchUserProfile, updateUserProfile, type ProfileFormData } from './actions'

import SimpleTranslatableSelect from "@/components/blocks/(protected)/simple-translatable-select"
import Loader from "@/components/blocks/loader"
import { useDictionary } from '@/app/context/dictionary-context'
import CustomLink from "@/components/blocks/custom-link"

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
    experience_level: '',
    spoken_language: ''
  })
  const [originalData, setOriginalData] = useState<ProfileFormData>({
    yt_username: '',
    content_style: '',
    video_length: '',
    target_interest: '',
    content_type: '',
    experience_level: '',
    spoken_language: ''
  })

  const dict = useDictionary()

  // Debug per i valori degli enum - solo per sviluppo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const targetInterestValues = Object.values(VideoTargetInterest);
      console.log("VideoTargetInterest values:", targetInterestValues);
      
      // Controlla se i valori dell'enum corrispondono a quelli aspettati nel componente
      console.log("Target interest field state:", formData.target_interest);
    }
  }, [formData.target_interest]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  useEffect(() => {
    const fetchUserAndProfileData = async () => {
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

          // Fetch additional profile data
          const { data: userData } = await supabase
            .from('users')
            .select('spoken_language')
            .eq('auth_user_id', user.id)
            .single()
          
          // Only show card if userData is null or spoken_language is null/empty string
          setProfileData(userData || { spoken_language: null })
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast({
          title: dict.profilePage.toast.fetchError[0],
          description: dict.profilePage.toast.fetchError[1],
          variant: 'destructive'
        })
        setProfileData({ spoken_language: null })
      } finally {
        setLoading(false)
      }
    }
    fetchUserAndProfileData()
  }, [supabase, toast, dict.profilePage.toast.fetchError])
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!user) return
    
    try {
      const result = await updateUserProfile(user.id, formData, originalData)
      
      if (!result.success) {
        toast({
          title: dict.profilePage.toast.noChanges[0],
          description: dict.profilePage.toast.noChanges[1]
        })
        return
      }
      
      // Update original data to reflect the new state
      setOriginalData({...formData})
      // Reload the page to reflect changes
      router.refresh()
      toast({
        title: dict.profilePage.toast.updateSuccess[0],
        description: dict.profilePage.toast.updateSuccess[1],
        variant: 'success'
      })
    } catch (error) {
      console.error('Error in submission:', error)
      toast({
        title: dict.profilePage.toast.updateError[0],
        description: dict.profilePage.toast.updateError[1],
        variant: 'destructive'
      })
    }
  }

  if (loading) return <Loader position='full' />

	return (
		<section>
			<div className='flex flex-col'>
        <div className='flex items-center gap-3'>
          <CustomIcon icon={<User />} color='red' />
          <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>{dict.profilePage.title}</h1>
        </div>
        <Separator className='my-4' />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <Card className="shadow-sm h-fit">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Youtube className="h-5 w-5 text-red-500" />
                {dict.profilePage.youtubeProfileSettings.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="mt-2"> 
              <form onSubmit={handleSubmit}>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                  <div className='flex flex-col gap-2'>
                    <Label htmlFor='yt_username'>{dict.profilePage.youtubeProfileSettings.yt_username}</Label>
                    <Input id='yt_username' placeholder={dict.profilePage.youtubeProfileSettings.yt_usernamePlaceholder} name='yt_username' value={formData.yt_username} onChange={handleChange} />
                  </div>
                  

                  <SimpleTranslatableSelect
                    name="contentStyle"
                    label={dict.profilePage.youtubeProfileSettings.contentStyle}
                    placeholder={dict.profilePage.youtubeProfileSettings.contentStylePlaceholder}
                    searchPlaceholder={dict.profilePage.youtubeProfileSettings.contentStyleSearchPlaceholder}
                    options={Object.values(VideoContentStyle)}
                    value={formData.content_style}
                    onChange={(value) => handleSelectChange("content_style", value)}
                    required
                  />

                  <SimpleTranslatableSelect
                    name="videoLength"
                    label={dict.profilePage.youtubeProfileSettings.videoLength}
                    placeholder={dict.profilePage.youtubeProfileSettings.videoLengthPlaceholder}
                    searchPlaceholder={dict.profilePage.youtubeProfileSettings.videoLengthSearchPlaceholder}
                    options={Object.values(VideoLength)}
                    value={formData.video_length}
                    onChange={(value) => handleSelectChange("video_length", value)}
                    required
                  />
                  
                  <SimpleTranslatableSelect
                    name="targetInterest"
                    label={dict.profilePage.youtubeProfileSettings.targetInterest}
                    placeholder={dict.profilePage.youtubeProfileSettings.targetInterestPlaceholder}
                    searchPlaceholder={dict.profilePage.youtubeProfileSettings.targetInterestSearchPlaceholder}
                    options={Object.values(VideoTargetInterest)}
                    value={formData.target_interest}
                    onChange={(value) => handleSelectChange("target_interest", value)}
                    required
                  />
                  
                  <SimpleTranslatableSelect
                    name="videoType"
                    label={dict.profilePage.youtubeProfileSettings.videoType}
                    placeholder={dict.profilePage.youtubeProfileSettings.videoTypePlaceholder}
                    searchPlaceholder={dict.profilePage.youtubeProfileSettings.videoTypeSearchPlaceholder}
                    options={Object.values(VideoType)}
                    value={formData.content_type}
                    onChange={(value) => handleSelectChange("content_type", value)}
                    required
                  />
                  
                  <SimpleTranslatableSelect
                    name="experienceLevel"
                    label={dict.profilePage.youtubeProfileSettings.experienceLevel}
                    placeholder={dict.profilePage.youtubeProfileSettings.experienceLevelPlaceholder}
                    searchPlaceholder={dict.profilePage.youtubeProfileSettings.experienceLevelSearchPlaceholder}
                    options={Object.values(ExperienceLevel)}
                    value={formData.experience_level}
                    onChange={(value) => handleSelectChange("experience_level", value)}
                    required
                  />

                </div>
                
                <div className="flex justify-end mt-6 sm:mt-8">
                  <Button type="submit" variant='black' className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {dict.profilePage.youtubeProfileSettings.submit}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>


          {profileData && !loading && (!profileData.spoken_language || profileData.spoken_language === '') && (
            <Card className='mt-4 bg-blue-50/50 border-blue-200'>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Languages size={20} className="text-blue-600" />
                  {dict.profilePage.youtubeProfileSettings.languageSettings.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className='text-sm text-muted-foreground'>
                  {dict.profilePage.youtubeProfileSettings.languageSettings.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end pt-0">
                <Button 
                  variant='default' 
                  className="bg-blue-600 hover:bg-blue-700"
                  asChild
                >
                  <CustomLink href='/settings'>
                    <Languages className="mr-2 h-4 w-4" />
                    {dict.profilePage.youtubeProfileSettings.languageSettings.button}
                  </CustomLink>
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
        
      <Card className=" lg:h-fit">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            {dict.profilePage.youtubeProfileSettings.info.title}
          </CardTitle>
          <CardDescription className="text-sm">
            {dict.profilePage.youtubeProfileSettings.info.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-2">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="font-medium text-base sm:text-lg mb-1 sm:mb-2 flex items-center gap-2">
                <span className="text-blue-600 p-1.5 rounded-xl bg-blue-100">
                  <Video className="w-5 h-5" />
                </span>
                {dict.profilePage.youtubeProfileSettings.info.fields[0].title}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {dict.profilePage.youtubeProfileSettings.info.fields[0].description}
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium text-base sm:text-lg mb-1 sm:mb-2 flex items-center gap-2">
                <span className="text-orange-600 p-1.5 rounded-xl bg-orange-100">
                  <TargetIcon className="w-5 h-5" />
                </span>
                {dict.profilePage.youtubeProfileSettings.info.fields[1].title}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {dict.profilePage.youtubeProfileSettings.info.fields[1].description}
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium text-base sm:text-lg mb-1 sm:mb-2 flex items-center gap-2">
                <span className="text-green-600 p-1.5 rounded-xl bg-green-100">
                  <Video className="w-5 h-5" />
                </span>
                {dict.profilePage.youtubeProfileSettings.info.fields[2].title}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {dict.profilePage.youtubeProfileSettings.info.fields[2].description}
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