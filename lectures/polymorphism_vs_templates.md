Dynamic polymorphism vs templates (and concepts)
--

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50% style="margin: 0.5rem"></a>
</p>

Largely speaking, dynamic polymorphism as well as templates can be used to serve the same purpose - to abstract the details of the implementation away from a high level design as well as to invert the dependencies.

In this course, we've spent quite some time looking at both. We've seen how we can use dynamic polymorphism with `virtual` functions to implement various patterns and we also looked quite deep into how similar things can be achieved with templates.

But I believe that this topic is extremely important to be fluent in software design with modern C++ and warrants another look.

So today, I'd like to try to implement a very concrete example - loading an image - in both of these ways to have an even better understanding of where these methods shine and where they fall short.

We'll still stick with the same example topic as before: loading and saving images. To be more concrete, having a class `Image` we want to load such image from disk. The image can be stored as any type, for example either as a `png` or a `jpeg` image and we want to be able to load it with a very simple interface:
```cpp
int main() {
  // Load a PNG image.
  const std::filesystem::path path_png{"hello.png"};
  const std::optional<Image> image_png = LoadImage(path_png);
  if (!image_png) { fmt::println("Failed to load png image"); }

  // Load a JPEG image without providing additional parameters.
  const std::filesystem::path path_jpg{"hello.jpg"};
  const std::optional<Image> image_jpg = LoadImage(path_jpg);
  if (!image_jpg) { fmt::println("Failed to load jpg image"); }
}
```

Furthermore, we want to enable a way for the user to provide their own logic for loading images of their custom extension, say `.blah` without modifying the code within the `LoadImage` function.

<!-- Intro -->

## Why not just use `if` statements?
Before we go into dynamic and static polymorphism as a tool for our task, let's briefly talk about a simple `if` statement and why it falls short in our task.

A naïve implementation would simply have an `if` statement within the `LoadImage` function to choose which loading logic to use:
```cpp
std::optional<Image> LoadPngImage(const std::filesystem::path& path) {
  std::cout << "Loading PNG image." << std::endl;
  // Irrelevant here logic for actually loading the image.
  return Image{};
}

std::optional<Image> LoadJpegImage(const std::filesystem::path& path) {
  std::cout << "Loading JPEG image." << std::endl;
  // Irrelevant here logic for actually loading the image.
  return Image{};
}

std::optional<Image> LoadImage(const std::filesystem::path& path) {
  if (path.extension() == ".png") {
    return LoadPngImage(path);
  }
  if (path.extension() == ".jpg") {
    return LoadJpegImage(path);
  }
  return {};
}

int main() {
  // Load a PNG image.
  const std::filesystem::path path_png{"hello.png"};
  const auto image_png = LoadImage(path_png);
  if (!image_png) { fmt::println("Failed to load png image"); }

  // Load a JPEG image without providing additional parameters.
  const std::filesystem::path path_jpg{"hello.jpg"};
  const auto image_jpg = LoadImage(path_jpg);
  if (!image_jpg) { fmt::println("Failed to load jpg image"); }
}
```

This is a completely valid way to deal with our problem in simple cases and I would argue that if we are not sure that we need to ever support other types, this is the solution that I personally would implement.

However, in our case, we want to allow the user to provide their own logic of loading their custom image formats, say `.blah`. If we are using the `if` statements, the only option we have here is to modify the `LoadImage` function and to add another `if` statement making sure that the new function `LoadBlahImage` is compiled before the `LoadImage` function:

