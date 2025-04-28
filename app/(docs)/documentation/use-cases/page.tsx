import DocLayout from '@/components/blocks/(public)/doc-layout'
import { ListCheck } from 'lucide-react'
import React from 'react'

const breadcrumbs = [
	{ label: 'Home', href: '/' },
	{ label: 'Documentation', href: '/documentation' },
	{ label: 'Use Cases', href: '/documentation/use-cases' },
]

const sections = [
	{ id: 'introduction', title: 'Introduction' },
	{ id: 'account-setup', title: 'Account Setup' },
	{ id: 'platform-overview', title: 'Platform Overview' },
	{ id: 'first-steps', title: 'First Steps' },
]

const UseCases = () => {
	return (
		<DocLayout
			icon={<ListCheck />}
			title="Use Cases"
			breadcrumbs={breadcrumbs}
			sections={sections}
		>
			<div>UseCases</div>
		</DocLayout>
	)
}

export default UseCases
