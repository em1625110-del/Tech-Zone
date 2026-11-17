// Внимание: VITE_-переменные попадают в код сайта и видны в браузере.
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

function sendTelegramMessage(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: text.slice(0, 4000),
      disable_web_page_preview: true,
    }),
  }).catch((error) => console.error("Telegram notification failed", error));
}

export function sendTelegramOrder(orderId, order) {
  sendTelegramMessage([
    "🛒 Новый заказ в Tech-Zone",
    `Заказ: ${orderId}`,
    `Клиент: ${order.firstName} ${order.lastName}`,
    `Телефон: ${order.phone}`,
    `Email: ${order.email || "—"}`,
    `Адрес: ${order.address}`,
    "Оплата: наличные",
    "",
    "Товары:",
    ...order.items.map(
      (item) => `• ${item.title} × ${item.quantity} — ${Number(item.price).toLocaleString("ru-RU")}`,
    ),
    `Итого: ${Number(order.total).toLocaleString("ru-RU")}`,
  ].join("\n"));
}

export function sendTelegramReview(review) {
  sendTelegramMessage([
    "⭐ Новый отзыв в Tech-Zone",
    `От: ${review.name} (${review.email || "—"})`,
    `Оценка: ${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}`,
    "",
    review.comment,
  ].join("\n"));
}
