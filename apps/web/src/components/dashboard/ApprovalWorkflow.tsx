'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from '@k2w/ui';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertCircle,
  Eye,
  Edit3,
  Monitor,
  Smartphone,
  Globe
} from 'lucide-react';
import { 
  usePendingReviewContent, 
  useApproveContent, 
  useRejectContent, 
  useUpdateContentBody,
  useTranslateToEnglish
} from '@/hooks/use-api';
import { toast } from 'sonner';

// Import subcomponents
import PendingList from './approval/PendingList';
import LivePreview from './approval/LivePreview';
import DirectEditor from './approval/DirectEditor';
import RejectionForm from './approval/RejectionForm';

export default function ApprovalWorkflow() {
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'preview' | 'edit' | 'feedback'>('preview');
  
  // Editorial edits
  const [editedTitle, setEditedTitle] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Queries and mutations
  const { data: pendingData, isLoading: loadingPending, refetch: refetchPending } = usePendingReviewContent();
  const { mutate: approve, isPending: approving } = useApproveContent();
  const { mutate: reject, isPending: rejecting } = useRejectContent();
  const { mutate: updateBody, isPending: saving } = useUpdateContentBody();
  const { mutate: translateToEnglish, isPending: translating } = useTranslateToEnglish();

  const pendingList = pendingData?.data || [];
  const selectedContent = pendingList.find(c => c.id === selectedContentId);

  // Handle auto-selection of first item
  useEffect(() => {
    if (pendingList.length > 0 && !selectedContentId) {
      setSelectedContentId(pendingList[0].id);
    }
  }, [pendingList, selectedContentId]);

  // Sync edit form fields when selection changes
  useEffect(() => {
    if (selectedContent) {
      setEditedTitle(selectedContent.title || '');
      setEditedBody(selectedContent.body_html || selectedContent.body || '');
      setShowRejectForm(false);
      setRejectFeedback('');
    }
  }, [selectedContent]);

  const handleApprove = () => {
    if (!selectedContentId) return;
    approve(selectedContentId, {
      onSuccess: () => {
        setSelectedContentId(null);
        refetchPending();
      }
    });
  };

  const handleReject = () => {
    if (!selectedContentId || !rejectFeedback.trim()) {
      toast.error('Please enter feedback for the revision request');
      return;
    }
    reject({ contentId: selectedContentId, feedback: rejectFeedback }, {
      onSuccess: () => {
        setSelectedContentId(null);
        setShowRejectForm(false);
        refetchPending();
      }
    });
  };

  const handleSaveDraft = () => {
    if (!selectedContentId) return;
    updateBody({ contentId: selectedContentId, bodyHtml: editedBody, title: editedTitle }, {
      onSuccess: () => {
        refetchPending();
      }
    });
  };

  const handleTranslate = () => {
    if (!selectedContentId) return;
    translateToEnglish(selectedContentId, {
      onSuccess: (response) => {
        if (response?.data) {
          setEditedTitle(response.data.title || '');
          setEditedBody(response.data.body_html || response.data.body || '');
        }
        refetchPending();
      }
    });
  };

  if (loadingPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Loading pending drafts...</p>
      </div>
    );
  }

  if (pendingList.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto mt-12 border border-dashed text-center p-12">
        <CardHeader className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
            <CheckCircle className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl">Approval Completed!</CardTitle>
          <CardDescription>
            There are currently no drafts or landing pages pending approval. All content has been processed or is being created.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Button onClick={() => refetchPending()} variant="outline">
            Reload list
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Sidebar - Pending List */}
      <div className="lg:col-span-4">
        <PendingList
          pendingList={pendingList}
          selectedContentId={selectedContentId}
          onSelectContentId={setSelectedContentId}
          onRefresh={() => refetchPending()}
        />
      </div>

      {/* Editor & Preview Workspace */}
      <div className="lg:col-span-8">
        {selectedContent ? (
          <div className="space-y-6">
            {/* Header info bar */}
            <Card>
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-semibold">Project: {selectedContent.project_id}</Badge>
                    <Badge variant="secondary" className="text-xs font-semibold">SEO: {selectedContent.seo_score || 0}/100</Badge>
                  </div>
                  <h2 className="text-2xl font-bold font-display text-gray-900 leading-tight">{selectedContent.title}</h2>
                  <p className="text-xs text-muted-foreground">ID: {selectedContent.id} | KW ID: {selectedContent.keyword_id}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button 
                    onClick={handleTranslate} 
                    disabled={translating}
                    variant="outline" 
                    className="flex items-center gap-1.5 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  >
                    {translating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                    Translate to English
                  </Button>
                  <Button 
                    onClick={() => setShowRejectForm(!showRejectForm)} 
                    variant="outline" 
                    className="flex items-center gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                  <Button 
                    onClick={handleApprove} 
                    disabled={approving}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white"
                  >
                    {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Approve & Publish
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Rejection comment form */}
            {showRejectForm && (
              <RejectionForm
                rejectFeedback={rejectFeedback}
                onSetRejectFeedback={setRejectFeedback}
                onCancel={() => setShowRejectForm(false)}
                onConfirmReject={handleReject}
                rejecting={rejecting}
              />
            )}

            {/* Workspace tabs & Preview/Editor */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 flex items-center justify-between">
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`py-3 px-1 text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-all ${
                      activeTab === 'preview' 
                        ? 'border-indigo-600 text-indigo-600' 
                        : 'border-transparent text-muted-foreground hover:text-gray-900'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    Preview Landing Page
                  </button>
                  <button
                    onClick={() => setActiveTab('edit')}
                    className={`py-3 px-1 text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-all ${
                      activeTab === 'edit' 
                        ? 'border-indigo-600 text-indigo-600' 
                        : 'border-transparent text-muted-foreground hover:text-gray-900'
                    }`}
                  >
                    <Edit3 className="w-4 h-4" />
                    Live Edit
                  </button>
                </div>

                {activeTab === 'preview' && (
                  <div className="flex border rounded-lg overflow-hidden bg-white">
                    <button 
                      onClick={() => setPreviewMode('desktop')}
                      className={`p-1.5 ${previewMode === 'desktop' ? 'bg-gray-100 text-gray-900' : 'text-muted-foreground hover:bg-gray-50'}`}
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setPreviewMode('mobile')}
                      className={`p-1.5 ${previewMode === 'mobile' ? 'bg-gray-100 text-gray-900' : 'text-muted-foreground hover:bg-gray-50'}`}
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {activeTab === 'edit' ? (
                <DirectEditor
                  editedTitle={editedTitle}
                  onSetEditedTitle={setEditedTitle}
                  editedBody={editedBody}
                  onSetEditedBody={setEditedBody}
                  onSaveDraft={handleSaveDraft}
                  saving={saving}
                />
              ) : (
                <LivePreview
                  selectedContent={selectedContent}
                  previewMode={previewMode}
                  editedTitle={editedTitle}
                  editedBody={editedBody}
                />
              )}
            </div>
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center min-h-[400px] text-center p-12">
            <CardHeader className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-muted-foreground">
                <AlertCircle className="w-6 h-6" />
              </div>
              <CardTitle>No draft selected</CardTitle>
              <CardDescription>Select a draft from the list on the left to review the content and preview the interface.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
