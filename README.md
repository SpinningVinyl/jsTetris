# A simple Tetris clone written in JavaScript

![Screenshot](hero.png)

A very simple Tetris clone written in JavaScript using my [SquareGrid.js](https://github.com/SpinningVinyl/SquareGrid.js) library.

## Features

This started as a very simple Tetris clone (in order to learn basics of JavaScript) but has evolved quite a bit. Currently it has the following features:

- 7-bag randomiser that limits a drought to at most 12 pieces (this means that there will be max 12 pieces between two of the same kind).
- Rotation with horizontal wall kicks, allowing pieces to rotate in some constrained positions.
- Levels advance based on total rows cleared, while progressive scoring system rewards clearing multiple rows at once.

These features make gameplay quite pleasant, even if I do say so myself.

## Cloning

This repository uses a Git submodule for SquareGrid.js. Clone it together with its submodule by running:

```sh
git clone --recurse-submodules https://github.com/SpinningVinyl/jsTetris.git
cd jsTetris
```

If you have already cloned the repository without its submodule, initialize it with:

```sh
git submodule update --init --recursive
```

## License

The project is licensed under the terms of the MIT License. See LICENSE for details.
