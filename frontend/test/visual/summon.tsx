// Visual QA fixture only. Not imported by the production app or production build.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SummonStage } from '../../src/components/SummonStage';
import { useDrawSequence, type DrawPhase } from '../../src/hooks/useDrawSequence';
import '../../src/styles.css';
import '../../src/pages/draw.css';
const fixture = { id: 1, animeTitle: 'Capa de teste visual', coverUrl: window.location.origin + '/test/visual/poster.svg', mood: null, drawnAt: '', malId: 1 };
function Bench() {
  const sequence = useDrawSequence(async () => fixture);
  const [frozen, setFrozen] = useState<DrawPhase>();
  return <main className="main-container"><style>{'.stage-header>span:after {content:"PRÉVIA ISOLADA DE TESTE";display:block;color:#d1a2ba;font-size:9px;letter-spacing:1px;margin-top:6px;}'}</style><h1>Prévia visual isolada</h1><p>Fixture de teste, sem consulta à API e sem resultado real. Não integra o build de produção.</p><div className="outcome-actions"><button className="button primary" onClick={() => { setFrozen(undefined); void sequence.start(); }}>Executar sequência</button><button className="button secondary" onClick={() => setFrozen('suspense')}>Inspecionar suspense</button><button className="button secondary" onClick={() => setFrozen('revealing')}>Inspecionar revelação</button></div>{(frozen || sequence.busy) && <SummonStage phase={frozen || sequence.phase} result={fixture} skip={() => { setFrozen(undefined); sequence.skip(); }} />}{sequence.phase === 'result' && !frozen && <p role="status">Sequência de teste concluída.</p>}</main>;
}
const root = createRoot(document.getElementById('root')!);
root.render(<Bench />);
if (import.meta.hot) import.meta.hot.dispose(() => root.unmount());
