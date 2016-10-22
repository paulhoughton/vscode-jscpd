module.exports = function TextDocumentContentProvider() {
    let pathFormatter;
    let reportData;
    this.setData = (data) => reportData = data;
    this.setPathFormatter = (fn) => pathFormatter = fn;


    this.provideTextDocumentContent = function () {

        let rows = reportData.map(d =>
            `<a href='${encodeURI('command:jscpd.showLines?' + JSON.stringify(d))}'>
            ${pathFormatter(d.firstFile, d.firstFileStart, d.linesCount)}<br>
            ${pathFormatter(d.secondFile, d.secondFileStart, d.linesCount)}</a><br>`)

        return `
            <head>
            <style>
            a {
                color: #0072be 
            }
            </style>
            </head>

            <body>
                <h1>Copy/Paste Report</h1>
                ${rows.join("<br>")}
            </body>`;
    }
}