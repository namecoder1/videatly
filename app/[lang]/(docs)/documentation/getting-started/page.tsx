import React from 'react'
import { Rocket } from 'lucide-react'
import DocLayout from '@/components/blocks/(public)/doc-layout'

const breadcrumbs = [
	{ label: 'Home', href: '/' },
	{ label: 'Documentation', href: '/documentation' },
	{ label: 'Getting Started', href: '/documentation/getting-started' },
]

const sections = [
	{ id: 'introduction', title: 'Introduction' },
	{ id: 'account-setup', title: 'Account Setup' },
	{ id: 'platform-overview', title: 'Platform Overview' },
	{ id: 'first-steps', title: 'First Steps' },
	{ id: 'next-steps', title: 'Next Steps' },
]

const GettingStarted = () => {
	return (
		<DocLayout
			icon={<Rocket />}
			title="Getting Started"
			breadcrumbs={breadcrumbs}
			sections={sections}
		>
			<div className='flex-1'>
				<h1>Getting Started</h1>
				<p>ciuaoo</p>
			</div>
		</DocLayout>
	)
}

export default GettingStarted