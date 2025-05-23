import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Info, Coins, Lightbulb, NotepadText } from 'lucide-react'
import { useTokens, initializeTokenListener } from '@/hooks/use-tokens'
import React, { useEffect } from 'react'

const TokenViewer = ({ dict }: { dict: any }) => {
	const { tokens } = useTokens()

	useEffect(() => {
		// Initialize real-time token listener
		const cleanup = initializeTokenListener();
		return () => {
			cleanup();
		};
	}, []);

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
		<div className='rounded-3xl border border-neutral-200 bg-white transition-all duration-200 p-4 flex items-center justify-between gap-2 group-data-[collapsible=icon]:hidden'>
			<div className='flex items-center gap-3'>
				<div className='rounded-full p-1.5 group-data-[collapsible=icon]:hidden border border-neutral-300'>
					<Coins className='w-4 h-4 text-black' />
				</div>
				<div className='flex flex-col group-data-[collapsible=icon]:hidden'>
					<span className='text-xs text-neutral-500 font-medium'>{dict?.tokens?.span}</span>
					<span className='text-base font-bold text-neutral-800'>{totalTokens}</span>
				</div>
			</div>
			
			<DropdownMenu>
				<DropdownMenuTrigger className='rounded-full hover:bg-neutral-100 p-1.5 transition-colors'>
					<Info className='w-4 h-4 text-neutral-500 group-data-[collapsible=icon]:hidden' />
				</DropdownMenuTrigger>
				<DropdownMenuContent side="right" align="start" className='p-5 rounded-2xl space-y-3 bg-white shadow-lg border-neutral-200'>
					<div className='space-y-1.5'>
						<h4 className='font-semibold text-neutral-800'>{dict?.tokens?.span}</h4>
						<p className='text-sm text-neutral-600'>{dict?.tokens?.description1}<span className='font-medium text-neutral-800'>{totalTokens}</span>{dict?.tokens?.description2}</p>
					</div>
					<Separator className='bg-neutral-200' />
					<div className='space-y-2'>
						<h4 className='font-semibold text-neutral-800'>{dict?.tokens?.span2}</h4>
						<ul className='text-sm space-y-2'>
							<li className='flex items-center gap-2 p-2 rounded-xl bg-yellow-100 border border-yellow-500'>
								<Lightbulb className='text-yellow-500' size={14} />
								<span className='text-neutral-600 flex ic justify-between w-full'>{dict?.tokens?.ideas}<span className='font-medium text-neutral-800 flex items-center gap-1'>{ideasTotal}<Coins className='w-3 h-3 text-black' /></span></span>
							</li>
							<li className='flex items-center gap-2 p-2 rounded-xl bg-blue-100 border border-blue-500'>
								<NotepadText className='text-blue-500' size={14} />
								<span className='text-neutral-600 flex ic justify-between w-full'>{dict?.tokens?.scripts}<span className='font-medium text-neutral-800 flex items-center gap-1'>{scriptsTotal}<Coins className='w-3 h-3 text-black' /></span></span>
							</li>
						</ul>
					</div>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}

export default TokenViewer