import {
  CodeModification,
} from '@motion-canvas/2d/lib/components/CodeBlock';

const store = (...args: [TemplateStringsArray, ...any]) => args;

function to_string([strings, ...values]: [TemplateStringsArray, ...any]): string {
  return strings.reduce((acc, str, i) => {
    const value = values[i] ?? '';
    return acc + str + value;
  }, '');
}

function append(
  template_1: TemplateStringsArray, args_1: string[],
  template_2: TemplateStringsArray, args_2: string[]): [TemplateStringsArray, ...string[]] {
  let new_template = Array.from<string>(template_1);
  let new_args: Array<string> = args_1;
  new_template[template_1.length - 1] += template_2[0]
  new_template = new_template.concat(template_2.slice(1))
  new_args = new_args.concat(args_2)
  return [new_template as unknown as TemplateStringsArray, ...new_args];
}

const isCodeModification = (code: any): code is CodeModification => (code as CodeModification).from !== undefined;

function simplify(
  args_in: [TemplateStringsArray, ...any]): [TemplateStringsArray, ...string[]] {
  const template = args_in[0]
  const args = args_in.slice(1)
  if (args.every((arg) => (typeof (arg) == "string") || isCodeModification(arg))) {
    return args_in
  }
  let new_template: Array<any> = [];
  let new_args: Array<any> = [];
  let concatenate = false;
  for (let i = 0; i <= args.length; i++) {
    if (concatenate) {
      concatenate = false;
      new_template[new_template.length - 1] += template[i];
    } else {
      new_template.push(template[i]);
    }
    if (i == args.length) { break; }
    if (typeof (args[i]) == "string" || isCodeModification(args[i])) {
      new_args.push(args[i])
      continue;
    }
    let simplified_arg = simplify(args[i]);
    let simplified_template = simplified_arg[0]
    let simplified_args = simplified_arg.slice(1)
    const appended = append(
      new_template as unknown as TemplateStringsArray,
      new_args,
      simplified_template,
      simplified_args as string[]);
    new_template = Array.from<string>(appended[0])
    new_args = appended.slice(1)
    concatenate = true;
  }
  return [new_template as unknown as TemplateStringsArray, ...new_args]
}

export {store, simplify, to_string};
