import 'server-only';

const documentationContent = {
  en: () => import('./en.json').then((module) => module.default),
  it: () => import('./it.json').then((module) => module.default),
};

export const getDocumentationContent = async (locale: string) => {
  return documentationContent[locale as keyof typeof documentationContent]();
}; 