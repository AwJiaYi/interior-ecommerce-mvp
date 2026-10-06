# Interior Design E-Commerce MVP

A polished React + Supabase MVP that covers the project brief:

- Homepage
- Product browsing, search and category filter
- Product detail and quantity selection
- Shopping cart
- Checkout form validation
- Predefined NETSPay QR display
- Payment screenshot upload
- Order submission and confirmation
- Admin login
- Product add/edit/delete + image upload
- Admin order review and payment-proof viewing
- Responsive design
- Vercel-ready frontend

## Recommended stack

- Frontend: React + Vite + TypeScript
- Backend / Database / Storage / Authentication: Supabase
- Hosting: Vercel

This stack is intentionally simple because the deadline is short.

## 1. Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local URL shown by Vite.

Without Supabase environment variables, the storefront runs in demo mode using local sample products.
Checkout/admin persistence requires Supabase.

## 2. Supabase setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. Go to Project Settings > API and copy:
   - Project URL
   - anon public key
5. Put them in `.env`:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## 3. Create the admin account

In Supabase Authentication, create an email/password user.

Copy the new user's UUID, then run:

```sql
insert into public.admin_users (user_id)
values ('YOUR_AUTH_USER_UUID');
```

You can then sign in at:

`/admin/login`

## 4. Replace the NETSPay QR

The project currently includes a clearly marked demo placeholder:

`public/netspay-qr-placeholder.svg`

Replace it with the client's official NETSPay merchant QR image while keeping the same filename,
or update the image path in `src/pages/CheckoutPage.tsx`.

Do not invent a payment gateway integration for the MVP. The brief specifically allows:
QR display + screenshot proof + manual verification.

## 5. Deployment to Vercel

1. Push this folder to GitHub.
2. Import the GitHub repository into Vercel.
3. Add the two `VITE_...` environment variables.
4. Deploy.
5. In Supabase Authentication > URL Configuration, add your Vercel domain if needed.

Because this is a client-side React app, add the SPA rewrite in `vercel.json`.

## 6. Demo flow for presentation

Customer:
1. Browse homepage.
2. Search/filter products.
3. Open a product.
4. Add quantity to cart.
5. Edit quantity/remove an item.
6. Checkout.
7. Scan/display QR.
8. Upload payment screenshot.
9. Submit order.
10. Show order confirmation.

Admin:
1. Login.
2. Add a product with an image.
3. Edit a product.
4. Delete a product.
5. Open Orders.
6. View payment proof.
7. Change order status to Payment Verified.

## 7. Production notes

For a real commercial deployment after the MVP:
- Replace demo branding/content with the client's final assets.
- Use the client's official NETSPay QR.
- Tighten upload rate limits and file validation.
- Add transactional email.
- Add inventory and category management.
- Add shipping calculations.
- Add backups, monitoring and audit logs.
- Review PDPA/privacy requirements before handling real customer data.
