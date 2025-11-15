"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    // Manually construct the new path to be compatible with Next.js 16
    const newPath = `/${newLocale}${pathname.substring(1 + locale.length)}`;
    router.replace(newPath);
  };

  return (
    <select onChange={handleChange} value={locale}>
      <option value="zh">中文</option>
      <option value="en">English</option>
    </select>
  );
}