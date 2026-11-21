# Weather doesn't strike once: what distributed lag models reveal about soybean target spot

When we rate a soybean field at R6, we see a single number: disease severity. But that number carries a memory. It reflects the heat of a week in early December, the rain that fell a month before assessment, and how dry the air was while the first lesions were forming.

In plant disease epidemiology, we usually compress that memory into **weather windows**: the mean temperature over 30 days, total rainfall in a growth stage, and so on. In our new paper in *Phytopathology*, we tried something different. We borrowed a method from environmental health research, the **distributed lag nonlinear model (DLNM)**, and used it to ask a better question:

> Not only *how much* weather, but *when* that weather mattered.

## The problem with weather windows

Windows are intuitive, but they make two strong assumptions before the data are even analyzed. First, the boundaries of the window are fixed in advance. Second, every day inside a window counts the same.

![Window averages versus a distributed lag approach](assets/blog/dlnm-target-spot/concept-windows-vs-dlnm.jpg)
*Illustrative example. Left: two windows with almost identical average temperatures hide very different weather histories. Right: a DLNM gives each day its own contribution, depending on how extreme it was and when it happened.*

Two seasons can share the same 40-day average temperature and still produce very different epidemics. The average simply hides *when* the hot days came. If the biologically important signal falls across the border of two windows, it can be split and diluted.

## DLNM in one paragraph

A DLNM describes the association between an exposure (for example, maximum temperature) and an outcome (disease severity) in **two dimensions at once**:

- **Exposure dimension:** how the response changes with the *magnitude* of the weather variable. This allows thresholds, plateaus and optimum curves, which are common in plant–pathogen interactions.
- **Lag dimension:** how that association is distributed *over time* before the assessment. This allows delayed, cumulative or stage-specific effects.

Both dimensions are combined in a *cross-basis* built from splines. DLNMs are widely used to study how heat waves or air pollution affect hospital admissions and mortality days later. As far as we know, they had not yet been applied to plant disease epidemics, even though weather almost never acts on disease instantaneously.

## Our case study: target spot of soybean

Target spot, caused by *Corynespora cassiicola*, has become a major foliar disease of soybean in Brazil. The pathogen survives on crop residue, infects more than 530 plant species, and has developed resistance to multiple fungicide classes in some regions. Even so, we still knew little about how weather shapes field epidemics across the season.

We used data from the **nontreated plots of 254 trials**, conducted across **nine Brazilian states** over **13 growing seasons** (2012/13 to 2024/25). For each epidemic, we built a daily weather history from planting to the R6 assessment (about 85 days), using ERA5 reanalysis. We focused on three variables:

- **TMAX:** maximum air temperature (°C)
- **RAIN:** accumulated precipitation (mm)
- **VPD:** vapor pressure deficit (kPa), a measure of how "thirsty" the air is

We then split the season into two epidemiologically meaningful phases: an **earlier phase** (41 to 85 days before assessment), linked to epidemic onset, and a **later phase** (0 to 40 days), linked to epidemic development.

![Conceptual modeling framework](assets/blog/dlnm-target-spot/fig1-framework.jpg)
*The modeling framework: daily weather and final severity (left) feed DLNM cross-bases (center), which enter a beta mixed model with season as a random effect (right). Reproduced from Tomáz et al. (2026), Phytopathology. © The American Phytopathological Society.*

## What the weather told us

The cumulative relative risks revealed that **the same variable can push disease in opposite directions depending on when it occurs**.

![Cumulative relative risk by phase](assets/blog/dlnm-target-spot/fig2-cumulative-risk.jpg)
*Cumulative relative risk for TMAX, RAIN and VPD in the earlier (41–85 days) and later (0–40 days) phases. Reproduced from Tomáz et al. (2026), Phytopathology. © The American Phytopathological Society.*

- 🌡️ **Temperature:** severity above 60% was associated with maximum temperatures above about **30 °C** in both phases. In the earlier phase, risk peaked near 32 °C and then declined. In the later phase, it kept increasing.
- 🌧️ **Rain:** late-season rainfall had a strong cumulative effect. Severity above **70%** was typical when the total exceeded about **300 mm**. In the earlier phase, moderate rain raised risk, but very high amounts *reduced* it.
- 💨 **VPD:** the most striking reversal. A drier atmosphere (higher VPD) early in the season was linked to *lower* severity, while values above about **1.3 kPa** in the later phase were linked to *higher* severity.

