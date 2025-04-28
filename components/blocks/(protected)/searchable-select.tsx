'use client'

import { Check } from "lucide-react";
import { CommandItem } from "@/components/ui/command";
import { CommandEmpty, CommandGroup, CommandInput } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SearchableSelectProps } from "@/types/types";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronsUpDown } from "lucide-react";
import { Command } from "@/components/ui/command";

const SearchableSelect = ({ 
	name, 
	label, 
	placeholder, 
	searchPlaceholder, 
	options, 
	required,
	value: externalValue,
	onChange
}: SearchableSelectProps) => {
	const [open, setOpen] = useState(false);
	const [internalValue, setInternalValue] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);

	// Use external value if provided, otherwise use internal state
	const value = externalValue !== undefined ? externalValue : internalValue;

	// Update internal value when external value changes
	useEffect(() => {
		if (externalValue !== undefined) {
			setInternalValue(externalValue);
		}
	}, [externalValue]);

	const filteredOptions = options.filter((option) =>
		option.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!open) return;

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setSelectedIndex((prev) => (prev + 1) % filteredOptions.length);
				break;
			case "ArrowUp":
				e.preventDefault();
				setSelectedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
				break;
			case "Enter":
				e.preventDefault();
				if (filteredOptions[selectedIndex]) {
					handleSelect(filteredOptions[selectedIndex]);
				}
				break;
			case "Escape":
				e.preventDefault();
				setOpen(false);
				break;
		}
	};

	const handleSelect = (option: string) => {
		if (externalValue === undefined) {
			setInternalValue(option);
		}
		
		if (onChange) {
			onChange(option);
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
							{value || placeholder}
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
							No results found.
						</CommandEmpty>
						<CommandGroup className="max-h-[300px] overflow-auto">
							{filteredOptions.map((option, index) => (
								<CommandItem
									key={option}
									value={option}
									onSelect={() => handleSelect(option)}
									className={cn(
										"cursor-pointer transition-colors",
										index === selectedIndex && "bg-primary/10",
										value === option && "bg-primary/5"
									)}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											value === option ? "opacity-100" : "opacity-0"
										)}
									/>
									<span className="truncate">{option}</span>
								</CommandItem>
							))}
						</CommandGroup>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export default SearchableSelect