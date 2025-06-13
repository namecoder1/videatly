import { Sponsorship } from "@/types/types";
import { Tool } from "@/types/types";


// ------------------------------------------------------------------------------------------------
// EXTRACTION FUNCTIONS

// Extract fields using regex patterns that match the markdown structure
export const extractField = (content: string, pattern: RegExp): string => {
	const match = content.match(pattern);
	console.log('Extracting field with pattern:', pattern);
	console.log('Match result:', match);

	// Fallback method if regex fails
	if (!match) {
		console.log('Trying fallback method');
		const lines = content.split('\n');
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (pattern.source.includes(line.match(/\*\*([^*]+)\*\*/)?.[1] || '')) {
				const nextLine = lines[i + 1];
				if (nextLine) {
					console.log('Fallback found:', nextLine.trim());
					return nextLine.trim();
				}
			}
		}
	}

	return match ? match[1].trim() : '';
};

export const extractListField = (content: string, pattern: RegExp, expectedType: 'object' | 'string_array'): string[] | Tool[] | Sponsorship[] => {
	console.log('=== DEBUG: extractListField ===');
	console.log('Content:', content);
	console.log('Pattern:', pattern);
	console.log('Expected type:', expectedType);
	
	const match = content.match(pattern);
	console.log('Match result:', match);

	// Fallback method if regex fails (primarily for object types)
	if (!match) {
		console.log('Trying fallback method for list');
		const lines = content.split('\n');
		console.log('Split lines:', lines);
		const fallbackItems: any[] = [];
		let isInSection = false;
		let currentFallbackItem: any = {};

		for (const line of lines) {
			console.log('Processing line:', line);
			// Check for section header
			const headerMatch = line.match(/\*\*([^*]+)\*\*/);
			console.log('Header match:', headerMatch);
			if (pattern.source.includes(headerMatch?.[1] || '')) {
				console.log('Found section header:', headerMatch?.[1]);
				isInSection = true;
				continue;
			}

			// If we're in the section and find a bullet point
			if (isInSection && (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*'))) {
				console.log('Found bullet point:', line);
				if (currentFallbackItem.name) {
					fallbackItems.push(currentFallbackItem);
				}
				const itemContent = line.replace(/^[•\-*]\s*/, '').trim();
				const urlMatch = itemContent.match(/\((https?:\/\/[^)]+)\)/);
				currentFallbackItem = {
					name: itemContent.split('(')[0].trim(),
					url: urlMatch ? urlMatch[1] : '',
					description: ''
				};
				console.log('Created fallback item:', currentFallbackItem);
			} else if (isInSection && currentFallbackItem.name && line.trim()) {
				if (currentFallbackItem.description) {
					currentFallbackItem.description += '\n' + line.trim();
				} else {
					currentFallbackItem.description = line.trim();
				}
				console.log('Updated fallback item description:', currentFallbackItem);
			} else if (isInSection && line.match(/\*\*([^*]+)\*\*/)) {
				console.log('Found next section, breaking');
				break;
			}
		}
		if (currentFallbackItem.name) {
			fallbackItems.push(currentFallbackItem);
		}
		if (fallbackItems.length > 0) {
			console.log('Final fallback items:', fallbackItems);
			return fallbackItems;
		}
		console.log('No fallback items found');
		return []; // Fallback failed to find items
	}

	// If match is null at this point (it shouldn't be if fallback is comprehensive, but as a safeguard)
	if (!match) return [];
	
	if (expectedType === 'object') {
		// Robust object parsing for tools and sponsorships
		const objectItems: any[] = [];
		const lines = match[1].split('\n');
		console.log('Processing object lines:', lines);
		let currentItem: any = {};

		for (const line of lines) {
			const trimmedLine = line.trim();
			console.log('Processing object line:', trimmedLine);
			if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
				if (currentItem.name) { // Save previous item
					objectItems.push(currentItem);
				}
				const itemContent = trimmedLine.substring(1).trim();
				console.log('Item content:', itemContent);
				
				const oneLineRegex = /^(.*?)\s*\((https?:\/\/[^)]+)\)\s*(.*)$/;
				const oneLineMatch = itemContent.match(oneLineRegex);
				console.log('One line match:', oneLineMatch);

				if (oneLineMatch) {
					currentItem = {
						name: oneLineMatch[1].trim(),
						url: oneLineMatch[2],
						description: oneLineMatch[3] ? oneLineMatch[3].trim() : ''
					};
				} else {
					const urlPartMatch = itemContent.match(/\((https?:\/\/[^)]+)\)/);
					if (urlPartMatch && typeof urlPartMatch.index === 'number') {
						currentItem = {
							name: itemContent.substring(0, urlPartMatch.index).trim(),
							url: urlPartMatch[1],
							description: itemContent.substring(urlPartMatch.index + urlPartMatch[0].length).trim() || ''
						};
					} else {
						currentItem = {
							name: itemContent.trim(),
							url: '',
							description: ''
						};
					}
				}
				console.log('Created object item:', currentItem);
			} else if (currentItem.name && trimmedLine) { // Description on a new line
				if (currentItem.description) {
					currentItem.description += '\n' + trimmedLine;
				} else {
					currentItem.description = trimmedLine;
				}
				console.log('Updated object item description:', currentItem);
			}
		}
		if (currentItem.name) { // Add the last item
			objectItems.push(currentItem);
		}
		console.log('Final object items:', objectItems);
		return objectItems;

	} else { // expectedType === 'string_array'
		const stringItems = match[1].split('\n')
			.map(item => {
				console.log('Topic line:', JSON.stringify(item));
				return item.trim();
			})
			.filter(item => /^[-•*]/.test(item))
			.map(item => item.replace(/^[-•*]\s*/, '').trim())
			.filter(item => item.length > 0);
		console.log('Final string items:', stringItems);
		return stringItems;
	}
};

