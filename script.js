const sections = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('on');
  });
}, { threshold: 0.12 });
sections.forEach((section) => observer.observe(section));

const topBtn = document.querySelector('.top-btn');
if (topBtn) {
  window.addEventListener('scroll', () => {
    topBtn.classList.toggle('show', window.scrollY > 600);
  });
  topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// Section Capsule Indicator Logic
const capsuleNav = document.querySelector('.section-capsule-indicator');
if (capsuleNav) {
  const sectionsToObserve = Array.from(document.querySelectorAll('main .section'));

  capsuleNav.innerHTML = '';
  const capsuleBtns = sectionsToObserve.map((sec, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'capsule-btn';
    btn.setAttribute('aria-label', `Section ${i + 1}`);

    const shape = document.createElement('span');
    shape.className = 'capsule-shape';

    const num = document.createElement('span');
    num.className = 'capsule-num';
    num.textContent = (i + 1).toString().padStart(2, '0');

    btn.appendChild(shape);
    btn.appendChild(num);
    capsuleNav.appendChild(btn);

    btn.addEventListener('click', () => {
      let targetElement = sec;
      if (sec.parentElement && sec.parentElement.classList.contains('pin-spacer')) {
        targetElement = sec.parentElement;
      }
      let elTop = targetElement.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elTop, behavior: 'smooth' });
    });

    return btn;
  });

  let currentActiveIndex = -1;

  function updateCapsuleIndicator() {
    if (window.innerWidth <= 900) return;

    let closestIndex = 0;
    let minDistance = Infinity;
    const focusY = window.innerHeight / 2;

    sectionsToObserve.forEach((sec, index) => {
      if (!sec) return;
      let rect = sec.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = Math.abs(center - focusY);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== currentActiveIndex) {
      currentActiveIndex = closestIndex;

      capsuleBtns.forEach((btn, index) => {
        btn.classList.remove('active', 'past');

        if (index < closestIndex) {
          btn.classList.add('past');
        } else if (index === closestIndex) {
          btn.classList.add('active');
        }
      });
    }
  }

  window.addEventListener('scroll', () => {
    requestAnimationFrame(updateCapsuleIndicator);
  });
  window.addEventListener('resize', () => {
    requestAnimationFrame(updateCapsuleIndicator);
  });

  updateCapsuleIndicator();
}


// BIVER scroll companion — clean floating character, no cards or speech bubbles.
const beaverGuide = document.querySelector('.beaver-guide');
const guideStops = [
  { id: 'hero', x: 85, y: 68, scale: 1 },
  { id: 'why', x: 85, y: 68, scale: 1 },
  { id: 'solution', x: 85, y: 64, scale: 1 },
  { id: 'ai', x: 45, y: 60, scale: 1, flip: true },
  { id: 'works', x: 85, y: 65, scale: 1 },
  { id: 'community', x: 87, y: 72, scale: 1 },
  { id: 'vision', x: 85, y: 70, scale: 1 },
  { id: 'download', hide: true }
].map(stop => ({ ...stop, el: document.getElementById(stop.id) }));

let currentGuide = -1;

