---
title: "Impact of Censorship in Social Media"
description: "A model of censorship in social networks using Friedkin–Johnsen opinion dynamics, with implications for polarization, disagreement, and welfare."
paper_status: "working"   # working | published
paper_year: 2024
authors:
  - "Kacper Krasowski"
slug: "censorship"
tags: ["research", "social media", "opinion dynamics", "censorship", "polarization"]
# buttons
pdf: "/research/impact/impact_writeup.pdf"
slides: "/research/social/social_slides.pdf"
showToc: false
# optional
hideMeta: true
weight: 2
---

## Overview

This paper studies how censorship on social media affects **polarization**, **disagreement**, and **internal conflict** using a formal opinion dynamics model. The central result is a trade-off: stronger censorship tends to **increase polarization** but **reduce internal conflict**, while the effect on disagreement depends on how connected the network is and how much cross-group communication exists.

---

## Introduction

Social media platforms increasingly shape real-world opinion formation, but governance and regulation remain limited. This creates an important policy question: **what are the welfare effects of censorship on social media?** In particular:

- Does censorship reduce harmful conflict, or does it deepen polarization?
- Is there an **optimal level of censorship**?
- Does the answer depend on **homophily** (whether people mostly talk to like-minded users versus across groups)?

The paper approaches these questions through a stylized opinion dynamics framework with two opposing groups, where a platform/network administrator chooses a censorship threshold before opinions evolve.

---

## Related Literature (Brief)

The paper connects three strands of literature:

1. **Opinion dynamics**, especially models like DeGroot, bounded confidence, and Friedkin–Johnsen.
2. **Freedom of speech and moderation in social media**, including concerns about arbitrary censorship and platform control over information flow.
3. **Social media and welfare**, where much of the empirical literature focuses on well-being and life satisfaction rather than formal network-level opinion dynamics.

A key contribution here is to provide a **quantitative framework** for studying censorship as a policy variable in a social network.

---

## Methodology

## 1) Network structure

The model assumes a network of `n` agents split into two equally sized groups with opposing viewpoints (think of them as two ideological camps).

- Opinions lie on a continuous interval `[-1, 1]`
- Left-group innate opinions are distributed on `[-1, 0]`
- Right-group innate opinions are distributed on `[0, 1]`
- The two distributions are symmetric around zero

Communication intensity is parameterized by:

- `p`: within-group communication intensity
- `q`: across-group communication intensity

This allows the paper to study both **high-homophily** and **low-homophily** environments.

---
## 2) Opinion dynamics (Friedkin–Johnsen)

Each agent starts with an **innate opinion** and updates over time by combining:

- their own innate view (stubbornness),
- and the opinions of their neighbors (weighted by communication intensity).

Opinions evolve until they reach an equilibrium.

---

## 3) Censorship as a threshold rule

Censorship is modeled as a **threshold policy** chosen by a network administrator.

- Let `c ∈ [0,1]` be the censor point.
- Agents with opinions outside `[-c, c]` are **banned**.
- Banned agents keep their current opinion and stop participating in further opinion formation.

Important convention in the paper:

- **Smaller `c` = stronger censorship** (because fewer opinions are allowed)

---

## 4) Welfare measures

The paper evaluates censorship using three equilibrium outcomes:

### Polarization
Measures dispersion of opinions (variance-like concept).

### Disagreement
Measures how far apart connected agents are in equilibrium (weighted by network ties).

### Internal Conflict
Measures how far each agent’s equilibrium opinion moves from their innate opinion.

Finally, welfare is defined as a weighted negative sum of these three costs:

- higher polarization = worse
- higher disagreement = worse
- higher internal conflict = worse

So welfare depends on policy weights over the three indices.

---

## Main Results

## General case

The paper derives analytical and numerical results for the expected effects of censorship.

### 1) More censorship increases polarization
As censorship becomes stronger, extreme users are removed from interaction, so they stop updating and remain at more extreme opinions. This raises equilibrium polarization.

### 2) More censorship reduces internal conflict
When fewer people interact, opinions move less from their original values, so internal conflict declines.

### 3) Disagreement is non-monotonic
The effect on disagreement depends on network size and connectivity:

- In smaller / weakly connected networks, disagreement tends to decrease with censorship
- In larger / highly connected networks, disagreement may **initially increase** and only later decline

This is one of the paper’s most interesting findings: censorship can simultaneously reduce communication while increasing distance between surviving opinions in some parameter regions.

---

## Welfare and Optimal Censorship

Because censorship affects polarization, disagreement, and internal conflict differently, the welfare effect is not one-directional.

The paper shows that depending on:

- network connectivity (`p`, `q`, `n`)
- and welfare weights (how much the administrator cares about polarization vs disagreement vs internal conflict)

the optimal policy may be:

- **no censorship**
- **partial censorship**
- **near-total / total censorship**

In other words, there is no single universal moderation rule — the “best” censorship level is parameter-dependent.

---

## Role of Homophily

A major contribution of the paper is showing how censorship effects change with network homophily.

## Extremely high homophily (`q = 0`)
Agents only communicate within their own group.

- Censorship has a **smaller effect overall**
- Opinions are already evolving mostly inside echo chambers
- Removing cross-group interaction does not change much (because it was already absent)

## Extremely low homophily (`q = p`)
Agents communicate across groups as much as within groups.

- Censorship has a **stronger effect**
- Cross-group communication normally helps pull opinions closer together
- Censorship shuts down that mixing, so the welfare and disagreement effects become more pronounced

A key takeaway is that censorship matters more in networks where **cross-group exchange is active**.

---

## Interpretation

This framework highlights why moderation policy is hard:

- Censorship can reduce conflict-like outcomes (especially internal conflict, sometimes disagreement)
- But it can also entrench ideological distance and increase polarization

So moderation is not just a “more vs less” question — it is a **design problem** shaped by:

- network structure,
- communication patterns,
- and the platform’s objective function.

---

## Limitations and Future Work

The paper explicitly notes that the model takes the perspective of a welfare-oriented network administrator. A natural extension is to model a **profit-maximizing platform** instead, where moderation policy also depends on:

- enforcement costs,
- engagement,
- user retention,
- and platform incentives.

Another important next step is empirical calibration using real-world social media data (e.g., Twitter/X or Reddit) to estimate network and opinion parameters.

---

## Citation

Krasowski, Kacper. *Impact of Censorship in Social Media*.