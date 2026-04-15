import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@k2w/ui';
import { MessageSquare, Loader2 } from 'lucide-react';

interface RejectionFormProps {
  rejectFeedback: string;
  onSetRejectFeedback: (feedback: string) => void;
  onCancel: () => void;
  onConfirmReject: () => void;
  rejecting: boolean;
}

export default function RejectionForm({
  rejectFeedback,
  onSetRejectFeedback,
  onCancel,
  onConfirmReject,
  rejecting
}: RejectionFormProps) {
  return (
    <Card className="border-red-200 bg-red-50/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-700">
          <MessageSquare className="w-4 h-4" />
          Revision Feedback / Reason for Rejection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <textarea
          placeholder="Please describe in detail the content or design sections that need revisions..."
          value={rejectFeedback}
          onChange={(e) => onSetRejectFeedback(e.target.value)}
          className="w-full h-24 p-3 border rounded-md resize-none border-red-200 bg-white"
        />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={onConfirmReject} disabled={rejecting}>
            {rejecting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
            Confirm Rejection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
