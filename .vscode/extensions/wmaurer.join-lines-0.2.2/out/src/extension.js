"use strict";
const vscode = require('vscode');
const whitespaceAtEndOfLine = /\s*$/;
function activate(context) {
    const disposable = vscode.commands.registerTextEditorCommand('extension.join-lines', (textEditor, edit) => {
        const document = textEditor.document;
        const newSelections = [];
        textEditor.edit(editBuilder => {
            textEditor.selections
                .filter(selection => selection.end.line !== document.lineCount - 1)
                .forEach(selection => {
                if (isRangeSimplyCursorPosition(selection)) {
                    const newSelectionEnd = document.lineAt(selection.start.line).range.end.character - joinLineWithNext(selection.start.line, editBuilder, document).whitespaceLengthAtEnd;
                    newSelections.push({
                        numLinesRemoved: 1,
                        selection: new vscode.Selection(selection.start.line, newSelectionEnd, selection.end.line, newSelectionEnd)
                    });
                }
                else if (isRangeOnOneLine(selection)) {
                    joinLineWithNext(selection.start.line, editBuilder, document);
                    newSelections.push({ numLinesRemoved: 1, selection });
                }
                else {
                    const numberOfCharactersOnFirstLine = document.lineAt(selection.start.line).range.end.character;
                    let endCharacterOffset = 0;
                    for (let lineIndex = selection.start.line; lineIndex <= selection.end.line - 1; lineIndex++) {
                        const charactersInLine = lineIndex == selection.end.line - 1 ? selection.end.character + 1 : document.lineAt(lineIndex + 1).range.end.character + 1;
                        const whitespaceLengths = joinLineWithNext(lineIndex, editBuilder, document);
                        endCharacterOffset += charactersInLine - whitespaceLengths.whitespaceLengthAtEnd - whitespaceLengths.whitespaceLengthAtStart;
                    }
                    newSelections.push({
                        numLinesRemoved: selection.end.line - selection.start.line,
                        selection: new vscode.Selection(selection.start.line, selection.start.character, selection.start.line, numberOfCharactersOnFirstLine + endCharacterOffset)
                    });
                }
            });
        }).then(() => {
            const selections = newSelections.map((x, i) => {
                const { numLinesRemoved, selection } = x;
                const numPreviousLinesRemoved = i == 0 ? 0 : newSelections.slice(0, i).map(x => x.numLinesRemoved).reduce((a, b) => a + b);
                const newLineNumber = selection.start.line - numPreviousLinesRemoved;
                return new vscode.Selection(newLineNumber, selection.start.character, newLineNumber, selection.end.character);
            });
            if (selections.length > 0) {
                textEditor.selections = selections;
            }
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function isRangeOnOneLine(range) {
    return range.start.line === range.end.line;
}
function isRangeSimplyCursorPosition(range) {
    return isRangeOnOneLine(range) && range.start.character === range.end.character;
}
function joinLineWithNext(line, editBuilder, document) {
    const matchWhitespaceAtEnd = document.lineAt(line).text.match(whitespaceAtEndOfLine);
    const range = new vscode.Range(line, document.lineAt(line).range.end.character - matchWhitespaceAtEnd[0].length, line + 1, document.lineAt(line + 1).firstNonWhitespaceCharacterIndex);
    editBuilder.replace(range, ' ');
    return {
        whitespaceLengthAtEnd: matchWhitespaceAtEnd[0].length,
        whitespaceLengthAtStart: document.lineAt(line + 1).firstNonWhitespaceCharacterIndex
    };
}
//# sourceMappingURL=extension.js.map