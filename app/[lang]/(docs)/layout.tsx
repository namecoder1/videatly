import { getDictionary } from '@/dictionaries'
import DocsLayout from './layout-client'

export default async function ServerDocsLayout({
	children,
	params,
}: {
	children: React.ReactNode
	params: { lang: string }
}) {
	const dict = await getDictionary(params.lang)

	return (
		<DocsLayout params={{ dict }}>
			{children}
		</DocsLayout>
	)
}