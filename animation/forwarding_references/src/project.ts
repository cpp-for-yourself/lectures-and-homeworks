import { makeProject } from '@motion-canvas/core';
import { Code, LezerHighlighter } from '@motion-canvas/2d';
import { parser } from '@lezer/cpp';
import { tags } from '@lezer/highlight';
import { HighlightStyle } from '@codemirror/language';

const MyStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#569CD6' }, // VSCode Keyword color
  { tag: tags.controlKeyword, color: '#C586C0' }, // VSCode Control Keyword color
  { tag: tags.operatorKeyword, color: '#C586C0' }, // VSCode Control Keyword color
  { tag: tags.comment, color: 'gray' }, // VSCode Comment color
  { tag: tags.className, color: '#4EC9B0' }, // VSCode Class Name color
  { tag: tags.constant(tags.variableName), color: '#B5CEA8' }, // VSCode Constant color
  { tag: tags.function(tags.variableName), color: '#DCDCAA' }, // VSCode Function color
  { tag: tags.function(tags.propertyName), color: '#DCDCAA' }, // VSCode Function color
  // { tag: tags.propertyName, color: '#DCDCAA' }, // VSCode Function color
  { tag: tags.number, color: '#B5CEA8' }, // VSCode Number color
  { tag: tags.string, color: '#CE9178' }, // VSCode String color
  { tag: tags.typeName, color: '#4EC9B0' }, // VSCode Type Name color
  { tag: tags.squareBracket, color: '#C586C0' }, // VSCode Square Bracket color
  { tag: tags.bracket, color: '#C586C0' }, // VSCode Bracket color
  { tag: tags.brace, color: '#DDDD22' }, // VSCode Brace color
  { tag: tags.processingInstruction, color: '#C586C0' }, // VSCode Brace color
  { tag: tags.arithmeticOperator, color: '#D16969' }, // VSCode Arithmetic Operator color
]);

Code.defaultHighlighter = new LezerHighlighter(parser, MyStyle);

import './global.css';

import example from './scenes/example?scene';


export default makeProject({
  scenes: [example],
});
