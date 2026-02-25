---
title: "Social Media and Labor Market outcomes. An analysis of Facebook effect on college graduates earnings"
description: "Quasi-experimental evidence on the effect of Facebook exposure during college on graduates’ earnings."
paper_status: "working"   # working | published
paper_year: 2025
authors:
  - name: "Kacper Krasowski"
  - name: "Luca Marcianò"
    url: "https://sites.google.com/view/lucamarciano/home-page"
slug: "social"
tags: ["research", "social media", "facebook", "labor economics", "difference-in-differences"]
categories: ["Research"]
weight: 1
# buttons
pdf: "/research/social/social_writeup.pdf"
slides: "/research/social/social_slides.pdf"

# optional
hideMeta: true
showToc: false
---

## Overview

This paper studies the causal impact of social media exposure during college on later earnings, using the staggered introduction of Facebook across U.S. universities as a natural experiment. The main finding is that greater exposure to Facebook during undergraduate studies is associated with **lower wages after graduation**, with effects that are strongest early on and fade over time.

---

## Introduction

Social media changed how students communicate and spend time, but its effect on long-run labor market outcomes is still not fully understood. This paper asks a simple question:

**How did access to Facebook during college affect graduates’ earnings one, five, and ten years later?**

The paper exploits a key institutional fact: Facebook was rolled out across colleges at different times between 2004 and 2006, before becoming publicly available in 2006. This staggered expansion creates quasi-experimental variation in social media exposure during university years.

---

## Data

The analysis combines two data sources:

1. **Facebook college rollout dates** (from replication files used in prior work, based on archived data)
2. **PSEO (Post-Secondary Employment Outcomes) Earnings**, which reports aggregate earnings by institution, major, cohort, and percentile (25th, 50th, 75th), measured one, five, and ten years after graduation.

### Matched sample

After merging sources, the paper matches **111 universities** that received Facebook before it became public and that can be linked to PSEO data. The final analysis focuses on undergraduates, motivated by high Facebook take-up rates among that group in the early rollout period.

### Exposure measure

Because individual Facebook usage is not observed, the paper constructs an **institution-cohort exposure variable**:

- normalized from **0** (no exposure during undergraduate years)
- to **1** (full exposure during undergraduate years)

This variable measures the share of undergraduate years in which a cohort at a given institution had access to Facebook.

---

## Empirical Strategy

The core empirical design is a **difference-in-differences style specification** using quasi-experimental variation from staggered Facebook rollout.

The outcome is:

- `log(earnings)` at the 25th, 50th, and 75th percentiles,
- measured 1, 5, and 10 years after graduation.

The main regressor is the cohort-level Facebook exposure measure, with controls for:

- graduation cohort fixed effects,
- institution and major effects,
- and institution–major structure (as in the paper’s fixed-effects setup).

### Identification assumptions

The interpretation relies on:

1. **Stable selection** into institutions and majors across cohorts
2. **Parallel trends** in wages across treated and untreated institutions (within major), absent Facebook exposure

The baseline specification compares pre-treatment cohorts (2001–2003) to post-treatment cohorts (2007–2009), excluding the intermediate 2004–2006 cohorts because exposure is harder to assign cleanly in those grouped data.

---

## Main Results

The paper finds a **negative and persistent** effect of Facebook exposure on wages.

### 1 year after graduation

Full undergraduate exposure to Facebook is associated with wage declines of roughly:

- **-3.7%** at the 25th percentile
- **-3.9%** at the median
- **-3.6%** at the 75th percentile

### 5 years after graduation

The negative effect remains but is smaller (around **-1.1%** at the median).

### 10 years after graduation

The effect is close to zero and no longer statistically meaningful in the baseline estimates.

### Nonlinear exposure effect

The paper also estimates specifications with a quadratic exposure term. The positive coefficient on exposure-squared suggests that the negative wage effect grows more slowly at higher exposure levels (i.e., diminishing marginal harm). A possible interpretation is that the initial arrival of social media is more disruptive, while students later adapt their routines.

---

## Interpretation

The paper interprets the results through a simple **work–leisure framework**:

- Facebook increases time spent on social activity / distraction
- Students study less
- Academic performance (e.g., GPA) falls
- Lower academic performance weakens labor market bargaining power and reduces wages

This mechanism is not directly observed in the data, but it provides an intuitive explanation for the short- to medium-run earnings effects.

---

## Heterogeneity Analysis

The paper groups majors into:

- STEM
- Humanities
- Social Sciences
- Others

and estimates a triple-differences specification to test whether effects vary by field.

### Main takeaway

There is no single subgroup that cleanly drives the overall result, but the point estimates suggest:

- **Humanities** students may be the most affected
- **Social Sciences** appear less affected (in point-estimate terms)

However, standard errors overlap substantially, so subgroup differences should be interpreted cautiously.

---

## Placebo Tests and Sensitivity Analysis

The paper performs two robustness exercises.

### 1) Placebo cohort tests

It assigns “synthetic” Facebook exposure to cohorts that should not exhibit treatment variation (or where treatment timing should not matter) and re-runs the main specification.

Result: placebo estimates are generally null / insignificant, which supports the identification strategy and parallel-trends assumption.

### 2) Randomization inference

For the 1-year outcome, exposure is randomly reassigned across universities (10,000 times), and the regression is re-estimated.

Result: the observed estimates are far from the randomization distribution, suggesting the main effect is very unlikely to be due to chance.

---

## Limitations

The paper highlights several limitations:

1. **Three-cohort aggregation in PSEO**
   - This blurs treatment timing (especially for cohorts around 2009)
   - It weakens the precision of exposure assignment

2. **Limited control for the 2008 financial crisis**
   - Cohort fixed effects absorb only an average cohort shock
   - Residual differential effects may still bias estimates

These limitations suggest the estimates are informative but should be interpreted with appropriate caution.

---

## Conclusion

Using the staggered rollout of Facebook across U.S. colleges, this paper provides quasi-experimental evidence that social media exposure during college reduced post-graduation wages in the short run, with effects that persist for several years and largely fade by ten years after graduation.

The results are consistent with a distraction-based mechanism and suggest that digital technologies can have economically meaningful effects on human capital accumulation and early-career labor market outcomes.

---

