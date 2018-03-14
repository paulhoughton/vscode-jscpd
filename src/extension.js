const vscode = require('vscode');
const jscpd = require('jscpd');
const path = require('path');

const showLines = require('./showLines');
const reportProvider = require('./reportProvider');

function activate(context) {
  const jscpd_inst = new jscpd();
  const jscpdSchema = 'jscpd';

  let provider = new reportProvider();
  let registration = vscode.workspace.registerTextDocumentContentProvider(
    jscpdSchema,
    provider
  );

  let disposableShowLines = vscode.commands.registerCommand(
    'jscpd.showLines',
    showLines
  );

  let disposable = vscode.commands.registerCommand('extension.jscpd', function(
    explorer
  ) {
    const currentPath =
      (explorer && path.dirname(explorer._fsPath)) || vscode.workspace.rootPath;

    const exclude = vscode.workspace.getConfiguration('jscpd').get('exclude');
    const files = vscode.workspace.getConfiguration('jscpd').get('files');
    const minLines = vscode.workspace.getConfiguration('jscpd').get('minLines');
    const minTokens = vscode.workspace
      .getConfiguration('jscpd')
      .get('minTokens');
    const skipComments = vscode.workspace
      .getConfiguration('jscpd')
      .get('skipComments');
    const languagesExts = vscode.workspace
      .getConfiguration('jscpd')
      .get('languagesExts');
    const languages =
      vscode.workspace.getConfiguration('jscpd').get('languages') || '';

    let config = {
      reporter: 'json',
      path: currentPath,
      exclude,
      'min-lines': minLines,
      'min-tokens': minTokens
    };

    if (files) config['files'] = files;
    if (skipComments) config['skip-comments'] = skipComments;
    if (languages) config['languages'] = languages;
    if (languagesExts) config['languages-ext'] = languagesExts;

    const output = jscpd_inst.run(config);

    if (output.report.statistics.clones === 0) {
      vscode.window.showInformationMessage(
        `0 duplicated lines out of ${
          output.report.statistics.lines
        } total lines of code.`
      );
      return;
    }
    const formatName = format(currentPath);

    let quickPickList = output.map.clones.map(data => ({
      label:
        formatName(data.firstFile, data.firstFileStart, data.linesCount) +
        ' <-> ' +
        formatName(data.secondFile, data.secondFileStart, data.linesCount),
      data
    }));

    const { percentage, duplications, lines } = output.report.statistics;

    quickPickList.unshift({
      label: '',
      description: `${percentage}% (${duplications} lines) duplicated lines out of ${lines} total lines of code`,
      data: 'REPORT'
    });

    vscode.window.showQuickPick(quickPickList).then(({ data }) => {
      if (data === 'REPORT') {
        provider.setPathFormatter(formatName);
        provider.setData(output.map.clones);
        var previewUri = vscode.Uri.parse(
          jscpdSchema +
            '://authority/jscpd?x=' +
            new Date().getTime().toString()
        );
        vscode.commands
          .executeCommand(
            'vscode.previewHtml',
            previewUri,
            vscode.ViewColumn.One,
            'JSCPD'
          )
          .then(
            () => {},
            error => {
              vscode.window.showErrorMessage(error);
            }
          );
      } else {
        vscode.commands.executeCommand('jscpd.showLines', data);
      }
    });
  });

  context.subscriptions.push(disposable, disposableShowLines, registration);
}

const format = currentPath => (file, start, count) => {
  const stripProject = path => path.replace(currentPath + '\\', '');

  return stripProject(file, currentPath) + ':' + start + '-' + (start + count);
};
function deactivate() {}
exports.activate = activate;
exports.deactivate = deactivate;