```cpp
std::optional<Image> LoadPngImage(const std::filesystem::path& path) {
  std::cout << "Loading PNG image." << std::endl;
  // Irrelevant here logic for actually loading the image.
  return Image{};
}

std::optional<Image> LoadJpegImage(const std::filesystem::path& path) {
  std::cout << "Loading JPEG image." << std::endl;
  // Irrelevant here logic for actually loading the image.
  return Image{};
}

std::optional<Image> LoadBlahImage(const std::filesystem::path& path) {
  std::cout << "Loading BLAH image." << std::endl;
  // Irrelevant here logic for actually loading the image.
  return Image{};
}

std::optional<Image> LoadImage(const std::filesystem::path& path) {
  if (path.extension() == ".png") {
    return LoadPngImage(path);
  }
  if (path.extension() == ".jpg") {
    return LoadJpegImage(path);
  }
  if (path.extension() == ".blah") {
    return LoadBlahImage(path);
  }
  return {};
}

int main() {
  // Load a PNG image.
  const std::filesystem::path path_png{"hello.png"};
  const auto image_png = LoadImage(path_png);
  if (!image_png) { fmt::println("Failed to load png image"); }

  // Load a JPEG image without providing additional parameters.
  const std::filesystem::path path_jpg{"hello.jpg"};
  const auto image_jpg = LoadImage(path_jpg);
  if (!image_jpg) { fmt::println("Failed to load jpg image"); }

  // Load a BLAH image without providing additional parameters.
  const std::filesystem::path path_blah{"hello.blah"};
  const auto image_blah = LoadImage(path_blah);
  if (!image_blah) { fmt::println("Failed to load BLAH image"); }
}
```

While this is a fine solution to use during our own development process it is less ideal if we want to write a library and provide it to the outside users. If we provide a compiled library to our users they will only have access to the declaration of our function:
```cpp
std::optional<Image> LoadImage(const std::filesystem::path& path);
```
Making it impossible to change the logic within this function to support the new kind of images. This is not great.

## Invert the dependencies
Right now, `LoadImage` function depends on `LoadJpegImage` and on `LoadPngImage` functions. This is what makes it hard for the user to quickly add a support for their own type - if they add a new dependency `LoadBlahImage` to the `LoadImage` function, the latter must be recompiled.

We've already encountered a solution to this problem during this course and the technique is called the "dependency inversion". Instead of passing the concrete implementations, we can pass polymorphic objects that conform to a selected interface. So we can create such an interface and change our loading functions into `virtual` class methods that override this interface:
```cpp
struct NonCopyableNonMoveable {
    NonCopyableNonMoveable() = default;
    NonCopyableNonMoveable(const NonCopyableNonMoveable&) = delete;
    NonCopyableNonMoveable(NonCopyableNonMoveable&&) = delete;
    NonCopyableNonMoveable& operator=(const NonCopyableNonMoveable&) = delete;
    NonCopyableNonMoveable& operator=(NonCopyableNonMoveable&&) = delete;
    ~NonCopyableNonMoveable() = default;
};

struct ImageLoaderInterface: public NonCopyableNonMoveable {
  virtual std::optional<Image> LoadImage(const std::filesystem::path& path) const = 0;
  virtual ~ImageLoaderInterface() = default;
};

struct PngImageLoader : public ImageLoaderInterface {
  std::optional<Image> LoadImage(const std::filesystem::path& path) const override {
    std::cout << "Loading PNG image." << std::endl;
    // Irrelevant here logic for actually loading the image.
    return Image{};
  }
};

struct JpegImageLoader : public ImageLoaderInterface {
  std::optional<Image> LoadImage(const std::filesystem::path& path) const override {
    std::cout << "Loading JPEG image." << std::endl;
    // Irrelevant here logic for actually loading the image.
    return Image{};
  }
};
```
This allows us to change the `LoadImage` function by adding the image loader reference as another input parameter and use it to load the image:
```cpp
std::optional<Image> LoadImage(const std::filesystem::path& path, const ImageLoaderInterface& image_loader) {
  return image_loader->LoadImage(path);
}

int main() {
  // Load a PNG image.
  const auto image_png = LoadImage(std::filesystem::path{"hello.png"}, PngImageLoader{});
  if (!image_png) { fmt::println("Failed to load a PNG image"); }

  // Load a PNG image.
  const auto image_jpeg = LoadImage(std::filesystem::path{"hello.png"}, JpegImageLoader{});
  if (!image_jpeg) { fmt::println("Failed to load a JPEG image"); }
}
```

Note that now the `LoadImage` function does not depend on anything apart from the `ImageLoaderInterface` class. Furthermore, the actual loaders `JpegImageLoader` and `PngImageLoader` also depend on this interface. This is why the dependencies are inverted.
<!-- TODO: show how the dependencies are actually inverted with an image -->

Now if the user wants to load a BLAH image, they can easily do this by providing their own loader:
```cpp
struct BlahImageLoader : public ImageLoaderInterface {
  std::optional<Image> LoadImage(const std::filesystem::path& path) const override {
    std::cout << "Loading BLAH image." << std::endl;
    return Image{};
  }
};

int main() {
  // Load a BLAH image.
  const auto image_blah = LoadImage(std::filesystem::path{"hello.blah"}, BlahImageLoader{});
  if (!image_blah) { fmt::println("Failed to load a BLAH image"); }
}
```

