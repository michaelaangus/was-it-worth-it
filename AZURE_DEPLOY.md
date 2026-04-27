# Deploying "Was It Worth It?" to Azure App Service

This guide walks you through deploying the production bundle to **Azure
App Service** (Linux, Node 20). The bundle in `azure-deploy/` is fully
self-contained — there are no monorepo or pnpm steps required on Azure.

> Estimated time: **15–20 minutes**.

---

## Prerequisites

- An Azure account (the free tier is enough — students get $100 credit
  via Azure for Students if you don't already have a subscription).
- Your Supabase **Transaction pooler** connection string. You can re-copy
  it from the Supabase dashboard → green **Connect** button →
  **Connection string** → **Transaction pooler**.
- The deployment zip we generated together: `was-it-worth-it-azure.zip`.

---

## Step 1 — Create the Resource Group

1. Go to <https://portal.azure.com> and sign in.
2. In the top search bar, type **Resource groups** and click it.
3. Click **+ Create**.
4. Fill in:
   - **Subscription**: your subscription.
   - **Resource group name**: `was-it-worth-it-rg`
   - **Region**: pick the one closest to you (e.g. `East US 2`).
5. Click **Review + create**, then **Create**.

---

## Step 2 — Create the App Service

1. In the top search bar, type **App Services** and click it.
2. Click **+ Create** → **Web App**.
3. On the **Basics** tab, fill in:
   - **Subscription**: same as above.
   - **Resource group**: `was-it-worth-it-rg`.
   - **Name**: pick a globally unique name, e.g. `was-it-worth-it-yourname`.
     This becomes your URL: `https://<name>.azurewebsites.net`.
   - **Publish**: **Code**
   - **Runtime stack**: **Node 20 LTS**
   - **Operating system**: **Linux**
   - **Region**: same region as your resource group.
4. **Pricing plan**: click **Create new** and choose a plan, or pick the
   default. The **Free F1** plan is fine for this assignment.
5. Click **Review + create**, then **Create**. Wait ~1 minute for it to
   finish ("Your deployment is complete").
6. Click **Go to resource**.

---

## Step 3 — Set the database connection string

1. In your App Service, in the left sidebar click **Settings → Environment variables**.
2. On the **App settings** tab, click **+ Add**.
3. Add a single setting:
   - **Name**: `SUPABASE_DATABASE_URL`
   - **Value**: paste your full Supabase Transaction pooler URL
     (`postgresql://postgres.kfxczjrgobnwduzaeeqe:%21%21Mickey%401203%21%21@aws-1-us-east-2.pooler.supabase.com:6543/postgres`)
4. Click **Apply** at the bottom, then **Confirm**.

> Azure App Service automatically provides the `PORT` variable — do not
> set it yourself.

---

## Step 4 — Configure the startup command

1. Still in **Settings**, click **Configuration** (or in newer portals,
   **Settings → Configuration → General settings**).
2. Find the **Startup Command** field.
3. Enter: `npm start`
4. Click **Save**, then **Continue**.

---

## Step 5 — Deploy the zip

The simplest deployment method is the **Zip Deploy** REST API, exposed
through the portal:

1. In your App Service, in the left sidebar click **Deployment →
   Deployment Center**.
2. At the top, click the **Settings** tab. For **Source**, choose
   **Zip Deploy**. Click **Save**.
3. Now switch to the **Browse / Logs** tab to keep an eye on logs.
4. Open a terminal on your machine and run (replacing the app name and
   path to the zip):

   ```bash
   az webapp deploy \
     --resource-group was-it-worth-it-rg \
     --name was-it-worth-it-yourname \
     --src-path ./was-it-worth-it-azure.zip \
     --type zip
   ```

   If you don't have the Azure CLI, install it from
   <https://learn.microsoft.com/cli/azure/install-azure-cli>, then run
   `az login` first.

   **GUI alternative (no CLI):**
   1. In the App Service, click **Development Tools → Advanced Tools →
      Go**. This opens **Kudu** in a new tab.
   2. In Kudu's top menu click **Tools → Zip Push Deploy**.
   3. Drag and drop `was-it-worth-it-azure.zip` onto the page. Wait for
      the deployment to complete (the page shows a log).

5. Wait 30–60 seconds for App Service to start.

---

## Step 6 — Verify

1. Back in your App Service overview, click the **Default domain** URL
   (`https://<name>.azurewebsites.net`).
2. You should see the **landing page**. Click **Open the App**.
3. The dashboard should load with "Total logged: 10" and a purchase
   ready for reflection.
4. Add a new purchase from `/app/log`. Confirm it appears in your
   Supabase Table Editor under `purchases`.

If the page is blank or shows an error, check **Log stream** in the App
Service sidebar — most issues are missing or wrong
`SUPABASE_DATABASE_URL`.

---

## Updating the app later

After making changes, run from the repo root:

```bash
pnpm run build:azure
cd azure-deploy && zip -r ../was-it-worth-it-azure.zip . && cd ..
```

Then re-run the `az webapp deploy` command (or re-drag in Kudu).

---

## What the bundle contains

| File / dir         | Purpose                                              |
| ------------------ | ---------------------------------------------------- |
| `index.mjs`        | Bundled Express server (handles `/api/*` + frontend) |
| `pino-*.mjs`       | Logger worker files used by `index.mjs`              |
| `public/`          | Built React frontend (served by Express at `/`)      |
| `package.json`     | Tells Azure to run `node index.mjs`                  |
| `web.config`       | Routing rules (only used on Windows App Service)     |
| `.env.example`     | Documents required env vars                          |
