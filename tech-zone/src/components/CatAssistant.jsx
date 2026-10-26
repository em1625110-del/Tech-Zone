import { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import useShop from "../hooks/useShop";

/* ── Реалистичный SVG-котик (рыжий табби, анфас) ── */
function CatSVG({ dir = 1 }) {
  // dir: 1 = вправо, -1 = влево — поворачиваем только голову чуть-чуть через transform
  return (
    <svg
      className="cat-svg"
      viewBox="0 0 100 110"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="gBody" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#f9b96e" />
          <stop offset="100%" stopColor="#d4751a" />
        </radialGradient>
        <radialGradient id="gHead" cx="50%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#fbcf8a" />
          <stop offset="100%" stopColor="#e08530" />
        </radialGradient>
        <radialGradient id="gBelly" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff8ee" />
          <stop offset="100%" stopColor="#ead5b0" />
        </radialGradient>
        <radialGradient id="gEye" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#6abf45" />
          <stop offset="100%" stopColor="#3d8020" />
        </radialGradient>
        <radialGradient id="gShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.22)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      {/* Тень */}
      <ellipse cx="50" cy="106" rx="30" ry="4" fill="url(#gShadow)" />

      {/* Хвост — появляется сбоку */}
      <path
        className="cat-tail"
        d={dir >= 0
          ? "M72 78 Q88 72 90 58 Q91 47 84 46 Q80 46 78 50"
          : "M28 78 Q12 72 10 58 Q9 47 16 46 Q20 46 22 50"
        }
        fill="none" stroke="#e08530" strokeWidth="6" strokeLinecap="round"
      />
      {/* полоски на хвосте */}
      <path
        className="cat-tail"
        d={dir >= 0
          ? "M72 78 Q88 72 90 58 Q91 47 84 46 Q80 46 78 50"
          : "M28 78 Q12 72 10 58 Q9 47 16 46 Q20 46 22 50"
        }
        fill="none" stroke="#b85e10" strokeWidth="6"
        strokeLinecap="round" strokeDasharray="3 9" opacity="0.5"
      />

      {/* Задние лапы */}
      <ellipse className="cat-leg cat-leg-back-l" cx="34" cy="95" rx="8" ry="9" fill="#d4751a" />
      <ellipse className="cat-leg cat-leg-back-r" cx="66" cy="95" rx="8" ry="9" fill="#d4751a" />

      {/* Тело */}
      <ellipse cx="50" cy="74" rx="28" ry="24" fill="url(#gBody)" />
      {/* Полоски на теле */}
      <path d="M30 60 Q50 57 70 60" fill="none" stroke="#b85e10" strokeWidth="2" opacity="0.4" strokeLinecap="round"/>
      <path d="M28 68 Q50 65 72 68" fill="none" stroke="#b85e10" strokeWidth="2" opacity="0.35" strokeLinecap="round"/>
      <path d="M30 76 Q50 74 70 76" fill="none" stroke="#b85e10" strokeWidth="1.5" opacity="0.3" strokeLinecap="round"/>
      {/* Живот */}
      <ellipse cx="50" cy="80" rx="17" ry="18" fill="url(#gBelly)" />

      {/* Передние лапы */}
      <ellipse className="cat-leg cat-leg-left"  cx="36" cy="94" rx="7" ry="8" fill="#e8923a" />
      <ellipse className="cat-leg cat-leg-right" cx="64" cy="94" rx="7" ry="8" fill="#e8923a" />
      {/* Пальчики */}
      <line x1="33" y1="98" x2="33" y2="102" stroke="#c06010" strokeWidth="1.2" opacity="0.5" strokeLinecap="round"/>
      <line x1="36" y1="99" x2="36" y2="103" stroke="#c06010" strokeWidth="1.2" opacity="0.5" strokeLinecap="round"/>
      <line x1="39" y1="98" x2="39" y2="102" stroke="#c06010" strokeWidth="1.2" opacity="0.5" strokeLinecap="round"/>
      <line x1="61" y1="98" x2="61" y2="102" stroke="#c06010" strokeWidth="1.2" opacity="0.5" strokeLinecap="round"/>
      <line x1="64" y1="99" x2="64" y2="103" stroke="#c06010" strokeWidth="1.2" opacity="0.5" strokeLinecap="round"/>
      <line x1="67" y1="98" x2="67" y2="102" stroke="#c06010" strokeWidth="1.2" opacity="0.5" strokeLinecap="round"/>

      {/* Голова */}
      <circle cx="50" cy="38" r="26" fill="url(#gHead)" />
      {/* Полоски на голове */}
      <path d="M41 18 Q50 15 59 18" fill="none" stroke="#c06010" strokeWidth="1.8" opacity="0.45" strokeLinecap="round"/>
      <path d="M38 23 Q50 20 62 23" fill="none" stroke="#c06010" strokeWidth="1.5" opacity="0.4" strokeLinecap="round"/>
      <path d="M36 28 Q50 26 64 28" fill="none" stroke="#c06010" strokeWidth="1.3" opacity="0.35" strokeLinecap="round"/>

      {/* Уши */}
      <path d="M30 24 L24 6  L40 20 Z" fill="#f0a040" />
      <path d="M30 24 L27 10 L38 20 Z" fill="#f0c8a0" />
      <path d="M70 24 L76 6  L60 20 Z" fill="#f0a040" />
      <path d="M70 24 L73 10 L62 20 Z" fill="#f0c8a0" />

      {/* Морда (светлый круг) */}
      <ellipse cx="50" cy="46" rx="16" ry="14" fill="#fff8ee" />

      {/* Глаза */}
      {/* Левый глаз */}
      <ellipse cx="39" cy="36" rx="6.5" ry="8" fill="#fff" />
      <ellipse cx="39" cy="36" rx="5.5" ry="7" fill="url(#gEye)" />
      <ellipse className="cat-pupil" cx={39 + dir * 0.8} cy="36" rx="2" ry="6.5" fill="#111" />
      <circle cx={38 + dir * 0.5} cy="32" r="1.5" fill="#fff" />
      <circle cx={40 + dir * 0.5} cy="38" r="0.8" fill="#fff" opacity="0.6" />

      {/* Правый глаз */}
      <ellipse cx="61" cy="36" rx="6.5" ry="8" fill="#fff" />
      <ellipse cx="61" cy="36" rx="5.5" ry="7" fill="url(#gEye)" />
      <ellipse className="cat-pupil" cx={61 + dir * 0.8} cy="36" rx="2" ry="6.5" fill="#111" />
      <circle cx={60 + dir * 0.5} cy="32" r="1.5" fill="#fff" />
      <circle cx={62 + dir * 0.5} cy="38" r="0.8" fill="#fff" opacity="0.6" />

      {/* Нос */}
      <path d="M47 46 L50 50 L53 46 Q50 44 47 46 Z" fill="#e07070" />
      {/* Желобок над носом */}
      <line x1="50" y1="43" x2="50" y2="46" stroke="#d06060" strokeWidth="1" strokeLinecap="round"/>
      {/* Рот */}
      <path d="M50 50 Q46 55 42 53" fill="none" stroke="#c08080" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M50 50 Q54 55 58 53" fill="none" stroke="#c08080" strokeWidth="1.2" strokeLinecap="round"/>

      {/* Усы — 3 слева, 3 справа */}
      <line x1="47" y1="48" x2="30" y2="44" stroke="#ddd" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="47" y1="50" x2="29" y2="50" stroke="#ddd" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="47" y1="52" x2="31" y2="55" stroke="#ddd" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="53" y1="48" x2="70" y2="44" stroke="#ddd" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="53" y1="50" x2="71" y2="50" stroke="#ddd" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="53" y1="52" x2="69" y2="55" stroke="#ddd" strokeWidth="0.7" strokeLinecap="round"/>

      {/* Подбородок */}
      <ellipse cx="50" cy="57" rx="7" ry="4" fill="#fff0de" />
    </svg>
  );
}

/* ── ИИ-движок ответов (на includes() — надёжнее для кириллицы) ── */
function getAIResponse(rawText, t) {
  const q = rawText.toLowerCase().trim();

  // Приветствия
  if (
    q.includes("привет") || q.includes("здравств") || q.includes("хай") ||
    q.includes("hello") || q.includes("hi") || q.includes("салам") ||
    q.includes("саламат") || q.includes("добр") || q.includes("hey") ||
    q.includes("ку") || q.includes("qalay") || q.includes("morning") ||
    q.includes("evening")
  )
    return t.catHi;

  // Спасибо
  if (
    q.includes("спасибо") || q.includes("благодар") || q.includes("рахмат") ||
    q.includes("thank")
  )
    return t.catThanks;

  // Пока
  if (
    q.includes("пока") || q.includes("до свид") || q.includes("бай") ||
    q.includes("bye") || q.includes("goodbye") || q.includes("сау бол")
  )
    return t.catBye;

  // Кто ты
  if (
    q.includes("кто ты") || q.includes("тебя зов") || q.includes("твое имя") ||
    q.includes("what") && q.includes("you") || q.includes("твоё имя") ||
    q.includes("сен ким") || q.includes("аты")
  )
    return t.catWhoAmI;

  // Категории / товары
  if (
    q.includes("категор") || q.includes("товар") || q.includes("продукт") ||
    q.includes("каталог") || q.includes("что есть") || q.includes("что прода") ||
    q.includes("category") || q.includes("product") || q.includes("товарлар") ||
    q.includes("что купить") || q.includes("что можно")
  )
    return t.catProducts;

  // Доставка
  if (
    q.includes("доставк") || q.includes("курьер") || q.includes("привез") ||
    q.includes("сколько ждать") || q.includes("delivery") || q.includes("жеткир") ||
    q.includes("когда будет") || q.includes("когда прид")
  )
    return t.catDelivery;

  // Корзина / заказ
  if (
    q.includes("корзин") || q.includes("заказ") || q.includes("оформ") ||
    q.includes("купить") || q.includes("купит") || q.includes("cart") ||
    q.includes("order") || q.includes("себет") || q.includes("буйрут")
  )
    return t.catOrder;

  // Оплата / цена
  if (
    q.includes("оплат") || q.includes("цен") || q.includes("стоим") ||
    q.includes("скидк") || q.includes("price") || q.includes("pay") ||
    q.includes("төлө") || q.includes("баа") || q.includes("арзан") ||
    q.includes("сколько стоит")
  )
    return t.catPrice;

  // Гарантия / возврат
  if (
    q.includes("гаранти") || q.includes("возврат") || q.includes("вернут") ||
    q.includes("обмен") || q.includes("warranty") || q.includes("return") ||
    q.includes("кепил") || q.includes("кайтар")
  )
    return t.catWarranty;

  // Контакты
  if (
    q.includes("контакт") || q.includes("связать") || q.includes("телефон") ||
    q.includes("номер") || q.includes("email") || q.includes("почта") ||
    q.includes("address") || q.includes("адрес") || q.includes("байлан") ||
    q.includes("позвонить")
  )
    return t.catContacts;

  // Время работы
  if (
    q.includes("работа") || q.includes("график") || q.includes("время") ||
    q.includes("когда открыт") || q.includes("часы") || q.includes("иштей") ||
    q.includes("open hours")
  )
    return t.catHours;

  // Тема
  if (
    q.includes("темн") || q.includes("светл") || q.includes("тема") ||
    q.includes("theme") || q.includes("dark") || q.includes("light") ||
    q.includes("режим")
  )
    return t.catTheme;

  // Админ
  if (
    q.includes("админ") || q.includes("войти") || q.includes("пароль") ||
    q.includes("логин") || q.includes("admin") || q.includes("login") ||
    q.includes("вход")
  )
    return t.catAdmin;

  // Избранное
  if (
    q.includes("избран") || q.includes("любим") || q.includes("heart") ||
    q.includes("favorite") || q.includes("тандал")
  )
    return t.catFavorites;

  // Отзывы
  if (
    q.includes("отзыв") || q.includes("мнен") || q.includes("оценк") ||
    q.includes("review") || q.includes("feedback") || q.includes("пикир")
  )
    return t.catReviews;

  // Не понял
  return t.catDontKnow;
}

export default function CatAssistant() {
  const { t } = useShop();

  // Позиция котика
  const [pos, setPos] = useState({ x: 60, y: -1 });
  const [walkDir, setWalkDir] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [walkPaused, setWalkPaused] = useState(false);

  const catRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const walkTimer = useRef(null);
  const chatScrollRef = useRef(null);

  // Обновляем приветствие при смене языка или при первом рендере
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages((prev) => {
      if (prev.length === 0) {
        return [{ from: "cat", text: t.catGreeting }];
      }
      if (prev.length > 0 && prev[0].from === "cat" && prev[0].text !== t.catGreeting && prev.length <= 1) {
        return [{ from: "cat", text: t.catGreeting }];
      }
      return prev;
    });
  }, [t.catGreeting]);

  // ── Анимация ходьбы (медленная, спокойная) ──
  useEffect(() => {
    if (isDragging || walkPaused || chatOpen) return;

    walkTimer.current = setInterval(() => {
      setPos((prev) => {
        const maxX = window.innerWidth - 80;
        const minX = 10;
        let nextX = prev.x + walkDir * 0.4; // очень медленно

        if (nextX >= maxX) {
          setWalkDir(-1);
          nextX = maxX;
        } else if (nextX <= minX) {
          setWalkDir(1);
          nextX = minX;
        }

        return { ...prev, x: nextX };
      });
    }, 80); // 80ms — спокойный темп

    return () => clearInterval(walkTimer.current);
  }, [isDragging, walkPaused, chatOpen, walkDir]);

  // ── Перетаскивание ──
  function handlePointerDown(e) {
    const cat = catRef.current;
    if (!cat) return;
    const rect = cat.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    dragOffset.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
    setIsDragging(true);
    setWalkPaused(true);
    e.preventDefault();
  }

  function handlePointerMove(e) {
    if (!isDragging) return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX === undefined) return;

    const newX = clientX - dragOffset.current.x;
    const newY = clientY - dragOffset.current.y;

    setPos({ x: Math.max(0, Math.min(window.innerWidth - 70, newX)), y: newY });
  }

  function handlePointerUp() {
    if (isDragging) {
      setIsDragging(false);
      setTimeout(() => setWalkPaused(false), 2000); // было 1.5 — стало 2 сек
    }
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handlePointerMove);
      document.addEventListener("mouseup", handlePointerUp);
      document.addEventListener("touchmove", handlePointerMove, { passive: false });
      document.addEventListener("touchend", handlePointerUp);
    }
    return () => {
      document.removeEventListener("mousemove", handlePointerMove);
      document.removeEventListener("mouseup", handlePointerUp);
      document.removeEventListener("touchmove", handlePointerMove);
      document.removeEventListener("touchend", handlePointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  // ── Чат ──
  function handleCatClick() {
    if (!isDragging) {
      setChatOpen((v) => !v);
    }
  }

  function handleSend(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;

    const userMsg = { from: "user", text };
    const catMsg = { from: "cat", text: getAIResponse(text, t) };
    setMessages((prev) => [...prev, userMsg, catMsg]);
    setInput("");
  }

  // Авто-скролл чата
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const bottomY = pos.y < 0 ? null : pos.y;
  const style = {
    left: `${pos.x}px`,
    ...(bottomY !== null ? { top: `${bottomY}px` } : {}),
  };

  return (
    <>
      {/* Котик */}
      <div
        ref={catRef}
        className={`cat-assistant ${isDragging ? "dragging" : ""}`}
        style={style}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        onClick={handleCatClick}
        title={t.catHint}
      >
        <CatSVG dir={walkDir} />
        {walkPaused && !chatOpen && (
          <span className="cat-speech-bubble">{t.catTapToChat}</span>
        )}
        {!chatOpen && (
          <span className="cat-badge">
            <Send size={11} />
          </span>
        )}
      </div>

      {/* Чат-окно */}
      {chatOpen && (
        <div className="cat-chat-window" style={{ left: `${Math.min(pos.x, window.innerWidth - 330)}px` }}>
          <div className="cat-chat-header">
            <span className="cat-chat-title">
              <span className="cat-chat-avatar"><CatSVG dir={walkDir} /></span>
              <span className="cat-chat-title-info">
                <span className="cat-chat-title-name">{t.catName}</span>
                <span className="cat-chat-title-status">{t.catOnline ?? "онлайн"}</span>
              </span>
            </span>
            <button className="cat-chat-close" onClick={() => setChatOpen(false)} aria-label="Close">
              <X size={16} />
            </button>
          </div>

          <div className="cat-chat-messages" ref={chatScrollRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`cat-msg ${msg.from === "user" ? "user" : "cat"}`}>
                {msg.from === "cat" && <span className="cat-msg-avatar"><CatSVG /></span>}
                <span className="cat-msg-text">{msg.text}</span>
              </div>
            ))}
          </div>

          <form className="cat-chat-input-row" onSubmit={handleSend}>
            <input
              type="text"
              placeholder={t.catInputPlaceholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={200}
            />
            <button type="submit" className="cat-chat-send" aria-label="Send">
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