// ------------------------------------------------------------------------------------------------
// PARSING FUNCTIONS

// Helper for parsing a single item line (name, url, description) from a bullet point
const parseListItemObject = (itemContent: string): { name: string, url: string, description: string } | null => {
	// Regex to capture: 1. Name, 2. URL, 3. Description (optional)
	// Allows for structures like: "Name (url) Description" or "Name (url)"
	const oneLineRegex = /^(.*?)\s*\((https?:\/\/[^)]+)\)\s*(.*)$/;
	const match = itemContent.match(oneLineRegex);

	if (match) {
		return {
			name: match[1].trim(),
			url: match[2],
			description: match[3] ? match[3].trim() : ''
		};
	} else {
		// Fallback for items that might only have a name and URL, or just name, if regex fails
		const urlOnlyMatch = itemContent.match(/\((https?:\/\/[^)]+)\)/);
		if (urlOnlyMatch && typeof urlOnlyMatch.index === 'number') {
			return {
				name: itemContent.substring(0, urlOnlyMatch.index).trim(),
				url: urlOnlyMatch[1],
				description: itemContent.substring(urlOnlyMatch.index + urlOnlyMatch[0].length).trim() || ''
			};
		}
		console.warn(`Could not parse item line into object: "${itemContent}"`);
		return { name: itemContent.trim(), url: '', description: '' }; // Fallback if no regex matches
	}
};

export const extractToolObjects = (content: string, pattern: RegExp): Tool[] => {
	console.log('[extractToolObjects] Attempting to extract tools. Pattern:', pattern.source);
	const sectionMatch = content.match(pattern);
	if (!sectionMatch || !sectionMatch[1]) {
		console.log('[extractToolObjects] No section match or empty content for tools.');
		return [];
	}

	const tools: Tool[] = [];
	const lines = sectionMatch[1].split('\n');
	let currentToolData: Partial<Tool> = {};

	for (const line of lines) {
		const trimmedLine = line.trim();
		if (trimmedLine.startsWith('•')) {
			if (currentToolData.name) { // Save previously accumulated tool
				tools.push({ ...currentToolData } as Tool);
				currentToolData = {}; // Reset
			}
			const itemContent = trimmedLine.substring(1).trim();
			const parsedObject = parseListItemObject(itemContent);
			if (parsedObject) {
				currentToolData = parsedObject;
			}
		} else if (currentToolData.name && trimmedLine) { // Line is a continuation of the description
			if (currentToolData.description) {
				currentToolData.description += '\n' + trimmedLine;
			} else {
				currentToolData.description = trimmedLine;
			}
		}
	}

	if (currentToolData.name) { // Add the last parsed tool
		tools.push({ ...currentToolData } as Tool);
	}
	console.log('[extractToolObjects] Extracted tools:', tools);
	return tools;
};

