'use client';

import { redirect } from 'next/navigation';

export default function MultiSiteRedirectPage() {
  redirect('/dashboard/multi-site');
  return null;
}