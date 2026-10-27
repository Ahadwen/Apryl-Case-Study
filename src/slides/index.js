// Slide order. Each slide module exports { id, title, render(el) }.
// render() builds the slide's DOM inside `el` and may return a cleanup function.
// The agreed copy for each slide is recorded in content/slides.md.
import title from './title.js';
import context from './context.js';
import metrics from './metrics.js';
import assumptions from './assumptions.js';
import explore from './explore.js';
import investigation from './investigation.js';
import prototype from './prototype.js';
import nextSteps from './next-steps.js';
import risks from './risks.js';
import aiUsage from './ai-usage.js';

export const slides = [title, context, metrics, assumptions, explore, investigation, prototype, nextSteps, risks, aiUsage];