But we also introduced some quite horrible usability degradation. Now it falls on the shoulders of the user to pick the right loader for a right image extension. This is far from ideal.

To avoid this we must make sure that the default interface of the `LoadImage` function stays exactly the same as before with no additional parameters required.

There are multiple ways to achieve this, so I'll pick the first one that comes to my mind. We can extend the `ImageLoaderInterface` with another function: `MatchesExtension` and override it for the concrete loaders:
```cpp
struct ImageLoaderInterface: public NonCopyableNonMoveable {
  virtual std::optional<Image> LoadImage(const std::filesystem::path& path) const = 0;
  virtual bool MatchesExtension(const std::string& extension) const = 0;
  virtual ~ImageLoaderInterface() = default;
};

struct PngImageLoader : public ImageLoaderInterface {
  std::optional<Image> LoadImage(const std::filesystem::path& path) const override {
    std::cout << "Loading PNG image." << std::endl;
    // Irrelevant here logic for actually loading the image.
    return Image{};
  }
  bool MatchesExtension(const std::string& extension) const override {
    return extension == ".png";
  }

};

struct JpegImageLoader : public ImageLoaderInterface {
  std::optional<Image> LoadImage(const std::filesystem::path& path) const override {
    std::cout << "Loading JPEG image." << std::endl;
    // Irrelevant here logic for actually loading the image.
    return Image{};
  }
  bool MatchesExtension(const std::string& extension) const override {
    return (extension == ".jpg") || (extension == ".jpeg");
  }
};
```
Then we can update the `LoadImage` function to accept a vector of possible loaders and an overload of this function that takes only the path and uses a default list of image loaders:
```cpp
std::optional<Image> LoadImage(const std::filesystem::path& path, const std::vector<std::unique_ptr<const ImageLoaderInterface>>& image_loaders) {
  for (const auto& image_loader : image_loaders) {
    if (image_loader->MatchesExtension(path.extension())) {
      return image_loader->LoadImage(path);
    }
  }
  return {};
}

std::optional<Image> LoadImage(const std::filesystem::path& path) {
  return LoadImage(path, {std::make_unique<JpegImageLoader>(), std::make_unique<PngImageLoader>()});
}
```

With these changes we achiever everything that we wanted to: by default the user is able to load any of the default image types that we designed our library for, namely JPEG and PNG images.
```cpp
int main() {
  // Load a PNG image.
  const auto image_png = LoadImage(std::filesystem::path{"hello.png"});
  if (!image_png) { fmt::println("Failed to load a PNG image"); }

  // Load a PNG image.
  const auto image_jpeg = LoadImage(std::filesystem::path{"hello.png"});
  if (!image_jpeg) { fmt::println("Failed to load a JPEG image"); }
}
```

The user also can now extend the functionality if they want to by providing their own loader:
```cpp

struct BlahImageLoader : public ImageLoaderInterface {
  std::optional<Image> LoadImage(const std::filesystem::path& path) const override {
    std::cout << "Loading BLAH image." << std::endl;
    // Irrelevant here logic for actually loading the image.
    return Image{};
  }
  bool MatchesExtension(const std::string& extension) const override {
    return extension == ".blah";
  }
};

int main() {
  const auto image_blah = LoadImage(std::filesystem::path{"hello.blah"}, {std::make_unique<BlahImageLoader>()});
  if (!image_blah) { fmt::println("Failed to load a BLAH image"); }
}
```

## We can use templates to achieve the same
The method above uses dynamic polymorphism to achieve what it does. That means that the type conversion and selection of the run path is happening at runtime. One alternative way to address the same problem is to use static polymorphism instead by using templates.

The logic stays largely the same, starting from the initial solution we must invert the dependencies to make sure that the user is able to supply their own implementation of an image loader as a parameter.

The main difference to the dynamic polymorphism way is that with templates our interface is not outlined explicitly. In C++20 we can use concepts that allows us to outline an interface explicitly again but in a very different way.

We'll start with templates to make sure that we can compile the code with C++17 and afterwards will look at what changes if we switch to concepts.
