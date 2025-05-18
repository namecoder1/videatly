import { toast } from "@/hooks/use-toast"
import { Tool, Sponsorship } from "@/types/types"
import { createClient } from "@/utils/supabase/client"


const updateTools = async (tools: Tool[], setFormData: (prev: any) => void, id: string, dict: any) => {
  const supabase = createClient()
  try {
    const { error } = await supabase
      .from('ideas')
      .update({ tools_recommendations: tools })
      .eq('id', id)

    if (error) {
      console.error('Error updating tools:', error)
      toast({
        title: dict.ideaPage?.toast?.updateToolsError?.title,
        description: dict.ideaPage?.toast?.updateToolsError?.description,
        variant: 'destructive',
      })
    } else {
      setFormData((prev: any) => ({ ...prev, tools_recommendations: tools }))
      toast({
        title: dict.ideaPage?.toast?.updateToolsSuccess?.title,
        description: dict.ideaPage?.toast?.updateToolsSuccess?.description,
        variant: 'success'
      })
    }
  } catch (err) {
    console.error('Error updating tools:', err)
    toast({
      title: dict.ideaPage?.toast?.updateToolsError?.title,
      description: dict.ideaPage?.toast?.updateToolsError?.description,
      variant: 'destructive',
    })
  }
}

const updateSponsorships = async (sponsorships: Sponsorship[], setFormData: (prev: any) => void, id: string, dict: any) => {
  const supabase = createClient()
  try {
    const { error } = await supabase
      .from('ideas')
      .update({ sponsorship_opportunities: sponsorships })
      .eq('id', id)

    if (error) {
      console.error('Error updating sponsorships:', error)
      toast({
        title: dict.ideaPage?.toast?.updateSponsorshipsError?.title,
        description: dict.ideaPage?.toast?.updateSponsorshipsError?.description,
        variant: 'destructive',
      })
    } else {
      setFormData((prev: any) => ({ ...prev, sponsorship_opportunities: sponsorships }))
      toast({
        title: dict.ideaPage?.toast?.updateSponsorshipsSuccess?.title,
        description: dict.ideaPage?.toast?.updateSponsorshipsSuccess?.description,
        variant: 'success'
      })
    }
  } catch (err) {
    console.error('Error updating sponsorships:', err)
    toast({
      title: dict.ideaPage?.toast?.updateSponsorshipsError?.title,
      description: dict.ideaPage?.toast?.updateSponsorshipsError?.description,
      variant: 'destructive',
    })
  }
}


export { updateTools, updateSponsorships }