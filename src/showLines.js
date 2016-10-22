const vscode = require('vscode');
const path = require('path');

const createRange = (start, count) => new vscode.Range(start - 1, 0, start + count, 0);

const decType = vscode.window.createTextEditorDecorationType({
    backgroundColor: "rgba(255,0,0,0.3)"
});

module.exports = function showLines(data) {
    vscode.workspace.openTextDocument(data.firstFile).then(doc =>
        vscode.window.showTextDocument(doc, vscode.ViewColumn.One)
    ).then(doc => {
        const range = createRange(data.firstFileStart, data.linesCount)
        doc.setDecorations(decType, [{ range, hoverMessage: "Matches " + path.basename(data.secondFile) + ":" + data.secondFileStart }]);
        doc.revealRange(range);
    })

    vscode.workspace.openTextDocument(data.secondFile).then(doc =>
        vscode.window.showTextDocument(doc, vscode.ViewColumn.Two)
    ).then(doc => {
        const range = createRange(data.secondFileStart, data.linesCount)
        doc.setDecorations(decType, [{ range, hoverMessage: "Matches " + path.basename(data.firstFile) + ":" + data.firstFileStart }]);
        doc.revealRange(range);
    });
}
