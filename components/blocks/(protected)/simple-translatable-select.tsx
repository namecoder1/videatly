'use client'

import { Check, ChevronsUpDown } from "lucide-react";
import { CommandItem } from "@/components/ui/command";
import { CommandEmpty, CommandGroup, CommandInput } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Command } from "@/components/ui/command";
import { useParams } from "next/navigation";
import { getEnumTranslation, getTranslatedOptions, getOriginalValue } from "@/utils/enum-translations";
import { useDictionary } from '@/app/context/dictionary-context';

export interface SimpleTranslatableSelectProps {
  name: string;
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  options: string[];
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

const SimpleTranslatableSelect = ({ 
	name, 
	label, 
	placeholder, 
	searchPlaceholder, 
	options, 
	required,
	value: externalValue,
	onChange
}: SimpleTranslatableSelectProps) => {
	const params = useParams();
	const locale = params.lang as string || 'en'; 
	const dict = useDictionary();
	const [open, setOpen] = useState(false);
	const [internalValue, setInternalValue] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);

	// Traduci le opzioni per la visualizzazione
	const translatedOptions = getTranslatedOptions(options, locale);
	
	// Trova il valore tradotto da visualizzare
	const getTranslatedValue = () => {
		if (!value) return "";
		return getEnumTranslation(value, locale);
	};
	
	// Usa valore esterno se fornito, altrimenti usa stato interno
	const value = externalValue !== undefined ? externalValue : internalValue;
	const displayValue = getTranslatedValue();

	// Aggiorna il valore interno quando cambia quello esterno
	useEffect(() => {
		if (externalValue !== undefined) {
			setInternalValue(externalValue);
		}
	}, [externalValue]);

	// Filtra le opzioni in base alla query di ricerca
	const filteredTranslatedOptions = translatedOptions.filter((option) =>
		option.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!open) return;

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setSelectedIndex((prev) => (prev + 1) % filteredTranslatedOptions.length);
				break;
			case "ArrowUp":
				e.preventDefault();
				setSelectedIndex((prev) => (prev - 1 + filteredTranslatedOptions.length) % filteredTranslatedOptions.length);
				break;
			case "Enter":
				e.preventDefault();
				if (filteredTranslatedOptions[selectedIndex]) {
					handleSelect(filteredTranslatedOptions[selectedIndex]);
				}
				break;
			case "Escape":
				e.preventDefault();
				setOpen(false);
				break;
		}
	};

	const handleSelect = (translatedOption: string) => {
		// Converti il valore tradotto in quello originale in inglese per il database
		const originalOption = getOriginalValue(translatedOption, options, locale);
		
		if (externalValue === undefined) {
			setInternalValue(originalOption);
		}
		
		if (onChange) {
			onChange(originalOption);
		}
		
		setOpen(false);
		setSearchQuery("");
		setSelectedIndex(0);
	};

	return (
		<div className="grid gap-2">
			<Label htmlFor={name}>{label}</Label>
			<input type="hidden" name={name} value={value} required={required} />
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className={cn(
							"w-full justify-between",
							!value && "text-muted-foreground",
							open && "ring ring-primary/20 border-primary"
						)}
						onClick={() => setOpen(true)}
					>
						<span className="truncate">
							{displayValue || placeholder}
						</span>
						<ChevronsUpDown className={cn(
							"ml-2 h-4 w-4 shrink-0 transition-transform duration-200",
							open ? "rotate-180" : ""
						)} />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0" align="start">
					<Command shouldFilter={false}>
						<CommandInput 
							placeholder={searchPlaceholder}
							value={searchQuery}
							onValueChange={setSearchQuery}
							onKeyDown={handleKeyDown}
							className="border-none focus:ring-0"
						/>
						<CommandEmpty className="py-6 text-center text-sm">
							{dict.components.translatableSelect.noResults}
						</CommandEmpty>
						<CommandGroup className="max-h-[300px] overflow-auto">
							{filteredTranslatedOptions.map((translatedOption, index) => {
								// Trova il valore originale corrispondente
								const originalOption = getOriginalValue(translatedOption, options, locale);
								
								return (
									<CommandItem
										key={originalOption}
										value={translatedOption}
										onSelect={() => handleSelect(translatedOption)}
										className={cn(
											"cursor-pointer transition-colors",
											index === selectedIndex && "bg-primary/10",
											value === originalOption && "bg-primary/5"
										)}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === originalOption ? "opacity-100" : "opacity-0"
											)}
										/>
										<span className="truncate">{translatedOption}</span>
									</CommandItem>
								);
							})}
						</CommandGroup>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export default SimpleTranslatableSelect; 