# From weather profile to yield loss: introducing EpiExposure

In my previous post, I described how distributed lag nonlinear models (DLNMs) helped us understand *when* weather matters for soybean target spot. The results were exciting. The road to get there was not.

Fitting the model was only one step. Before it, I had to align daily weather with each epidemic, choose reference conditions and build cross-bases. After it, I had to translate the surface into interpretable numbers, propagate uncertainty, simulate scenarios and validate predictions without leaking information between epidemics. Each step lived in its own script.

So we turned that workflow into a tool. Meet **EpiExposure**, an open-source R package for exposure–lag–response analysis in plant disease epidemiology.

![EpiExposure](assets/blog/capa.png)

## Why another package?

Excellent DLNM software already exists. The `dlnm` package provides the statistical foundation, and `bdlnm` extends it to Bayesian inference. **EpiExposure does not replace them** and does not introduce a new estimator.

Its contribution is integration. Methods developed mainly for human health had to be adapted, one script at a time, to the structure and questions of plant disease studies. EpiExposure connects exposure definition, model fitting, interpretation, uncertainty, simulation, validation and loss estimation in **one reproducible workflow**. Every downstream step reuses the exact specification that was fitted, so a prediction or simulation can never silently drift away from the model.

![The EpiExposure workflow](assets/blog/epiexposure/fig1-workflow.jpg)
*The EpiExposure workflow, from data and exposure setup to model fitting, interpretation, simulation and decision-oriented outputs.*

## Getting started

EpiExposure is available on CRAN:

```r
install.packages("EpiExposure")
library(EpiExposure)
```

The data structure is simple. Each row is one time step within one epidemic, with four ingredients:

- `epi_id`: identifies each epidemic, for example a site–season
- `time`: orders the days from the start of the profile to the disease assessment
- **exposures:** one or more drivers, such as temperature, rain or leaf wetness
- `y`: the disease outcome, measured once per epidemic

Exposures don't have to be weather. Any variable measured repeatedly before assessment works, including physiological, biochemical or chemical measurements.

To show what the package can do, we used `epi_data`, a simulated dataset included in the package: **520 epidemics** of a hypothetical foliar disease, each with **86 daily observations** of mean temperature, rainfall and leaf wetness. The examples below come from it. They are illustrations, not biological recommendations.

## Six questions EpiExposure helps answer

### 1. When do conditions matter?

`summarise_effects(scale = "lag")` evaluates every combination of exposure value and lag relative to a reference profile. It shows not only *whether* a variable matters, but *when*.

![Lag-specific associations](assets/blog/epiexposure/fig2-lag-surfaces.jpg)
*Lag-specific associations (top) and changes in expected severity (bottom) for temperature, rainfall and leaf wetness across the 85 days before assessment.*

### 2. How do daily effects add up across crop stages?

Daily resolution can be more detail than biology needs. `define_periods()` groups lags into meaningful intervals, such as growth stages or pathogen processes. `summarise_effects(scale = "period")` accumulates the effects within each one, and `compare_periods()` contrasts them. All of this happens without fitting separate window models.

### 3. How does a whole season become one signal?

The package introduces the **Exposure Cumulative Impact (ECI)**. It compares a complete observed or simulated profile with a reference, weighted by the fitted model. Unlike a raw total, the ECI accounts for both *what* happened and *when*. `compute_eci()` gives the overall value, and `compute_ecilag()` breaks it down **exactly**, day by day.

![Exposure Cumulative Impact](assets/blog/epiexposure/fig4-eci.jpg)
*(a) ECI versus predicted severity, (b) the exact lag-by-lag decomposition of the ECI, and (c) how each profile differed from the reference.*

### 4. What if it rained earlier or later?

`simulate_exposures()` and `predict_outcomes()` let you build "what-if" profiles. In the example, two seasons had identical temperature and leaf wetness and the **same amount of rain**. The only difference was *when* the 15 mm daily rain fell: early (lags 45–85) or late (lags 0–45).

