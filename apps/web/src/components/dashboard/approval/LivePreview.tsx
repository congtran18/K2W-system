import React, { useRef, useEffect } from 'react';

interface LivePreviewProps {
  selectedContent: {
    title: string;
    meta_description?: string;
    images?: string[];
    faqs?: Array<{ question: string; answer: string }>;
    [key: string]: any;
  };
  previewMode: 'desktop' | 'mobile';
  editedTitle: string;
  editedBody: string;
}

export default function LivePreview({
  selectedContent,
  previewMode,
  editedTitle,
  editedBody
}: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Helper to wrap edited body HTML in agency template for preview
  const getAestheticPreviewHtml = (title: string, body: string, desc = '', images: string[] = [], faqs: any[] = []) => {
    const hasImage = images.length > 0 && images[0] && images[0].length > 0;
    const featuredImg = hasImage ? images[0] : '';
    // Escape image URL for safe embedding in HTML
    const safeImgUrl = featuredImg.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Plus+Jakarta+Sans:wght@300;400;500;700&display=swap" rel="stylesheet">
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  fontFamily: {
                    sans: ['Plus Jakarta Sans', 'sans-serif'],
                    display: ['Outfit', 'sans-serif'],
                  }
                }
              }
            }
          </script>
          <style>
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              background-color: #0b0f19;
              color: #f3f4f6;
              margin: 0;
              padding: 0;
            }
            .font-display {
              font-family: 'Outfit', sans-serif;
            }
            .glassmorphism {
              background: rgba(17, 25, 40, 0.75);
              backdrop-filter: blur(16px);
              border: 1px solid rgba(255, 255, 255, 0.08);
            }
          </style>
      </head>
      <body class="p-6 md:p-12 pb-24 selection:bg-indigo-500/30 selection:text-indigo-200">
          <div class="max-w-4xl mx-auto space-y-12">
              <!-- Banner Header -->
              <div class="glassmorphism rounded-2xl p-6 flex justify-between items-center">
                <span class="text-lg font-display font-extrabold tracking-wider bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">CDA Live Preview</span>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Draft Mode</span>
              </div>

              <!-- Hero -->
              <div class="space-y-6 text-center md:text-left">
                  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
                      ⚡ Brand Landing Page Template
                  </div>
                  <h1 class="text-4xl md:text-5xl font-display font-extrabold tracking-tight text-white leading-tight">
                      ${title}
                  </h1>
                  <p class="text-base md:text-lg text-gray-400 font-light leading-relaxed max-w-2xl">
                      ${desc || 'Trải nghiệm số độc đáo và nhiều cảm xúc, đồng hành cùng các chiến lược tiếp cận khách hàng tối ưu.'}
                  </p>
              </div>

              <!-- Cover Image -->
              ${hasImage ? `
              <div class="relative group rounded-2xl overflow-hidden aspect-video max-h-[350px] bg-slate-800/50">
                  <img src="${safeImgUrl}" alt="${title}" class="w-full h-full object-cover" 
                       onerror="this.style.display='none';this.parentElement.innerHTML='<div class=\\'w-full h-full flex items-center justify-center text-slate-500 text-sm\\'>🖼️ Image loading...</div>'" 
                       onload="this.parentElement.classList.add('image-loaded')" />
              </div>
              ` : `
              <div class="relative rounded-2xl overflow-hidden aspect-video max-h-[350px] bg-slate-800/30 border border-slate-700/50 flex items-center justify-center">
                  <div class="text-center text-slate-500">
                      <div class="text-3xl mb-2">🖼️</div>
                      <div class="text-sm">No cover image generated yet</div>
                  </div>
              </div>
              `}

              <!-- Body Copy -->
              <div class="prose prose-invert prose-indigo prose-lg max-w-none text-gray-300 leading-relaxed space-y-6 pt-6 border-t border-gray-900">
                  ${body}
              </div>

              <!-- FAQs -->
              ${faqs.length > 0 ? `
              <div class="space-y-6 pt-12 border-t border-gray-900">
                  <h2 class="text-2xl font-display font-extrabold text-white">Câu hỏi thường gặp</h2>
                  <div class="grid gap-4">
                      ${faqs.map(faq => `
                      <div class="glassmorphism p-5 rounded-xl">
                          <h3 class="text-base font-bold text-white mb-2">? ${faq.question}</h3>
                          <p class="text-gray-400 text-sm pl-4">${faq.answer}</p>
                      </div>
                      `).join('')}
                  </div>
              </div>
              ` : ''}
          </div>
      </body>
      </html>
    `;
  };

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(getAestheticPreviewHtml(
          editedTitle,
          editedBody,
          selectedContent.meta_description,
          selectedContent.images || [],
          selectedContent.faqs || []
        ));
        doc.close();
      }
    }
  }, [selectedContent, editedTitle, editedBody]);

  return (
    <div className="flex justify-center border bg-slate-900 rounded-xl p-4 transition-all duration-300">
      <div className={`transition-all duration-300 ${previewMode === 'mobile' ? 'w-[375px] h-[650px] shadow-2xl rounded-3xl border-[12px] border-slate-950 overflow-hidden' : 'w-full h-[650px] rounded-lg overflow-hidden'}`}>
        <iframe 
          ref={iframeRef} 
          title="Landing Page Preview" 
          className="w-full h-full bg-slate-950 border-0"
        />
      </div>
    </div>
  );
}
