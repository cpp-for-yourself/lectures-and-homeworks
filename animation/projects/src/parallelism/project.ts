import { makeProject } from '@motion-canvas/core';

import '../../global.css';

import code from './scenes/code?scene';
import whyNotOthers from './scenes/why_not_others?scene';
import threadPool from './scenes/thread_pool?scene';

export default makeProject({
    scenes: [code, whyNotOthers, threadPool],
});
