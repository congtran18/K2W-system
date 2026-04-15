import { K2WContentRecord } from '@k2w/database';

/**
 * Generate a highly aesthetic, responsive Tailwind CSS landing page from content.
 * Styled to match the branding and digital experience standards of CDA.
 */
export function generateAestheticTailwindLandingPage(content: K2WContentRecord): string {
  const hasImage = content.images && content.images.length > 0;
  const featuredImg = hasImage ? content.images[0] : '';

  return `
<!DOCTYPE html>
<html lang="${content.language || 'en'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.meta_title || content.title}</title>
    <meta name="description" content="${content.meta_description || ''}">
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
      }
      .font-display {
        font-family: 'Outfit', sans-serif;
      }
      .glassmorphism {
        background: rgba(17, 25, 40, 0.75);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .gradient-text {
        background: linear-gradient(135deg, #a5b4fc 0%, #c084fc 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    </style>
    ${content.schema_markup ? `<script type="application/ld+json">${content.schema_markup}</script>` : ''}
</head>
<body class="selection:bg-indigo-500/30 selection:text-indigo-200">
    <!-- Header/Navbar -->
    <header class="fixed top-0 left-0 w-full z-50 px-4 py-4 md:px-8">
        <nav class="max-w-6xl mx-auto glassmorphism rounded-2xl px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <span class="text-2xl font-display font-extrabold tracking-wider bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">CDA × K2W</span>
            </div>
            <div class="hidden md:flex items-center gap-8 text-sm text-gray-300 font-medium">
                <a href="#about" class="hover:text-white transition-colors">About</a>
                <a href="#features" class="hover:text-white transition-colors">Features</a>
                <a href="#faq" class="hover:text-white transition-colors">FAQs</a>
            </div>
            <div>
                <a href="#cta" class="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all">Get Started</a>
            </div>
        </nav>
    </header>

    <!-- Hero Section -->
    <section class="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div class="absolute top-20 right-10 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div class="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div class="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300 uppercase tracking-widest">
                    ⚡ SEO Optimized & Adaptive
                </div>
                <h1 class="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight leading-none text-white">
                    ${content.title}
                </h1>
                <p class="text-lg md:text-xl text-gray-400 font-light leading-relaxed">
                    ${content.meta_description || 'Stunning, strategic, and emotional experiences created dynamically to align with your business goals.'}
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <a href="#cta" class="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-xl shadow-indigo-600/20">
                        Explore Strategy
                    </a>
                    <a href="#features" class="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold border border-gray-700 hover:bg-gray-800 text-white transition-colors">
                        Learn More
                    </a>
                </div>
            </div>
            <div class="lg:col-span-5 flex justify-center">
                ${hasImage ? `
                <div class="relative group">
                    <div class="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <img src="${featuredImg}" alt="${content.title}" class="relative rounded-2xl max-w-full h-auto max-h-[350px] object-cover glassmorphism" />
                </div>
                ` : `
                <div class="w-full aspect-video rounded-2xl bg-gradient-to-tr from-indigo-900/40 to-violet-900/40 border border-gray-800 flex items-center justify-center text-indigo-400 font-display font-semibold text-lg">
                    [ Creative Visual Asset ]
                </div>
                `}
            </div>
        </div>
    </section>

    <!-- Main Content Body -->
    <section id="about" class="py-16 md:py-24 border-t border-gray-900 bg-gray-950/40">
        <div class="max-w-4xl mx-auto px-6 prose prose-invert prose-indigo prose-lg">
            <div class="text-gray-300 leading-relaxed space-y-6">
                ${content.body_html || content.body}
            </div>
        </div>
    </section>

    <!-- FAQs Section -->
    ${content.faqs && content.faqs.length > 0 ? `
    <section id="faq" class="py-16 md:py-24 border-t border-gray-900">
        <div class="max-w-3xl mx-auto px-6 space-y-12">
            <div class="text-center space-y-4">
                <h2 class="text-3xl md:text-4xl font-display font-extrabold text-white">Frequently Asked Questions</h2>
                <p class="text-gray-400 font-light">Got questions? We've got answers.</p>
            </div>
            <div class="grid gap-6">
                ${content.faqs.map(faq => `
                <div class="glassmorphism p-6 rounded-2xl space-y-2">
                    <h3 class="text-lg font-bold text-white">? ${faq.question}</h3>
                    <p class="text-gray-400 text-sm pl-4 leading-relaxed">${faq.answer}</p>
                </div>
                `).join('')}
            </div>
        </div>
    </section>
    ` : ''}

    <!-- CTA Section -->
    <section id="cta" class="py-16 md:py-24 border-t border-gray-900 bg-gradient-to-b from-transparent to-indigo-950/20">
        <div class="max-w-4xl mx-auto px-6 text-center space-y-8">
            <h2 class="text-3xl md:text-5xl font-display font-extrabold text-white tracking-tight">
                Let's Build Something Meaningful Together
            </h2>
            <p class="text-lg text-gray-400 font-light max-w-2xl mx-auto">
                Ready to take your digital experience to the next level? Get in touch with our design strategy team.
            </p>
            <div>
                <a href="https://collectivedesign.agency" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all duration-300">
                    Connect with CDA
                </a>
            </div>
        </div>
    </section>

    <footer class="py-8 border-t border-gray-900 text-center text-xs text-gray-500">
        <p>© ${new Date().getFullYear()} CDA × K2W Automation. Designed for dynamic scale.</p>
    </footer>
</body>
</html>
  `.trim();
}
