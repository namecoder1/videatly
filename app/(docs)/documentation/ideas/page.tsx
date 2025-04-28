import DocLayout from '@/components/blocks/(public)/doc-layout'
import { Lightbulb } from 'lucide-react'
import React from 'react'


const breadcrumbs = [
	{ label: 'Home', href: '/' },
	{ label: 'Documentation', href: '/documentation' },
	{ label: 'Ideas', href: '/documentation/ideas' },
]

const sections = [
	{ id: 'understanding-ideas', title: 'Understanding Ideas' },
	{ id: 'creating-ideas', title: 'Creating Ideas' },
	{ id: 'managing-ideas', title: 'Managing Ideas' },
	{ id: 'advices-from-the-experts', title: 'Advices from the Experts' },
]


const Ideas = () => {
	return (
		<DocLayout
			icon={<Lightbulb />}
			title="Ideas"
			breadcrumbs={breadcrumbs}
			sections={sections}
		>
			<p>ciao</p>
		</DocLayout>
	)
}

export default Ideas