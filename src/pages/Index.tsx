import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const PAIRS = [
  { pair: 'EUR/USD', dir: 'UP', acc: 94, tf: '1m', expiry: '00:42' },
  { pair: 'GBP/JPY', dir: 'DOWN', acc: 88, tf: '30с', expiry: '00:18' },
  { pair: 'AUD/CAD', dir: 'UP', acc: 91, tf: '2m', expiry: '01:30' },
  { pair: 'USD/CHF', dir: 'UP', acc: 82, tf: '15с', expiry: '00:09' },
  { pair: 'EUR/GBP', dir: 'DOWN', acc: 97, tf: '5m', expiry: '03:50' },
  { pair: 'NZD/USD', dir: 'DOWN', acc: 85, tf: '3m', expiry: '02:12' },
];

const HISTORY = [
  { pair: 'EUR/USD', dir: 'UP', tf: '1m', result: 'WIN', pl: '+82.5', acc: 94 },
  { pair: 'USD/JPY', dir: 'DOWN', tf: '30с', result: 'WIN', pl: '+50.0', acc: 90 },
  { pair: 'GBP/USD', dir: 'UP', tf: '2m', result: 'LOSS', pl: '-100.0', acc: 78 },
  { pair: 'AUD/USD', dir: 'DOWN', tf: '5m', result: 'WIN', pl: '+120.0', acc: 96 },
  { pair: 'EUR/JPY', dir: 'UP', tf: '15с', result: 'WIN', pl: '+38.0', acc: 81 },
  { pair: 'USD/CAD', dir: 'DOWN', tf: '3m', result: 'WIN', pl: '+95.0', acc: 92 },
];

const POSITIONS = [
  { pair: 'EUR/USD', dir: 'UP', amount: 50, tf: '1m', pl: 41.25, left: 42 },
  { pair: 'GBP/JPY', dir: 'DOWN', amount: 25, tf: '30с', pl: -8.4, left: 18 },
  { pair: 'AUD/CAD', dir: 'UP', amount: 75, tf: '2m', pl: 22.1, left: 90 },
];

const TIMEFRAMES = ['15с', '30с', '1м', '2м', '3м', '5м'];

