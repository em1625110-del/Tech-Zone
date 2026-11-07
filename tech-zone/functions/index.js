import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";
import { defineSecret } from "firebase-functions/params";

const telegramBotToken = defineSecret("TELEGRAM_BOT_TOKEN");
const adminChatId = "8768857023";

function cleanText(value, maxLength = 500) {
  return Array.from(String(value ?? ""), (character) => {
    const code = character.charCodeAt(0);
    return code <= 0x1f || code === 0x7f ? " " : character;
  })
    .join("")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function formatOrder(order, orderId) {
  const items = Array.isArray(order.items)
    ? order.items.slice(0, 30).map((item) => {
        const title = cleanText(item?.title, 100) || "Товар";
        const quantity = Number.isFinite(Number(item?.quantity))
          ? Number(item.quantity)
          : 0;
        const price = Number.isFinite(Number(item?.price))
          ? Number(item.price)
          : 0;
        return `• ${title} × ${quantity} — ${price.toLocaleString("ru-RU")}`;
      })
    : [];

  const message = [
    "Новый заказ в Tech-Zone",
    `Заказ: ${cleanText(orderId, 100)}`,
    `Клиент: ${cleanText(order.firstName, 100)} ${cleanText(order.lastName, 100)}`,
    `Телефон: ${cleanText(order.phone, 30)}`,
    `Email: ${cleanText(order.email, 150)}`,
    `Адрес: ${cleanText(order.address, 500)}`,
    `Оплата: ${cleanText(order.paymentMethod, 30)}`,
    "",
    "Товары:",
    ...items,
    `Итого: ${Number(order.total || 0).toLocaleString("ru-RU")}`,
  ].join("\n");

  return message.length <= 4000 ? message : `${message.slice(0, 3980)}\n…`;
}

export const notifyAdminOnOrder = onDocumentCreated(
  {
    document: "orders/{orderId}",
    region: "us-central1",
    secrets: [telegramBotToken],
    retry: true,
  },
  async (event) => {
    logger.info("New order received for Telegram notification", {
      orderId: event.params.orderId,
    });
    const order = event.data?.data();
    if (!order) {
      throw new Error("Created order document has no data.");
    }

    const response = await fetch(
      `https://api.telegram.org/bot${telegramBotToken.value()}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: adminChatId,
          text: formatOrder(order, event.params.orderId),
          disable_web_page_preview: true,
        }),
      },
    );
    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(
        `Telegram sendMessage failed with status ${response.status}: ${
          result.description || "unknown Telegram API error"
        }`,
      );
    }
    logger.info("Telegram order notification sent", {
      orderId: event.params.orderId,
    });
  },
);
