// src/pages/PendingOrders/hooks/useNewOrderNotifier.ts
import { useCallback, useEffect, useRef } from "react";

type KeyType = "empresa" | "pessoal" | "coinexEmpresa" | "coinexPessoal" | "cryptotech" | "binance";

type OrdersData = {
  empresa?: any[];
  pessoal?: any[];
  coinexEmpresa?: any[];
  coinexPessoal?: any[];
  cryptotech?: any[];
  binance?: { items?: any[] };
};

const LABEL: Record<KeyType, string> = {
  empresa: "Bybit Empresa",
  pessoal: "Bybit Pessoal",
  coinexEmpresa: "Coinex Empresa",
  coinexPessoal: "Coinex Pessoal",
  cryptotech: "Cryptotech",
  binance: "Binance",
} as const;

const getCount = (data?: OrdersData, key?: KeyType): number => {
  if (!data || !key) return 0;
  if (key === "binance") return data.binance?.items?.length ?? 0;

  return Array.isArray(data[key]) ? data[key].length : 0;
};

/**
 * Habilita automaticamente alertas quando `acesso === "Master"`.
 * - Notificação (Notification API) + vibração (mobile).
 * - Som via WebAudio (se o navegador permitir autoplay; caso contrário,
 *   o áudio é destravado no primeiro gesto do usuário, sem precisar de botão visível).
 * - Detecção de novas ordens por aumento de contagem por aba.
 */
export const useNewOrderNotifier = (data?: OrdersData, acesso?: string) => {
  const prevCountsRef = useRef<Record<KeyType, number> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundReadyRef = useRef(false); // áudio realmente liberado
  const alertsEnabledRef = useRef(false); // gating geral (Master)
  const cooldownRef = useRef<Record<KeyType, number>>({
    empresa: 0,
    pessoal: 0,
    coinexEmpresa: 0,
    coinexPessoal: 0,
    cryptotech: 0,
    binance: 0,
  });

  // Beep curto usando WebAudio
  const beep = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx || !soundReadyRef.current) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = 1000;
    gain.gain.value = 0.0001;

    osc.connect(gain);
    gain.connect(ctx.destination);

    const t0 = ctx.currentTime;
    osc.start(t0);
    gain.gain.exponentialRampToValueAtTime(0.05, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.00001, t0 + 0.35);
    osc.stop(t0 + 0.4);
  }, []);

  // Notifica (visual + vibração + som)
  const notify = useCallback(
    (key: KeyType, diff: number) => {
      if (typeof window === "undefined") return;

      const title = `Nova ordem: ${LABEL[key]}`;
      const body = diff === 1 ? "1 nova ordem disponível." : `${diff} novas ordens disponíveis.`;

      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(title, { body, icon: "/icon-crypto.png" });
        } catch {
          /* silent */
        }
      }

      if ("vibrate" in navigator) {
        try {
          navigator.vibrate([200, 100, 200]);
        } catch {
          /* silent */
        }
      }

      try {
        beep();
      } catch {
        /* silent */
      }
    },
    [beep],
  );

  // Auto-habilitação quando acesso === Master
  useEffect(() => {
    if (typeof window === "undefined") return;
    const shouldEnable = acesso === "Master";

    if (!shouldEnable) {
      alertsEnabledRef.current = false;
      return;
    }

    // Habilita notificações
    alertsEnabledRef.current = true;
    if ("Notification" in window && Notification.permission === "default") {
      // Alguns browsers permitem sem gesto; outros ignoram — ok.
      Notification.requestPermission().catch(() => void 0);
    }

    // Prepara áudio
    try {
      const ACtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (ACtx && !audioCtxRef.current) {
        audioCtxRef.current = new ACtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx) {
        // Tenta resumir já (pode falhar sem gesto)
        ctx.resume().then(
          () => {
            soundReadyRef.current = true;
          },
          () => {
            soundReadyRef.current = ctx.state === "running";
          },
        );

        // Se ainda estiver suspenso, destravar no primeiro gesto do usuário
        const unlock = () => {
          ctx.resume().finally(() => {
            soundReadyRef.current = ctx.state === "running";
            window.removeEventListener("pointerdown", unlock);
            window.removeEventListener("keydown", unlock);
            window.removeEventListener("touchstart", unlock);
          });
        };

        if (ctx.state !== "running") {
          window.addEventListener("pointerdown", unlock, { once: true, passive: true });
          window.addEventListener("keydown", unlock, { once: true });
          window.addEventListener("touchstart", unlock, { once: true, passive: true });
        }
      }
    } catch {
      /* silent */
    }
  }, [acesso]);

  // Observa mudanças nas ordens e dispara alertas quando houver aumento
  useEffect(() => {
    if (typeof window === "undefined" || !data || !alertsEnabledRef.current) return;

    const nowCounts: Record<KeyType, number> = {
      empresa: getCount(data, "empresa"),
      pessoal: getCount(data, "pessoal"),
      coinexEmpresa: getCount(data, "coinexEmpresa"),
      coinexPessoal: getCount(data, "coinexPessoal"),
      cryptotech: getCount(data, "cryptotech"),
      binance: getCount(data, "binance"),
    };

    // Primeira leitura apenas inicializa
    if (!prevCountsRef.current) {
      prevCountsRef.current = nowCounts;
      return;
    }

    (Object.keys(nowCounts) as KeyType[]).forEach((key) => {
      const prev = prevCountsRef.current![key] ?? 0;
      const curr = nowCounts[key] ?? 0;
      const diff = curr - prev;

      const now = Date.now();
      const last = cooldownRef.current[key] ?? 0;
      const minDeltaMs = 3000;

      if (diff > 0 && now - last > minDeltaMs) {
        notify(key, diff);
        cooldownRef.current[key] = now;
      }
    });

    prevCountsRef.current = nowCounts;
  }, [data, notify]);
};
