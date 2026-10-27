import { useEffect, useRef } from 'react';
import type { DrawPhase } from '../hooks/useDrawSequence';
import type { Draw } from '../types';
import { Cover } from './UI';

/** Canvas handles only light/particles. The real outcome never comes from this renderer. */
function EnergyCanvas({ phase }: { phase: DrawPhase }) {
  const canvas = useRef<HTMLCanvasElement>(null); const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => {
    const element = canvas.current; const context = element?.getContext('2d'); if (!element || !context) return;
    let frame = 0; let width = 0; let height = 0; let last = 0;
    const particles = Array.from({ length: 85 }, (_, index) => ({ angle: index * 2.39996, radius: .3 + (index % 19) / 19, speed: .07 + (index % 7) * .02, trail: 5 + index % 14 }));
    const resize = () => { const rect = element.getBoundingClientRect(); width = rect.width; height = rect.height; const dpr = Math.min(window.devicePixelRatio || 1, 1.75); element.width = width * dpr; element.height = height * dpr; context.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const observer = new ResizeObserver(resize); observer.observe(element); resize();
    const draw = (time: number) => {
      const delta = Math.min((time - (last || time)) / 1000, .05); last = time;
      context.clearRect(0, 0, width, height);
      const active = !['requesting', 'preparing', 'result'].includes(phaseRef.current);
      if (active) {
        const reveal = phaseRef.current === 'revealing'; const extent = Math.max(width, height) * .75;
        context.globalCompositeOperation = 'lighter';
        particles.forEach((p, index) => {
          p.radius -= delta * p.speed * (reveal ? -2 : 1); if (p.radius < .08) p.radius = 1;
          const radius = p.radius * extent; const angle = p.angle + time * .000035;
          const x = width / 2 + Math.cos(angle) * radius; const y = height * .47 + Math.sin(angle) * radius * .65;
          const opacity = Math.max(0, Math.min(.6, (1 - p.radius) * .7));
          context.strokeStyle = index % 3 ? 'rgba(169,139,244,' + opacity + ')' : 'rgba(111,176,255,' + opacity + ')';
          context.lineWidth = index % 7 === 0 ? 1.5 : .7;
          context.beginPath(); context.moveTo(x, y); context.lineTo(x + Math.cos(angle) * p.trail, y + Math.sin(angle) * p.trail * .65); context.stroke();
        });
        context.globalCompositeOperation = 'source-over';
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); context.clearRect(0, 0, width, height); };
  }, []);
  return <canvas className="energy-canvas" ref={canvas} aria-hidden="true" />;
}
export function SummonStage({ phase, result, skip }: { phase: DrawPhase; result?: Draw; skip: () => void }) {
  const root = useRef<HTMLDivElement>(null); const skipButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null; const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; skipButton.current?.focus();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  const labels: Record<string, string> = { requesting: 'Consultando o catálogo MyAnimeList', preparing: 'Resultado confirmado. Preparando apresentação', invoking: 'Invocação em andamento', suspense: 'Preparando revelação', revealing: 'Revelando o anime sorteado' };
  return <div ref={root} className={'summon-stage phase-' + phase} role="dialog" aria-modal="true" aria-label="Apresentação do sorteio" onKeyDown={event => { if (event.key === 'Escape') skip(); if (event.key === 'Tab') { event.preventDefault(); skipButton.current?.focus(); } }}><div className="stage-vignette" /><EnergyCanvas phase={phase} /><div className="stage-header"><span>ANIME MOOD <span className="stage-header-divider">/</span> SORTEIO GLOBAL</span><button ref={skipButton} className="skip-presentation" onClick={skip}>{phase === 'requesting' ? 'Pular quando estiver pronto' : 'Pular apresentação'} <kbd>Esc</kbd></button></div><div className="stage-light" /><div className="stage-beam" /><div className="summon-perspective"><div className="summon-card"><div className="summon-back"><div className="card-engraving" /><div className="card-back-type"><span>ANIME</span><strong>MOOD</strong><small>CATÁLOGO MYANIMELIST</small></div><span className="card-corner top-left" /><span className="card-corner bottom-right" /></div><div className="summon-front" aria-hidden={phase !== 'revealing'}>{result && <Cover key={result.coverUrl} url={result.coverUrl} title={result.animeTitle} />}<div className="front-frame" /><div className="card-light-sweep" /></div></div></div><div className="stage-floor" /><div className="reveal-pulse" /><div className="stage-status" role="status"><span className="stage-step">{phase === 'requesting' ? 'CATÁLOGO OFICIAL' : phase === 'revealing' ? 'RESULTADO' : 'APRESENTAÇÃO'}</span><p>{labels[phase]}</p><div className="stage-progress"><span /></div></div></div>;
}
