# Saarthi — Human ambition. AI momentum.

**The public marketing website for Saarthi Agents**, an engineering-preview platform for governed AI employees. This repository contains only the public website; internal architecture, operator credentials, tenant data, and the private Saarthi control plane are not published here.

## Website

The organization GitHub Pages URL is **https://saarthi-agents.github.io/** after the first successful deployment.

The website includes an original Saarthi geometric logo, animated team orbit, product story, scoped employee-role catalog, human-in-the-loop governance narrative, responsive layouts, motion-reduction support, and keyboard-accessible mobile navigation.

## Publish with GitHub Pages

The workflow `.github/workflows/pages.yml` tests the site and deploys a **whitelisted static artifact**: `index.html`, `styles.css`, `site.js`, `assets/mark.svg`, and `.nojekyll`. It does not publish the Git history, CI source, internal docs, or test files.

GitHub repository Settings → Pages → Build and deployment → Source should be **GitHub Actions**. On pushes to `main`, deployment runs automatically. It can also be triggered from Actions → Publish Saarthi organization website → Run workflow.

The site's deployment status and exact public URL are recorded in the `github-pages` environment. Do not claim a successful public release until the deployment and live HTTP checks pass.

## Develop and test

```sh
node --test site.test.mjs
node --check site.js
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

This is dependency-free static HTML/CSS/JS. Fonts from Google Fonts are optional; system fonts are used as fallback. Animation honors `prefers-reduced-motion`. There is no user registration form, payment flow, tracking SDK, third-party API key, or production agent execution endpoint.

## Status

Saarthi is in engineering preview. Product details describe architecture and intended capabilities, **not** production certifications, active customers, or general commercial availability.

## License

MIT. See [LICENSE](LICENSE).
