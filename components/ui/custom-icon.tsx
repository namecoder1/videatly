import { cn } from '@/lib/utils'
import React from 'react'

const CustomIcon = ({ icon, className, color = 'gray' }: { icon: React.ReactNode, className?: string, color?: string }) => {
	const colorClasses = {
		red: 'bg-red-100',
		gray: 'bg-gray-100',
		blue: 'bg-blue-100',
		green: 'bg-green-100',
		yellow: 'bg-yellow-100',
		purple: 'bg-purple-100',
		pink: 'bg-pink-100',
		indigo: 'bg-indigo-100',
		orange: 'bg-orange-100',
		teal: 'bg-teal-100',
		cyan: 'bg-cyan-100',
	}

	const borderColorClasses = {
		red: 'border-red-200',
		gray: 'border-gray-200',
		blue: 'border-blue-200',
		green: 'border-green-200',
		yellow: 'border-yellow-200',
		purple: 'border-purple-200',
		pink: 'border-pink-200',
		indigo: 'border-indigo-200',
		orange: 'border-orange-200',
		teal: 'border-teal-200',
		cyan: 'border-cyan-200',
	}

	return (
		<div 
			className={
				cn('p-2 rounded-xl w-fit border', 
				colorClasses[color as keyof typeof colorClasses] || colorClasses.gray, 
				borderColorClasses[color as keyof typeof borderColorClasses] || borderColorClasses.gray, 
				className)
			}>
			{icon}
		</div>
	)
}

export default CustomIcon