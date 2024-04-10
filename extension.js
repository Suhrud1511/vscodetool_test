const vscode = require('vscode');
const { spawn } = require('child_process');
const path = require('path');

async function removeOutliersAndSaveCleanedData(inputFile, outputDir) {
    try {
        const pythonScript = path.join(__dirname, 'model.py');
        const args = [inputFile, outputDir];
        const pythonProcess = spawn('python', [pythonScript, ...args]);

        let cleanedCsvPath = '';

        pythonProcess.stdout.on('data', (data) => {
            cleanedCsvPath += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python stderr: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                const cleanedDataPath = cleanedCsvPath.trim();
                console.log('Cleaned data saved successfully at:', cleanedDataPath);
                vscode.window.showInformationMessage('Cleaned data saved successfully at: ' + cleanedDataPath);
            } else {
                console.error(`Python process exited with code ${code}`);
                vscode.window.showErrorMessage('Python process exited with code ' + code);
            }
        });
    } catch (error) {
        console.error(error);
        vscode.window.showErrorMessage('Error occurred: ' + error);
    }
}

async function activate(context) {
    let disposable = vscode.commands.registerCommand('test.run', async () => {
        const inputFileUri = await vscode.window.showOpenDialog({
            canSelectFolders: false,
            canSelectMany: false,
            openLabel: 'Select CSV File',
            filters: {
                'CSV Files': ['csv']
            }
        });

        if (inputFileUri && inputFileUri.length > 0) {
            const inputFile = inputFileUri[0].fsPath;

            const outputDirUri = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                openLabel: 'Select Output Directory'
            });

            if (outputDirUri && outputDirUri.length > 0) {
                const outputDir = outputDirUri[0].fsPath;

                try {
                    await removeOutliersAndSaveCleanedData(inputFile, outputDir);
                } catch (error) {
                    console.error(error);
                    vscode.window.showErrorMessage('Error occurred: ' + error);
                }
            }
        }
    });

    context.subscriptions.push(disposable);
}

exports.activate = activate;

function deactivate() { }
exports.deactivate = deactivate;
