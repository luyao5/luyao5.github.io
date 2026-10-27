# Website Hosting Migration History

**Date of Migration:** 2026-10-27  
**Previous Host:** GitHub Pages (`luyao5/luyao5.github.io`)  
**New Host:** Cloudflare Pages (`stonedrum-home`)  
**Production Site URL:** [https://stonedrum.co](https://stonedrum.co)  

---

## 1. Overview & Objective

The production website previously hosted on GitHub Pages in this repository (`luyao5/luyao5.github.io`) has been completely migrated to **Cloudflare Pages** under the project name **`stonedrum-home`**.

All future development, content publishing, and CI/CD operations are now decoupled from this public repository and handled through a dedicated private repository.

---

## 2. Infrastructure Changes & Parameters

### A. Repositories
* **Legacy Repository (This repo):** `luyao5/luyao5.github.io`
  * Status: Deprecated for production hosting. Retained as placeholder serving `https://luyao5.github.io`.
  * Custom domain `stonedrum.co` removed via GitHub API (`cname: null`, `CNAME` deleted).
* **New Production Repository:** `luyao5/website-stonedrum-home` (Private)
  * Complete git history (3,128 objects) copied to `main`.
  * Connected via Cloudflare GitHub App integration for automated deployments.

### B. Cloudflare Pages Deployment
* **Project Name:** `stonedrum-home`
* **Connected Repo:** `luyao5/website-stonedrum-home` (branch `main`)
* **Build Settings:**
  * Framework preset: `None`
  * Build command: `(empty)`
  * Output directory: `/` (root)
* **Pages URL:** `https://stonedrum-home.pages.dev`
* **CI/CD:** Every push to `main` triggers an automatic build and deployment.

### C. Domain & DNS Migration
* **Domain:** `stonedrum.co` & `www.stonedrum.co`
* **DNS Provider:** Cloudflare (`vera.ns.cloudflare.com`, `langston.ns.cloudflare.com`)
* **Routing:** Attached directly as custom domain to Cloudflare Pages `stonedrum-home` with automatic edge SSL/TLS.
* **DNS Cleanup:** Retired obsolete GitHub Pages wildcard record `*.stonedrum.co A 185.199.108.153`.

---

## 3. Workflow Specification for Website Dev Agent

* **Local Production Folder:** `/Users/l.woogie/DEVELOPMENT/GitHub/website-stonedrum-home`
* **Workflow:**
  1. Build and generate static assets locally as normal.
  2. Copy generated output to `/Users/l.woogie/DEVELOPMENT/GitHub/website-stonedrum-home`.
  3. Commit and push to `origin main`:
     ```bash
     git add .
     git commit -m "Update site content"
     git push origin main
     ```
  4. Cloudflare Pages automatically deploys the changes live to `https://stonedrum.co`.
