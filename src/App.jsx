import { useEffect, useMemo, useRef, useState } from "react";

const WHATSAPP_E164 = "+201507619503"; // عدّل الرقم هنا
const BRAND = "ICODE";

function waLink(message) {
  const num = WHATSAPP_E164.replace(/[^\d+]/g, "").replace("+", "");
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

function pitch() {
  return `مرحبًا ${BRAND}،
عايز صفحة/موقع لخدمتي.

الهدف: (اكتب)
عدد الصفحات: (اكتب)
المحتوى جاهز؟ (نعم/لا)
الموعد المطلوب: (اكتب)
الميزانية: (اكتب)
روابط تعجبني: (اكتب)
رقمي: (اكتب)`;
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useParallaxGlow(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onMove = (ev) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = ((ev.clientX - r.left) / r.width) * 100;
        const y = ((ev.clientY - r.top) / r.height) * 100;
        el.style.setProperty("--mx", `${x}%`);
        el.style.setProperty("--my", `${y}%`);
      });
    };
    el.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mousemove", onMove);
    };
  }, [ref]);
}

export default function App() {
  useReveal();

  const heroCardRef = useRef(null);
  useParallaxGlow(heroCardRef);

  const [drawer, setDrawer] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("icode_theme") || "dark");

  const [secretOpen, setSecretOpen] = useState(false);
  const [mouseMoves, setMouseMoves] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [focused, setFocused] = useState(true);
  const t0 = useMemo(() => performance.now(), []);

  const wa = useMemo(() => waLink(pitch()), []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme === "light" ? "light" : "dark";
    localStorage.setItem("icode_theme", theme);
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setMaxScroll((v) => Math.max(v, window.scrollY));
    const onMove = () => setMouseMoves((v) => v + 1);
    const onFocus = () => setFocused(true);
    const onBlur = () => setFocused(false);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  // Double-tap (double click) on logo to toggle diagnostics
  const tapRef = useRef({ n: 0, t: 0 });
  const onLogoTap = () => {
    const now = Date.now();
    const s = tapRef.current;
    if (now - s.t > 1200) { s.n = 0; }
    s.t = now;
    s.n += 1;
    if (s.n >= 2) {
      s.n = 0;
      setSecretOpen((v) => !v);
    }
  };

  const copyPitch = async () => {
    try {
      await navigator.clipboard.writeText(pitch());
      alert("تم نسخ رسالة واتساب.");
    } catch {
      // fallback
      prompt("انسخ الرسالة يدويًا:", pitch());
    }
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const fmt = (ms) => `${Math.round(ms)}ms`;

  return (
    <div className="page">
      <div className="bg" aria-hidden="true">
        <div className="orb o1" />
        <div className="orb o2" />
        <div className="grid" />
        <div className="noise" />
      </div>

      <header className="topbar">
        <div className="wrap bar" data-reveal>
          <a className="brand" href="#top" onClick={(e) => { e.preventDefault(); scrollTop(); }} aria-label="ICODE">
            <span className="mark" onClick={(e) => { e.stopPropagation(); onLogoTap(); }} title="ICODE">
              <span className="cube" aria-hidden="true" />
            </span>
            <span className="btxt">
              <b>ICODE</b>
              <span>Web • UI • Deploy</span>
            </span>
          </a>

          <nav className="nav" aria-label="التنقل">
            <a href="#services">الخدمات</a>
            <a href="#work">أعمال</a>
            <a href="#process">المنهج</a>
            <a href="#faq">أسئلة</a>
            <a href="#contact">تواصل</a>
          </nav>

          <div className="actions">
            <button className="iconBtn" type="button" onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} aria-label="تبديل الثيم">
              ◐
            </button>
            <button className="iconBtn burger" type="button" onClick={() => setDrawer(true)} aria-label="فتح القائمة">
              <span className="lines" />
            </button>
            <a className="btn primary" href="#contact">اطلب عرض سعر</a>
          </div>
        </div>

        <div className={`drawer ${drawer ? "open" : ""}`} role="dialog" aria-hidden={!drawer} onClick={() => setDrawer(false)}>
          <div className="drawerCard" onClick={(e) => e.stopPropagation()}>
            {[
              ["الخدمات", "#services"],
              ["أعمال", "#work"],
              ["المنهج", "#process"],
              ["أسئلة", "#faq"],
              ["تواصل", "#contact"],
            ].map(([t, h]) => (
              <a key={h} className="dlink" href={h} onClick={() => setDrawer(false)}>{t}</a>
            ))}
            <button className="btn ghost" type="button" onClick={() => setDrawer(false)}>إغلاق</button>
          </div>
        </div>
      </header>

      <main id="top" className="hero">
        <div className="wrap heroGrid">
          <section className="heroText" data-reveal>
            <div className="kicker">
              <span className="dot" />
              تنفيذ سريع + مظهر راقي + نتائج قابلة للقياس
            </div>

            <h1>
              موقعك لازم يبيع…
              <span className="grad"> مش بس يبقى شكله حلو</span>
            </h1>

            <p className="sub">
              ICODE يبني صفحات هبوط ومواقع شركات وواجهات UI “نظيفة” تشتغل بسرعة،
              وتكون جاهزة للنشر وربط DNS بدون وجع دماغ.
            </p>

            <div className="heroCtas">
              <a className="btn primary" href="#contact">ابدأ مشروعك الآن</a>
              <a className="btn ghost" href="#services">شوف الخدمات</a>
            </div>

            <div className="proof">
              <div className="proofItem">
                <b>أولوية الأداء</b>
                <span>تحميل سريع وتجربة سلسة</span>
              </div>
              <div className="proofItem">
                <b>تصميم “مقنع”</b>
                <span>هرمية محتوى تدفع للقرار</span>
              </div>
              <div className="proofItem">
                <b>تسليم واضح</b>
                <span>مراحل + مخرجات + مراجعات</span>
              </div>
            </div>
          </section>

          <aside className="heroCard" ref={heroCardRef} data-reveal>
            <div className="cardHead">
              <div>
                <div className="cardTitle">عرض سريع</div>
                <div className="cardHint">خلال 24–72 ساعة حسب النطاق</div>
              </div>
              <span className="chip">جاهز للنشر</span>
            </div>

            <div className="cardList">
              <div className="row">
                <span className="check">✓</span>
                <div>
                  <b>Landing Page</b>
                  <p>هيكل بيع + CTA + واتساب + SEO أساسي</p>
                </div>
              </div>
              <div className="row">
                <span className="check">✓</span>
                <div>
                  <b>UI نظيف</b>
                  <p>تباين صحيح + خط عربي + responsive</p>
                </div>
              </div>
              <div className="row">
                <span className="check">✓</span>
                <div>
                  <b>Deploy + DNS</b>
                  <p>Cloudflare/GitHub Pages + توثيق</p>
                </div>
              </div>
            </div>

            <div className="cardFoot">
              <a className="btn primary wide" href={wa} target="_blank" rel="noreferrer">فتح واتساب</a>
              <button className="btn ghost wide" type="button" onClick={copyPitch}>انسخ رسالة واتساب جاهزة</button>
              <p className="tiny">*الأسعار تُحدد بعد معرفة: الصفحات، المحتوى، والموعد.</p>
            </div>

            <div className={`secret ${secretOpen ? "show" : ""}`} aria-live="polite">
              <div className="secretTitle">Diagnostics (Hidden)</div>
              <div className="secretGrid">
                <div className="metric"><span>وقت الفتح</span><b>{fmt(performance.now() - t0)}</b></div>
                <div className="metric"><span>حركة الماوس</span><b>{mouseMoves}</b></div>
                <div className="metric"><span>عمق التصفح</span><b>{Math.round(maxScroll)}px</b></div>
                <div className="metric"><span>التركيز</span><b>{focused ? "On" : "Off"}</b></div>
              </div>
              <div className="secretHint">تفعيل/إخفاء: Double-click على الأيقونة.</div>
            </div>
          </aside>
        </div>
      </main>

      <section className="section" id="services">
        <div className="wrap" data-reveal>
          <div className="secHead">
            <h2>الخدمات</h2>
            <p>خدمات عملية تُسلَّم كمنتج نهائي، مش وعود.</p>
          </div>

          <div className="grid3">
            <article className="card">
              <h3>صفحات هبوط تبيع</h3>
              <p>هيكل محتوى يرفع التحويل: عرض → إثبات → CTA.</p>
              <div className="tags"><span>CTA</span><span>SEO</span><span>WhatsApp</span></div>
            </article>

            <article className="card">
              <h3>مواقع شركات</h3>
              <p>هوية + خدمات + أعمال + تواصل… بشكل مرتب ومقنع.</p>
              <div className="tags"><span>Brand</span><span>Responsive</span><span>Content</span></div>
            </article>

            <article className="card">
              <h3>UI وتنفيذ واجهات</h3>
              <p>تحويل تصميم إلى واجهة حقيقية قابلة للصيانة.</p>
              <div className="tags"><span>Clean UI</span><span>Components</span><span>Accessibility</span></div>
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="work">
        <div className="wrap" data-reveal>
          <div className="secHead">
            <h2>أعمال</h2>
            <p>ضع روابط أعمالك لاحقًا. هذه قوالب توضيحية.</p>
          </div>

          <div className="grid3">
            <article className="card"><h3>Landing — خدمات</h3><p>Hero قوي + أقسام بيع + CTA واضح.</p></article>
            <article className="card"><h3>Portfolio — شخصي</h3><p>عرض مهارات وأعمال بدون مبالغة.</p></article>
            <article className="card"><h3>Company — شركة</h3><p>هيكل شركة جاهز: خدمات/أعمال/تواصل.</p></article>
          </div>
        </div>
      </section>

      <section className="section" id="process">
        <div className="wrap" data-reveal>
          <div className="secHead">
            <h2>منهج التنفيذ</h2>
            <p>4 مراحل… كل مرحلة لها مخرج واضح.</p>
          </div>

          <div className="steps">
            <div className="step"><span className="num">1</span><div><b>جمع المتطلبات</b><p>هدف الصفحة + الجمهور + CTA + أمثلة مرجعية.</p></div></div>
            <div className="step"><span className="num">2</span><div><b>هيكل المحتوى</b><p>ترتيب الأقسام لتوجيه العميل لاتخاذ القرار.</p></div></div>
            <div className="step"><span className="num">3</span><div><b>التنفيذ والتلميع</b><p>Responsive + تباين + سرعة + لمسات UI.</p></div></div>
            <div className="step"><span className="num">4</span><div><b>النشر والتوثيق</b><p>Pages + DNS + ملف تسليم مختصر.</p></div></div>
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="wrap" data-reveal>
          <div className="secHead">
            <h2>أسئلة شائعة</h2>
            <p>مختصر ومباشر.</p>
          </div>

          <div className="faq">
            <details className="qa">
              <summary>هل التصميم عربي بالكامل؟</summary>
              <p>نعم. RTL مضبوط، وخط عربي، وتباين واضح.</p>
            </details>
            <details className="qa">
              <summary>هل ممكن نشر مجاني؟</summary>
              <p>نعم عبر GitHub Pages أو Cloudflare Pages بدون تكلفة.</p>
            </details>
            <details className="qa">
              <summary>إيه المطلوب للبدء؟</summary>
              <p>اسم النشاط، الخدمات، رقم واتساب، وروابط أمثلة تعجبك.</p>
            </details>
          </div>
        </div>
      </section>

      <section className="section" id="contact">
        <div className="wrap" data-reveal>
          <div className="contactCard">
            <div className="secHead">
              <h2>تواصل الآن</h2>
              <p>أسرع قناة: واتساب. رسالة جاهزة لتحديد النطاق فورًا.</p>
            </div>

            <div className="contactGrid">
              <div className="contactBox">
                <b>واتساب</b>
                <p>يفتح برسالة جاهزة. عدّل الرقم في الكود.</p>
                <a className="btn primary" href={wa} target="_blank" rel="noreferrer">فتح واتساب</a>
              </div>

              <div className="contactBox">
                <b>بريد</b>
                <p>contact@icode.eu.org (Placeholder)</p>
                <a className="btn ghost" href="mailto:contact@icode.eu.org">إرسال بريد</a>
              </div>
            </div>

            <div className="miniNote">
              <span className="badge">ضمان واقعي</span>
              <span>تسليم واضح + قابل للاختبار + بدون مبالغة.</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap foot">
          <span>© 2025 ICODE</span>
          <button className="toTop" type="button" onClick={scrollTop}>رجوع للأعلى</button>
        </div>
      </footer>

      <button className="floatUp" type="button" aria-label="للأعلى" onClick={scrollTop}>↑</button>
    </div>
  );
}
