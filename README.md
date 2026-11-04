# Nexum Global Solutions website

Local React/Vite recreation of the six-page Framer website.

## Run locally

```powershell
npm install
npm run dev
```

## Production build

```powershell
npm run build
npm run preview
```

Routes: `/`, `/about`, `/services`, `/process`, `/faqs`, `/contact`.

The contact form is a working client-side form with validation and a success state. Connect the submit handler in `src/App.jsx` to an email or CRM endpoint for production delivery.