![Rainfall timing scenarios](assets/blog/epiexposure/fig5-rain-timing.jpg)
*Same rain, different timing, different epidemic. Panels d and h show the distributions of predicted severity for the two scenarios.*

Same rain, different timing, very different predicted epidemics.

### 5. What does it mean for yield and profit?

Disease predictions matter most when they connect to decisions. `simulate_scenarios()` explores combinations of conditions, and `simulate_losses()` turns predicted disease into **yield and economic losses**. It uses a disease–yield relationship, attainable yield and crop price that you supply.

![Yield and economic losses](assets/blog/epiexposure/fig8-losses.jpg)
*Potential yield loss (kg/ha) and economic loss (USD/ha) across attainable yields (4,000–12,000 kg/ha) under contrasting environmental scenarios, at 300 USD/t.*

The same disease level can cost much more in a high-yield system. These estimates are conditional on your assumptions, which is exactly why the package keeps those assumptions explicit.

### 6. Will the model work on new epidemics?

Fitting well is not the same as predicting well. `find_bestfit()` compares candidate models with **grouped cross-validation**, which keeps each epidemic entirely in either training or validation, so information never leaks. In the example, we compared **63 candidate specifications**. `ensemble_bestfit()` then combines the strongest candidates.

![Ensemble performance](assets/blog/epiexposure/fig10-ensembles.jpg)
*Out-of-fold agreement for unweighted, performance-weighted and stacked ensembles (a), and candidate-model performance (b).*

Out-of-fold concordance (CCC) rose from **0.65** for the unweighted ensemble to **0.84** with performance weighting and **0.98** with stacking. That result is specific to this simulated dataset, but it shows the value of judging models on epidemics they have never seen.

## Flexible by design

EpiExposure supports beta, binomial, negative binomial, Poisson, Gaussian and gamma responses. It can fit models with GLM, GLMM, GAM, GAMM, GLS, spaMM, brms and INLA engines, so you can choose a frequentist or a Bayesian approach.

## What EpiExposure contributes to plant disease epidemiology

- 🧭 **The complete exposure history becomes the unit of analysis.** No more arbitrary windows that split or dilute the signal.
- 🔁 **Reproducibility:** lag horizons, reference conditions, periods and validation units are recorded and reused, so results can be reconstructed, challenged and compared across studies.
- 🎯 **Honest uncertainty:** joint parameter draws carry uncertainty through every estimate, comparison and prediction.
- 🌾 **From epidemiology to decisions:** the workflow goes all the way from weather to disease, and from disease to yield and dollars.
- 🤝 **Accessibility:** advanced exposure–lag methods become usable by researchers without heavy programming experience.

## A word of caution

EpiExposure organizes **conditional associations**, not causal effects. Simulations are for generating hypotheses and planning studies, not for direct management recommendations. Internal validation does not replace testing in new locations, seasons and cultivars. Biological reasoning still comes first.

## Try it and tell us what you think

- 📦 **CRAN:** [cran.r-project.org/package=EpiExposure](https://cran.r-project.org/web/packages/EpiExposure/index.html)
- 📚 **Documentation:** [tomazrg.github.io/EpiExposure](https://tomazrg.github.io/EpiExposure/)
- 🐞 **Issues and suggestions:** [github.com/tomazrg/EpiExposure/issues](https://github.com/tomazrg/EpiExposure/issues)
- 💻 **Code for the preprint:** [tomazrg.github.io/paper_EpiExposure_package](https://tomazrg.github.io/paper_EpiExposure_package/)

*Preprint: Tomáz, R. G., Del Ponte, E. M., and Dalla Lana, F. EpiExposure: An R Package for Exposure-Lag-Response Analysis in Plant Disease Epidemiology.*

EpiExposure is an open-source project, and it will grow with the community. If you work with plant disease and weather, or any exposure measured over time, I would love to see what you build with it. 🌱
