# Simple Font Renderer

A lightweight bitmap font renderer designed for embedded and other resource-constrained applications. A converter is included to transform the [BMFont](https://www.angelcode.com/products/bmfont/) outputs into C files. Note that Simple Font Renderer is not a library; it is intended as a starting point and should be modified to fit your use case.

## Features

- Supports variable-width fonts with a configurable bit depth of 1, 2, 4, or 8 bits per pixel.
- Storage space is reduced by removing duplicated glyph data.
- Fonts are stored as regular C files, ensuring compatibility with most compilers.
- Efficient renderer requiring no additional libraries in most scenarios. The provided example implementation uses [SDL2](https://www.libsdl.org/) for rendering.

## Limitations

- No support for multi-line text. Multi-line rendering can be implemented using `text_measure` and `text_render` if required.
- To simplify rendering and minimize data size, kerning pairs are not supported.
- By default, only printable ASCII characters are rendered.

## Converting Fonts

Ensure a recent version of [Node.js](https://nodejs.org/) and [NPM](https://www.npmjs.com/) is installed. Install dependencies by entering the converter directory and running `npm install`. Font descriptors should be exported from BMFont in the text format, while textures should use the PNG format. To convert a font to a C file, run:

	npm run convert <input> <bit depth> <destination>

The input should be a path to a font descriptor exported from BMFont. For optimal results, disable font smoothing within BMFont when using a bit depth of 1.

## Rendering Text

The example renderer uses SDL2. Ensure it is installed before continuing. Once a font has been converted and placed in the renderer directory, build the renderer by running `make` from within the renderer directory.

## License

The converter uses the [GPL-3.0 licence](https://opensource.org/license/gpl-3-0). The renderer uses the [MIT license](https://opensource.org/license/mit).
