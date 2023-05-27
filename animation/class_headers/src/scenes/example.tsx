import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { Circle, Rect, Layout, Txt } from '@motion-canvas/2d/lib/components';
import { createRef } from '@motion-canvas/core/lib/utils';
import { waitFor, all, chain } from '@motion-canvas/core/lib/flow';
import { DEFAULT, createSignal } from '@motion-canvas/core/lib/signals';
import {
  CodeBlock,
  edit,
  insert,
  lines,
  word,
  remove,
  CodeModification,
} from '@motion-canvas/2d/lib/components/CodeBlock';

export default makeScene2D(function* (view) {
  const main_ref = createRef<Layout>();
  const filename_left_ref = createRef<CodeBlock>();
  const code_block_left_ref = createRef<CodeBlock>();
  const filename_right_ref = createRef<CodeBlock>();
  const code_block_right_ref = createRef<CodeBlock>();

  const grow_factor = createSignal(0.0);

  function CreateCodeBlock(reference: any, grow_int: number, color: any = "#242424") {
    return <Rect
      grow={grow_int}
      radius={4}
      fill={color}
      clip={true}
      marginLeft={20}
      marginBottom={20}
    >
      <CodeBlock
        layout={false}
        language="cpp"
        fontSize={48}
        ref={reference} />
    </Rect>;
  }

  function CreateColumn(filename: any, code: any, grow_factor: any) {
    return <Rect layout
      direction="column"
      grow={grow_factor}
      lineWidth={40}
      clip={true}
    >
      {filename}
      {code}
    </Rect>
  }

  const code_block_left = CreateCodeBlock(code_block_left_ref, 10);
  const filename_left = CreateCodeBlock(filename_left_ref, 1);
  const code_block_right = CreateCodeBlock(code_block_right_ref, 10);
  const filename_right = CreateCodeBlock(filename_right_ref, 1);

  const column_left = CreateColumn(filename_left, code_block_left, () => 1.0 - grow_factor());
  const column_right = CreateColumn(filename_right, code_block_right, () => grow_factor());

  view.add(
    <Layout layout width={1920} height={1080} ref={main_ref}>
      {column_left}
      {column_right}
    </Layout>
  );

  const duration = 1.5

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

  const answer_struct = `  struct Answer {
    float probability{};
    std::string text{};
  };\n\n`


  const data_struct_is_valid_impl = ` {
      return questions.size() == correct_answers.size();
    }
  `
  const data_struct = (
    { impl = `;` }: {
      impl?: any
    },
  ) => store`  struct Data {
    bool IsValid() const${impl}
    std::vector<std::string> questions{};
    std::vector<std::string> correct_answers{};
  };\n\n`

  const train_method_impl = ` {
    if (!data.IsValid()) { return; }
    IngestData(data);
  }`

  const train_method = (
    { impl = `;` }: {
      impl?: any
    },
  ) => store`\n  void Train(const Data &data)${impl}\n`

  const get_answer_impl = ` {
    if (smartness_ < 1) { return Answer{0.1, "I don't know"}; }
    if (smartness_ < 5) { return Answer{0.8, "Yes."}; }
    if (question.length() > 10) {
      return Answer{1.0, "You will regret this question..."};
    }
    return Answer{1.0, "Can't you ask anything more important?"};
  }`

  const get_answer_method_code = (
    { impl = `;` }: {
      impl?: any
    },
  ) => store`  Answer GetAnswer(const std::string &question) const${impl}\n`

  const ingest_data_impl = `\n  void IngestData(const Data &data) {
    // Definitely not the smartest way...
    smartness_ += data.correct_answers.size();
  }\n`

  const private_part = (
    { ingest_data = `` }: {
      ingest_data?: any
    },
  ) => store`\n private:${ingest_data}\n  int smartness_{};\n`

  const main = `
int main() {
  Chatbot chatbot{};
  chatbot.Train({{
      "How much is 2 + 2?",
      "What color is the sky?",
      "What is the answer to life and everything?"},
    {"4", "It depends", "42"}});
  const auto question = "Are you self aware?";
  std::cout << "Asking chatbot: "
            << question << std::endl;
  std::cout << "Chatbot answered: "
            << chatbot.GetAnswer(question).text
            << std::endl;
  return 0;
}`

  const includes = (
    { pragma_once = ``,
      string = ``,
      vector = ``,
      iostream = `` }: {
        pragma_once?: any,
        string?: any,
        vector?: any,
        iostream?: any
      },
  ) => store`${pragma_once}${iostream}${string}${vector}
  `

  const code = (
    { includes = ``,
      public_keyword = ``,
      answer_struct = ``,
      data_struct = ``,
      train_method = ``,
      get_answer_method = ``,
      private_part = ``,
      main = `` }: {
        includes?: any,
        public_keyword?: any,
        answer_struct?: any,
        data_struct?: any,
        train_method?: any,
        get_answer_method?: any,
        private_part?: any,
        main?: any,
      },
  ) => store`${includes}\nclass Chatbot {${public_keyword}${answer_struct}${data_struct}${get_answer_method}${train_method}${private_part}};\n${main}
  `

  const code_separate_main = (
    { includes = ``,
      main = `` }: {
        includes?: any,
        main?: any,
      },
  ) => store`${includes}${main}`

  const code_cpp_file = (
    { includes = ``,
      data_method = ``,
      train_method = ``,
      get_answer_method = ``,
      ingest_data_method = ``,
    }: {
      includes?: any,
      data_method?: any,
      train_method?: any,
      get_answer_method?: any,
      ingest_data_method?: any
    },
  ) => store`${includes}
  ${data_method}
  ${get_answer_method}
  ${train_method}
  ${ingest_data_method}
  `

  const includes_cpp = `#include <chatbot/chatbot.hpp>`
  const data_method_cpp = `
bool Chatbot::Data::IsValid() const {
  return questions.size() == correct_answers.size();
}`
  const train_method_cpp = `
void Chatbot::Train(const Data &data) {
  if (!data.IsValid()) { return; }
  IngestData(data);
}`
  const get_answer_method_cpp = `
Chatbot::Answer
Chatbot::GetAnswer(const std::string &question) const {
  if (smartness_ < 1) { return Answer{0.1, "I don't know"}; }
  if (smartness_ < 5) { return Answer{0.8, "Yes."}; }
  if (question.length() > 10) {
    return Answer{1.0, "You will regret this question..."};
  }
  return Answer{1.0, "Can't you ask anything more important?"};
}`
  const ingest_data_method_cpp = `
void Chatbot::IngestData(const Data &data) {
  smartness_ += data.correct_answers.size();
}`


  yield* filename_left_ref().edit(0, false)`chatbot.cpp`;
  yield* filename_right_ref().edit(0, false)`chatbot.hpp`;
  yield* code_block_left_ref().edit(0, false)(...simplify(code({})));
  yield* code_block_right_ref().edit(0, false)(...simplify(code({ main: insert(main) })));


  yield* all(
    code_block_left_ref().edit(duration, false)(...simplify(code({
      includes: insert(to_string(includes({ string: "#include <string>" }))),
      public_keyword: insert("\n public:\n"),
      get_answer_method: insert(to_string(get_answer_method_code({}))),
    }))),
    code_block_left_ref().selection([...lines(4)], duration),
    waitFor(duration * 2)
  );

  yield* all(
    code_block_left_ref().edit(duration, true)(...simplify(code({
      includes: includes({ string: "#include <string>" }),
      public_keyword: "\n public:\n",
      get_answer_method: get_answer_method_code({}),
      train_method: insert(to_string(train_method({}))),
    }))),
    waitFor(duration * 2)
  );

  yield* all(
    code_block_left_ref().edit(duration, true)(...simplify(code({
      includes: includes({ string: "#include <string>" }),
      public_keyword: "\n public:\n",
      get_answer_method: get_answer_method_code({}),
      train_method: train_method({}),
      answer_struct: insert(answer_struct),
    }))),
    waitFor(duration * 2)
  );

  yield* all(
    code_block_left_ref().edit(duration, true)(...simplify(code({
      includes: includes({
        string: "#include <string>",
        vector: insert("\n#include <vector>")
      }),
      public_keyword: "\n public:\n",
      get_answer_method: get_answer_method_code({}),
      train_method: train_method({}),
      answer_struct: answer_struct,
      data_struct: insert(to_string(data_struct({}))),
    }))),
    code_block_left_ref().position([0, 150], duration),
    waitFor(duration * 2)
  );

  yield* all(
    code_block_left_ref().edit(duration, false)(...simplify(code({
      includes: includes({
        string: "#include <string>",
        vector: "\n#include <vector>"
      }),
      public_keyword: "\n public:\n",
      get_answer_method: get_answer_method_code({}),
      train_method: train_method({ impl: insert(train_method_impl) }),
      answer_struct: answer_struct,
      data_struct: data_struct({}),
      private_part: insert(to_string(private_part({ ingest_data: ingest_data_impl }))),
    }))),
    code_block_left_ref().position([0, -450], duration),
    code_block_left_ref().selection([...lines(18, Infinity)], duration),
    waitFor(duration * 2)
  );

  yield* all(
    code_block_left_ref().edit(duration, false)(...simplify(code({
      includes: includes({
        string: "#include <string>",
        vector: "\n#include <vector>"
      }),
      public_keyword: "\n public:\n",
      get_answer_method: get_answer_method_code({ impl: edit(';', get_answer_impl) }),
      train_method: train_method({ impl: train_method_impl }),
      answer_struct: answer_struct,
      data_struct: data_struct({ impl: edit(';', data_struct_is_valid_impl) }),
      private_part: private_part({ ingest_data: ingest_data_impl }),
    }))),
    code_block_left_ref().position([0, 0], 0),
    code_block_left_ref().scale(0.35, 0),
    code_block_left_ref().selection(DEFAULT, 0),
    waitFor(duration * 2)
  );

  yield* all(
    code_block_left_ref().scale(0.9, duration),
    code_block_left_ref().position([0, 800], duration),
    waitFor(duration * 2)
  );
  yield* all(
    code_block_left_ref().position([0, -800], 2 * duration),
  );

  yield* all(
    code_block_left_ref().edit(duration, true)(...simplify(code({
      includes: includes({
        string: "#include <string>",
        vector: "\n#include <vector>",
        iostream: insert("\n#include <iostream>")
      }),
      public_keyword: "\n public:\n",
      get_answer_method: get_answer_method_code({ impl: get_answer_impl }),
      train_method: train_method({ impl: train_method_impl }),
      answer_struct: answer_struct,
      data_struct: data_struct({ impl: data_struct_is_valid_impl }),
      private_part: private_part({ ingest_data: ingest_data_impl }),
      main: insert(main),
    }))),
    code_block_left_ref().position([0, -1100], duration),
    code_block_left_ref().selection(DEFAULT, 0),
    waitFor(duration * 2)
  );

  yield* all(
    code_block_left_ref().edit(duration, false)(...simplify(code({
      includes: includes({
        string: "\n#include <string>",
        vector: "\n#include <vector>",
        iostream: "#include <iostream>"
      }),
      public_keyword: "\n public:\n",
      get_answer_method: get_answer_method_code({ impl: get_answer_impl }),
      train_method: train_method({ impl: train_method_impl }),
      answer_struct: answer_struct,
      data_struct: data_struct({ impl: data_struct_is_valid_impl }),
      private_part: private_part({ ingest_data: ingest_data_impl }),
      main: main,
    }))),
    code_block_left_ref().scale(0.25, 0),
    code_block_left_ref().position([0, 0], 0),
    code_block_left_ref().selection(DEFAULT, 0),
    waitFor(duration * 2)
  );

  yield* all(
    filename_left_ref().edit(duration, true)`chatbot.${edit(`cpp`, `hpp`)}`,
    waitFor(duration * 2)
  );

  yield* all(
    filename_left_ref().selection(DEFAULT, duration),
    code_block_left_ref().scale(0.9, duration),
    code_block_left_ref().position([0, 1300], duration),
    code_block_left_ref().edit(duration, true)(...simplify(code({
      includes: includes({
        pragma_once: insert("#pragma once\n\n"),
        string: "\n#include <string>",
        vector: "\n#include <vector>",
        iostream: "#include <iostream>"
      }),
      public_keyword: "\n public:\n",
      get_answer_method: get_answer_method_code({ impl: get_answer_impl }),
      train_method: train_method({ impl: train_method_impl }),
      answer_struct: answer_struct,
      data_struct: data_struct({ impl: data_struct_is_valid_impl }),
      private_part: private_part({ ingest_data: ingest_data_impl }),
      main: main,
    }))),
    waitFor(duration * 2)
  );

  yield* all(
    code_block_left_ref().selection(DEFAULT, duration),
    code_block_left_ref().position([0, -1150], duration),
    waitFor(duration * 2)
  );

  yield* all(
    code_block_left_ref().position([5, -160], duration),
    code_block_left_ref().scale(0.49, duration),
    code_block_left_ref().edit(duration, false)(...simplify(code({
      includes: includes({
        pragma_once: "#pragma once\n",
        string: "\n#include <string>",
        vector: "\n#include <vector>",
      }),
      public_keyword: "\n public:\n",
      get_answer_method: get_answer_method_code({ impl: get_answer_impl }),
      train_method: train_method({ impl: train_method_impl }),
      answer_struct: answer_struct,
      data_struct: data_struct({ impl: data_struct_is_valid_impl }),
      private_part: private_part({ ingest_data: ingest_data_impl }),
      main: remove(main),
    }))),
    filename_right_ref().edit(0, false)`main.cpp`,
    grow_factor(0.5, duration),
    code_block_right_ref().scale(0.6, duration),
    code_block_right_ref().position([0, 0], duration),
    code_block_right_ref().edit(duration, true)(...simplify(code_separate_main({
      includes: includes({
        vector: insert("#include <iostream>"),
        string: insert("#include <chatbot/chatbot.hpp>\n"),
      }),
      main: insert(main),
    }))),
    waitFor(duration * 3)
  );

  // Copying the data into cpp file
  yield* all(
    grow_factor(0, 0),
    code_block_left_ref().scale(0.5, 0),
    code_block_right_ref().scale(0.5, 0),
    code_block_left_ref().position([20, 200], 0),
    filename_right_ref().edit(0, false)`chatbot.cpp`,
    code_block_right_ref().edit(0, false)``,
    waitFor(duration * 2)
  );

  yield* all(
    grow_factor(0.5, duration),
    filename_right_ref().edit(0, false)`chatbot.cpp`,
    code_block_right_ref().edit(duration, true)(...simplify(code_cpp_file({
      includes: insert(includes_cpp),
    }))),
    waitFor(duration * 2)
  );

  yield* all(
    code_block_left_ref().position.y(0, duration * 5),
    chain(
      all(
        code_block_left_ref().edit(duration, false)(...simplify(code({
          includes: includes({
            pragma_once: "#pragma once\n",
            string: "\n#include <string>",
            vector: "\n#include <vector>",
          }),
          public_keyword: "\n public:\n",
          get_answer_method: get_answer_method_code({ impl: get_answer_impl }),
          train_method: train_method({ impl: train_method_impl }),
          answer_struct: answer_struct,
          data_struct: data_struct({ impl: edit(data_struct_is_valid_impl, ';') }),
          private_part: private_part({ ingest_data: ingest_data_impl }),
        }))),
        code_block_right_ref().edit(duration, true)(...simplify(code_cpp_file({
          includes: includes_cpp,
          data_method: insert(data_method_cpp),
        }))),
      ),
      all(
        code_block_left_ref().edit(duration, false)(...simplify(code({
          includes: includes({
            pragma_once: "#pragma once\n",
            string: "\n#include <string>",
            vector: "\n#include <vector>",
          }),
          public_keyword: "\n public:\n",
          get_answer_method: get_answer_method_code({ impl: edit(get_answer_impl, ';') }),
          train_method: train_method({ impl: train_method_impl }),
          answer_struct: answer_struct,
          data_struct: data_struct({}),
          private_part: private_part({ ingest_data: ingest_data_impl }),
        }))),
        code_block_right_ref().edit(duration, true)(...simplify(code_cpp_file({
          includes: includes_cpp,
          data_method: data_method_cpp,
          get_answer_method: insert(get_answer_method_cpp),
        }))),
      ),
      all(
        code_block_left_ref().edit(duration, false)(...simplify(code({
          includes: includes({
            pragma_once: "#pragma once\n",
            string: "\n#include <string>",
            vector: "\n#include <vector>",
          }),
          public_keyword: "\n public:\n",
          get_answer_method: get_answer_method_code({}),
          train_method: train_method({ impl: edit(train_method_impl, ';') }),
          answer_struct: answer_struct,
          data_struct: data_struct({}),
          private_part: private_part({ ingest_data: ingest_data_impl }),
        }))),
        code_block_right_ref().edit(duration, true)(...simplify(code_cpp_file({
          includes: includes_cpp,
          data_method: data_method_cpp,
          get_answer_method: get_answer_method_cpp,
          train_method: insert(train_method_cpp),
        }))),
      ),
      all(
        code_block_left_ref().edit(duration, false)(...simplify(code({
          includes: includes({
            pragma_once: "#pragma once\n",
            string: "\n#include <string>",
            vector: "\n#include <vector>",
          }),
          public_keyword: "\n public:\n",
          get_answer_method: get_answer_method_code({}),
          train_method: train_method({}),
          answer_struct: answer_struct,
          data_struct: data_struct({}),
          private_part: private_part({ ingest_data: edit(ingest_data_impl, '\n  void IngestData(const Data& data);\n') }),
        }))),
        code_block_right_ref().edit(duration, true)(...simplify(code_cpp_file({
          includes: includes_cpp,
          data_method: data_method_cpp,
          get_answer_method: get_answer_method_cpp,
          train_method: train_method_cpp,
          ingest_data_method: insert(ingest_data_method_cpp),
        }))),
      )
    )
  );

  yield* all(
    grow_factor(1.0, duration),
    code_block_right_ref().scale(0.6, duration),
    code_block_right_ref().selection([
      ...word(2, 5, 15),
      ...word(7, 0, 9),
      ...word(16, 5, 9),
      ...word(21, 5, 9)], duration),
    waitFor(duration * 2)
  );

  yield* all(
    code_block_right_ref().selection([
      ...word(6, 0, 15)], duration),
    waitFor(duration * 2)
  );

  yield* all(
    code_block_right_ref().selection([
      ...word(8, 30, 7),
      ...word(9, 30, 7),
      ...word(11, 10, 7),
      ...word(13, 8, 7),
      ...word(16, 25, 5),
      ...word(21, 30, 5),
    ], duration),
    waitFor(duration * 2)
  );

  yield* all(
    grow_factor(0.5, duration),
    code_block_right_ref().scale(0.5, duration),
    code_block_right_ref().selection([
      ...word(7, 48, 6),
      ...word(2, 30, 6),
    ], duration),
    code_block_left_ref().selection([
      ...word(13, 19, 5),
      ...word(18, 48, 5),
    ], duration),
  );
  yield* all(
    code_block_right_ref().scale(0.8, duration * 2),
    code_block_right_ref().position([-200, 340], duration * 2),
    code_block_left_ref().scale(0.8, duration * 2),
    code_block_left_ref().position([-200, -100], duration * 2),
    waitFor(duration * 3)
  );
});
