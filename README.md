## Relative path support for Visual Studio Code
Now you can get the relative path to any file in the workspace.

Just press `Ctrl+Shift+H` (Mac: `Cmd+Shift+H`) and select a file.
Alternatively, you can press open command palette `F1` and search for `Relative Path`.

## How to use
Clone this repo into your VSCode extensions directory (`~/.vscode/extensions`).

## Important
Your workspace may be really big, so please wait for the initial file list to be created. This will happen only once.

## Options
The following Visual Studio Code settings are available for the RelativePath extension. They can be set in user preferences (`ctrl+,` or `cmd+,`) or workspace settings (.vscode/settings.json).

	{
		"relativePath.ignore": ["**/node_modules/**","**/*.dll"],
		"relativePath.resolveExtensions": [".ts", ".tsx"]
	}

