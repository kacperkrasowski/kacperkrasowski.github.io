---
title: "GenAI and the Internet"
description: "A simple model of how Generative AI changes online content supply and consumed quality through user choice and provider entry."
paper_status: "working"   # working | published
paper_year: 2026
authors:
  - "Kacper Krasowski"
slug: "genaiandinternet"

tags: ["research", "genai", "internet economics", "platforms", "information supply"]
categories: ["Research"]
# buttons
#pdf: "/research/genai/genaiandinternet_writeup.pdf"
slides: "/research/genaiandinternet/genaiandinternet_slides.pdf"

# optional
hideMeta: true
weight: 3
showtoc: false
---

---

## Overview

This project asks a core question: **How does Generative AI (GenAI) affect online content supply and the quality of information users consume?**

The project develops a simple equilibrium model of the internet with:

1. **Users** who choose between the Web and AI,
2. **Heterogeneous web providers** who decide whether to produce content,
3. **GenAI** that aggregates web content and also reduces providers’ costs.

A key preview result is that **GenAI can worsen outcomes, but not always**: it improves AI-side aggregation and may reduce production costs, but it can also divert traffic away from the web and reduce incentives to produce original content.

---

## Introduction

The motivating research question is:

> **How does Generative AI (GenAI) affect online content supply and quality?**

The presentation frames this as a two-sided equilibrium problem:

- On the **demand side**, users decide whether to search the Web directly or rely on AI.
- On the **supply side**, firms/providers decide whether it is profitable to create information online.
- GenAI affects both sides simultaneously:
  - it is a **substitute** for the Web in users’ choice set,
  - and a **technology shock** that can reduce content production costs.

The broader research agenda is to first build a transparent theoretical framework and then bring the data to the model in future work.

---

## Methodology

## 1) Environment

The model includes three objects:

### Users
- Mass 1.
- Search for information online.
- Choose between:
  - **AI** (an aggregated source), or
  - **the Web** (a collection of sources/providers).

### Providers (the Web)
- There are `m` potential providers.
- Each provider has heterogeneous quality.
- Providers choose whether to enter and produce content (Melitz-style entry decision).

### GenAI
- Aggregates information available online.
- Competes with the Web for user attention.
- May reduce the cost of content provision.

---

## 2) User Side

Users derive utility from either the AI channel or a web source.

Let `Q_k` denote the quality of web source `k`, `δ_W` the baseline preference for the web, and `ϕ` AI ability.

### Utility

For user `i`:

- **AI option**
  `U_{iA} = ln(Q_A) + ε_{iA}`

- **Web source k**
  `U_{ik} = ln(δ_W) + ln(Q_k) + ε_{ik}`

where the taste shocks follow a GEV structure:
`ε_i ~ GEV(θ)`.

Users choose the source that maximizes utility.

### AI aggregation technology

AI aggregates content from the web according to:

`Q_A = ϕ (Σ_k Q_k^(1/θ))^θ`

This means AI quality improves with:
- stronger AI ability `ϕ`,
- and better/more abundant underlying web content.

---

## 3) Demand Shares

The model yields closed-form demand shares.

### Share going to AI
` s_A = ϕ / (δ_W + ϕ) `

- Increases with AI ability `ϕ`
- Decreases with web preference `δ_W`

### Share going to the Web
` s_W = δ_W / (δ_W + ϕ) `

- Decreases with AI ability `ϕ`
- Increases with web preference `δ_W`

### Share of web traffic to provider k (conditional on using the Web)
` s_{k|W} = Q_k^(1/θ) / Σ_j Q_j^(1/θ) `

So higher-quality web sources attract a larger share of web users.

---

## 4) Provider Side (Entry / Content Supply)

Providers differ in quality and decide whether to produce.

### Heterogeneity
Each provider draws quality from a Pareto distribution:
`Q_k ~ Pareto(γ)`.

### Profits
Provider `k` earns:

`π_k = r s_k - F(1 - η)`