export const extractSponsorshipObjects = (content: string, pattern: RegExp): Sponsorship[] => {
	console.log('[extractSponsorshipObjects] Attempting to extract sponsorships. Pattern:', pattern.source);
	const sectionMatch = content.match(pattern);
	if (!sectionMatch || !sectionMatch[1]) {
		console.log('[extractSponsorshipObjects] No section match or empty content for sponsorships.');
		return [];
	}

	const sponsorships: Sponsorship[] = [];
	const lines = sectionMatch[1].split('\n');
	console.log('[extractSponsorshipObjects] Processing lines:', lines);
	let currentSponsorshipData: Partial<Sponsorship> = {};

	for (const line of lines) {
		const trimmedLine = line.trim();
		// Accetta sia bullet che righe che iniziano con [Nome] (url)
		if (trimmedLine.startsWith('•') || /^\[.*\]\s*\(https?:\/\/.*\)/.test(trimmedLine)) {
			if (currentSponsorshipData.name) {
				console.log('[extractSponsorshipObjects] Adding sponsorship:', currentSponsorshipData);
				sponsorships.push({ ...currentSponsorshipData } as Sponsorship);
				currentSponsorshipData = {};
			}
			// Rimuovi bullet se presente
			const itemContent = trimmedLine.replace(/^•\s*/, '').trim();
			const parsedObject = parseListItemObject(itemContent);
			if (parsedObject) {
				currentSponsorshipData = parsedObject;
				console.log('[extractSponsorshipObjects] Created sponsorship:', currentSponsorshipData);
			}
		} else if (currentSponsorshipData.name && trimmedLine) {
			if (currentSponsorshipData.description) {
				currentSponsorshipData.description += '\n' + trimmedLine;
			} else {
				currentSponsorshipData.description = trimmedLine;
			}
			console.log('[extractSponsorshipObjects] Updated sponsorship description:', currentSponsorshipData);
		}
	}

	if (currentSponsorshipData.name) {
		console.log('[extractSponsorshipObjects] Adding final sponsorship:', currentSponsorshipData);
		sponsorships.push({ ...currentSponsorshipData } as Sponsorship);
	}
	console.log('[extractSponsorshipObjects] Final sponsorships:', sponsorships);
	return sponsorships;
};

export const parseTags = (tags: string | string[]): string[] => {
  if (!tags) return [];
  
  // Se è già un array, lo restituiamo
  if (Array.isArray(tags)) return tags;
  
  // Se è una stringa, proviamo a fare il parse
  if (typeof tags === 'string') {
    try {
      const parsedTags = JSON.parse(tags);
      return Array.isArray(parsedTags) ? parsedTags : [];
    } catch (e) {
      // Se non è un JSON valido, proviamo a dividerlo per virgole
      const tagsString = tags as string;
      return tagsString.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
    }
  }
  
  return [];
};

