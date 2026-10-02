import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, ArrowLeft, ArrowRight, Share2, Check, Layers } from "lucide-react";
import { d1 } from "../lib/d1";
import { normalizeR2Url } from "../lib/r2";
import { usePageSEO } from "../hooks/usePageSEO";

const defaultArticles: Record<string, any> = {
  "1": {
    id: "1",
    title: "The 3-Second Rule: Why Most C-Suite Slides Fail to Persuade",
    category: "Strategy",
    date: "September 2026",
    imageUrl: "/portfolio/case_study_a_14.png",
    readTime: "4 min read",
    keywords: [
      "presentation design",
      "c-suite slide structure",
      "3 second rule slides",
      "mckinsey presentation framework",
      "executive keynote design",
      "executive slide layout"
    ],
    metaDescription: "Learn the Ex-McKinsey 3-Second Rule for structuring high-impact executive presentation slides that persuade boardrooms and C-suite decision-makers.",
    content: `When presenting to senior executive stakeholders, dense walls of bullet points force the audience to read instead of listen. In high-stakes meetings with board members and C-level leaders, attention is the scarcest currency in the room.

### The Cognitive Cost of Bullet Points
Human working memory can only process one linguistic stream at a time. If an executive is reading 4 lines of 12-point text on a slide, they have completely tuned out your verbal voiceover. The presentation ceases to be a strategic conversation and becomes an awkward shared reading exercise.

Ex-McKinsey consultants and master storytellers adhere strictly to the **3-Second Rule**: within three seconds of a slide appearing, the audience must immediately comprehend:
1. **The Lead Assertion**: What is the core takeaway?
2. **The Evidence Anchor**: Which chart, metric, or visual proves that takeaway?
3. **The Strategic Next Step**: What action or decision is required?

### Structuring High-Impact Focal Points
Rather than dumping exhaustive research onto a slide, senior art directors organize content into clear, distinct focal zones:
- **Use Headline Sentences**: Replace generic category titles like "Financial Performance" with governing action headlines like "Gross Margins Expanded 420 bps Driven by Enterprise Expansion."
- **Isolate the Hero Metric**: One dominant, oversized statistic communicates more conviction than twelve small percentages scattered across four tables.
- **Enforce Visual Hierarchy**: Keep secondary details in muted warm grays (#726F6D) while drawing immediate focus to the decision variable using Honey Gold (#FCBF14) or deep contrast.

By treating each slide as an argumentative unit rather than an information bucket, your presentations shift from defensive updates to decisive leadership moments.`
  },
  "2": {
    id: "2",
    title: "How to Design a Series A Pitch Deck That Secures Partner Meetings",
    category: "Fundraising",
    date: "August 2026",
    imageUrl: "/portfolio/global_brands_1.png",
    readTime: "6 min read",
    keywords: [
      "series a pitch deck",
      "pitch deck design",
      "investor pitch deck template",
      "vc presentation structure",
      "tam sam som visualizer",
      "fundraising deck agency"
    ],
    metaDescription: "The essential 12-slide venture capital pitch deck structure that secures partner meetings, models TAM/SAM/SOM market size, and visualizes unit economics.",
    content: `Venture capitalists review hundreds of pitch decks every single week. Most partners spend less than 2 minutes and 40 seconds on an initial deck review before deciding whether to pass or schedule an introductory partner meeting.

### The Essential 12-Slide VC Narrative
An investor-grade venture deck follows a tightly wound narrative arc where every slide builds undeniable momentum toward valuation:
1. **Title & Vision**: A clear, one-line positioning statement that anchors your market category.
2. **The Structural Problem**: The expensive, urgent pain point experienced by a well-defined customer segment.
3. **The Unfair Advantage Solution**: Why software, AI, or structural shifts make your solution 10x better today.
4. **Market Sizing (TAM / SAM / SOM)**: Bottom-up unit-driven addressable market analysis rather than generic analyst percentages.
5. **Product & User Flow**: Visualized in clean, high-fidelity mockups that show product velocity.
6. **Business Model & Unit Economics**: CAC, LTV, payback periods, and gross margin trajectories.
7. **Traction & Moat**: MoM revenue velocity, cohort retention curves, and logos of lighthouse customers.
8. **Go-to-Market Engine**: Inbound mechanics, enterprise sales cycles, or product-led growth flywheel.
9. **Competitive Matrix**: Dimensional 2x2 positioning showing why incumbents cannot easily replicate your wedge.
10. **The Team**: Relevant founder pedigree, engineering velocity, and operational track record.
11. **Financial Projections**: 3-year milestone roadmap aligned with capital milestones.
12. **The Ask & Milestones**: Clear round size, use of funds, and the metrics to be unlocked prior to Series B.

### Turning Numbers into High-Trust Proof
Investors do not fund projections; they fund momentum. Replace generic stock graphics with real customer cohorts, verifiable unit economics, and clean chart visualizers that demonstrate deep financial command.`
  },
  "3": {
    id: "3",
    title: "Building an Enterprise Master Template System That Teams Actually Use",
    category: "Branding",
    date: "August 2026",
    imageUrl: "/portfolio/levis_yuengling_6.png",
    readTime: "5 min read",
    keywords: [
      "enterprise master template",
      "corporate slide templates",
      "powerpoint layout locking",
      "brand slide system",
      "presentation template agency",
      "powerpoint slide masters"
    ],
    metaDescription: "Discover how to architect scalable corporate PowerPoint master slide systems with layout locking, modular drag-and-drop components, and brand consistency.",
    content: `Why do corporate slide templates break within weeks of launch? In organizations with 500+ employees, standard PowerPoint files quickly degenerate into misaligned typefaces, clashing brand colors, and stretched vector graphics.

### The Failure of Traditional Template Design
Most design agencies build presentation decks from a graphic designer's perspective, without understanding the day-to-day workflow of salespeople, product managers, and finance analysts. When non-designers are forced to resize text boxes or hunt for hex codes, they inevitably abandon the master template.

### Layout Locking & Modular Systems
To build an enterprise template system that maintains visual integrity across global departments:
- **Lock Master Layouts**: Use PowerPoint slide masters to establish rigid placeholders for headers, footers, slide numbers, and legal disclaimers that cannot be accidentally nudged or deleted.
- **Curate a Restricted Palette**: Define exactly 4 primary theme colors and 2 high-contrast accent colors directly within the XML theme definition, removing neon default choices.
- **Provide Drag-and-Drop Modules**: Include pre-built visual components: 3-column feature cards, 4-step process arrows, timeline callouts, and clean table headers that team members can paste directly without reformatting.
- **Embed High-Res Vector Icon Packs**: Provide an organized slide of 100+ branded vector icons directly in the template file, preventing employees from pulling pixelated low-res JPEGs from search engines.

A truly successful enterprise template balances uncompromising brand consistency with effortless daily usability.`
  },
  "4": {
    id: "4",
    title: "Top 10 Presentation Design Best Practices for High-Stakes Keynotes",
    category: "Keynote",
    date: "September 2026",
    imageUrl: "/portfolio/nike_hsbc_cvs_1.png",
    readTime: "6 min read",
    keywords: [
      "keynote presentation design",
      "high stakes keynote best practices",
      "stage presentation design",
      "conference slide design",
      "ceo keynote slides"
    ],
    metaDescription: "Master the 10 executive presentation design principles trusted by Fortune 500 CEOs for summits, product launches, and high-contrast stage keynotes.",
    content: `When a CEO takes the stage at a global summit, product launch, or industry keynote, the presentation slides serve an entirely different purpose than an internal memo or boardroom briefing.

### 1. Design for the Back Row (The 30-Foot Test)
In a venue with 1,000+ attendees, small text is invisible. If a viewer sitting 30 feet from the screen cannot instantly read the focal point, the slide fails. Keynotes demand oversized typography (44pt+ headlines), extreme negative space, and single-idea compositions.

### 2. High-Contrast Darkness
Stage projection screens are prone to washouts from venue lighting. High-contrast dark backgrounds (#111111) paired with radiant accent highlights (#FCBF14) dramatically reduce eye strain and command the room's collective focus.

### 3. One Thought Per Slide
If an idea requires three sub-points, make three sequential slides. Advancing slides frequently creates forward narrative momentum and keeps the audience's gaze locked to the speaker.

### 4. Replace Sentences with Cinematic Imagery
A speaker should never read their slides. Use custom full-bleed vector graphics, product hero shots, or high-definition isometric renders that evoke emotion while the speaker provides the verbal narrative.

### 5. Seamless Rehearsals with Clicker Friendly Timing
Always rehearse with a physical presentation remote. Animation triggers must be instantaneous, avoiding complex 5-second transition delays that interrupt natural speaking rhythm.`
  },
  "5": {
    id: "5",
    title: "PowerPoint vs Google Slides vs Keynote: Which is Best for Executives?",
    category: "Software",
    date: "July 2026",
    imageUrl: "/portfolio/case_study_a_3.png",
    readTime: "5 min read",
    keywords: [
      "powerpoint vs google slides",
      "best presentation tool for executives",
      "google slides vs keynote",
      "enterprise presentation software",
      "boardroom presentation tool"
    ],
    metaDescription: "An executive comparison of Microsoft PowerPoint, Google Slides, and Apple Keynote across typographic control, team collaboration, and boardroom reliability.",
    content: `Choosing the right presentation tool impacts everything from layout fidelity and font rendering to cross-team collaboration and boardroom reliability.

### Microsoft PowerPoint: The Enterprise Standard
- **Strengths**: Unmatched typographic control, XML master slide customization, robust offline reliability, and universal enterprise acceptance across Fortune 500 IT policies.
- **Best For**: Boardroom meetings, complex financial modeling, investor presentations, and master corporate templates.

### Google Slides: Real-Time Team Collaboration
- **Strengths**: Effortless browser-based co-authoring, version history, and frictionless sharing via simple links.
- **Limitations**: Limited OpenType font support, lack of precision layout locking, and reliance on stable internet connectivity during live presentations.
- **Best For**: Internal team brainstorming, sprint reviews, and distributed agency co-working.

### Apple Keynote: Cinematic Stage Polish
- **Strengths**: Award-winning typography engine, native Mac rendering, Magic Move transitions, and broadcast-quality export formats.
- **Limitations**: Limited ecosystem penetration in enterprise Windows environments.
- **Best For**: Tech founder launch keynotes, creative agency pitch presentations, and design award reels.

At SlideBee, our master decks are crafted natively in Microsoft PowerPoint (.pptx) with full cross-compatibility for Google Slides and Keynote imports.`
  },
  "6": {
    id: "6",
    title: "How Much Does Professional Presentation Design Cost in 2026? Pricing Breakdown",
    category: "Economics",
    date: "July 2026",
    imageUrl: "/portfolio/global_brands_4.png",
    readTime: "7 min read",
    keywords: [
      "presentation design cost",
      "presentation design agency pricing",
      "how much does pitch deck design cost",
      "presentation designer hourly rate",
      "slide design packages"
    ],
    metaDescription: "Complete 2026 pricing guide for presentation design studios, freelance marketplaces, and brand agencies with turnaround SLAs and cost comparisons.",
    content: `Whether you are preparing a $5M Series A pitch deck, an executive keynote, or a 100-slide corporate template system, understanding agency pricing prevents expensive surprises.

### The 3 Tiers of Presentation Design

#### Tier 1: Freelance Marketplaces ($15 – $40 per slide)
- **What You Get**: Quick cosmetic cleanup, color adjustments, and alignment fixes.
- **Trade-Off**: Little to no strategic narrative restructuring, generic stock icon usage, and high risk of NDA leaks.

#### Tier 2: Dedicated Presentation Studios like SlideBee ($19 – $49 per slide / Flat Packages)
- **What You Get**: Senior Art Director supervision, ex-consulting storytelling frameworks, bespoke vector charts, 24h–48h SLA, 2 revision rounds, and strict mutual NDAs.
- **Ideal For**: Venture-backed startups, executive speakers, and fast-growing SME enterprises.

#### Tier 3: Elite Brand Agencies ($500+ per slide / $25,000+ per deck)
- **What You Get**: Complete copywriting overhaul, custom 3D motion design, and months of creative workshops.
- **Trade-Off**: 6-week to 12-week turnaround cycles that are often too slow for rapid fundraising milestones.

Transparent pricing with clear turnaround SLAs delivers the highest return on investment for high-stakes business pitches.`
  },
  "7": {
    id: "7",
    title: "Complete Ecommerce Website Development Guide for Modern Brands (₹25,000 Package)",
    category: "Ecommerce",
    date: "September 2026",
    imageUrl: "/portfolio/case_study_a_8.png",
    readTime: "8 min read",
    keywords: [
      "ecommerce website development",
      "ecommerce package 25000",
      "razorpay storefront design",
      "small business ecommerce development",
      "direct to consumer website setup"
    ],
    metaDescription: "A complete guide to launching an online store with 500 product capacity, Razorpay checkout, Cloudflare deployment, and Zoho business email for ₹25,000.",
    content: `For emerging direct-to-consumer (D2C) brands, boutique retailers, and small businesses, launching an online store historically meant choosing between overpriced agency quotes or confusing DIY page builders.

### The All-Inclusive ₹25,000 Launch Architecture
SlideBee's Ecommerce Website Package provides a complete, production-ready storefront designed to scale without recurring vendor lock-ins:

1. **500 Product Capacity**: Full support for categories, variants (size, color, material), inventory tracking, and high-resolution photo galleries.
2. **Certified Razorpay Gateway**: Instant integration for UPI, Credit/Debit cards, Net Banking, and wallet payments with automated order verification.
3. **Consumer-Grade UX**: Smooth cart drawer, coupon discount engine, delivery fee calculations, and 2-step mobile checkout.
4. **Customer Accounts & Google Sign-In**: Frictionless authentication with order history tracking and self-service address management.
5. **Cloudflare Global Deployment**: Ultra-low latency edge delivery, 99.9% uptime, and free automatic SSL encryption.
6. **Professional Zoho Business Email**: Domain verification and setup for hello@, support@, and orders@ mailboxes.
7. **30-Day Launch Support**: Dedicated technical warranty covering bug fixes and deployment support.

By consolidating design, development, and infrastructure setup into a single ₹25,000 investment, brands launch within 7–10 days with complete code and domain ownership.`
  },
  "8": {
    id: "8",
    title: "Data Visualization in Presentations: Turning Complex Spreadsheets into Persuasive Charts",
    category: "Data Viz",
    date: "June 2026",
    imageUrl: "/portfolio/nike_hsbc_cvs_4.png",
    readTime: "6 min read",
    keywords: [
      "data visualization presentations",
      "financial data visualization slides",
      "how to visualize complex spreadsheets",
      "executive chart design",
      "waterfall charts presentation"
    ],
    metaDescription: "Learn how to transform dense spreadsheets into high-impact waterfall charts, cohort heatmaps, and executive board presentations.",
    content: `When executives view complex financial models, dense spreadsheets create analysis paralysis. The goal of executive data visualization is not to display all the data, but to highlight the governing conclusion.

### 1. Declutter the Canvas (Reduce Data-Ink Ratio)
Remove heavy black gridlines, redundant axis tick marks, and 3D bevel effects. Every visual element on the slide must serve a communicative function.

### 2. Isolate the Hero Metric
When presenting quarterly growth, do not force the audience to calculate the net increase. Highlight the net growth percentage in oversized 48pt Honey Gold (#FCBF14) directly above the trendline.

### 3. Choose the Right Chart Architecture
- **Waterfall Charts**: Ideal for EBITDA bridge reconciliations and ARR expansion walks.
- **Cohort Heatmaps**: Perfect for demonstrating customer retention velocity to venture investors.
- **Grouped Bar Charts**: Best for benchmarking unit economics against market incumbents.

By pairing clean typography with strict color contrast, data transforms from a boring table into an executive decision catalyst.`
  },
  "9": {
    id: "9",
    title: "The Anatomy of a High-Converting B2B Sales Deck: Frameworks & Real Examples",
    category: "Sales",
    date: "June 2026",
    imageUrl: "/portfolio/levis_yuengling_2.png",
    readTime: "5 min read",
    keywords: [
      "b2b sales deck design",
      "high converting sales deck",
      "consultative sales presentation framework",
      "b2b slide deck template",
      "enterprise sales deck structure"
    ],
    metaDescription: "Structure an enterprise B2B sales presentation using the 5-part consensus framework that positions urgent customer pain before product features.",
    content: `Traditional sales presentations open with 5 slides about the seller: company history, office locations, and leadership awards. Prospects do not care about your history; they care about their urgent business pain.

### The 5-Part Consensus Framework
1. **The Undeniable Industry Shift**: Start with a macroeconomic change that creates urgent new stakes for the buyer's industry.
2. **Winners vs Losers**: Clearly delineate why legacy methods are collapsing under this shift while agile competitors thrive.
3. **The Promised Land**: Describe the ideal future state before mentioning your product.
4. **The Magic Gifts**: Introduce your software or service as the specific capabilities needed to reach that promised land.
5. **Verifiable Proof**: Real customer case studies demonstrating quantifiable ROI within 90 days.

This narrative architecture turns defensive product demos into consultative executive agreements.`
  },
  "10": {
    id: "10",
    title: "Essential SEO & Digital Storefront Checklist for Growing Businesses in 2026",
    category: "SEO & Growth",
    date: "May 2026",
    imageUrl: "/portfolio/global_brands_8.png",
    readTime: "7 min read",
    keywords: [
      "technical seo checklist 2026",
      "digital storefront seo",
      "schema org rich snippets",
      "google search console indexing",
      "inp core web vitals optimization"
    ],
    metaDescription: "A step-by-step technical SEO checklist for 2026 covering Google Search Console indexing, JSON-LD Schema.org rich snippets, XML sitemaps, and INP optimization.",
    content: `Building a beautiful website or ecommerce store is only half the battle. If search engines cannot crawl, comprehend, and index your storefront, organic traffic remains zero.

### 1. Google Search Console & Index Verification
- Verify your domain via DNS TXT records.
- Submit clean XML sitemaps containing all primary product and service URLs.
- Monitor Core Web Vitals (LCP, INP, CLS) to ensure sub-2-second mobile load times and instant touch interactivity.

### 2. Schema.org Structured Data
Incorporate JSON-LD rich snippets:
- **Organization & ProfessionalService**: Business name, logo, address, and operating hours.
- **Product & Offer Schema**: Item name, price, currency, availability, and review ratings.
- **WebSite with SearchAction**: Enable Google sitelinks and direct query routing.

### 3. Canonical URLs & Mobile Optimization
Enforce canonical URLs to eliminate duplicate content issues. Test your site with Google Mobile-Friendly testing to ensure responsive typography, touch targets, and instant viewport scaling.`
  }
};

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  const activeArticleId = article?.id || id || "1";
  const articleKeywords = article?.keywords || [
    "presentation design",
    "pitch deck strategy",
    "powerpoint templates",
    "executive keynote design",
  ];

  const cleanDescription = article?.metaDescription || (article?.content
    ? article.content.replace(/#{1,6}\s+/g, "").replace(/\*\*|\*/g, "").slice(0, 155) + "..."
    : "Expert guides on presentation design, pitch decks, and executive storytelling.");

  const ogImageUrl = article?.imageUrl
    ? (article.imageUrl.startsWith("http") ? article.imageUrl : `https://theslidebee.com${article.imageUrl}`)
    : "https://theslidebee.com/slidebee_logo_light.png";

  const canonicalUrl = `https://theslidebee.com/blog/${activeArticleId}`;

  const blogJsonLd = article ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "description": cleanDescription,
    "image": [ogImageUrl],
    "datePublished": "2026-09-01T00:00:00Z",
    "dateModified": "2026-10-01T00:00:00Z",
    "author": {
      "@type": "Organization",
      "name": "SlideBee Presentation Studio",
      "url": "https://theslidebee.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SlideBee",
      "logo": {
        "@type": "ImageObject",
        "url": "https://theslidebee.com/slidebee_logo_light.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    }
  } : undefined;

  usePageSEO({
    title: article ? `${article.title} | SlideBee Insights` : "Presentation Insights | SlideBee Blog",
    description: cleanDescription,
    keywords: articleKeywords,
    canonicalUrl,
    ogType: "article",
    ogImage: ogImageUrl,
    ogUrl: canonicalUrl,
    twitterCard: "summary_large_image",
    twitterImage: ogImageUrl,
    jsonLd: blogJsonLd,
  });

  useEffect(() => {
    async function loadArticle() {
      setLoading(true);
      try {
        const { data } = await d1
          .from("site_config")
          .select("value")
          .eq("key", "blog_cms")
          .maybeSingle();

        if (data?.value && Array.isArray(data.value)) {
          const found = data.value.find((a: any) => String(a.id) === String(id));
          if (found) {
            setArticle(found);
            setLoading(false);
            return;
          }
        }

        // Fallback to default articles
        if (id && defaultArticles[id]) {
          setArticle(defaultArticles[id]);
        } else if (id) {
          // If custom id, pick first default or match
          setArticle(defaultArticles["1"]);
        }
      } catch (err) {
        console.warn("Could not load article:", err);
        if (id && defaultArticles[id]) {
          setArticle(defaultArticles[id]);
        }
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9E8] flex items-center justify-center pt-24">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-36 pb-24 large-hex-grid">
        <div className="w-[90%] max-w-[800px] mx-auto text-center px-4">
          <h1 className="text-3xl font-heading font-extrabold mb-4">Article Not Found</h1>
          <p className="text-sm text-[#726F6D] mb-8">The requested article could not be located.</p>
          <Link
            to="/blog"
            className="hex-pill inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-3 text-xs shadow-md"
          >
            <ArrowLeft size={14} /> Back to All Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-32 pb-24 large-hex-grid">
      <div className="w-[90%] max-w-[960px] mx-auto px-4 sm:px-6">

        {/* Back Link */}
        <div className="mb-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-[#726F6D] hover:text-primary-amber transition-colors"
          >
            <ArrowLeft size={14} /> Back to All Articles
          </Link>
        </div>

        {/* Header Metadata */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="hex-pill-sm bg-[#111111] text-[#FCBF14] border border-primary/40 text-[10px] font-black px-3.5 py-1">
              {article.category || "Design Insights"}
            </span>
            <div className="flex items-center text-xs text-[#726F6D] font-bold gap-1.5">
              <Calendar size={13} className="text-primary-amber" />
              <span>{article.date || "September 2026"}</span>
            </div>
            {article.readTime && (
              <>
                <span className="text-xs text-[#726F6D]">•</span>
                <span className="text-xs text-[#726F6D] font-medium">{article.readTime}</span>
              </>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#111111] leading-tight">
            {article.title}
          </h1>
        </div>

        {/* Featured Image */}
        {article.imageUrl && (
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border-2 border-primary/40 shadow-xl mb-12 bg-[#111111]">
            <img
              src={normalizeR2Url(article.imageUrl)}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        <article className="hex-card-lg bg-white border-2 border-primary/30 p-8 sm:p-12 shadow-sm mb-12">
          <div className="prose prose-stone max-w-none text-[#111111] text-sm sm:text-base leading-relaxed space-y-6 font-medium">
            {article.content.split(/\n\n+/).map((paragraph: string, idx: number) => {
              const trimmed = paragraph.trim();
              if (trimmed.startsWith("### ")) {
                return (
                  <h3 key={idx} className="text-xl sm:text-2xl font-heading font-extrabold text-[#111111] pt-4 pb-1">
                    {trimmed.replace("### ", "")}
                  </h3>
                );
              }
              if (trimmed.startsWith("- ")) {
                const listItems = trimmed.split(/\n-\s+/);
                return (
                  <ul key={idx} className="space-y-2 pl-4 border-l-2 border-primary/40 my-4">
                    {listItems.map((item, i) => (
                      <li key={i} className="text-xs sm:text-sm text-[#333333] leading-relaxed">
                        {item.replace(/^- /, "")}
                      </li>
                    ))}
                  </ul>
                );
              }
              if (trimmed.match(/^[0-9]+\.\s/)) {
                const numItems = trimmed.split(/\n(?=[0-9]+\.\s)/);
                return (
                  <ol key={idx} className="space-y-2 pl-5 list-decimal text-xs sm:text-sm text-[#333333] leading-relaxed my-4">
                    {numItems.map((item, i) => (
                      <li key={i}>
                        {item.replace(/^[0-9]+\.\s/, "")}
                      </li>
                    ))}
                  </ol>
                );
              }
              return (
                <p key={idx} className="text-xs sm:text-sm text-[#333333] leading-relaxed">
                  {trimmed}
                </p>
              );
            })}
          </div>

          {/* Social Share & Author Bar */}
          <div className="border-t border-primary/20 mt-10 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-heading font-black text-xs text-[#111111]">
                SB
              </div>
              <div>
                <div className="text-xs font-heading font-extrabold text-[#111111]">
                  SlideBee Editorial Team
                </div>
                <div className="text-[11px] text-[#726F6D] font-medium">
                  Senior Presentation Strategists & Art Directors
                </div>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="hex-pill inline-flex items-center gap-1.5 bg-[#FFF9E8] hover:bg-black/5 text-[#111111] border border-primary/40 px-4 py-2 text-xs font-extrabold transition-all"
            >
              {copiedLink ? <Check size={13} className="text-green-600" /> : <Share2 size={13} />}
              <span>{copiedLink ? "Link Copied" : "Share Article"}</span>
            </button>
          </div>
        </article>

        {/* Bottom CTA Banner */}
        <div className="hex-card-dark p-8 sm:p-10 border-2 border-primary text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-xl mx-auto space-y-4 relative z-10">
            <span className="hex-pill inline-flex items-center gap-1.5 bg-primary text-[#111111] px-4 py-1 text-xs font-black uppercase tracking-wider">
              <Layers size={12} /> Transform Your Decks
            </span>
            <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              Need Investor-Grade Slides Built for Your Next Meeting?
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 font-medium">
              Explore our curated marketplace of master PowerPoint templates or book our bespoke redesign services with 24-hour delivery.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/templates"
                className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-3 text-xs transition-transform hover:scale-105 shadow-md flex items-center gap-1.5"
              >
                Browse Templates <ArrowRight size={14} />
              </Link>
              <Link
                to="/ordernow"
                className="hex-pill bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 text-xs border border-white/20 transition-all flex items-center gap-1.5"
              >
                Get a Quote
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
