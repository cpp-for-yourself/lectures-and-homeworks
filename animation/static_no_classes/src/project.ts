import {makeProject} from '@motion-canvas/core';

import static_vis from './scenes/static_vis?scene';

import './global.css'; // <- import the css

export default makeProject({
  scenes: [static_vis],
});