export const parseTools = (toolsString: string): Tool[] => {
	try {
		// Se è già un array di oggetti Tool, lo restituiamo
		if (Array.isArray(toolsString)) {
			return toolsString;
		}

		// Se è una stringa JSON, proviamo a fare il parse
		if (typeof toolsString === 'string') {
			try {
				// Rimuovi eventuali delimitatori markdown
				const cleanString = toolsString.replace(/^```json\n/, '').replace(/\n```$/, '');
				
				// Prova a fare il parse del JSON
				const parsed = JSON.parse(cleanString);
				
				// Se è un singolo oggetto, lo convertiamo in array
				if (!Array.isArray(parsed)) {
					return [parsed];
				}
				
				return parsed;
			} catch (e) {
				// Se non è JSON, proviamo a parsare il formato user-friendly
				const tools: Tool[] = [];
				const lines = toolsString.split('\n');
				let currentTool: Partial<Tool> = {};

				for (const line of lines) {
					if (line.trim().startsWith('•')) {
						// Se abbiamo già un tool in corso, lo salviamo
						if (currentTool.name) {
							tools.push(currentTool as Tool);
						}
						// Iniziamo un nuovo tool
						const content = line.replace(/^•\s*/, '').trim();
						const urlMatch = content.match(/\((https?:\/\/[^)]+)\)/);
						currentTool = {
							name: content.split('(')[0].trim(),
							url: urlMatch ? urlMatch[1] : '',
							description: ''
						};
					} else if (currentTool.name && line.trim()) {
						// Aggiungiamo la descrizione
						currentTool.description = line.trim();
					}
				}

				// Aggiungiamo l'ultimo tool se presente
				if (currentTool.name) {
					tools.push(currentTool as Tool);
				}

				return tools;
			}
		}

		return [];
	} catch (e) {
		console.error('Error in parseTools:', e);
		return [];
	}
};

export const parseSponsorships = (sponsorshipString: string): Sponsorship[] => {
	try {
		// Se è già un array di oggetti Sponsorship, lo restituiamo
		if (Array.isArray(sponsorshipString)) {
			return sponsorshipString;
		}

		// Se è una stringa JSON, proviamo a fare il parse
		if (typeof sponsorshipString === 'string') {
			try {
				// Rimuovi eventuali delimitatori markdown
				const cleanString = sponsorshipString.replace(/^```json\n/, '').replace(/\n```$/, '');
				
				// Prova a fare il parse del JSON
				const parsed = JSON.parse(cleanString);
				
				// Se è un singolo oggetto, lo convertiamo in array
				if (!Array.isArray(parsed)) {
					return [parsed];
				}
				
				return parsed;
			} catch (e) {
				// Se non è JSON, proviamo a parsare il formato user-friendly
				const sponsorships: Sponsorship[] = [];
				const lines = sponsorshipString.split('\n');
				let currentSponsorship: Partial<Sponsorship> = {};

				for (const line of lines) {
					if (line.trim().startsWith('•')) {
						// Se abbiamo già uno sponsorship in corso, lo salviamo
						if (currentSponsorship.name) {
							sponsorships.push(currentSponsorship as Sponsorship);
						}
						// Iniziamo un nuovo sponsorship
						const content = line.replace(/^•\s*/, '').trim();
						const urlMatch = content.match(/\((https?:\/\/[^)]+)\)/);
						currentSponsorship = {
							name: content.split('(')[0].trim(),
							url: urlMatch ? urlMatch[1] : '',
							description: ''
						};
					} else if (currentSponsorship.name && line.trim()) {
						// Aggiungiamo la descrizione
						currentSponsorship.description = line.trim();
					}
				}

				// Aggiungiamo l'ultimo sponsorship se presente
				if (currentSponsorship.name) {
					sponsorships.push(currentSponsorship as Sponsorship);
				}

				return sponsorships;
			}
		}

		return [];
	} catch (e) {
		console.error('Error in parseSponsorships:', e);
		return [];
	}
};

// Funzione di utilità per validare il formato dei dati
export const validateToolFormat = (tool: any): boolean => {
	return (
		typeof tool === 'object' &&
		tool !== null &&
		typeof tool.name === 'string' &&
		typeof tool.url === 'string' &&
		typeof tool.description === 'string'
	);
};

export const validateSponsorshipFormat = (sponsorship: any): boolean => {
	return (
		typeof sponsorship === 'object' &&
		sponsorship !== null &&
		typeof sponsorship.name === 'string' &&
		typeof sponsorship.url === 'string' &&
		typeof sponsorship.description === 'string'
	);
};