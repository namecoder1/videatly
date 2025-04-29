'use client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { encode, decode } from 'gpt-tokenizer/model/gpt-3.5-turbo-0125'


const Trial = () => {
	const supabase = createClient()
	const [baseTokens, setBaseTokens] = useState(0)
	const [totalTokens, setTotalTokens] = useState(0)
	const [formData, setFormData] = useState({
		baseTokens: 0,
		paidTokens: 0,
		text: ''
	})

	useEffect(() => {
		const fetchData = async () => {
			const { data, error } = await supabase.from('tokens').select('base_tokens, paid_tokens').eq('tool', 'ideas')
			if (error) {
				console.error('Error fetching tokens:', error)
			} else if (data && data.length > 0) {
				setBaseTokens(data[0].base_tokens)
				setTotalTokens((data[0].base_tokens) + (data[0].paid_tokens))
			}
		}
		fetchData()
	}, [])
	
	const updateTokens = async () => {
		const tokensToSubtract = encode(formData.text).length
		
		const { data, error } = await supabase.from('tokens').update({
			base_tokens: baseTokens - tokensToSubtract,
		}).eq('tool', 'ideas')
		
		if (error) {
			console.error('Error updating tokens:', error)
		} else {
			console.log('Tokens updated successfully')
			setBaseTokens(prev => prev - tokensToSubtract)
		}
	}
	
	return (
		<div>
			<h1>Trial</h1>
			<p>Base Tokens: {baseTokens}</p>
			<p>Total Tokens: {totalTokens}</p>
			<form onSubmit={(e) => {
				e.preventDefault()
				updateTokens()
			}}>
				<Input 
					type="text"
					value={formData.text}
					onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
					placeholder="Enter text to calculate tokens"
				/>
				<p>Tokens to subtract: {formData.text ? encode(formData.text).length : 0}</p>
				<Button type="submit">Update Tokens</Button>
			</form>
		</div>
	)
}

export default Trial