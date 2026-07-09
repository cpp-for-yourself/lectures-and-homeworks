/// <reference types="vite/client" />
import { createRef } from '@motion-canvas/core/lib/utils';
import { makeScene2D, Code, LezerHighlighter, lines, Camera, Rect, Node, Txt } from '@motion-canvas/2d';
import { all, waitFor } from '@motion-canvas/core/lib/flow';
import { DEFAULT } from '@motion-canvas/core/lib/signals';

import { parser as parser_cpp } from '@lezer/cpp';

import blockingCode from '@lectures/parallelism.md?snippet=parallelism_blocking/main.cpp';
import stopTokenCode from '@lectures/parallelism.md?snippet=parallelism_stop_token/main.cpp';
import asyncCode from '@lectures/parallelism.md?snippet=parallelism_async/main.cpp';
import algorithmsSequentialCode from '@lectures/parallelism.md?snippet=parallelism_algorithms/main_sequential.cpp';
import algorithmsParallelCode from '@lectures/parallelism.md?snippet=parallelism_algorithms/main_parallel.cpp';
import tbbCode from '@lectures/parallelism.md?snippet=parallelism_algorithms/main_tbb.cpp';
import jthread1Code from '@lectures/parallelism.md?snippet=parallelism_jthread_1/main.cpp';
import jthread2Code from '@lectures/parallelism.md?snippet=parallelism_jthread_2/main.cpp';
import jthread2ClassCode from '@lectures/parallelism.md?snippet=parallelism_jthread_2_class/main.cpp';
import jthread2ClassSwapCode from '@lectures/parallelism.md?snippet=parallelism_jthread_2_class_swap/main.cpp';
import jthread3Code from '@lectures/parallelism.md?snippet=parallelism_jthread_3/main.cpp';
import jthreadCode from '@lectures/parallelism.md?snippet=parallelism_jthread/main.cpp';
import threadpool17Code from '@lectures/parallelism.md?snippet=parallelism_threadpool_17/main.cpp';

import { MyStyle } from '../../styles';
import { centerOn, zoomInOn, zoomOut, getCodeBBox, getFutureCodeBBox } from '../../utils';
import { BBox } from '@motion-canvas/core';

const CppHighlighter = new LezerHighlighter(parser_cpp, MyStyle);

