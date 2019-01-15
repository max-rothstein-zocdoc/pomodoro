const exec = require('child_process').exec;

exec(
    'echo "Hi there!"',
    (error, stdout, stderr) => {
        console.log(`${stdout}`);
        console.log(`${stderr}`);
        if (error !== null) {
            console.log(`exec error: ${error}`);
        }
    }
);
