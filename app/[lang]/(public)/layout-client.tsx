'use client'
import React from 'react'
import Navbar from "@/components/blocks/navbar"
import Footer from "@/components/blocks/(public)/footer"
import { DictionaryContext } from '@/app/context/dictionary-context'

const PublicLayout = ({ 
	children, 
	params 
}: { 
	children: React.ReactNode,
	params: { 
		dict: any 
	}
}) => {
	return (
		<DictionaryContext.Provider value={params.dict}>
			<Navbar dict={params.dict} />
			<main>
				{children}
			</main>
			<Footer dict={params.dict} />
		</DictionaryContext.Provider>
	)
}

export default PublicLayout 