export default makeScene2D(function* (view) {
    const codeContainerRef = createRef<Node>();
    const codeRef = createRef<Code>();
    var cppVersionTxt = createRef<Txt>();

    const popups = [
        { stroke: '#FF6B6B', y: -250 },
        { stroke: '#4DABF7', y: 250 },
        { stroke: '#3eec9dff', y: 250 },
        { stroke: '#a356c1ff', y: 250 },
    ].map(p => ({
        ...p,
        popupRect: createRef<Rect>(),
        popupCamera: createRef<Camera>(),
        outline: createRef<Rect>(),
    }));

    const [
        { popupRect: popup1Rect, popupCamera: popup1Camera, outline: outline1 },
        { popupRect: popup2Rect, popupCamera: popup2Camera, outline: outline2 },
        { popupRect: popup3Rect, popupCamera: popup3Camera, outline: outline3 },
        { popupRect: popup4Rect, popupCamera: popup4Camera, outline: outline4 }
    ] = popups;

    yield view.add(
        <Node ref={codeContainerRef}>
            <Txt
                ref={cppVersionTxt}
                fontSize={95}
                fontFamily={'Fira Mono'}
                fontWeight={500}
                text=""
                fill={'white'}
                x={720}
                y={25}
            />
            <Code
                ref={codeRef}
                fontSize={14.5}
                fontFamily={'Fira Mono'}
                fontWeight={500}
                offsetX={-1}
                x={-850}
                y={0}
                highlighter={CppHighlighter}
            />
        </Node>
    );
    yield view.add(
        <>
            {popups.map(p => (
                <>
                    <Rect
                        ref={p.outline}
                        stroke={p.stroke}
                        lineWidth={3}
                        radius={4}
                        opacity={0}
                    />
                    <Rect
                        ref={p.popupRect}
                        clip={true}
                        width={1000}
                        height={480}
                        x={200}
                        y={p.y}
                        fill={'#1E1E1E'}
                        stroke={p.stroke}
                        lineWidth={4}
                        radius={8}
                        opacity={0}
                        scale={0.8}
                    >
                        <Camera
                            ref={p.popupCamera}
                            scene={codeContainerRef()}
                        />
                    </Rect>
                </>
            ))}
        </>
    );
    const duration = 1.0;

    // 0. Blocking
    yield* codeRef().code(blockingCode, 0);
    yield* centerOn(codeRef(), DEFAULT, 0, 20);
    yield* waitFor(duration);

    // Focus on loading an image
    yield* centerOn(codeRef(), [lines(8, 10)], duration, 30);
    yield* waitFor(duration);
    yield* centerOn(codeRef(), [lines(12, 16), lines(6, 11)], duration, 30);
    yield* waitFor(duration);
    yield* centerOn(codeRef(), lines(18, 28), duration, 30);
    yield* waitFor(duration);
    yield* centerOn(codeRef(), DEFAULT, duration, 20);
    yield* waitFor(duration);

    // 1. std::async Background Task
    const final_box = getFutureCodeBBox(codeRef(), lines(44, 45), () => {
        codeRef().code(asyncCode);
        codeRef().fontSize(14);
    });
    yield* all(
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), getCodeBBox(codeRef(), lines(23, 23)), duration, { zoom: 2, position: 'center', screenPaddingY: 220 }),
        codeRef().selection(lines(23, 23), duration),
    )
    yield* waitFor(duration);
    yield* all(
        codeRef().code(asyncCode, duration),
        codeRef().fontSize(14, duration),
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), final_box, duration, { zoom: 2, position: 'center', screenPaddingY: 220 }),
        codeRef().selection(lines(44, 45), duration),
    );
    yield* waitFor(duration);
    yield* all(
        codeRef().selection(lines(21, 38), duration),
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), getCodeBBox(codeRef(), lines(21, 38)), duration, { zoom: 2, position: 'top-right', screenPaddingY: 250 }),
    )
    yield* waitFor(duration);

    // Focus on std::async AND future polling simultaneously!
    yield* all(
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), getCodeBBox(codeRef(), lines(21, 38)), duration, { zoom: 2, position: 'top-right', screenPaddingY: 100 }),
        zoomInOn(popup2Rect(), popup2Camera(), outline2(), getCodeBBox(codeRef(), lines(46, 54)), duration, { zoom: 2, position: 'bottom-right', screenPaddingX: 150, screenPaddingY: 150 }),
        codeRef().selection([lines(21, 38), lines(46, 54)], duration),
    );
    yield* waitFor(duration);

    yield* all(
        zoomOut(popup1Rect(), outline1(), duration),
        zoomOut(popup2Rect(), outline2(), duration),
        codeRef().selection(DEFAULT, duration),
    );

    yield* all(
        centerOn(codeRef(), lines(40, 58), duration, 30)
    );
    yield* waitFor(duration);

    yield* centerOn(codeRef(), lines(44, 44), duration, 33);
    yield* waitFor(duration);

    // 2. Parallel Algorithms
    yield* all(
        codeRef().code(algorithmsSequentialCode, 0),
        centerOn(codeRef(), DEFAULT, 0, 15),
    );
    yield* waitFor(duration);

    yield* centerOn(codeRef(), lines(16, 22), duration, 30);

    yield* all(
        centerOn(codeRef(), [lines(16, 22), lines(8, 10)], duration, 30),
    )

    yield* waitFor(duration);

    yield* all(
        centerOn(codeRef(), [lines(16, 22), lines(8, 10), lines(10, 16)], duration, 30),
    )

    yield* waitFor(duration);

    yield* all(
        centerOn(codeRef(), [lines(24, 45)], duration, 30),
    )
    yield* waitFor(duration);

    yield* centerOn(codeRef(), DEFAULT, duration, 15);
    yield* waitFor(duration);

    const final_parllel_box = getFutureCodeBBox(codeRef(), lines(32, 37), () => {
        codeRef().code(algorithmsParallelCode);
        codeRef().fontSize(15);
    });

    yield* all(
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), getCodeBBox(codeRef(), lines(32, 36)), duration, { zoom: 1.5, position: 'bottom-right', screenPaddingY: 240 }),
    );
    yield* waitFor(duration);


    yield* all(
        codeRef().code(algorithmsParallelCode, duration),
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), final_parllel_box, duration, { zoom: 1.5, position: 'bottom-right', screenPaddingY: 220 }),
    );
    yield* all(
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), final_parllel_box, duration, { zoom: 1.5, position: 'bottom-right', screenPaddingY: 220 }),
        zoomInOn(popup2Rect(), popup2Camera(), outline2(), getCodeBBox(codeRef(), lines(2, 2)), duration, { zoom: 1.5, position: 'top-right', screenPaddingX: 730, screenPaddingY: 170 }),
    );
    yield* waitFor(duration);

    yield* all(
        zoomOut(popup1Rect(), outline1(), duration),
        zoomOut(popup2Rect(), outline2(), duration),
        codeRef().selection(DEFAULT, duration),
    );
    yield* waitFor(duration);

    // TBB code
    const final_tbb_box_1 = getFutureCodeBBox(codeRef(), lines(34, 42), () => {
        codeRef().code(tbbCode);
        codeRef().fontSize(15);
    });
    const final_tbb_box_2 = getFutureCodeBBox(codeRef(), lines(0, 6), () => {
        codeRef().code(tbbCode);
        codeRef().fontSize(15);
    });
    yield* all(
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), getCodeBBox(codeRef(), lines(32, 37)), duration, { zoom: 1.5, position: 'bottom-right', screenPaddingY: 220 }),
        zoomInOn(popup2Rect(), popup2Camera(), outline2(), getCodeBBox(codeRef(), lines(0, 5)), duration, { zoom: 1.5, position: 'top-right', screenPaddingX: 720, screenPaddingY: 100 }),
    );
    yield* waitFor(duration);
    yield* all(
        codeRef().code(tbbCode, duration),
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), final_tbb_box_1, duration, { zoom: 1.5, position: 'bottom-right', screenPaddingX: 60, screenPaddingY: 160 }),
        zoomInOn(popup2Rect(), popup2Camera(), outline2(), final_tbb_box_2, duration, { zoom: 1.5, position: 'top-right', screenPaddingX: 680, screenPaddingY: 70 }),
    );
    yield* waitFor(duration);

    yield* all(
        zoomOut(popup1Rect(), outline1(), duration),
        zoomOut(popup2Rect(), outline2(), duration),
        codeRef().selection(DEFAULT, duration),
    );
    yield* waitFor(duration);


    // 3. Worker threads and thread pools
    // #### Step 1: How to create a thread
    yield* all(
        codeRef().code(jthread1Code, duration),
        codeRef().fontSize(14, duration),
        centerOn(codeRef(), DEFAULT, duration, 15),
        cppVersionTxt().text("C++20", duration),
    );
    yield* waitFor(duration);

    // Highlight 1 (TinyImage struct)
    yield* all(
        centerOn(codeRef(), lines(7, 10), duration, 30),
    );
    yield* waitFor(duration);

    yield* all(
        centerOn(codeRef(), lines(12, 15), duration, 30),
    );
    yield* waitFor(duration);

    // Highlight 2 (Pushing to queue)
    yield* all(
        centerOn(codeRef(), lines(32, 35), duration, 30),
    );
    yield* waitFor(duration);

    // Highlight 4 (jthread worker)
    yield* all(
        centerOn(codeRef(), lines(38, 38), duration, 30),
    );
    yield* waitFor(duration);

    // Highlight 5 (pointer to images)
    yield* all(
        centerOn(codeRef(), [lines(17, 17), lines(38, 38)], duration, 30),
    );
    yield* waitFor(duration);

    yield* all(
        centerOn(codeRef(), [lines(17, 25)], duration, 25),
    );
    yield* waitFor(duration);

    yield* all(
        centerOn(codeRef(), DEFAULT, duration, 15),
    );
    yield* waitFor(duration);

    // #### Step 2: Adding another thread and a Mutex
    yield* all(
        codeRef().code(stopTokenCode, 0),
        centerOn(codeRef(), DEFAULT, 0, 25),
        cppVersionTxt().text("C++20", 0),
        cppVersionTxt().y(400, 0),
    );
    yield* waitFor(duration);

    // #### Step 2: Adding another thread and a Mutex
    yield* all(
        codeRef().code(jthread1Code, 0),
        centerOn(codeRef(), DEFAULT, 0, 15),
    );
    yield* waitFor(duration);
    yield* all(
        codeRef().code(jthread2Code, duration),
        centerOn(codeRef(), DEFAULT, duration, 15),
    );
    yield* waitFor(duration);

    // Highlight 1 (mutex created)
    yield* all(
        centerOn(codeRef(), lines(40, 44), duration, 30),
    );
    yield* waitFor(duration);

    yield* all(
        centerOn(codeRef(), [lines(40, 44), lines(46, 46)], duration, 30),
    );
    yield* waitFor(duration);

    // Highlight 2 (2 jthreads)
    yield* all(
        centerOn(codeRef(), [lines(40, 44), lines(46, 46), lines(48, 50)], duration, 30),
    );
    yield* waitFor(duration);

    // Highlight 3 (ProcessImages params & lock_guard)
    yield* all(
        centerOn(codeRef(), [lines(18, 34)], duration, 28),
    );
    yield* waitFor(duration);

    yield* all(
        centerOn(codeRef(), DEFAULT, duration, 15),
    );
    yield* waitFor(duration);

    // #### Step 2: Class approach
    yield* all(
        codeRef().code(jthread2ClassCode, duration),
        centerOn(codeRef(), DEFAULT, duration, 13),
    );
    yield* waitFor(duration);

    const pipeline_constructor = getFutureCodeBBox(codeRef(), lines(20, 26), () => {
        codeRef().code(jthread2ClassCode);
        codeRef().fontSize(13);
    });

    const process_images_func = getFutureCodeBBox(codeRef(), lines(29, 44), () => {
        codeRef().code(jthread2ClassCode);
        codeRef().fontSize(13);
    });

    const start_threads_func = getFutureCodeBBox(codeRef(), lines(60, 60), () => {
        codeRef().code(jthread2ClassCode);
        codeRef().fontSize(13);
    });

    yield* all(
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), pipeline_constructor, duration, { zoom: 1.7, position: 'top-right', screenPaddingY: 100 }),
    );
    yield* all(
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), pipeline_constructor, duration, { zoom: 1.7, position: 'top-right', screenPaddingY: 100 }),
        zoomInOn(popup2Rect(), popup2Camera(), outline2(), process_images_func, duration, { zoom: 1.7, position: 'top-right', screenPaddingX: 100, screenPaddingY: 340 }),
    );
    yield* all(
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), pipeline_constructor, duration, { zoom: 1.7, position: 'top-right', screenPaddingY: 100 }),
        zoomInOn(popup2Rect(), popup2Camera(), outline2(), process_images_func, duration, { zoom: 1.7, position: 'top-right', screenPaddingX: 100, screenPaddingY: 340 }),
        zoomInOn(popup3Rect(), popup3Camera(), outline3(), start_threads_func, duration, { zoom: 2.0, position: 'bottom-right', screenPaddingX: 100, screenPaddingY: 250 }),
    );
    yield* waitFor(duration);

    yield* all(
        zoomOut(popup1Rect(), outline1(), duration),
        zoomOut(popup2Rect(), outline2(), duration),
        zoomOut(popup3Rect(), outline3(), duration),
    );

    yield* all(
        centerOn(codeRef(), lines(29, 44), duration, 25),
    );
    yield* waitFor(duration);

    // #### Step 2: Class swap approach
    yield* all(
        codeRef().code(jthread2ClassSwapCode, duration),
        centerOn(codeRef(), lines(29, 46), duration, 25),
    );
    yield* waitFor(duration);

    // Highlight 1 (the swap part)
    yield* all(
        centerOn(codeRef(), lines(31, 36), duration, 30),
    );
    yield* waitFor(duration);

    // Highlight 2 (processing local queue)
    yield* all(
        centerOn(codeRef(), lines(38, 44), duration, 30),
    );
    yield* waitFor(duration);

    yield* all(
        centerOn(codeRef(), DEFAULT, duration, 10),
    );
    yield* waitFor(duration);

    // #### Step 3: Sleeping with Condition Variables
    yield* all(
        codeRef().code(jthread3Code, duration),
    );
    yield* waitFor(duration);

    yield* all(
        centerOn(codeRef(), lines(62, 62), duration, 30),
    );
    yield* waitFor(duration);

    yield* all(
        centerOn(codeRef(), lines(30, 36), duration, 30),
    );
    yield* waitFor(duration);

    yield* all(
        centerOn(codeRef(), lines(70, 74), duration, 30),
    );
    yield* waitFor(duration);

    yield* all(
        centerOn(codeRef(), lines(21, 28), duration, 30),
    );
    yield* waitFor(duration);

    yield* all(
        centerOn(codeRef(), lines(39, 58), duration, 27),
    );
    yield* waitFor(duration);

    yield* all(
        centerOn(codeRef(), DEFAULT, duration, 10),
    );
    yield* waitFor(duration);


    const thread_pool_with_images_name = `#include <chrono>
#include <condition_variable>
#include <functional>
#include <iostream>
#include <mutex>
#include <queue>
#include <random>
#include <thread>

namespace {
struct TinyImage {
  int id{};
  int size{};
};

void ProcessImage(const TinyImage& image) {
  // Simulate some work. Its duration depends on the image's size.
  std::this_thread::sleep_for(std::chrono::milliseconds(image.size));
}

template <typename T> 
class ImageProcessingPipeline {
public:
  ImageProcessingPipeline(size_t number_of_threads,
                          std::function<void(const T&)> process_image)
      : process_image_{std::move(process_image)} {
    std::cout << "Starting " << number_of_threads << " background threads...\\n";
    for (size_t i = 0; i < number_of_threads; ++i) {
      worker_threads_.emplace_back([this](std::stop_token stoken) {
        this->ProcessImages(std::move(stoken));
      });
    }
  }

  void Submit(T&& img) {
    {
      std::lock_guard lock{queue_mutex_};
      images_.push(std::move(img));
    }
    cv_.notify_one();
  }

private:
  void ProcessImages(std::stop_token stoken) {
    while (true) {
      std::queue<T> local_images;
      {
        std::unique_lock lock{queue_mutex_};
        const bool work_exists = cv_.wait(lock, stoken, [this] { return !images_.empty(); });
        if (!work_exists) { break; }
        std::swap(local_images, images_);
      }

      while(!local_images.empty()) {
        const auto image = std::move(local_images.front());
        local_images.pop();
        process_image_(image);
      }
    }
  }

  std::queue<T> images_{};
  std::mutex queue_mutex_{};
  std::condition_variable_any cv_{};
  std::function<void(const T&)> process_image_{};
  std::vector<std::jthread> worker_threads_{};
};
} // namespace

int main() {
  std::mt19937 rng{std::random_device{}()};
  std::uniform_int_distribution<int> dist{10, 100};

  ImageProcessingPipeline<TinyImage> pipeline{2, ProcessImage};
  for (int i = 1; i <= 10; ++i) {
    pipeline.Submit(TinyImage{i, dist(rng)});
  }

  return 0;
}`
    yield* all(
        codeRef().code(thread_pool_with_images_name, duration),
    );
    yield* waitFor(duration);

    const template_box = getFutureCodeBBox(codeRef(), lines(20, 21), () => {
        codeRef().code(thread_pool_with_images_name);
        codeRef().fontSize(10);
    });
    const template_box_constructor = getFutureCodeBBox(codeRef(), lines(23, 25), () => {
        codeRef().code(thread_pool_with_images_name);
        codeRef().fontSize(10);
    });
    const template_box_main = getFutureCodeBBox(codeRef(), lines(72, 73), () => {
        codeRef().code(thread_pool_with_images_name);
        codeRef().fontSize(10);
    });
    const template_box_queue = getFutureCodeBBox(codeRef(), lines(60, 61), () => {
        codeRef().code(thread_pool_with_images_name);
        codeRef().fontSize(10);
    });
    const template_box_queue_more = getFutureCodeBBox(codeRef(), lines(60, 64), () => {
        codeRef().code(thread_pool_with_images_name);
        codeRef().fontSize(10);
    });
    const use_std_func = getFutureCodeBBox(codeRef(), lines(56, 56), () => {
        codeRef().code(thread_pool_with_images_name);
        codeRef().fontSize(10);
    });


    yield* all(
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), template_box, duration, { zoom: 3, position: 'top-right', screenPaddingX: 100 }),
    );
    yield* waitFor(duration);

    yield* all(
        zoomInOn(popup2Rect(), popup2Camera(), outline2(), template_box_main, duration, { zoom: 3, position: 'bottom-right', screenPaddingX: 100, screenPaddingY: 100 }),
        cppVersionTxt().y(popup2Rect().y() + popup2Rect().height() / 2 + 80, duration),
    );
    yield* waitFor(duration);

    yield* all(
        zoomInOn(popup3Rect(), popup3Camera(), outline3(), template_box_queue, duration, { zoom: 3, position: 'bottom-right', screenPaddingX: 100, screenPaddingY: 220 }),
        cppVersionTxt().y(popup3Rect().y() - popup3Rect().height() / 2 - 60, duration),
    );
    yield* waitFor(duration);

    yield* all(
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), template_box_constructor, duration, { zoom: 3, position: 'top-right', screenPaddingX: 100 }),
    );
    yield* waitFor(duration);

    yield* all(
        zoomInOn(popup3Rect(), popup3Camera(), outline3(), template_box_queue_more, duration, { zoom: 3, position: 'bottom-right', screenPaddingX: 100, screenPaddingY: 220 }),
        cppVersionTxt().y(popup3Rect().y() - popup3Rect().height() / 2 - 180, duration),
    );
    yield* waitFor(duration);

    yield* all(
        zoomInOn(popup4Rect(), popup4Camera(), outline4(), use_std_func, duration, { zoom: 3, position: 'bottom-right', screenPaddingX: 100, screenPaddingY: 440 }),
        cppVersionTxt().y(popup4Rect().y() - popup4Rect().height() / 2 - 60, duration),
    );
    yield* waitFor(duration);

    // #### Step 4: Putting it all together into a Generic Thread Pool
    yield* all(
        codeRef().code(jthreadCode, duration),
    );
    yield* waitFor(duration);

    yield* all(
        zoomOut(popup1Rect(), outline1(), duration),
        zoomOut(popup2Rect(), outline2(), duration),
        zoomOut(popup3Rect(), outline3(), duration),
        zoomOut(popup4Rect(), outline4(), duration),
        cppVersionTxt().y(400, duration),
    );
    yield* waitFor(duration);

    const before_constructor = getFutureCodeBBox(codeRef(), lines(23, 32), () => {
        codeRef().code(jthreadCode);
        codeRef().fontSize(10);
    });
    const after_constructor = getFutureCodeBBox(codeRef(), lines(23, 30), () => {
        codeRef().code(threadpool17Code);
        codeRef().fontSize(9);
    });
    const before_members = getFutureCodeBBox(codeRef(), lines(61, 65), () => {
        codeRef().code(jthreadCode);
        codeRef().fontSize(10);
    });
    const after_members = getFutureCodeBBox(codeRef(), lines(68, 73), () => {
        codeRef().code(threadpool17Code);
        codeRef().fontSize(9);
    });
    const before_process_items = getFutureCodeBBox(codeRef(), lines(43, 59), () => {
        codeRef().code(jthreadCode);
        codeRef().fontSize(10);
    });
    const after_process_items = getFutureCodeBBox(codeRef(), lines(50, 66), () => {
        codeRef().code(threadpool17Code);
        codeRef().fontSize(9);
    });

    yield* all(
        cppVersionTxt().y(400, 0),
        cppVersionTxt().text("C++20", duration)
    );
    yield* waitFor(duration);

    yield* all(
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), before_constructor, duration, { zoom: 3, position: 'top-right', screenPaddingX: 100 }),
    );
    yield* all(
        zoomInOn(popup2Rect(), popup2Camera(), outline2(), before_members, duration, { zoom: 3, position: 'bottom-right', screenPaddingX: 100 }),
        cppVersionTxt().y(popup2Rect().y() - 310, duration),
    );
    yield* waitFor(duration);

    // #### What if I don't have C++20?
    yield* all(
        codeRef().code(threadpool17Code, duration),
        centerOn(codeRef(), DEFAULT, duration, 9),
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), after_constructor, duration, { zoom: 3.3, position: 'top-right', screenPaddingX: 100 }),
        zoomInOn(popup2Rect(), popup2Camera(), outline2(), after_members, duration, { zoom: 3.3, position: 'bottom-right', screenPaddingX: 100 }),
        cppVersionTxt().text("C++17", duration / 5),
        cppVersionTxt().y(popup2Rect().y() - 300, duration),
    );
    yield* waitFor(duration);

    yield* all(
        codeRef().code(jthreadCode, duration),
        centerOn(codeRef(), DEFAULT, duration, 10),
        zoomOut(popup1Rect(), outline1(), duration),
        zoomOut(popup2Rect(), outline2(), duration),
        zoomInOn(popup3Rect(), popup3Camera(), outline3(), before_process_items, duration, { zoom: 2.6, position: 'top-right', screenPaddingX: 100 }),
        cppVersionTxt().text("C++20", duration / 5),
        cppVersionTxt().y(popup3Rect().y(), duration),
    );
    yield* waitFor(duration);

    yield* all(
        codeRef().code(threadpool17Code, duration),
        centerOn(codeRef(), DEFAULT, duration, 9),
        zoomInOn(popup3Rect(), popup3Camera(), outline3(), after_process_items, duration, { zoom: 3, position: 'top-right', screenPaddingX: 100 }),
        cppVersionTxt().text("C++17", duration / 5),
        cppVersionTxt().y(popup3Rect().y() + 400, duration),
    );
    yield* waitFor(duration);

    // Highlight 1 (shutting_down flag)
    yield* all(
        zoomOut(popup3Rect(), outline3(), duration),
        cppVersionTxt().y(370, duration),
    );
    yield* all(
        centerOn(codeRef(), lines(32, 39), duration, 30),
    );
    yield* waitFor(duration);

});
