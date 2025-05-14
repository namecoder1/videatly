import 'server-only';

const dictionaries = {
  en: () => import('./en.json').then((module) => module.default),
  it: () => import('./it.json').then((module) => module.default),
  es: () => import('./es.json').then((module) => module.default),
  fr: () => import('./fr.json').then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
  // Fallback to English if the requested locale is not supported
  const selectedLocale = dictionaries[locale as keyof typeof dictionaries] 
    ? locale 
    : 'en';
  
  return dictionaries[selectedLocale as keyof typeof dictionaries]();
}; 