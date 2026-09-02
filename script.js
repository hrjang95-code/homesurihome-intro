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

const heroPhone = document.querySelector('.hero-visual img');
if (heroPhone) {
  window.addEventListener('scroll', () => {
    if (window.innerWidth < 768) return;
    const y = Math.min(window.scrollY * 0.06, 32);
    heroPhone.style.transform = `translateY(${y}px)`;
  }, { passive:true });
}

// BIVER scroll companion — clean floating character, no cards or speech bubbles.
const beaverGuide = document.querySelector('.beaver-guide');
const guideStops = [
  { id:'hero',      x:84, y:68, face:'left'  },
  { id:'why',       x:12, y:78, face:'right' },
  { id:'solution',  x:86, y:78, face:'left'  },
  { id:'ai',        x:9,  y:58, face:'right', scale: 0.88 },
  { id:'works',     x:86, y:72, face:'left'  },
  { id:'community', x:19, y:83, face:'right', scale: 0.82 },
  { id:'vision',    x:82, y:76, face:'left'  },
  { id:'download',  x:76, y:70, face:'left'  }
].map(stop => ({ ...stop, el:document.getElementById(stop.id) }));

let currentGuide = -1;
let lastScrollY = window.scrollY;
let moveTimer;
let switchTimer;

function nearestGuideStop(){
  const focusY = window.scrollY + window.innerHeight * .54;
  let bestIndex = 0;
  let bestDistance = Infinity;
  guideStops.forEach((stop,index) => {
    if (!stop.el) return;
    const center = stop.el.offsetTop + stop.el.offsetHeight / 2;
    const distance = Math.abs(center - focusY);
    if (distance < bestDistance){
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function updateBeaver(){
  if (!beaverGuide || window.innerWidth < 861) return;

  const index = nearestGuideStop();
  const stop = guideStops[index];
  
  beaverGuide.style.transform = `translate3d(calc(${stop.x}vw - 50%), calc(${stop.y}vh - 50%), 0) scale(${stop.scale || 1})`;
  beaverGuide.classList.toggle('face-left', stop.face === 'left');

  lastScrollY = window.scrollY;

  beaverGuide.classList.add('is-moving');
  clearTimeout(moveTimer);
  moveTimer = setTimeout(() => beaverGuide.classList.remove('is-moving'), 200);

  if (index !== currentGuide){
    currentGuide = index;
  }
}

window.addEventListener('scroll', updateBeaver, { passive:true });
window.addEventListener('resize', updateBeaver);
updateBeaver();
