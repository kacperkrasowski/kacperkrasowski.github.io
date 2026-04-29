---
title: "GenAI and the Internet"
description: "A simple model of how Generative AI changes online content supply and consumed quality through user choice and provider entry."
paper_status: "working"
paper_year: 2026
authors:
  - "Kacper Krasowski"
slug: "genaiandinternet"

tags: ["research", "genai", "internet economics", "platforms", "information supply"]
categories: ["Research"]
pdf:    "/research/genaiandinternet/genaiandinternet_writeup.pdf"
slides: "/research/genaiandinternet/genaiandinternet_slides.pdf"

hideMeta: true
weight: 3
showtoc: false
---

## Overview

This project studies how **Generative AI reshapes the internet as an information ecosystem**, focusing on both the **supply of online content** and the **quality of information users consume**.

I develop a simple equilibrium model in which:
- users choose between **traditional web sources and AI**,  
- content creators decide whether to **enter and produce information**,  
- and AI both **aggregates existing knowledge** and **changes production costs**.

The key insight is that GenAI introduces **two opposing forces**:
- it **improves information access** by aggregating dispersed content,
- but it also **diverts attention away from the web**, weakening incentives to produce that content.

As a result, the effect of GenAI is **non-monotonic**:  
> When AI is weak, it can reduce both content supply and consumed quality; when sufficiently strong, the same forces can reverse and improve outcomes.

---

## Introduction

The central question is:

> **How does Generative AI affect the supply and quality of online information?**

The internet is now a core infrastructure for learning, decision-making, and knowledge production. Changes in how information is produced and accessed have direct implications for productivity, innovation, and welfare.

The project frames this as a **general equilibrium interaction** between three actors:

- **Users (demand side)** choose how to access information: via the web or via AI.
- **Content creators (supply side)** decide whether to produce based on expected traffic and costs.
- **Generative AI** acts both as:
  - a **competing information source**, and  
  - a **technology that lowers production costs**.

This dual role is central: AI simultaneously substitutes for the web and reshapes the economics of content creation.

---

## Methodology

### The Internet as an Equilibrium System

The model treats the internet as a **market for attention and information**:

- Users allocate attention across sources.
- Creators supply content if it is profitable.
- AI both competes for attention and depends on the content it aggregates.

This creates a feedback loop:
- AI relies on web content,
- but also weakens incentives to produce it.

---

### Demand: Choosing Between AI and the Web

Users choose between:
- **AI**, which provides a single aggregated answer,
- and the **web**, which consists of many heterogeneous sources.

As AI improves, it captures a larger share of user attention. This is the **business-stealing channel**: AI diverts traffic away from traditional sources.

---

### Supply: Content Creation

Content creators differ in quality and decide whether to enter based on:
- expected user traffic,
- and fixed production costs.

GenAI affects entry through two channels:
- **Negative:** less web traffic reduces revenues  
- **Positive:** lower production costs make entry easier  

The net effect on content supply depends on which force dominates.

---

### AI as an Aggregator

AI aggregates information from the web rather than producing it independently.

Its quality depends on:
- its own capability,
- and the **amount and quality of available web content**.

This implies that AI performance is endogenous to the health of the information ecosystem it relies on.

---

## Core Mechanism

The model highlights three forces:

### 1. Aggregation Effect (positive)
- AI improves how information is synthesized.
- Users may receive higher-quality answers.

### 2. Business-Stealing Effect (negative)
- AI diverts users away from the web.
- Lower traffic reduces incentives to create content.

### 3. Cost-Reduction Effect (positive)
- AI lowers production costs.
- More creators can profitably enter.

---

## Main Result: A Threshold Effect

The effect of GenAI is **not monotonic**:

- **When AI is weak:**
  - Users shift away from the web,
  - Cost reductions are limited,
  - → **Content supply and consumed quality decline**

- **When AI is sufficiently effective:**
  - Aggregation becomes strong,
  - Cost reductions support entry,
  - → **Content supply and quality increase**

GenAI can therefore initially degrade the information environment, but improve it once it becomes sufficiently capable.

---

## What the Model Predicts

<iframe
  src="/research/genaiandinternet/plot.html"
  width="120%"
  height="620"
  style="border: none; border-radius: 8px;"
></iframe>

Key predictions:

- **Higher AI capability**
  - increases AI usage,
  - reduces direct web traffic,
  - weakens incentives to produce content,
  - but improves aggregation quality.

- **Stronger cost reductions**
  - increase entry,
  - expand the stock of information,
  - offset part of the demand-diversion effect.

These forces generate regions where GenAI:
- reduces information supply and quality,
- or improves both.

---

## Current Scope and Next Steps

### Current stage
- A tractable equilibrium model of:
  - user choice,
  - content supply,
  - and AI aggregation.

### Next steps
- Bring the model to data
- Estimate key parameters
- Quantify the importance of:
  - demand diversion vs. cost reduction

---

## Conclusion

This project provides a framework for thinking about **GenAI as a general equilibrium shock to the internet**.

The core tradeoff is:

- AI **improves access to information**,  
- but may **undermine incentives to produce it**.

Whether GenAI improves or degrades the information environment depends on:
- how strongly it substitutes for the web,
- how much it lowers production costs,
- and how effective it is at aggregating knowledge.

> The future quality of information online depends not only on AI itself, but on whether the ecosystem it relies on continues to exist.