'use client'

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagsInputProps } from "@/types/types";
import { X } from "lucide-react";
import { useRef, useState, KeyboardEvent, useEffect } from "react";

const TagsInput = ({ name, label, placeholder, description, addTags }: TagsInputProps) => {
	const [tags, setTags] = useState<string[]>([]);
	const [inputValue, setInputValue] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	const addTag = (tag: string) => {
		const trimmedTag = tag.trim();
		if (trimmedTag && !tags.includes(trimmedTag)) {
			setTags([...tags, trimmedTag]);
			setInputValue('');
		}
	};

	const removeTag = (tagToRemove: string) => {
		setTags(tags.filter(tag => tag !== tagToRemove));
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' || e.key === ',' || (e.key === ' ' && inputValue.endsWith(' '))) {
			e.preventDefault();
			addTag(inputValue);
		} else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
			removeTag(tags[tags.length - 1]);
		}
	};

	const handleBlur = () => {
		if (inputValue.trim()) {
			addTag(inputValue);
		}
	};

	useEffect(() => {
		// Create hidden input for form submission
		const input = document.createElement('input');
		input.type = 'hidden';
		input.name = name;
		input.value = tags.join(',');
		const container = inputRef.current?.parentElement;
		if (container) {
			const existingInput = container.querySelector(`input[name="${name}"]`);
			if (existingInput) {
				existingInput.remove();
			}
			container.appendChild(input);
		}
	}, [tags, name]);

	return (
		<div className="grid gap-2">
			<Label htmlFor={name} className="font-medium">{label}</Label>
			<div 
				ref={inputRef}
				className="bg-card flex flex-wrap gap-2 p-2 border border-input rounded-3xl transition-all focus-within:ring-1 focus-within:ring-ring focus-within:border-ring hover:border-gray-400"
			>
				{tags.map((tag) => (
					<Badge 
						key={tag} 
						variant="secondary"
						className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-sm font-medium transition-colors hover:bg-gray-200"
					>
						{tag}
						<button
							type="button"
							onClick={() => removeTag(tag)}
							className="ml-1 rounded-full p-0.5 hover:bg-gray-300 hover:text-destructive focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
							aria-label={`Remove ${tag} tag`}
						>
							<X className="h-3.5 w-3.5" />
						</button>
					</Badge>
				))}
				<Input
					type="text"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					onBlur={handleBlur}
					placeholder={tags.length === 0 ? placeholder : addTags}
					className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-1 min-w-[120px] h-8"
				/>
			</div>
			{description && (
				<p className="text-sm text-muted-foreground mt-1">
					{description}
				</p>
			)}
		</div>
	);
};

export default TagsInput