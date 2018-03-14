# jscpd-vscode

VSCode extension for the copy/paste detector [jscpd](https://github.com/kucherenko/jscpd)

Detects code duplication in a project.

![Image of jscpd](https://github.com/paulhoughton/vscode-jscpd/raw/master/images/demo.gif)

## Extension Settings

This extension contributes the following settings:

* `jscpd.exclude`: Files to ignore
* `jscpd.files`: glob pattern for find code
* `jscpd.languagesExts`: list of languages with file extensions
* `jscpd.skipComments`: skip comments in code
* `jscpd.minLines`: min size of duplication in code lines
* `jscpd.minTokens`: min size of duplication in code tokens
