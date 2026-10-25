# MAX Chat

Простой веб-клиент для отправки и получения текстовых сообщений в мессенджере MAX через [GREEN-API](https://green-api.com/max).

Стек: React 19, TypeScript, Vite. Без UI-библиотек и стейт-менеджеров — для такого объёма они не нужны.

## Возможности

- вход по `idInstance` и `apiTokenInstance` (при входе проверяется статус инстанса)
- создание чата по номеру телефона получателя
- отправка текстовых сообщений — [SendMessage](https://green-api.com/v3/docs/api/sending/SendMessage/)
- получение входящих сообщений через HTTP API — [ReceiveNotification](https://green-api.com/v3/docs/api/receiving/technology-http-api/ReceiveNotification/) + [DeleteNotification](https://green-api.com/v3/docs/api/receiving/technology-http-api/DeleteNotification/)
- если собеседник пишет первым, чат появляется в списке автоматически
- счётчик непрочитанных, история чатов сохраняется в localStorage
- адаптивная вёрстка

## Запуск

Нужен Node.js 20+.

```bash
git clone <ссылка на репозиторий>
cd max-chat
npm install
npm run dev
```

Приложение откроется на http://localhost:5173

Сборка продакшн-версии:

```bash
npm run build
npm run preview
```

## Настройка инстанса

1. Создать инстанс в [личном кабинете GREEN-API](https://console.green-api.com) и авторизовать его по QR-коду из приложения MAX.
2. Для получения сообщений через HTTP API поле `webhookUrl` в настройках инстанса должно быть **пустым**, а уведомления о входящих сообщениях — включены.
3. Скопировать `apiUrl`, `idInstance` и `apiTokenInstance` из кабинета и ввести их на странице входа.

## Как это работает

- Перед созданием чата номер проверяется методом [CheckAccount](https://green-api.com/v3/docs/api/service/CheckAccount/) — он же возвращает `chatId`, по которому дальше идёт отправка. Так рекомендует документация MAX: при отправке по номеру входящие ответы приходят с другим `chatId` и не сопоставляются с чатом.
- Получение сделано long polling'ом: `receiveNotification` с таймаутом 5 секунд → обработка → `deleteNotification` → следующий запрос. Цикл живёт в хуке `useNotifications` и останавливается при выходе.
- Обрабатываются `incomingMessageReceived` и `outgoingMessageReceived` (сообщения, отправленные с телефона) с типами `textMessage` и `extendedTextMessage`. Остальные уведомления просто удаляются из очереди.
- Номера принимаются только РФ (`7XXXXXXXXXX`) и РБ (`375XXXXXXXXX`) — это ограничение API MAX.

## Структура

```
src/
  api/greenApi.ts            запросы к GREEN-API
  hooks/useNotifications.ts  цикл получения уведомлений
  hooks/useLocalStorage.ts
  components/
    LoginForm.tsx
    Messenger.tsx            состояние чатов, обработка уведомлений
    Sidebar.tsx              список чатов и создание нового
    ChatWindow.tsx           переписка и поле ввода
    Avatar.tsx
  utils/format.ts
  types.ts
```
