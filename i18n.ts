import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

export const locales = ['zh', 'en'];
export const defaultLocale = 'zh';

export default getRequestConfig(async () => {
  // Read the locale from the cookies
  const locale = (await cookies()).get('NEXT_LOCALE')?.value || defaultLocale;
 
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});