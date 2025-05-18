import { ExternalLink } from "lucide-react"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sponsorship } from "@/types/types"
import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"


const SponsorshipManager = ({ 
	sponsorships, 
	onChange,
	dict
}: { 
	sponsorships: Sponsorship[], 
	onChange: (sponsorships: Sponsorship[]) => Promise<void>,
	dict: any
}) => {
	const [newSponsorship, setNewSponsorship] = useState<Sponsorship>({ name: '', description: '', url: '' })
	const [isDialogOpen, setIsDialogOpen] = useState(false)

	const handleAddSponsorship = async () => {
		if (newSponsorship.name && newSponsorship.description) {
			const sponsorshipToAdd: Sponsorship = {
				name: newSponsorship.name,
				description: newSponsorship.description,
				url: newSponsorship.url
			}
			const updatedSponsorships = [...sponsorships, sponsorshipToAdd]
			await onChange(updatedSponsorships)
			setNewSponsorship({ name: '', description: '', url: '' })
			setIsDialogOpen(false)
		}
	}

	const handleRemoveSponsorship = async (index: number) => {
		const newSponsorships = sponsorships.filter((_, i) => i !== index)
		await onChange(newSponsorships)
	}

	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between'>
				<Label className='text-md font-medium'>{dict.ideaPage.details.fields.sponsorships}</Label>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button variant="ghost" size="sm">
							<Plus size={16} className="mr-2" /> {dict.ideaPage.details.fields.addSponsorship}
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{dict.ideaPage.details.fields.addNewSponsorship}</DialogTitle>
						</DialogHeader>
						<div className='space-y-4 mt-4'>
							<div className='space-y-2'>
								<Label htmlFor='sponsorName'>{dict.ideaPage.details.fields.sponsorshipName}</Label>
								<Input
									id='sponsorName'
									value={newSponsorship.name}
									onChange={(e) => setNewSponsorship({ ...newSponsorship, name: e.target.value })}
									placeholder={dict.ideaPage.details.fields.sponsorshipNamePlaceholder}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='sponsorDescription'>{dict.ideaPage.details.fields.sponsorshipDescription}</Label>
								<Textarea
									id='sponsorDescription'
									value={newSponsorship.description}
									onChange={(e) => setNewSponsorship({ ...newSponsorship, description: e.target.value })}
									placeholder={dict.ideaPage.details.fields.sponsorshipDescriptionPlaceholder}
									className='h-[100px]'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='sponsorUrl'>{dict.ideaPage.details.fields.sponsorshipUrl}</Label>
								<Input
									id='sponsorUrl'
									value={newSponsorship.url}
									onChange={(e) => setNewSponsorship({ ...newSponsorship, url: e.target.value })}
									placeholder={dict.ideaPage.details.fields.sponsorshipUrlPlaceholder}
								/>
							</div>
							<Button 
								onClick={handleAddSponsorship} 
								className='w-full'
								disabled={!newSponsorship.name || !newSponsorship.description}
							>
								{dict.ideaPage.details.fields.addSponsorship}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				{Array.isArray(sponsorships) && sponsorships.length > 0 ? (
					sponsorships.map((sponsorship, index) => (
						<Card key={index} className='p-4 relative group'>
							<Button
								variant="ghost"
								size="sm"
								className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'
								onClick={() => handleRemoveSponsorship(index)}
							>
								<X size={14} />
							</Button>
							<div className='flex items-center justify-between mb-2'>
								{sponsorship.url ? (
									<Link href={`https://${sponsorship.url}` || ''} target='_blank' className="hover:underline flex items-center gap-2 group transition-all">
										<ExternalLink size={16} className="hidden group-hover:block transition-all group-hover:translate-x-1" />
										<h3 className='font-semibold text-base'>{sponsorship.name}</h3>
									</Link>
								) : (
									<h3 className='font-semibold text-base'>{sponsorship.name}</h3>
								)}
							</div>
							<p className='text-muted-foreground text-sm'>{sponsorship.description}</p>
						</Card>
					))
				) : (
					<p className="text-muted-foreground text-sm col-span-2">{dict.ideaPage.details.fields.noSponsorships}</p>
				)}
			</div>
		</div>
	)
}

export default SponsorshipManager