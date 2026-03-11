'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function CreateTemplatePage() {
  const router = useRouter();

  useEffect(() => {
    const templateId = `template-${Date.now()}`;
    router.replace(`/editor/${templateId}`);
  }, [router]);

  return <LoadingSkeleton />;
}
