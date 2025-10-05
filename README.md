# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/f47a19f7-935b-4cac-bf75-3e5ce2eb7137

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/f47a19f7-935b-4cac-bf75-3e5ce2eb7137) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/f47a19f7-935b-4cac-bf75-3e5ce2eb7137) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## PWA / Manifest changes

I cleaned up `public/manifest.json` to remove experimental or non-standard fields that caused PWABuilder/MSIX packaging to fail (fields like `scope_extensions`, `widgets`, `edge_side_panel`, and `launch_handler`). I also generated additional PNG icon sizes required by app packaging tools.

Files added/updated:
- `public/manifest.json` (trimmed to standards-compliant fields)
- `public/icon-144x144.png`, `public/icon-256x256.png`, `public/icon-1024x1024.png` (generated from `public/pwd2.png`)
- `scripts/validate-manifest.js` (local manifest checker)
- `scripts/generate-icons.js` (icon generator using Jimp)

If you plan to re-run PWABuilder or package an MSIX, ensure the site is publicly reachable and try again; if there are packaging errors I can iterate further.
