import { toast } from "@/hooks/use-toast"
import { Tool, Sponsorship } from "@/types/types"
import { createClient } from "@/utils/supabase/client"


const updateTools = async (tools: Tool[], setFormData: (prev: any) => void, id: string) => {
  const supabase = createClient()
  try {
    const { error } = await supabase
      .from('ideas')
      .update({ tools_recommendations: tools })
      .eq('id', id)

    if (error) {
      console.error('Error updating tools:', error)
      toast({
        title: 'Error updating tools',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      setFormData((prev: any) => ({ ...prev, tools_recommendations: tools }))
      toast({
        title: 'Tools updated',
        description: 'Your tools have been updated successfully',
        variant: 'success'
      })
    }
  } catch (err) {
    console.error('Error updating tools:', err)
    toast({
      title: 'Error updating tools',
      description: 'An unexpected error occurred',
      variant: 'destructive',
    })
  }
}

const updateSponsorships = async (sponsorships: Sponsorship[], setFormData: (prev: any) => void, id: string) => {
  const supabase = createClient()
  try {
    const { error } = await supabase
      .from('ideas')
      .update({ sponsorship_opportunities: sponsorships })
      .eq('id', id)

    if (error) {
      console.error('Error updating sponsorships:', error)
      toast({
        title: 'Error updating sponsorships',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      setFormData((prev: any) => ({ ...prev, sponsorship_opportunities: sponsorships }))
      toast({
        title: 'Sponsorships updated',
        description: 'Your sponsorships have been updated successfully',
        variant: 'success'
      })
    }
  } catch (err) {
    console.error('Error updating sponsorships:', err)
    toast({
      title: 'Error updating sponsorships',
      description: 'An unexpected error occurred',
      variant: 'destructive',
    })
  }
}


export { updateTools, updateSponsorships }