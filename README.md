# Check Updates of NPM Packages

Visual Studio Code extensions that checks if all packages in `dependencies` and `devDependencies` sections of your `package.json` files are up to date. The extension makes this check in background and shows notifications if updates are required.

## Features

The extension is activated every time you open workspace folder containing `package.json` file. Also you can run it at any moment using keyboard shortcut.

## Keyboard Shortcuts

The extension registers keyboard shortcut `checkNpmUpdates.checkUpdates` to execute checking immediately. Default shortcut is `Shift-Ctrl-C` (`Shift-Cmd-C` for Mac).

## Issues and Contributing

If you have found a bug or you want to suggest some improvements, create a pull request or an issue at [GitHub](https://github.com/yakimovim/vscode-check-npm-updates).

## Release Notes

### 1.0.0

The extension only checks presence `package.json` in the folder of workspace.

## Release Notes

This software is released under [MIT License](https://raw.githubusercontent.com/yakimovim/vscode-check-npm-updates/master/LICENSE)