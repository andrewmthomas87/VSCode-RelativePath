// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var path = require('path');
var Glob = require('glob').Glob;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('The extension "RelativePath" is now active!');
    var workspacePath = vscode.workspace.rootPath.replace(/\\/g, "/");
    var configuration = vscode.workspace.getConfiguration("relativePath");
    var editor = vscode.window.activeTextEditor;
    var emptyItem = { label: "", description: "No files found" };
    var items = null;
    var myGlob = null;
    var paused = false;
    function myActivate() {
        // Show loading info box
        var info = vscode.window.showQuickPick([emptyItem], { matchOnDescription: false, placeHolder: "Finding files... Please wait. (Press escape to cancel)" });
        info.then(function (value) {
            myGlob.pause();
            paused = true;
        }, function (rejected) {
            myGlob.pause();
            paused = true;
        });
        //Search for files
        if (paused) {
            paused = false;
            myGlob.resume();
        }
        else {
            myGlob = new Glob(workspacePath + "/**/*.*", { ignore: configuration.get("ignore") }, function (err, files) {
                if (err) {
                    return;
                }
                items = files;
                vscode.commands.executeCommand('extension.relativePath');
            });
            myGlob.on("end", function () {
                paused = false;
            });
        }
    }
    // Initialize activation
    myActivate();
    // Watch for file system changes - as we're caching the searched files
    var watcher = vscode.workspace.createFileSystemWatcher("**/*.*");
    watcher.ignoreChangeEvents = true;
    // Add a file on creation
    watcher.onDidCreate(function (e) {
        items.push(e.fsPath.replace(/\\/g, "/"));
    });
    // Remove a file on deletion
    watcher.onDidDelete(function (e) {
        var item = e.fsPath.replace(/\\/g, "/");
        var index = items.indexOf(item);
        if (index > -1) {
            items.splice(index, 1);
        }
    });
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('extension.relativePath', function () {
        // The code you place here will be executed every time your command is executed
        // If there's no file opened	
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage("You need to have a file opened.");
            return; // No open text editor
        }
        // If we canceled the file search
        if (paused) {
            myActivate();
            return;
        }
        // If there are no items found
        if (!items) {
            return;
        }
        showQuickPick(items);
        // Show dropdown editor
        function showQuickPick(items) {
            if (items) {
                var paths = items.map(function (val) {
                    var item = { description: val.replace(workspacePath, ""), label: val.split("/").pop() };
                    return item;
                });
                var pickResult;
                pickResult = vscode.window.showQuickPick(paths, { matchOnDescription: true, placeHolder: "Filename" });
                pickResult.then(returnRelativeLink);
            }
            else {
                vscode.window.showInformationMessage("No files to show.");
            }
        }
        // Get the picked item
        function returnRelativeLink(item) {
            if (item) {
                var targetPath = item.description;
                var currentItemPath = editor.document.fileName.replace(/\\/g, "/").replace(workspacePath, "");
                var relativeUrl = path.relative(currentItemPath, targetPath).replace(".", "").replace(/\\/g, "/");
                relativeUrl = relativeUrl.replace('./../', '../')
                console.log(configuration.get("resolveExtensions"))
                var matchingExtension = configuration.get("resolveExtensions").filter(function(extension) {
                    console.log(extension, relativeUrl.indexOf(extension, relativeUrl.length - extension.length) > -1)
                    return relativeUrl.indexOf(extension, relativeUrl.length - extension.length) > -1
                }).reduce(function(previous, current) {
                    return previous.length > current.length ? previous : current
                }, '')
                if (matchingExtension) {
                    relativeUrl = relativeUrl.substr(0, relativeUrl.length - matchingExtension.length)
                }
                vscode.window.activeTextEditor.edit(function (editBuilder) {
                    var position = vscode.window.activeTextEditor.selection.end;
                    editBuilder.insert(position, relativeUrl);
                });
            }
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map