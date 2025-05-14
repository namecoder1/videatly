import DocLayout from '@/components/blocks/(public)/doc-layout'
import { BookOpen } from 'lucide-react'
import React from 'react'

const breadcrumbs = [
	{ label: 'Home', href: '/' },
	{ label: 'Documentation', href: '/documentation' },
	{ label: 'Usage', href: '/documentation/usage' },
]

const sections = [
	{ id: 'introduction', title: 'Introduction' },
	{ id: 'account-setup', title: 'Account Setup' },
	{ id: 'platform-overview', title: 'Platform Overview' },
	{ id: 'first-steps', title: 'First Steps' },
]


const Usage = () => {
	return (
		<DocLayout
			icon={<BookOpen />}
			title="Usage"
			breadcrumbs={breadcrumbs}
			sections={sections}
		>
			<div>Usage</div>
		</DocLayout>
	)
}

export default Usage