where:
- `r` = revenue per unit of user share,
- `s_k` = user share obtained by provider `k`,
- `F` = fixed cost of production,
- `η` = cost reduction from AI (higher `η` means lower costs).

The provider produces iff:
`π_k ≥ 0`.

### Entry cutoff

There is a quality threshold `Q_0` such that providers enter only if their quality is high enough. The cutoff satisfies the zero-profit condition:

`r s(Q_0) - F(1 - η) = 0`.

From the presentation, the implied cutoff is:

`Q_0 = [ (F m γ) / (r(γ - 1/θ)) * (1 - η) * ((δ_W + ϕ) / δ_W) ]^(1/γ)`

Comparative statics:
- `Q_0` **decreases** with `η` (lower costs make entry easier)
- `Q_0` **increases** with `ϕ` (AI steals traffic, making entry harder)

### Active content supply

The mass/share of active providers is:

`m_A = Q_0^(-γ)`

So:
- `m_A` **increases** with cost reduction (`η`)
- `m_A` **decreases** with AI demand diversion (`ϕ`)

This captures the central supply-side tradeoff:
- AI can **help** providers via lower costs,
- but AI can also **hurt** providers by taking users away from the web.

---

## 5) Consumed Quality

The object of interest is the quality actually consumed by users:

`Q^e = s_A Q_A + s_W Σ_{k∈A} s_{k|W} Q_k`

This is a weighted average of:
- quality consumed through AI,
- and quality consumed through direct web browsing.

Because both demand shares and provider entry respond to AI, the net effect of GenAI on consumed quality is generally **ambiguous**.

---

## Main Mechanisms and Economic Intuition

The model highlights two opposing forces:

## Force 1: AI improves aggregation (quality-enhancing)
- Higher `ϕ` makes AI a better aggregator.
- Users may receive higher-quality information through the AI channel.
- This tends to increase consumed quality on the AI side.

## Force 2: AI cannibalizes web traffic (supply-reducing)
- As `ϕ` rises, a larger share of users chooses AI instead of the web.
- Web providers lose traffic and revenue.
- Some providers stop producing content, reducing the supply of original information.

## Force 3: AI reduces costs for providers (supply-enhancing)
- Higher `η` lowers fixed production costs.
- More providers can profitably enter.
- This supports information supply and can improve the quality of content available for both the web and AI to use.

The key result is that GenAI is not unambiguously good or bad: its effect depends on the balance between **demand diversion** and **cost reduction**.

---

## What the Model Predicts

<iframe
  src="/research/genaiandinternet/plot.html"
  width="120%"
  height="620"
  style="border: none; border-radius: 8px;"
></iframe>
The presentation emphasizes the following qualitative predictions:

- **Higher AI ability (`ϕ`)**
  - increases AI usage (`s_A`)
  - decreases direct web usage (`s_W`)
  - tends to reduce incentives for web content production
  - may improve AI-side quality aggregation

- **Higher cost reduction (`η`)**
  - lowers entry costs
  - increases active web content supply
  - can offset part of the demand-diversion effect from AI

This creates regions where:
- GenAI **reduces** information supply and lowers quality,
- but also regions where cost reductions are strong enough that GenAI can **improve** outcomes.

---

## Current Scope and Next Steps

This presentation is a first theoretical step in a larger project.

### Current stage
- A simple, tractable equilibrium model of:
  - user choice,
  - provider entry,
  - and AI aggregation.

### Next stage
- Bring data to the model
- Calibrate / estimate key parameters
- Evaluate whether observed changes in web content and user behavior align with the model’s predictions

---

## Conclusion

This project provides a clean framework for thinking about how GenAI changes the internet economy.

The core insight is a **general equilibrium tradeoff**:

- GenAI can improve information access by aggregating content more effectively,
- but it can also weaken the underlying incentive to produce original content online.

Whether GenAI ultimately improves or degrades the online information environment depends on:
- how strong AI is as a substitute for the web (`ϕ`),
- how much it lowers content production costs (`η`),
- and how users value direct web browsing (`δ_W`).

---
