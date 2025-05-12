import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tool } from "@/types/types"
import { Plus, X } from "lucide-react"
import { ExternalLink } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const ToolsManager = ({ 
	tools, 
	onChange
}: { 
	tools: Tool[], 
	onChange: (tools: Tool[]) => Promise<void>
}) => {
	const [newTool, setNewTool] = useState<Tool>({ name: '', description: '', url: '' })
	const [isDialogOpen, setIsDialogOpen] = useState(false)

	const handleAddTool = async () => {
		if (newTool.name && newTool.description) {
			const toolToAdd: Tool = {
				name: newTool.name,
				description: newTool.description,
				url: newTool.url
			}
			const updatedTools = [...tools, toolToAdd]
			await onChange(updatedTools)
			setNewTool({ name: '', description: '', url: '' })
			setIsDialogOpen(false)
		}
	}

	const handleRemoveTool = async (index: number) => {
		const newTools = tools.filter((_, i) => i !== index)
		await onChange(newTools)
	}

	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between'>
				<Label className='text-md font-medium'>Tools Recommendations</Label>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button variant="ghost" size="sm">
							<Plus size={16} className="mr-2" /> Add Tool
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add New Tool</DialogTitle>
						</DialogHeader>
						<div className='space-y-4 mt-4'>
							<div className='space-y-2'>
								<Label htmlFor='toolName'>Tool Name</Label>
								<Input
									id='toolName'
									value={newTool.name}
									onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
									placeholder="Enter tool name"
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='toolDescription'>Description</Label>
								<Textarea
									id='toolDescription'
									value={newTool.description}
									onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
									placeholder="Enter tool description"
									className='h-[100px]'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='toolUrl'>URL (optional)</Label>
								<Input
									id='toolUrl'
									value={newTool.url}
									onChange={(e) => setNewTool({ ...newTool, url: e.target.value })}
									placeholder="Enter tool URL"
								/>
							</div>
							<Button 
								onClick={handleAddTool} 
								className='w-full'
								disabled={!newTool.name || !newTool.description}
							>
								Add Tool
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
				{Array.isArray(tools) && tools.length > 0 ? (
					tools.map((tool, index) => (
						<Card key={index} className='p-4 relative group'>
							<Button
								variant="ghost"
								size="sm"
								className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'
								onClick={() => handleRemoveTool(index)}
							>
								<X size={14} />
							</Button>
							<div className='flex items-center justify-between mb-2'>
								{tool.url ? (
									<Link href={tool.url} target='_blank' className="hover:underline flex items-center gap-2 group transition-all">
										<ExternalLink size={16} className="hidden group-hover:block transition-all group-hover:translate-x-1" />
										<h3 className='font-semibold text-base'>{tool.name}</h3>
									</Link>
								) : (
									<h3 className='font-semibold text-base'>{tool.name}</h3>
								)}
							</div>
							<p className='text-muted-foreground text-sm'>{tool.description}</p>
						</Card>
					))
				) : (
					<p className="text-muted-foreground text-sm col-span-2">No tools recommendations added yet.</p>
				)}
			</div>
		</div>
	)
}

export default ToolsManager