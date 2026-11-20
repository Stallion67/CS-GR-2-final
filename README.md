# GoatBrowse Herbarium

A lightweight digital herbarium frontend for exploring reconstructed medicinal plants, community knowledge, and goat-borne capture provenance. This is a static site. It needs no server, so it runs on GitHub Pages.

## Run it on your computer

```
npm install
npm run dev
```

Open the address the terminal prints.

## Publish on GitHub Pages

1. Create a new repository on GitHub.
2. Upload every file in this folder to the repository, or push it with git. Keep the `.github` folder. Use the `main` branch.
3. In the repository, open Settings, then Pages. Under Build and deployment, set Source to GitHub Actions.
4. Open the Actions tab. The workflow "Deploy to GitHub Pages" runs after each push to `main`. Wait for the green tick.
5. Your site is live at `https://<your-username>.github.io/<repository-name>/`.

## How the site works on GitHub Pages

- The build uses a relative base path, so the same files work at `https://<user>.github.io/<repo>/` and at `https://<user>.github.io/`.
- The site uses hash routing. A species page looks like `https://<user>.github.io/<repo>/#/species/neem-02`. Links and page reloads work, because GitHub Pages does not rewrite paths to `index.html`.
- To build by hand, run `npm run build`. The site appears in the `dist` folder.

## Check the build

```
npm run typecheck
npm run build
npm run preview
```
