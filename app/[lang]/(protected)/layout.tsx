import { getDictionary } from '@/dictionaries'
import ProtectedLayout from './layout-client'

export default async function ServerProtectedLayout({
	children,
	params,
}: {
	children: React.ReactNode
	params: { lang: string }
}) {
	const dict = await getDictionary(params.lang)
	
	// Aggiungiamo la lingua al dizionario per renderla disponibile ovunque
	const enhancedDict = { 
		...dict, 
		locale: params.lang 
	};

	return (
		<ProtectedLayout params={{ dict: enhancedDict, lang: params.lang }}>
			{children}
		</ProtectedLayout>
	)
}