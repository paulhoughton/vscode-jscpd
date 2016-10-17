let vscode = require('vscode');
let jscpd = require('jscpd');
let path = require('path');

function activate(context) {

    const jscpd_inst = new jscpd();

    let disposable = vscode.commands.registerCommand('extension.jscpd', function (explorer) {

        const decType = vscode.window.createTextEditorDecorationType({
            backgroundColor: "rgba(255,0,0,0.3)"
        });

        const output = jscpd_inst.run({
            reporter: "json",
            path: ((explorer && path.dirname(explorer._fsPath)) || vscode.workspace.rootPath),
            exclude: vscode.workspace.getConfiguration('jscpd').get('exclude'),
            'min-lines': vscode.workspace.getConfiguration('jscpd').get('minLines'),
            'min-tokens': vscode.workspace.getConfiguration('jscpd').get('minTokens')
        })

        if (output.report.statistics.clones===0) {
             vscode.window.showInformationMessage(`0 duplicated lines out of ${output.report.statistics.lines} total lines of code.`);
             return;
        } 

        let quickPickList = output.map.clones.map(data => ({
            label: formatName(data.firstFile,  data.firstFileStart, data.linesCount) + " <-> " + formatName(data.secondFile,  data.secondFileStart, data.linesCount),
            data
            })
        );

        const {percentage, duplications, lines} = output.report.statistics;

        quickPickList.unshift({
            label: "",
            description:`${percentage}% (${duplications} lines) duplicated lines out of ${lines} total lines of code`,
            data:""});

        vscode.window.showQuickPick(quickPickList).then(({data}) => {
            vscode.workspace.openTextDocument(data.firstFile).then(doc => 
                vscode.window.showTextDocument(doc, vscode.ViewColumn.One)
            ).then(doc => {
                const range = createRange(data.firstFileStart, data.linesCount)
                doc.setDecorations(decType, [{ range, hoverMessage: "Matches line " + data.secondFileStart }]);
                doc.revealRange(range);
            })

            vscode.workspace.openTextDocument(data.secondFile).then(doc =>
                vscode.window.showTextDocument(doc, vscode.ViewColumn.Two)
            ).then(doc => {
                const range = createRange(data.secondFileStart, data.linesCount)
                doc.setDecorations(decType, [{ range, hoverMessage: "Matches line " + data.firstFileStart }]);
                doc.revealRange(range);
            });
        });
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;
function createRange(start, count) {
    return new vscode.Range(start - 1, 0, start +   count, 0)
}
function stripProject(path){
    return path.replace(vscode.workspace.rootPath + "\\", "")
}
function formatName (file, start, count) {
    return stripProject(file) + ":" + start + "-" + (start + count);
}
function deactivate() {
}
exports.deactivate = deactivate;