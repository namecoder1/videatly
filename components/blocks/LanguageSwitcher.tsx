'use client';

import { usePathname, useRouter } from 'next/navigation';
import { locales } from '@/middleware';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function LanguageSwitcher({ className, showLabel = true }: { className?: string, showLabel?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  // Extract current locale from pathname
  const currentLocale = pathname.split('/')[1];
  const isValidLocale = locales.includes(currentLocale);

  const handleLanguageChange = (newLocale: string) => {
    // Get the path without the locale prefix
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
    // Navigate to the new locale path
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <Select onValueChange={handleLanguageChange} defaultValue={isValidLocale ? currentLocale : 'en'} >
      <SelectTrigger className={cn('w-fit space-x-1.5', className)}>
        <SelectValue className='text-sm' placeholder={showLabel ? '🇺🇸 EN' : ''} />
      </SelectTrigger>
      <SelectContent className={showLabel ? 'w-full' : 'w-fit'}>
        {locales.map((locale) => (
          <SelectItem key={locale} value={locale} className='flex items-center gap-2'>
            <span className={`text-sm ${showLabel ? 'mr-2' : 'mx-1'}`}>
              {locale === 'en' ? '🇺🇸' : 
               locale === 'it' ? '🇮🇹' : 
               locale === 'es' ? '🇪🇸' : 
               locale === 'fr' ? '🇫🇷' : '🇺🇸'}
            </span>
            {showLabel && <span className='text-sm'>
              {locale === 'en' ? 'EN' : 
               locale === 'it' ? 'IT' : 
               locale === 'es' ? 'ES' : 
               locale === 'fr' ? 'FR' : 'EN'}
            </span>}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 
