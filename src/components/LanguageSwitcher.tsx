"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    const path = pathname ?? '/';
    const stripped = path.startsWith(`/${locale}`)
      ? path.slice(locale.length + 1) || '/'
      : path;
    const normalized = stripped.startsWith('/') ? stripped : `/${stripped}`;
    const newPath = `/${newLocale}${normalized === '/' ? '' : normalized}`;
    router.replace(newPath);
  };

  return (
    <select onChange={handleChange} value={locale}>
      <option value="zh">中文</option>
      <option value="en">English</option>
    </select>
  );
}
