// Slide order. Each slide module exports { id, title, render(el) }.
// render() builds the slide's DOM inside `el` and may return a cleanup function.
import title from './title.js';
import brief from './brief.js';
import prototype from './prototype.js';
import close from './close.js';

export const slides = [title, brief, prototype, close];
