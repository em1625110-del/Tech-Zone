# Tech-Zone

React + Vite storefront using Firebase Authentication, Cloud Firestore, and Firebase Analytics.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set the Firebase web app values.
3. In Firebase Console, enable **Authentication → Email/Password** and create a Cloud Firestore database.
4. Publish the rules in `firestore.rules` (or run `firebase deploy --only firestore:rules` after configuring Firebase CLI).
5. Run `npm run dev`.

The local `.env.local` is ignored by git. Firebase web API keys are public identifiers, not authorization credentials; restrict the key to the app's domains in Google Cloud Console and rely on Authentication and Firestore rules for access control.

## First administrator

1. Register an account at `/auth`.
2. While signed in, copy the UID shown on the account page.
3. In Firestore Console, create a document in the `admins` collection with the document ID set to that UID and a string field `role` set to `admin`.
4. The app watches the admin record and opens `/admin` automatically when the role is assigned.

Admin role documents cannot be created or modified from the client. Never use the temporary open Firestore rules from an initial Firebase setup.

## Telegram order notifications

The `notifyAdminOnOrder` Firebase Cloud Function sends a Telegram message to the admin chat (`8768857023`) whenever a new order is created in Firestore. The bot token is kept in Firebase Secret Manager and is never included in the website bundle.

1. In Telegram, open the bot and send `/start` so it can message you.
2. The previously shared bot token is compromised. Revoke it with BotFather (`/revoke`) and use a newly generated token.
3. From the project directory, set the replacement token as a Firebase secret: `firebase functions:secrets:set TELEGRAM_BOT_TOKEN`.
4. Deploy the function: `firebase deploy --only functions:notifyAdminOnOrder`.

Cloud Functions deployment requires the Firebase project to be selected in the Firebase CLI and a billing-enabled Firebase plan. The trigger retries failed Telegram sends; a rare retry after Telegram accepted a message may result in a duplicate notification.

## Firebase data

- `users/{uid}` stores the display name, email, UID, and registration timestamp.
- `products/{productId}` stores admin-created products. Their selected image is encoded as a Base64 data URL; images are limited to 700 KB because Firestore documents have a 1 MiB limit.
- `orders/{orderId}` stores a signed-in user's cart order, which administrators can review and update.
- `admins/{uid}` assigns the administrator role.

Products and admin data are stored in Firestore. The storefront and admin inventory use the Firestore `products` collection only; there are no demo or remote catalog products. The storefront allows smartphones, laptops, tablets, mobile accessories, and smart watches only. Use **Удалить неэлектронные** to remove Firestore products whose categories are not in that electronics list.
