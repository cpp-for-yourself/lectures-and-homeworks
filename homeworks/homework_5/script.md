# Video script
Hey everyone! In this video I want to introduce a project that we (and by "we" I mean "you") will implement to solidify everything that we've learned until this point.

Here is what it'll do. It will turn a normal picture, like this one, into its pixelated form, like that one.

And not only that, but it will also do all of this in the terminal!

<!-- Intro -->


Before we go into details, I hope that by now you know that you can find the full homework description below this video under a link to the course GitHub repository. I also provide an empty project skeleton with some boilerplate code for you to get started in an easier way.

Now, let's talk details, shall we?

In order to perform the pixelation we have to perform a number of actions.

1. First we have to load the image from disk. We do this using an external library `stb`, or, more concretely a couple of functions from its header `stb_image.h`. In order to use this library, you will have to add it as a submodule. We already talked about submodules before, but I also provide the necessary command in the homework description file I mentioned before.
2. Unfortunately, `stb` is a C library, so memory management is not its strongest side. That means we have to store the data that the `stb` library gave us in a safe way. How lucky for us that we learned about raw pointers and proper move semantics already! So we can implement a class, say `StbImageDataView` that will manage the memory allocated by the `stb` library for us! We should be able to move the objects of this class around and they should free the memory upon destruction. Again, I have an example to ease your way into this in the homework description.
3. Eventually, we will also need a way to manipulate the colors in an image, so we will implement a class `Image` that will allow us to directly access and manipulate the RGB pixels in it. We can represent the colors as a vector of `ftxui::Color` which comes from an awesome library FTXUI, which we will also have to add as a submodule to our code. Once again, I provide an example of how this library can be used in the project skeleton.
4. At this point we should be ready to implement the `PixelateImage` function that would take our `StbImageDataView`, pixelate it and return it as and `Image` instance. This is the most algorithmically intense part of the project but fear not, I'm sure you can manage!
5. Finally, once we have the pixelated image at hand, we would like to show it in the terminal. We will again use the FTXUI library for that. The way we can do it is we wrap the `ftxui::Screen` instance into a class `Drawer`, that takes an `Image` instance and can `Draw()` it to the terminal. And, you guessed it, you'll find an example to guide you through this in the project skeleton.

Oh, and of course we have to test all of this, so we add Googletest as a submodule to the project, write tests for all of the stuff I just talked about and test away!

And that's it! That's all the functionality that you have to implement here. Now, I know it sounds like a lot and, if I'm honest, it might be. But it is still a good project to take on in order to get comfortable with coding in C++.

Once again, all the needed details are in the repo linked in the description below.

And at this, I wish you good luck, have lots of fun implementing it and _do_ take your time on this project. It sure took me a long time to prepare everything. It probably will take you multiple hours (or maybe even days) but there are no shortcuts in learning! If something is really confusing, do start a discussion in the GitHub organization linked under the video.

Thanks again for watching and have fun implementing it all! And if you want a refresher on the move semantics or testing your code, do click on the thumbnails that have just appeared on your screen!
