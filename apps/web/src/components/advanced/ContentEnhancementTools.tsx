'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@k2w/ui';
import { Button } from '@k2w/ui';
import { Badge } from '@k2w/ui';
import { Input } from '@k2w/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@k2w/ui';
import { 
  Image as ImageIcon, 
  Download, 
  RefreshCw, 
  Layers,
  Zap,
  Settings,
  Eye,
  Grid,
  Sparkles
} from 'lucide-react';
import {
  useGenerateImage,
  useBatchGenerateImages,
  useImageStatus,
  useTranslateContent,
  useTranslationLanguages,
  useTranslationStatus,
  usePublishContent,
  usePublishStatus
} from '@/hooks/use-api';
import type {
  ContentToolsProps
} from '@/types/content-enhancement';

function ImageGeneration({ contentId }: ContentToolsProps) {
  const [formData, setFormData] = useState({
    keyword_id: '',
    content_id: contentId || '',
    image_type: 'featured' as 'featured' | 'inline' | 'thumbnail' | 'banner',
    style: 'realistic' as 'realistic' | 'artistic' | 'minimal' | 'corporate',
    dimensions: { width: 1200, height: 630 },
    prompt_override: ''
  });

  const [imageId, setImageId] = useState<string>('');
  
  const { mutate: generateImage, isPending: generating } = useGenerateImage();
  const { mutate: batchGenerate, isPending: batchGenerating } = useBatchGenerateImages();
  const { data: imageStatus } = useImageStatus(imageId);

  const handleGenerate = () => {
    if (!formData.keyword_id && !formData.content_id) return;
    
    generateImage(formData, {
      onSuccess: (data) => {
        if (data.data?.image_id) {
          setImageId(data.data.image_id);
        }
      }
    });
  };

  const handleBatchGenerate = () => {
    if (!formData.keyword_id && !formData.content_id) return;
    
    batchGenerate({
      requests: [
        { ...formData, image_type: 'featured' },
        { ...formData, image_type: 'thumbnail' },
        { ...formData, image_type: 'banner' }
      ],
      settings: {
        dimensions: formData.dimensions,
        style_consistency: true
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          AI Image Generation
        </CardTitle>
        <CardDescription>
          Generate high-quality images for your content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Keyword ID</label>
            <Input
              placeholder="keyword_123"
              value={formData.keyword_id}
              onChange={(e) => setFormData({ ...formData, keyword_id: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Content ID</label>
            <Input
              placeholder="content_456"
              value={formData.content_id}
              onChange={(e) => setFormData({ ...formData, content_id: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Image Type</label>
            <Select value={formData.image_type} onValueChange={(value) => setFormData({ ...formData, image_type: value as typeof formData.image_type })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured Image</SelectItem>
                <SelectItem value="inline">Inline Image</SelectItem>
                <SelectItem value="thumbnail">Thumbnail</SelectItem>
                <SelectItem value="banner">Banner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Style</label>
            <Select value={formData.style} onValueChange={(value) => setFormData({ ...formData, style: value as typeof formData.style })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realistic">Realistic</SelectItem>
                <SelectItem value="artistic">Artistic</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Dimensions</label>
            <div className="flex gap-1">
              <Input
                type="number"
                value={formData.dimensions.width}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  dimensions: { ...formData.dimensions, width: parseInt(e.target.value) || 1200 }
                })}
                className="w-20"
              />
              <span className="flex items-center px-1">×</span>
              <Input
                type="number"
                value={formData.dimensions.height}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  dimensions: { ...formData.dimensions, height: parseInt(e.target.value) || 630 }
                })}
                className="w-20"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Custom Prompt (optional)</label>
          <textarea
            value={formData.prompt_override}
            onChange={(e) => setFormData({ ...formData, prompt_override: e.target.value })}
            placeholder="Override the default prompt with your custom description..."
            className="w-full h-24 p-3 border rounded-md resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={handleGenerate}
            disabled={generating || (!formData.keyword_id && !formData.content_id)}
            className="flex items-center gap-2"
          >
            {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Image
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleBatchGenerate}
            disabled={batchGenerating || (!formData.keyword_id && !formData.content_id)}
            className="flex items-center gap-2"
          >
            {batchGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Grid className="w-4 h-4" />}
            Batch Generate
          </Button>
        </div>

        {/* Image Status */}
        {imageStatus?.data && (
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Generation Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <Badge variant={imageStatus.data.status === 'completed' ? 'default' : 'secondary'}>
                  {imageStatus.data.status}
                </Badge>
              </div>
              
              {imageStatus.data.status === 'completed' && imageStatus.data.image_url && (
                <div className="space-y-2">
                  <div className="border rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={imageStatus.data.image_url} 
                      alt="Generated image"
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" asChild>
                      <a href={imageStatus.data.image_url} download>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </a>
                    </Button>
                    {imageStatus.data.thumbnail_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={imageStatus.data.thumbnail_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4 mr-2" />
                          View Thumbnail
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContentTranslation({ contentId }: ContentToolsProps) {
  const [formData, setFormData] = useState({
    content_id: contentId || '',
    target_languages: [] as string[],
    preserve_formatting: true,
    seo_optimize: true
  });
  
  const [translationId, setTranslationId] = useState<string>('');
  
  const { data: languages } = useTranslationLanguages();
  const { mutate: translateContent, isPending: translating } = useTranslateContent();
  const { data: translationStatus } = useTranslationStatus(translationId);

  const handleTranslate = () => {
    if (!formData.content_id || formData.target_languages.length === 0) return;
    
    translateContent(formData, {
      onSuccess: (data) => {
        if (data.data?.translation_id) {
          setTranslationId(data.data.translation_id);
        }
      }
    });
  };

  const handleLanguageToggle = (languageCode: string) => {
    const isSelected = formData.target_languages.includes(languageCode);
    if (isSelected) {
      setFormData({
        ...formData,
        target_languages: formData.target_languages.filter(lang => lang !== languageCode)
      });
    } else {
      setFormData({
        ...formData,
        target_languages: [...formData.target_languages, languageCode]
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-5 h-5" />
          Content Translation
        </CardTitle>
        <CardDescription>
          Translate your content to multiple languages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Content ID */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Content ID</label>
          <Input
            placeholder="content_123"
            value={formData.content_id}
            onChange={(e) => setFormData({ ...formData, content_id: e.target.value })}
          />
        </div>

        {/* Language Selection */}
        {languages?.data && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Target Languages</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {languages.data.languages.map((language) => (
                <label key={language.code} className="flex items-center gap-2 text-sm p-2 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.target_languages.includes(language.code)}
                    onChange={() => handleLanguageToggle(language.code)}
                  />
                  <span>{language.name}</span>
                  <span className="text-muted-foreground">({language.code})</span>
                </label>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              Selected: {formData.target_languages.length} languages
            </div>
          </div>
        )}

        {/* Options */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.preserve_formatting}
              onChange={(e) => setFormData({ ...formData, preserve_formatting: e.target.checked })}
            />
            Preserve formatting
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.seo_optimize}
              onChange={(e) => setFormData({ ...formData, seo_optimize: e.target.checked })}
            />
            SEO optimize translations
          </label>
        </div>

        {/* Action */}
        <Button 
          onClick={handleTranslate}
          disabled={translating || !formData.content_id || formData.target_languages.length === 0}
          className="w-full"
        >
          {translating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Layers className="w-4 h-4 mr-2" />}
          Start Translation
        </Button>

        {/* Translation Status */}
        {translationStatus?.data && (
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Translation Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Overall Status:</span>
                <Badge variant={translationStatus.data.status === 'completed' ? 'default' : 'secondary'}>
                  {translationStatus.data.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Language Progress:</div>
                {translationStatus.data.languages.map((lang) => (
                  <div key={lang.code} className="flex items-center justify-between text-sm">
                    <span>{lang.code}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={lang.status === 'completed' ? 'default' : 'secondary'}>
                        {lang.status}
                      </Badge>
                      {lang.content_id && (
                        <Button variant="outline" size="sm">
                          View Content
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContentPublishing({ contentId }: ContentToolsProps) {
  const [formData, setFormData] = useState({
    content_id: contentId || '',
    platforms: [] as Array<{
      type: 'wordpress' | 'shopify' | 'ghost' | 'custom';
      config: Record<string, unknown>;
      schedule?: string;
    }>,
    seo_optimization: true
  });
  
  const [publishId, setPublishId] = useState<string>('');
  
  const { mutate: publishContent, isPending: publishing } = usePublishContent();
  const { data: publishStatus } = usePublishStatus(publishId);

  const addPlatform = () => {
    setFormData({
      ...formData,
      platforms: [
        ...formData.platforms,
        {
          type: 'wordpress',
          config: { url: '', username: '', password: '' }
        }
      ]
    });
  };

  const updatePlatform = (index: number, updates: Partial<typeof formData.platforms[0]>) => {
    const newPlatforms = [...formData.platforms];
    newPlatforms[index] = { ...newPlatforms[index], ...updates };
    setFormData({ ...formData, platforms: newPlatforms });
  };

  const removePlatform = (index: number) => {
    setFormData({
      ...formData,
      platforms: formData.platforms.filter((_, i) => i !== index)
    });
  };

  const handlePublish = () => {
    if (!formData.content_id || formData.platforms.length === 0) return;
    
    publishContent(formData, {
      onSuccess: (data) => {
        if (data.data?.publish_id) {
          setPublishId(data.data.publish_id);
        }
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Content Publishing
        </CardTitle>
        <CardDescription>
          Publish content to multiple platforms automatically
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Content ID */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Content ID</label>
          <Input
            placeholder="content_123"
            value={formData.content_id}
            onChange={(e) => setFormData({ ...formData, content_id: e.target.value })}
          />
        </div>

        {/* Platforms Configuration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Publishing Platforms</label>
            <Button variant="outline" size="sm" onClick={addPlatform}>
              Add Platform
            </Button>
          </div>
          
          {formData.platforms.map((platform, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Select 
                    value={platform.type} 
                    onValueChange={(value) => updatePlatform(index, { type: value as typeof platform.type })}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wordpress">WordPress</SelectItem>
                      <SelectItem value="shopify">Shopify</SelectItem>
                      <SelectItem value="ghost">Ghost</SelectItem>
                      <SelectItem value="custom">Custom API</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="destructive" size="sm" onClick={() => removePlatform(index)}>
                    Remove
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input 
                    placeholder="API URL" 
                    value={(platform.config.url as string) || ''}
                    onChange={(e) => updatePlatform(index, { 
                      config: { ...platform.config, url: e.target.value }
                    })}
                  />
                  <Input 
                    placeholder="Username/API Key" 
                    value={(platform.config.username as string) || ''}
                    onChange={(e) => updatePlatform(index, { 
                      config: { ...platform.config, username: e.target.value }
                    })}
                  />
                </div>
                
                <Input 
                  type="datetime-local"
                  value={platform.schedule || ''}
                  onChange={(e) => updatePlatform(index, { schedule: e.target.value })}
                  placeholder="Schedule publication (optional)"
                />
              </div>
            </Card>
          ))}
        </div>

        {/* Options */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.seo_optimization}
              onChange={(e) => setFormData({ ...formData, seo_optimization: e.target.checked })}
            />
            Apply SEO optimization before publishing
          </label>
        </div>

        {/* Action */}
        <Button 
          onClick={handlePublish}
          disabled={publishing || !formData.content_id || formData.platforms.length === 0}
          className="w-full"
        >
          {publishing ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
          Publish Content
        </Button>

        {/* Publishing Status */}
        {publishStatus?.data && (
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Publishing Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Overall Status:</span>
                <Badge variant={publishStatus.data.status === 'completed' ? 'default' : 'secondary'}>
                  {publishStatus.data.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Platform Status:</div>
                {publishStatus.data.platforms.map((platform, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{platform.type}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={platform.status === 'completed' ? 'default' : platform.status === 'failed' ? 'destructive' : 'secondary'}>
                        {platform.status}
                      </Badge>
                      {platform.url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={platform.url} target="_blank" rel="noopener noreferrer">
                            View
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ContentEnhancementTools() {
  const [selectedContentId, setSelectedContentId] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Content Enhancement Tools</h1>
        <p className="text-muted-foreground">
          Advanced tools to enhance, translate, and distribute your content
        </p>
      </div>

      {/* Content ID Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Content Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Enter content ID for all tools..."
              value={selectedContentId}
              onChange={(e) => setSelectedContentId(e.target.value)}
              className="flex-1"
            />
            <Button 
              variant="outline"
              onClick={() => setSelectedContentId('content_demo_123')}
            >
              Use Demo Content
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tools */}
      <div className="grid grid-cols-1 gap-6">
        <ImageGeneration contentId={selectedContentId} />
        <ContentTranslation contentId={selectedContentId} />
        <ContentPublishing contentId={selectedContentId} />
      </div>
    </div>
  );
}