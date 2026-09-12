import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, ArrowLeft, ArrowRight, Share2, Check, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";
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
  }
};

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  usePageSEO({
    title: article ? `${article.title} | SlideBee Insights` : "Presentation Insights | SlideBee Blog",
    description: article?.content ? article.content.slice(0, 160) : "Expert guides on presentation design and executive keynotes.",
  });

  useEffect(() => {
    async function loadArticle() {
      setLoading(true);
      try {
        const { data } = await supabase
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
              <Sparkles size={12} /> Transform Your Decks
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
