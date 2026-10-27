// Slide order. Each slide module exports { id, title, render(el) }.
// render() builds the slide's DOM inside `el` and may return a cleanup function.
// The agreed copy for each slide is recorded in content/slides.md.
import title from './title.js';
import problem from './problem.js';
import context from './context.js';
import proposal from './proposal.js';
import metrics from './metrics.js';
import prototype from './prototype.js';
import milestones from './milestones.js';
import risks from './risks.js';
import aiUsage from './ai-usage.js';

export const slides = [title, context, problem, proposal, metrics, prototype, milestones, risks, aiUsage];
