# Arc V2 — dependency freeze procedure

Current state: `package.json` uses `latest` ranges and the repository has no committed npm lockfile. **Do not claim deterministic builds yet.**

On the owner's development machine, after syncing `product/v2`:

```powershell
npm install --save-exact react react-dom lucide-react
npm install --save-dev --save-exact @vitejs/plugin-react vite typescript @types/react @types/react-dom @playwright/test
npm run check:lockfile
npm ci
npm run build
npx playwright test --workers=4
npm run test:production
git add package.json package-lock.json
git commit -m "Freeze reviewed V2 dependencies and npm lockfile"
git push origin product/v2
```

**Review the proposed package changes and installed versions before committing.** This workflow resolves versions available on the user's machine at execution time, rather than inventing versions or committing an unverified lockfile. Do not mix unrelated package upgrades into the release candidate. If a dependency upgrade causes regressions, restore the previous manifest and resolve before committing.

For future builds, use `npm ci`, not `npm install`. Keep `package-lock.json` tracked, and run the release gate after any intentional dependency update. Review `npm audit` findings separately; an audit result is not a substitute for testing.

The release gate must remain red until the lockfile and pinned dependencies exist.
