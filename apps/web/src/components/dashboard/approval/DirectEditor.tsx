import React from 'react';
import { Card, CardContent, Input, Button } from '@k2w/ui';
import { Loader2 } from 'lucide-react';

interface DirectEditorProps {
  editedTitle: string;
  onSetEditedTitle: (title: string) => void;
  editedBody: string;
  onSetEditedBody: (body: string) => void;
  onSaveDraft: () => void;
  saving: boolean;
}

export default function DirectEditor({
  editedTitle,
  onSetEditedTitle,
  editedBody,
  onSetEditedBody,
  onSaveDraft,
  saving
}: DirectEditorProps) {
  return (
    <Card className="h-full">
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Title (H1)</label>
          <Input 
            value={editedTitle} 
            onChange={(e) => onSetEditedTitle(e.target.value)}
            placeholder="Article title"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-gray-700">HTML Content</label>
            <span className="text-xs text-muted-foreground">Automatically synced to live preview</span>
          </div>
          <textarea
            value={editedBody}
            onChange={(e) => onSetEditedBody(e.target.value)}
            placeholder="Article HTML code..."
            className="w-full h-[400px] p-3 border rounded-md font-mono text-sm resize-none bg-slate-50 text-slate-900 border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={onSaveDraft} disabled={saving} variant="outline" className="flex items-center gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Save Draft
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
