import DocLayout from '@/components/blocks/(public)/doc-layout'
import { FileSliders } from 'lucide-react'
import React from 'react'

const breadcrumbs = [
	{ label: 'Home', href: '/' },
	{ label: 'Documentation', href: '/documentation' },
	{ label: 'Configuration', href: '/documentation/configuration' },
]

const sections = [
	{ id: 'introduction', title: 'Introduction' },
	{ id: 'account-setup', title: 'Account Setup' },
	{ id: 'platform-overview', title: 'Platform Overview' },
	{ id: 'first-steps', title: 'First Steps' },
]

const Configuration = () => {
	return (
		<DocLayout
			icon={<FileSliders />}
			title="Configuration"
			breadcrumbs={breadcrumbs}
			sections={sections}
		>
			<div>Configuration</div>
		</DocLayout>
	)
}

export default Configuration
