'use client'
import { createContext, useContext } from 'react'

// Creare un context per il dizionario
export const DictionaryContext = createContext<any>(null)

// Hook per utilizzare il dizionario
export const useDictionary = () => {
	const context = useContext(DictionaryContext)
	if (!context) {
		throw new Error('useDictionary must be used within a DictionaryProvider')
	}
	return context
} 