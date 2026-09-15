# Current — Ecommerce Knowledge Agent (MVP)

Prototype UI for the AI Ecom Guide MVP: a **free-form chat** that helps Business, Product, UX, QA, Engineering, and Operations discover current ecommerce capabilities with **source-linked** answers.

## What this prototype demonstrates

- Free-form discovery chat for the **Checkout** pilot journey
- Role lenses: Business / UX / QA / Engineering
- Structured answers for core use cases:
  - Current functionality discovery
  - Business rule finder
  - UX flow & screenshot discovery
  - Edge case discovery
  - Dependency & impact discovery
  - Decision history
  - New-initiative context pack
- Trust UX: **sources**, **conflicts**, **knowledge gaps**, and **confidence**
- Journey switcher including Payroll API (benchmark framing)

Knowledge responses are **seeded mocks** for product/UX validation — not live code extraction.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui primitives.
