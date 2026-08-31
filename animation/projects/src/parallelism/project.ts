import { makeProject } from '@motion-canvas/core';

import '../../global.css';

import processVsThreads from './scenes/process_vs_threads?scene';
import code from './scenes/code?scene';
import whyNotOthers from './scenes/why_not_others?scene';
import threadPool from './scenes/thread_pool?scene';
import conditionVariable from './scenes/condition_variable?scene';

export default makeProject({
    scenes: [processVsThreads, code, whyNotOthers, threadPool, conditionVariable],
});