## Looking day by day

The exposure–lag–response surfaces show the full picture: each cell is one combination of weather intensity and timing.

![Exposure–lag–response surfaces](assets/blog/dlnm-target-spot/fig3-lag-surfaces.jpg)
*Daily exposure–lag responses for TMAX, RAIN and VPD, from sowing (lag 85) to assessment (lag 0). Red indicates higher relative risk. Reproduced from Tomáz et al. (2026), Phytopathology. © The American Phytopathological Society.*

Temperatures above 29 °C were most influential between roughly 10 and 40 days before assessment. Rainfall effects concentrated in the early epidemic period. Isolated days rarely mattered much on their own. **It is the accumulation and the timing that shape the epidemic.**

## Timing beats totals

To test this idea, we simulated complete weather scenarios, combining high (H, 350 mm) or low (L, 150 mm) rainfall in the earlier and later phases, under medium or high VPD.

![Severity under contrasting weather scenarios](assets/blog/dlnm-target-spot/fig5-scenarios.jpg)
*Expected target spot severity across temperature under four rainfall scenarios (earlier/later phase) and two VPD levels. Reproduced from Tomáz et al. (2026), Phytopathology. © The American Phytopathological Society.*

The contrast is clear. **A dry start followed by a wet finish (LH)** produced the most severe epidemics, exceeding **80%** severity under high VPD. **A wet start followed by a dry finish (HL)** kept severity low across the whole temperature range. Seasonal totals alone could never separate these two situations.

## Where, and when, to plant

Finally, we projected the fitted model onto 20 seasons of gridded climate data (2005/06 to 2024/25) to map climatic favorability under three planting dates.

![Historical climatic favorability maps](assets/blog/dlnm-target-spot/fig6-maps.jpg)
*Mean relative risk (top) and its interannual variability (bottom) for early, intermediate and late planting across central Brazil. Reproduced from Tomáz et al. (2026), Phytopathology. © The American Phytopathological Society.*

**Delayed planting consistently reduced favorability** along a northwest–southeast axis across central Brazil. This axis matches the South Atlantic Convergence Zone, a band of clouds and persistent rain that brings milder temperatures to the region in summer. Early planting exposed the crop to warmer, drier conditions and to greater year-to-year uncertainty.

This is not a simple recommendation, though. Double cropping limits planting flexibility, and later planting can increase the risk of soybean rust. The goal is to make these trade-offs visible, not to settle them with a single map.

## Keep in mind

These are model-based **associations**, not causal effects. The model was evaluated on the same dataset used to fit it, so independent validation in new locations, seasons and cultivars is the next step. Weather came from ERA5 reanalysis rather than from inside the canopy, and leaf wetness was not available, despite its known importance for *C. cassiicola*.

## Takeaways

1. **Weather effects are delayed and nonlinear.** A single number per season hides most of the story.
2. **The same variable can switch direction between phases.** Rain and VPD reduced risk early but increased it late.
3. **Timing beats totals.** A dry start with a wet finish was the riskiest combination.
4. **DLNMs transfer well from human to plant epidemiology** and open the door to more realistic, timing-aware forecasting models.

## Read more

- 📄 **Paper:** Tomáz, R. G., Dalla Lana, F., Godoy, C. V., and Del Ponte, E. M. (2026). Exposure–lag responses of soybean target spot to climatic proxies: a distributed lag nonlinear modeling approach. *Phytopathology*. [doi.org/10.1094/PHYTO-06-26-0185-R](https://doi.org/10.1094/PHYTO-06-26-0185-R)
- 💻 **Data and R code:** [tomazrg.github.io/paper_TS_weather](https://tomazrg.github.io/paper_TS_weather)

Building this analysis required a lot of custom code. That experience became the starting point for **EpiExposure**, an R package that turns the whole workflow into a few reproducible steps. More on that in the next post!
