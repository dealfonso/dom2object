# JS Library template

This is a template repository to create JavaScript Libraries intended to be redistributed in a single file.

## Usage

1. Clone this repository (or create a new one from this template)
    ```bash
    $ git clone https://github.com/dealfonso/jslibrary.git
    $ cd jslibrary
    ```

2. Adapt the license notice files to your needs:

    - `notice` contains the license notice to be included in the header of the generated files in full format.
    - `notice.min` contains the license notice to be included in the header of the minified files.

3. Install dependencies

    This package depends on `make`, `uglify-js` and `js-beautify`. Install them using your package manager.

    e.g. on Debian/Ubuntu:

    ```bash
    $ apt install make
    $ npm install uglify-js js-beautify
    ```

4. Develop your library under `src` folder.

    > Please make sure that the order of the files in the `src` folder is the order you want them to be concatenated. E.g. use a prefix like `01-`, `02-`, etc.

5. Build your library

    ```bash
    $ make
    ```

## Result

The result of the build process will be a set of files under the `dist` folder.

- `dist/<library-name>.raw.js`: Concatenated and beautified version of your library (still contains comments).
- `dist/<library-name>.full.js`: The same as `dist/<library-name>.raw.js` but with an envelope of `((window, document) => { ... })(window, document);` to avoid polluting the global namespace, with the comments removed.
- `dist/<library-name>.js`: The same as `dist/<library-name>.full.js` but removing unnecessary spaces and line breaks.
- `dist/<library-name>.min.js`: The same as `dist/<library-name>.js` but minified.
- `dist/<library-name>.compress.js`: The same as `dist/<library-name>.min.js` but compressed.

> The name of the library is taken from the variable `LIBRARY_NAME` either from the env or defined in the `Makefile`. If the variable is not defined, the name of the library will fallback to the current folder name.

## Distributing

You can distribute your library by copying the files under the `dist` folder.

If you are using GitHub, you can also distribute it using jsDelivr. To do so, you need to create a new release and upload the files under the `dist` folder as assets. Then you can use the following URL to access the files:

```
https://cdn.jsdelivr.net/gh/<user>/<repo>@<version>/dist/<library-name>.js
```

E.g. for this repository:

```
https://cdn.jsdelivr.net/gh/dealfonso/jslibrary@main/dist/jslibrary.js
```