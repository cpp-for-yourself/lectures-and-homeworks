import {makeProject} from '@motion-canvas/core';

import example from './scenes/example?scene';
import memory from './scenes/memory?scene';
import stealing from './scenes/stealing?scene';

export default makeProject({
  scenes: [memory, stealing, example],
});
