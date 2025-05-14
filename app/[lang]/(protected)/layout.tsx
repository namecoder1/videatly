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

	return (
		<ProtectedLayout params={{ dict }}>
			{children}
		</ProtectedLayout>
	)
}