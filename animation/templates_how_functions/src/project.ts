import {makeProject} from '@motion-canvas/core';

import template_print from './scenes/template_print?scene';
import three_types from './scenes/three_types?scene';
import mixing_params from './scenes/mixing_params?scene';

import './global.css'; // <- import the css

export default makeProject({
  scenes: [template_print],
});
