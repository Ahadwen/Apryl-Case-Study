// Slide order. Each slide module exports { id, title, render(el) }.
// render() builds the slide's DOM inside `el` and may return a cleanup function.
import title from './title.js';
import hypothesis from './hypothesis.js';
import research from './research.js';
import metrics from './metrics.js';
import proposal from './proposal.js';
import prototype from './prototype.js';
import milestones from './milestones.js';
import risks from './risks.js';
import aiUsage from './ai-usage.js';

export const slides = [title, hypothesis, research, metrics, proposal, prototype, milestones, risks, aiUsage];
