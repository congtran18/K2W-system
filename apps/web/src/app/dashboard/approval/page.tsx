'use client';

import ApprovalWorkflow from '@/components/dashboard/ApprovalWorkflow';
import { PageHeader } from '@/components';
import { Button } from '@k2w/ui';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ApprovalPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <PageHeader 
          title="Editorial Approval Workflow" 
          description="Review drafts, edit content, and approve for publishing to Webflow CMS" 
        />
      </div>
      <ApprovalWorkflow />
    </div>
  );
}
