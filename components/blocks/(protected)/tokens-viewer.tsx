import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Info, Coins } from 'lucide-react'
import React from 'react'

const TokenViewer = ({ tokens }: { tokens: any }) => {
	// Verifica che tokens sia un array
	const tokenArray = Array.isArray(tokens) ? tokens : [];

	// Calcola i token per le idee
	const ideasTokens = tokenArray.find(t => t.tool === 'ideas');

	const ideasTotal = (ideasTokens?.base_tokens || 0) + (ideasTokens?.paid_tokens || 0);

	// Calcola i token per gli scripts
	const scriptsTokens = tokenArray.find(t => t.tool === 'scripts');

	const scriptsTotal = (scriptsTokens?.base_tokens || 0) + (scriptsTokens?.paid_tokens || 0);

	// Calcola il totale generale
	const totalTokens = ideasTotal + scriptsTotal;

	return (
		<div className='rounded-3xl border border-neutral-200 bg-white transition-all duration-200 p-4 flex items-center justify-between gap-2 group-data-[collapsible=icon]:p-2'>
			<div className='flex items-center gap-3'>
				<div className='rounded-full p-1.5 group-data-[collapsible=icon]:hidden border border-neutral-300'>
					<Coins className='w-4 h-4 text-black' />
				</div>
				<div className='flex flex-col group-data-[collapsible=icon]:hidden'>
					<span className='text-xs text-neutral-500 font-medium'>Available Tokens</span>
					<span className='text-base font-bold text-neutral-800'>{totalTokens}</span>
				</div>
				<span className='text-base font-bold text-neutral-800 group-data-[collapsible=icon]:block pl-0.5 hidden'>{totalTokens}</span>
			</div>
			
			<DropdownMenu>
				<DropdownMenuTrigger className='rounded-full hover:bg-neutral-100 p-1.5 transition-colors'>
					<Info className='w-4 h-4 text-neutral-500 group-data-[collapsible=icon]:hidden' />
				</DropdownMenuTrigger>
				<DropdownMenuContent side="right" align="start" className='p-5 rounded-2xl space-y-3 bg-white shadow-lg border-neutral-200'>
					<div className='space-y-1.5'>
						<h4 className='font-semibold text-neutral-800'>Available Tokens</h4>
						<p className='text-sm text-neutral-600'>You have <span className='font-medium text-neutral-800'>{totalTokens}</span> tokens to use</p>
					</div>
					<Separator className='bg-neutral-200' />
					<div className='space-y-2'>
						<h4 className='font-semibold text-neutral-800'>Token Distribution</h4>
						<ul className='text-sm space-y-2'>
							<li className='flex items-center gap-2'>
								<div className='w-2 h-2 rounded-full bg-blue-500'></div>
								<span className='text-neutral-600'>Ideas: <span className='font-medium text-neutral-800'>{ideasTotal}</span> tokens</span>
							</li>
							<li className='flex items-center gap-2'>
								<div className='w-2 h-2 rounded-full bg-green-500'></div>
								<span className='text-neutral-600'>Scripts: <span className='font-medium text-neutral-800'>{scriptsTotal}</span> tokens</span>
							</li>
						</ul>
					</div>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}

export default TokenViewer