const Index = () => {
  const [running, setRunning] = useState(true);
  const [activeTf, setActiveTf] = useState<string[]>(['15с', '30с', '1м', '2м', '3м', '5м']);
  const [posSize, setPosSize] = useState(50);
  const [maxLoss, setMaxLoss] = useState(500);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const toggleTf = (tf: string) =>
    setActiveTf((p) => (p.includes(tf) ? p.filter((x) => x !== tf) : [...p, tf]));

  const dayPL = 287.35;
  const winrate = 89;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans grid-bg">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center glow-up">
              <Icon name="Activity" size={20} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none tracking-tight">QUANTUM<span className="text-primary">.signals</span></h1>
              <span className="text-[11px] text-muted-foreground font-mono">Pocket Option · AI Engine v3.2</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-xs font-mono">
              <span className={`w-2 h-2 rounded-full ${running ? 'bg-up animate-pulse-glow' : 'bg-muted-foreground'}`} />
              {running ? 'LIVE · сканирую рынок' : 'ПАУЗА'}
            </div>
            <Button
              onClick={() => setRunning((v) => !v)}
              className={running ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'}
            >
              <Icon name={running ? 'Square' : 'Play'} size={16} className="mr-1.5" />
              {running ? 'Стоп' : 'Запустить бота'}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Прибыль за день', value: `+$${dayPL}`, icon: 'TrendingUp', accent: 'up' },
            { label: 'Винрейт сигналов', value: `${winrate}%`, icon: 'Target', accent: 'primary' },
            { label: 'Сделок сегодня', value: '34', icon: 'Layers', accent: 'fg' },
            { label: 'Активных пар', value: '6 / 28', icon: 'Globe', accent: 'fg' },
          ].map((s, i) => (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-xl border border-border bg-card p-4 animate-fade-in"
              style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <Icon name={s.icon} size={16} className={s.accent === 'up' ? 'text-up' : s.accent === 'primary' ? 'text-primary' : 'text-muted-foreground'} />
              </div>
              <div className={`text-2xl font-bold font-mono ${s.accent === 'up' ? 'text-up' : s.accent === 'primary' ? 'text-primary' : ''}`}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Live Signals */}
          <section className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Icon name="Radar" size={18} className="text-primary" />
                  <h2 className="font-semibold">Живые сигналы на вход</h2>
                  <span className="text-xs font-mono text-muted-foreground">75–100%</span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {TIMEFRAMES.map((tf) => (
                    <button
                      key={tf}
                      onClick={() => toggleTf(tf)}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
                        activeTf.includes(tf)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-border">
                {PAIRS.map((s, i) => {
                  const up = s.dir === 'UP';
                  return (
                    <div
                      key={s.pair}
                      className="flex items-center gap-4 p-4 hover:bg-secondary/40 transition-colors animate-fade-in"
                      style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}
                    >
                      <div className={`relative w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${up ? 'bg-up/15 text-up' : 'bg-down/15 text-down'}`}>
                        <Icon name={up ? 'ArrowUpRight' : 'ArrowDownRight'} size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold">{s.pair}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${up ? 'bg-up/15 text-up' : 'bg-down/15 text-down'}`}>
                            {up ? 'ВВЕРХ' : 'ВНИЗ'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-mono">
                          <span>ТФ {s.tf}</span>
                          <span className="flex items-center gap-1"><Icon name="Clock" size={11} /> {s.expiry}</span>
                        </div>
                      </div>
                      <div className="hidden sm:block w-28">
                        <div className="flex justify-between text-[10px] font-mono mb-1">
                          <span className="text-muted-foreground">точность</span>
                          <span className={s.acc >= 90 ? 'text-up' : 'text-foreground'}>{s.acc}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full rounded-full ${s.acc >= 90 ? 'bg-up' : 'bg-primary'}`}
                            style={{ width: `${s.acc}%` }}
                          />
                        </div>
                      </div>
                      <Button size="sm" className={up ? 'bg-up hover:bg-up/90 text-primary-foreground' : 'bg-down hover:bg-down/90 text-white'}>
                        Войти
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* History */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-2 p-4 border-b border-border">
                <Icon name="History" size={18} className="text-primary" />
                <h2 className="font-semibold">История сигналов и точность</h2>
              </div>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground font-mono border-b border-border">
                      <th className="font-normal px-4 py-2.5">Пара</th>
                      <th className="font-normal px-4 py-2.5">Сигнал</th>
                      <th className="font-normal px-4 py-2.5">ТФ</th>
                      <th className="font-normal px-4 py-2.5">Точность</th>
                      <th className="font-normal px-4 py-2.5">Результат</th>
                      <th className="font-normal px-4 py-2.5 text-right">P/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HISTORY.map((h) => {
                      const up = h.dir === 'UP';
                      const win = h.result === 'WIN';
                      return (
                        <tr key={h.pair + h.tf} className="border-b border-border/50 last:border-0 hover:bg-secondary/30">
                          <td className="px-4 py-3 font-mono font-medium">{h.pair}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${up ? 'text-up' : 'text-down'}`}>
                              <Icon name={up ? 'ArrowUp' : 'ArrowDown'} size={12} />{up ? 'Вверх' : 'Вниз'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-muted-foreground">{h.tf}</td>
                          <td className="px-4 py-3 font-mono">{h.acc}%</td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${win ? 'bg-up/15 text-up' : 'bg-down/15 text-down'}`}>
                              {win ? 'WIN' : 'LOSS'}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-right font-mono font-semibold ${win ? 'text-up' : 'text-down'}`}>{h.pl}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Right column */}
          <aside className="space-y-6">
            {/* Self-improvement banner */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="BrainCircuit" size={18} className="text-primary" />
                <h3 className="font-semibold text-sm">Самообучение ИИ</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                После каждого неверного сигнала модель пересчитывает стратегию и улучшает точность.
              </p>
              <div className="mt-3 relative h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="absolute inset-y-0 w-1/4 bg-primary/60 rounded-full animate-scan" />
              </div>
              <div className="mt-2 text-[11px] font-mono text-muted-foreground">
                Анализ {12 + (tick % 5)} стратегий · обновлено только что
              </div>
            </div>

            {/* Open positions */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-2 p-4 border-b border-border">
                <Icon name="Briefcase" size={18} className="text-primary" />
                <h2 className="font-semibold text-sm">Открытые сделки</h2>
              </div>
              <div className="divide-y divide-border">
                {POSITIONS.map((p) => {
                  const up = p.dir === 'UP';
                  const profit = p.pl >= 0;
                  return (
                    <div key={p.pair} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-sm">{p.pair}</span>
                          <span className={`text-[10px] font-bold ${up ? 'text-up' : 'text-down'}`}>{up ? '▲' : '▼'}</span>
                          <span className="text-xs text-muted-foreground font-mono">{p.tf}</span>
                        </div>
                        <span className={`font-mono font-semibold text-sm ${profit ? 'text-up' : 'text-down'}`}>
                          {profit ? '+' : ''}{p.pl.toFixed(2)}$
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                        <span>Ставка ${p.amount}</span>
                        <span className="flex items-center gap-1"><Icon name="Timer" size={11} /> {p.left}с</span>
                      </div>
                      <div className="h-1 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${p.left}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Risk settings */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-5">
              <div className="flex items-center gap-2">
                <Icon name="SlidersHorizontal" size={18} className="text-primary" />
                <h2 className="font-semibold text-sm">Риск-менеджмент</h2>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Размер позиции</span>
                  <span className="font-mono font-semibold">${posSize}</span>
                </div>
                <input
                  type="range" min={5} max={500} step={5}
                  value={posSize} onChange={(e) => setPosSize(+e.target.value)}
                  className="w-full accent-[hsl(var(--primary))]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Макс. убыток в день</span>
                  <span className="font-mono font-semibold text-down">${maxLoss}</span>
                </div>
                <input
                  type="range" min={50} max={2000} step={50}
                  value={maxLoss} onChange={(e) => setMaxLoss(+e.target.value)}
                  className="w-full accent-[hsl(var(--destructive))]"
                />
                <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-down rounded-full" style={{ width: `${Math.min((212 / maxLoss) * 100, 100)}%` }} />
                </div>
                <div className="text-[11px] font-mono text-muted-foreground mt-1">
                  Использовано $212 из ${maxLoss}
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90">
                <Icon name="Save" size={16} className="mr-1.5" /> Сохранить настройки
              </Button>
            </div>
          </aside>
        </div>

        <footer className="text-center text-[11px] font-mono text-muted-foreground py-4">
          Quantum Signals · Подключено к Pocket Option API · Только демо-данные
        </footer>
      </main>
    </div>
  );
};

export default Index;
