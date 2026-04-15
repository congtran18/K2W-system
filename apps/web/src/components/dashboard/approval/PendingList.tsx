import React from 'react';
import { Card, CardContent, Badge, Button } from '@k2w/ui';
import { Clock } from 'lucide-react';

interface PendingItem {
  id: string;
  title: string;
  status: string;
  created_at?: string;
  keyword_id?: string;
  word_count?: number;
  [key: string]: any;
}

interface PendingListProps {
  pendingList: PendingItem[];
  selectedContentId: string | null;
  onSelectContentId: (id: string) => void;
  onRefresh: () => void;
}

export default function PendingList({
  pendingList,
  selectedContentId,
  onSelectContentId,
  onRefresh
}: PendingListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          Bài viết chờ duyệt
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border border-amber-500/20">
            {pendingList.length}
          </Badge>
        </h2>
        <Button variant="ghost" size="sm" onClick={onRefresh} className="text-xs">
          Làm mới
        </Button>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {pendingList.map((item) => (
          <Card 
            key={item.id} 
            onClick={() => onSelectContentId(item.id)}
            className={`cursor-pointer transition-all border ${selectedContentId === item.id ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/20 bg-indigo-500/[0.02]' : 'hover:border-gray-300'}`}
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Badge className="text-[10px] uppercase font-bold" variant={item.status === 'reviewing' ? 'default' : 'outline'}>
                  {item.status}
                </Badge>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : 'Vừa xong'}
                </span>
              </div>
              <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
              <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
                <span>KW ID: {item.keyword_id}</span>
                <span>{item.word_count || 0} từ</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
