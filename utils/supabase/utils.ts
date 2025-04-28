import { redirect } from "next/navigation";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string,
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}



export function formatDate(date: string, dateCase: 'normal' | 'full') {
  const d = new Date(date)
  if (dateCase === 'normal') {
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
    })
  } else if (dateCase === 'full') {
    return d.toLocaleTimeString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    })
  }
}


export const handleScrollToElement = (e: React.MouseEvent<HTMLAnchorElement>, elementId: string) => {
  e.preventDefault()
  const element = document.getElementById(elementId)
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    })
  }
}

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




// Funzioni di utilità per estrarre i campi dal messaggio
export function extractField(message: string, fieldName: string): string {
	const regex = new RegExp(
		`${fieldName}[:\\s-]+((?:(?!\\n(?:Title|Description|Meta-Description|Thumbnail Concept|List of topics covered|Hook suggestion|Mood and visual style|Call-to-Action|Editing techniques|Background music|Potential partnerships|Recommended tools):)[\\s\\S])*?)(?=\\n(?:Title|Description|Meta-Description|Thumbnail Concept|List of topics covered|Hook suggestion|Mood and visual style|Call-to-Action|Editing techniques|Background music|Potential partnerships|Recommended tools):|$)`,
		'i'
	);
	const match = message.match(regex);
	return match ? 
		match[1]
			.trim()
			.replace(/\*\*/g, '')
			.replace(/\*([^*]+)\*/g, '$1')
			.replace(/`([^`]+)`/g, '$1')
			.replace(/^[-•*]\s*/gm, '')
			.replace(/^\s+|\s+$/gm, '') : 
		'';
}

export function extractListField(message: string, fieldName: string): string[] {
	const regex = new RegExp(
		`${fieldName}[:\\s-]+((?:(?!\\n(?:Title|Description|Meta-Description|Thumbnail Concept|List of topics covered|Hook suggestion|Mood and visual style|Call-to-Action|Editing techniques|Background music|Potential partnerships|Recommended tools):)[\\s\\S])*?)(?=\\n(?:Title|Description|Meta-Description|Thumbnail Concept|List of topics covered|Hook suggestion|Mood and visual style|Call-to-Action|Editing techniques|Background music|Potential partnerships|Recommended tools):|$)`,
		'i'
	);
	const match = message.match(regex);
	if (!match) return [];
	
	return match[1]
		.split('\n')
		.map(item => item
			.replace(/\*\*/g, '')
			.replace(/\*([^*]+)\*/g, '$1')
			.replace(/`([^`]+)`/g, '$1')
			.replace(/^[-•*]\s*/g, '')
			.trim()
		)
		.filter(item => item.length > 0);
}
