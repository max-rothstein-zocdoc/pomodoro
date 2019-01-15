#!/usr/bin/env node
const exec = require('child_process').exec;
const readline = require('readline');
const colors = require('colors');
const moment = require('moment');
const tab = `[-----]`;

let prevtimestamp;
require('log-timestamp')(() => {
    const timestamp = moment().format('HH:mm');
    if (prevtimestamp && prevtimestamp === timestamp) {
        return tab;
    }
    prevtimestamp = timestamp;
    return `[${timestamp}]`;
});

// Constants
const DEBUG = false;
const ONE_MIN = 60 * 1000;
const TWENTY_FIVE_MIN = 25 * ONE_MIN;
const FIVE_MIN = 5 * ONE_MIN;
const TEN_SEC = 10 * 1000;

colors.setTheme({
    info: 'green',
    calm: 'cyan'
});


const displayNotification = (title, message, stopRecurse) => {
    const osaCommand = `display notification "${message}" with title "${title}"`;
    const command = `osascript -e '${osaCommand}'`;
    exec(
        command,
        (error, stdout) => {
            stdout && print(`${stdout}`);
            if (error) {
                if (!stopRecurse) {
                  displayNotification('Pomodoro', 'We are going down!', true);
                }
                throw error;
            }
        }
    );
};

const clearScreen = async () => {
    return new Promise(resolve => {
        exec(
            'clear',
            (error, stdout) => {
                stdout && print(`${stdout}`);
                if (error) {
                    throw error;
                }
                resolve();
            }
        );
    }).then(() => {
        prevtimestamp = null;
    });
};

const exit = () => {
    print('Sauce, out.');
    process.exit(0);
};

const init = () => {
    DEBUG && displayNotification('Pomodoro', 'sup');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'pomodoro> '
    });
    
    rl.on('close', exit);

    return rl;
};

const rl = init();

const questionAsync = message => {
    return new Promise(resolve => {
        rl.question(`${tab} ${message}`, answer => {
            resolve(answer);
        });
    });
};

let pomodoroCount = 0;

const sleep = async timeInMs => {
    return new Promise(resolve => {
        setTimeout(resolve, timeInMs);
    })
};

const print = (...args) => {
    console.log(...args);
};

const run = async () => {
    await sleep(200);
    await clearScreen();

    const goal = await questionAsync('Set a goal: ');
    await sleep(100);
    await clearScreen();
    print(`Thanks, your goal has been set to`)
    print(`  ${goal}`.info);
    await sleep(100);
    print(`Beginning your 25 minute ${'pomodoro'.red} now.`);
    print('...');
    await sleep(DEBUG ? TEN_SEC : TWENTY_FIVE_MIN);
    displayNotification('Pomodoro Complete', goal);
    print(`Well done! You've completed a ${'pomodoro'.red}.`)
    await sleep(1000);
    pomodoroCount = pomodoroCount + 1;
    if (pomodoroCount === 4) {
        pomodoroCount = 0;
        print(`It looks like you've complete four pomodoros in a row.`.calm)
        print(`Give your brain an extended break.`.calm);
        const breakDuration = await questionAsync(`Enter your duration (in minutes): `);
        print(`Thanks. Beginning ${breakDuration} minute break.`)
        print('...');
        await sleep(breakDuration * ONE_MIN);
    } else {
        print(`It's time for a short break.`.calm)
        const breakDuration = await questionAsync(`Enter length (defaults to 5 min): `.calm);
        print('Beginning break.');
        print('...');
        const timeout = breakDuration ? breakDuration * ONE_MIN : FIVE_MIN;
        await sleep(timeout)
    }
    displayNotification('Break Complete');
    print(`Your break is over. Time for another pomodoro.`);
    await questionAsync(`Click enter to continue. `);
    await sleep(1000);

    run();
};

run();
