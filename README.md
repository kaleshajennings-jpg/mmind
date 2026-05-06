# MealMind Vercel Deployment

This project is a Vite + React app packaged for deployment on Vercel.

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run locally:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

## Vercel deployment

1. Connect the `mealmind-vercel` folder to Vercel.
2. Vercel will use `npm install` and `npm run build` automatically.
3. The production output directory is `dist`.

## Notes

- `src/App.jsx` imports `src/mealData.js`.
- `vercel.json` ensures Vercel serves the built `dist` folder.