function nearestGuideStop() {
  const focusY = window.scrollY + window.innerHeight * .54;
  let bestIndex = 0;
  let bestDistance = Infinity;
  guideStops.forEach((stop, index) => {
    if (!stop.el) return;

    let elTop = stop.el.offsetTop;
    let elHeight = stop.el.offsetHeight;
    if (stop.el.parentElement && stop.el.parentElement.classList.contains('pin-spacer')) {
      elTop = stop.el.parentElement.offsetTop;
      elHeight = stop.el.parentElement.offsetHeight;
    }

    let distance = 0;
    if (focusY < elTop) {
      distance = elTop - focusY;
    } else if (focusY > elTop + elHeight) {
      distance = focusY - (elTop + elHeight);
    } else {
      distance = 0;
    }

    // Stable tie-breaker for exact boundaries
    distance -= index * 0.001;

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function updateBeaver() {
  if (!beaverGuide || window.innerWidth < 861) return;

  const index = nearestGuideStop();

  if (index === currentGuide) return;
  currentGuide = index;

  const stop = guideStops[index];

  if (stop.id === 'why' || stop.id === 'hero' || stop.id === 'vision' || stop.id === 'download' || stop.hide) {
    beaverGuide.style.opacity = '0';
    beaverGuide.style.visibility = 'hidden';
    beaverGuide.style.pointerEvents = 'none';
  } else {
    beaverGuide.style.opacity = '1';
    beaverGuide.style.visibility = 'visible';
    beaverGuide.style.pointerEvents = 'auto';
  }

  let xStr = `calc(${stop.x}vw - 50%)`;
  let yStr = `calc(${stop.y}vh - 50%)`;

  if (stop.flip) {
    beaverGuide.style.transform = `translate3d(${xStr}, ${yStr}, 0) scaleX(-1) scaleY(${stop.scale || 1})`;
  } else {
    beaverGuide.style.transform = `translate3d(${xStr}, ${yStr}, 0) scale(${stop.scale || 1})`;
  }
}

window.addEventListener('scroll', updateBeaver, { passive: true });
window.addEventListener('resize', () => { currentGuide = -1; updateBeaver(); });
updateBeaver();

// GSAP ScrollTrigger Animations
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  let mm = gsap.matchMedia();

  // Desktop Animations
  mm.add("(prefers-reduced-motion: no-preference) and (min-width: 1024px)", () => {
    // 1. HERO - Scrub
    const heroPhone = document.querySelector('.hero-visual img');
    const heroCopy = document.querySelector('.hero-copy');
    const scrollHint = document.querySelector('.scroll-hint');
    const scrollHintLine = document.querySelector('.scroll-hint i');

    if (scrollHintLine) {
      gsap.fromTo(scrollHintLine,
        { y: 0, opacity: 1 },
        { y: 10, opacity: 0.1, duration: 1.5, ease: "power1.inOut", repeat: -1 }
      );
    }
    if (scrollHint) {
      gsap.to(scrollHint, {
        opacity: 0,
        scrollTrigger: { trigger: '.hero', start: "top top", end: "top -30%", scrub: true }
      });
    }

    if (heroPhone && heroCopy) {
      gsap.to(heroCopy, {
        y: -30, opacity: 0.75, ease: "none",
        scrollTrigger: { trigger: '.hero', start: "top top", end: "bottom -100%", scrub: 1.5 }
      });
      gsap.to(heroPhone, {
        y: -45, scale: 1.04, ease: "none",
        scrollTrigger: { trigger: '.hero', start: "top top", end: "bottom -100%", scrub: 1.5 }
      });
    }

    // 2. WHY HOME SURI HOME - Scroll Flow Pin & Scrub Interaction
    const whySection = document.querySelector('#why');
    const whyItems = gsap.utils.toArray('.why-character-item');

    if (whySection && whyItems.length === 3) {
      const item1 = whyItems[0];
      const item2 = whyItems[1];
      const item3 = whyItems[2];

      const setInitialState = (item, o, s, y) => {
        const bg = item.querySelector('.char-img');
        const img = item.querySelector('.char-img img');
        const num = item.querySelector('.char-num');
        gsap.set(item, { opacity: o });
        gsap.set(img, { scale: s, y: y });
        if (o === 1) {
          gsap.set(bg, { backgroundColor: "rgba(166, 134, 99, 0.12)" });
          gsap.set(num, { scale: 1.08 });
        } else {
          gsap.set(bg, { backgroundColor: "rgba(166, 134, 99, 0.05)" });
          gsap.set(num, { scale: 1 });
        }
      };

      // Set initial state
      setInitialState(item1, 1, 1.04, -6);
      setInitialState(item2, 0.1, 0.92, 24);
      setInitialState(item3, 0.05, 0.9, 30);

      const tlWhy = gsap.timeline({
        scrollTrigger: {
          trigger: whySection,
          start: "top 5%",
          end: "+=1400",
          pin: true,
          pinSpacing: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      const animateToActive = (item) => {
        const bg = item.querySelector('.char-img');
        const img = item.querySelector('.char-img img');
        const num = item.querySelector('.char-num');
        return [
          gsap.to(item, { opacity: 1, duration: 0.2, ease: "none", immediateRender: false }),
          gsap.to(img, { scale: 1.04, y: -6, duration: 0.2, ease: "none", immediateRender: false }),
          gsap.to(bg, { backgroundColor: "rgba(166, 134, 99, 0.12)", duration: 0.2, ease: "none", immediateRender: false }),
          gsap.to(num, { scale: 1.08, duration: 0.2, ease: "none", immediateRender: false })
        ];
      };

      const animateToPast = (item) => {
        const bg = item.querySelector('.char-img');
        const img = item.querySelector('.char-img img');
        const num = item.querySelector('.char-num');
        return [
          gsap.to(item, { opacity: 0.12, duration: 0.2, ease: "none", immediateRender: false }),
          gsap.to(img, { scale: 0.94, y: -20, duration: 0.2, ease: "none", immediateRender: false }),
          gsap.to(bg, { backgroundColor: "rgba(166, 134, 99, 0.05)", duration: 0.2, ease: "none", immediateRender: false }),
          gsap.to(num, { scale: 1, duration: 0.2, ease: "none", immediateRender: false })
        ];
      };

      // 0~20%: Hold Step 1
      tlWhy.addLabel("start");
      tlWhy.to({}, { duration: 0.2 }, "start");

      // 20~40%: Transition 1 -> 2
      tlWhy.addLabel("trans1");
      animateToPast(item1).forEach(t => tlWhy.add(t, "trans1"));
      animateToActive(item2).forEach(t => tlWhy.add(t, "trans1"));

      // 40~55%: Hold Step 2
      tlWhy.addLabel("hold2");
      tlWhy.to({}, { duration: 0.15 }, "hold2");

      // 55~75%: Transition 2 -> 3
      tlWhy.addLabel("trans2");
      animateToPast(item2).forEach(t => tlWhy.add(t, "trans2"));
      animateToActive(item3).forEach(t => tlWhy.add(t, "trans2"));

      // 75~100%: Hold Step 3
      tlWhy.addLabel("hold3");
      tlWhy.to({}, { duration: 0.25 }, "hold3");
    }

    // 3. OUR SOLUTION - Scroll Flow Scrubbing Interaction
    const solutionSteps = gsap.utils.toArray('#solution .journey-step');
    const allWrappers = gsap.utils.toArray('#solution .journey-step-wrapper');
    const pathLine = document.querySelector('.journey-path-svg path');
    const svg = document.querySelector('.journey-path-svg');

    if (solutionSteps.length > 0) {
      let highlightPath;
      let activePoint;
      let pathLength = 0;
      let progressProxy = { val: 0 };

      if (pathLine && svg) {
        pathLength = pathLine.getTotalLength();

        highlightPath = pathLine.cloneNode();
        highlightPath.setAttribute('stroke', '#825331');
        highlightPath.setAttribute('stroke-width', '3');
        highlightPath.style.strokeDasharray = pathLength;
        highlightPath.style.strokeDashoffset = pathLength; // Hidden at start
        svg.appendChild(highlightPath);

        activePoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        activePoint.setAttribute("r", "5");
        activePoint.setAttribute("fill", "#6f472d");

        let startPt = pathLine.getPointAtLength(0);
        activePoint.setAttribute("cx", startPt.x);
        activePoint.setAttribute("cy", startPt.y);
        activePoint.style.opacity = 0; // Hidden at start
        svg.appendChild(activePoint);
      }

      let targetLengths = [];
      if (pathLine) {
        for (let i = 0; i < 5; i++) {
          let targetX = 100 + (i * 200);
          let closestLength = 0;
          let minDiff = Infinity;
          for (let l = 0; l <= pathLength; l += 2) {
            let pt = pathLine.getPointAtLength(l);
            if (Math.abs(pt.x - targetX) < minDiff) {
              minDiff = Math.abs(pt.x - targetX);
              closestLength = l;
            }
          }
          targetLengths.push(closestLength);
        }
      }

      let tlIntro = gsap.timeline({
        scrollTrigger: {
          trigger: '#solution',
          start: "top 75%",
          end: "top top",
          scrub: 1
        }
      });

      let tlSolution = gsap.timeline({
        scrollTrigger: {
          trigger: '#solution',
          start: "top top",
          end: "+=1800",
          pin: true,
          scrub: 1
        }
      });

      // Animate line drawing and dot moving globally in tlSolution
      if (highlightPath && activePoint && pathLength > 0) {
        tlSolution.fromTo(progressProxy, { val: 0 }, {
          val: pathLength,
          duration: 1,
          ease: "none",
          onUpdate: () => {
            highlightPath.style.strokeDashoffset = pathLength - progressProxy.val;
            let pt = pathLine.getPointAtLength(progressProxy.val);
            activePoint.setAttribute("cx", pt.x);
            activePoint.setAttribute("cy", pt.y);
          }
        }, 0);
      }

      let t = targetLengths.map(l => pathLength > 0 ? l / pathLength : 0);
      t[0] = 0;
      t[4] = 1;

      solutionSteps.forEach((step, i) => {
        const w = allWrappers[i];
        const icon = step.querySelector('.step-icon');
        const num = step.querySelector('.step-num');
        const h4 = step.querySelector('h4');
        const p = step.querySelector('p');

        step.style.cursor = 'default';

        // Initial Layout Reset: All steps in WAITING state initially
        gsap.set(step, { clearProps: "transform,rotateX,rotateY" });
        gsap.set([icon, num, h4, p], { clearProps: "transform" });

        gsap.set(w, { opacity: 0.35 });
        gsap.set(icon, { y: 0, scale: 1, borderColor: "#ead8c3", backgroundColor: "#fffdf9" });
        gsap.set(num, { color: "#a48671" });
        gsap.set(h4, { y: 0, opacity: 0.4, color: "#4f3b2c" });
        gsap.set(p, { y: 0, opacity: 0.4 });

        if (i === 0) {
          // Intro Trigger animates 01 to ACTIVE
          tlIntro.fromTo(w, { opacity: 0.35 }, { opacity: 1, ease: "none" }, 0);
          tlIntro.fromTo(icon, { y: 0, scale: 1, borderColor: "#ead8c3", backgroundColor: "#fffdf9" }, { y: -8, scale: 1.10, borderColor: "#6f472d", backgroundColor: "#f6eee4", ease: "none" }, 0);
          tlIntro.fromTo(num, { color: "#a48671" }, { color: "#6f472d", ease: "none" }, 0);
          tlIntro.fromTo(h4, { y: 0, opacity: 0.4, color: "#4f3b2c" }, { y: -3, opacity: 1, color: "#5c4535", ease: "none" }, 0);
          tlIntro.fromTo(p, { y: 0, opacity: 0.4 }, { y: -3, opacity: 1, ease: "none" }, 0);
          if (activePoint) {
            tlIntro.fromTo(activePoint, { opacity: 0 }, { opacity: 1, ease: "none" }, 0);
          }
        }

        // Deactivate logic (Active -> Completed)
        if (i < 4) {
          const startT = t[i];
          const endT = t[i + 1];
          const dur = endT - startT;

          tlSolution.fromTo(icon, { y: -8, scale: 1.10, borderColor: "#6f472d", backgroundColor: "#f6eee4" }, { y: 0, scale: 1, borderColor: "#a48671", backgroundColor: "#f9f3ec", duration: dur, ease: "none" }, startT);
          tlSolution.fromTo(num, { color: "#6f472d" }, { color: "#a48671", duration: dur, ease: "none" }, startT);
          tlSolution.fromTo(h4, { y: -3, opacity: 1, color: "#5c4535" }, { y: 0, color: "#4f3b2c", duration: dur, ease: "none" }, startT);
          tlSolution.fromTo(p, { y: -3, opacity: 1 }, { y: 0, duration: dur, ease: "none" }, startT);
          tlSolution.fromTo(w, { opacity: 1 }, { opacity: 1, duration: dur, ease: "none" }, startT);
        }

        // Activate logic (Waiting -> Active)
        if (i > 0) {
          const startT = t[i - 1];
          const endT = t[i];
          const dur = endT - startT;

          tlSolution.fromTo(icon, { y: 0, scale: 1, borderColor: "#ead8c3", backgroundColor: "#fffdf9" }, { y: -8, scale: 1.10, borderColor: "#6f472d", backgroundColor: "#f6eee4", duration: dur, ease: "none" }, startT);
          tlSolution.fromTo(num, { color: "#a48671" }, { color: "#6f472d", duration: dur, ease: "none" }, startT);
          tlSolution.fromTo(h4, { y: 0, opacity: 0.4, color: "#4f3b2c" }, { y: -3, opacity: 1, color: "#5c4535", duration: dur, ease: "none" }, startT);
          tlSolution.fromTo(p, { y: 0, opacity: 0.4 }, { y: -3, opacity: 1, duration: dur, ease: "none" }, startT);
          tlSolution.fromTo(w, { opacity: 0.35 }, { opacity: 1, duration: dur, ease: "none" }, startT);
        }
      });
    }

    // 4. AI REPAIR - Parallax Scrub
    gsap.fromTo('#ai .copy-block',
      { opacity: 0.3, y: 40 },
      { opacity: 1, y: 0, scrollTrigger: { trigger: '#ai', start: "top 95%", end: "bottom 10%", scrub: 1.5 } }
    );
    gsap.fromTo('#ai .feature-art',
      { opacity: 0.4, y: 60 },
      { opacity: 1, y: 0, scrollTrigger: { trigger: '#ai', start: "top 95%", end: "bottom -10%", scrub: 1.5 } }
    );

    // 5. HOW IT WORKS - Simple Scrub Parallax
    gsap.fromTo('#works .section-head .num, #works .section-head .eyebrow, #works .section-head h2, #works .section-head p',
      { opacity: 0.3, y: 30 },
      { opacity: 1, y: 0, stagger: 0.1, scrollTrigger: { trigger: '#works', start: "top 95%", end: "bottom 20%", scrub: 1.5 } }
    );
    gsap.fromTo('#works .works-stage',
      { opacity: 0.55, y: 80, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, scrollTrigger: { trigger: '#works', start: "top 95%", end: "bottom -10%", scrub: 1.5 } }
    );

    // 6. COMMUNITY - Parallax & Fade
    gsap.fromTo('#community .copy-block .num, #community .copy-block .eyebrow, #community .copy-block h2, #community .copy-block p',
      { opacity: 0.4, y: 35 },
      { opacity: 1, y: 0, stagger: 0.1, scrollTrigger: { trigger: '#community', start: "top 95%", end: "bottom 20%", scrub: 1.5 } }
    );
    gsap.fromTo('#community .community-art',
      { opacity: 0.55, y: 70, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, scrollTrigger: { trigger: '#community', start: "top 95%", end: "bottom -10%", scrub: 1.5 } }
    );

    // 7. OUR VISION - Section Depth Parallax
    let tlVision = gsap.timeline({
      scrollTrigger: {
        trigger: '#vision',
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
        pin: false
      }
    });

    tlVision.fromTo('#vision .vision-bg-text',
      { y: -10 },
      { y: 25, ease: "none" },
      0
    );

    tlVision.fromTo('#vision .section-head',
      { y: 0 },
      { y: -15, ease: "none" },
      0
    );

    const cardTargets = gsap.utils.toArray('#vision .vision-card:not(.vision-card--last), #vision .vision-card--last .vision-card-content');
    if (cardTargets.length > 0) {
      tlVision.fromTo(cardTargets,
        { y: 20 },
        { y: -25, ease: "none" },
        0
      );
    }

    // 8. DOWNLOAD - Ending Sequence
    gsap.set('#download .download-copy > *', { opacity: 0, y: 20 });
    gsap.set('#download .mascot-7 img', { opacity: 0, y: 16, scale: 0.92 });
    gsap.set('#download .doodle-7', { opacity: 0, y: 6 });
    gsap.set('#download .mascot-8 img', { opacity: 0, y: 24, scale: 0.9 });
    gsap.set('#download .doodle-8', { opacity: 0, y: 8 });

    gsap.set('#download .house-draw-overlay', { opacity: 1 });
    gsap.set('#download .house-draw-path', { strokeDasharray: 2000, strokeDashoffset: 2000 });

    gsap.set('#download .download-house-bg', { opacity: 0, scale: 0.97 });
    gsap.set('#download .qr-label', { opacity: 0, y: 8 });
    gsap.set('#download .qr-code-img', { opacity: 0 });
    gsap.set('#download .qr-desc', { opacity: 0, y: 8 });
    gsap.set('#download .mascot-9 img', { opacity: 0, x: 30, scale: 0.96 });
    gsap.set('#download .doodle-9', { opacity: 0, y: 8 });

    let tlDownload = gsap.timeline({
      scrollTrigger: {
        trigger: '#download',
        start: "top 68%",
        toggleActions: "play none none reverse"
      }
    });

    tlDownload
      .to('#download .download-copy > *', { opacity: 1, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.08 })
      .to('#download .doodle-7', { opacity: 1, y: 0, duration: 0.25 }, "-=0.15")
      .to('#download .mascot-7 img', { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.4)" }, "<")
      .to('#download .doodle-8', { opacity: 1, y: 0, duration: 0.25 }, "+=0.1")
      .to('#download .mascot-8 img', { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.35)" }, "<0.05")
      .to('#download .house-draw-path', { strokeDashoffset: 0, duration: 0.65, ease: "power2.inOut" }, "-=0.05")
      .to('#download .download-house-bg', { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" }, "-=0.2")
      .to('#download .house-draw-overlay', { opacity: 0, duration: 0.2 }, "<")
      .to('#download .qr-label', { opacity: 1, y: 0, duration: 0.25 }, "-=0.2")
      .to('#download .qr-code-img', { opacity: 1, duration: 0.3, ease: "power2.out" }, "-=0.05")
      .to('#download .qr-desc', { opacity: 1, y: 0, duration: 0.25 }, "-=0.05")
      .to('#download .doodle-9', { opacity: 1, y: 0, duration: 0.25 }, "-=0.05")
      .to('#download .mascot-9 img', { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: "power3.out" }, "<0.05")
      .to('#download .mascot-9 img', { y: -4, duration: 0.15, yoyo: true, repeat: 1, ease: "power1.inOut" }, "+=0.05");
  });

  // Mobile / Reduced Motion Fallback
  mm.add("(prefers-reduced-motion: reduce), (max-width: 1023px)", () => {
    const animateSection = (sectionId, textSelectors) => {
      const section = document.querySelector(sectionId);
      if (!section) return;
      const elements = section.querySelectorAll(textSelectors);
      if (elements.length > 0) {
        gsap.from(elements, {
          scrollTrigger: { trigger: section, start: "top 85%", once: true },
          opacity: 0, y: 25, duration: 0.6, stagger: 0.1, ease: "power2.out"
        });
      }
    };

    animateSection('#why', '.section-head .eyebrow, .section-head h2, .section-head p, .why-character-item');
    animateSection('#solution', '.section-head .eyebrow, .section-head h2, .section-head p, .journey-step-wrapper');
    animateSection('#ai', '.copy-block .num, .copy-block .eyebrow, .copy-block h2, .copy-block p, .feature-art');

    animateSection('#works', '.section-head .num, .section-head .eyebrow, .section-head h2, .section-head p, .works-stage');

    animateSection('#community', '.copy-block .num, .copy-block .eyebrow, .copy-block h2, .copy-block p, .community-art');
    animateSection('#vision', '.section-head .eyebrow, .section-head h2, .vision-item');
    animateSection('#download', '.download-copy .eyebrow, .download-copy h2, .download-copy p, .qr-wrap');
  });
}
