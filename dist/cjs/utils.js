"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectToolKit = exports.objectCopy = exports.stripNullish = void 0;
const descriptor_js_1 = require("./descriptor.js");
const util_1 = require("util");
function stripNullish(object) {
    if (typeof object !== 'object')
        return object;
    for (const key of Reflect.ownKeys(object)) {
        if (object[key] === null || object[key] === undefined)
            delete object[key];
    }
    return object;
}
exports.stripNullish = stripNullish;
function objectCopy(to, ...from) {
    const output = {};
    for (const object of from) {
        if (!object || (typeof object !== 'object'))
            continue;
        const descriptors = descriptor_js_1.Descriptor.descriptorsFor(object, null, true);
        for (const [key, _descriptor] of descriptors) {
            const descriptor = new descriptor_js_1.Descriptor(_descriptor);
            if (descriptor.isDataType && descriptor.hasValue) {
                const value = _descriptor.value;
                const rawType = /(\w+)]/.exec(Object.prototype.toString.call(value))[1];
                if (typeof value === 'object' && rawType === Object.name) {
                    const newValue = objectCopy({}, value);
                    Object.defineProperty(output, key, {
                        ..._descriptor,
                        value: newValue
                    });
                    continue;
                }
            }
            Object.defineProperty(output, key, _descriptor);
        }
    }
    return output;
}
exports.objectCopy = objectCopy;
function inspectToolKit(depth = 10, opts = { colors: true }, inspect = util_1.inspect) {
    const csi = s => opts.colors ? `${s}` : '';
    const toggle = ([on, off], s) => {
        return `${csi(`\x1b[${on}m`)}${s}${csi(`\x1b[${off}m`)}`;
    };
    const killCruft = s => (s
        .replace(/^[\[\{] /g, '')
        .replace(/ [\]\}]$/, '')
        .replace(/'/g, ''));
    const codes = new Map([
        ['bold', [1, 22]],
        ['underlined', [4, 24]],
        ['italics', [3, 23]],
        ['blinking', [5, 25]],
        ['reversed', [6, 26]],
        ['strikethru', [9, 29]],
        ['reset', [0, 0]],
        // items starting with lowercase letters are normal brightness
        // items starting with uppercase letters are double brightness
        ['black', [30, 39]], ['Black', [90, 39]],
        ['red', [31, 39]], ['Red', [91, 39]],
        ['green', [32, 39]], ['Green', [92, 39]],
        ['yellow', [33, 39]], ['Yellow', [93, 39]],
        ['blue', [34, 39]], ['Blue', [94, 39]],
        ['magenta', [35, 39]], ['Magenta', [95, 39]],
        ['cyan', [36, 39]], ['Cyan', [96, 39]],
        ['white', [37, 39]], ['White', [97, 39]],
        // items starting with an underscore indicate background colors
        // rather than foreground colors. case implications are here too
        ['_black', [40, 49]], ['_Black', [100, 49]],
        ['_red', [41, 49]], ['_Red', [101, 49]],
        ['_green', [42, 49]], ['_Green', [102, 49]],
        ['_yellow', [43, 49]], ['_Yellow', [103, 49]],
        ['_blue', [44, 49]], ['_Blue', [104, 49]],
        ['_magenta', [45, 49]], ['_Magenta', [105, 49]],
        ['_cyan', [46, 49]], ['_Cyan', [106, 49]],
        ['_white', [47, 49]], ['_White', [107, 49]],
    ]);
    const cursor = (cmd, count = 0) => {
        switch (cmd.toLowerCase()) {
            // moves cursor up # lines
            case 'u':
            case 'up': return `\x1b[${count}A`;
            // moves cursor down # lines
            case 'd':
            case 'down': return `\x1b[${count}B`;
            // moves cursor right # columns
            case 'r':
            case 'right': return `\x1b[${count}C`;
            // moves cursor left # columns
            case 'l':
            case 'left': return `\x1b[${count}D`;
            // moves cursor to beginning of next line, # lines down
            case '<d':
            case '<down': return `\x1b[${count}E`;
            // moves cursor to beginning of previous line, # lines up
            case '<u':
            case '<up': return `\x1b[${count}F`;
            // moves cursor to column #
            case 'col': return `\x1b[${count}G`;
            // moves cursor one line up, scrolling if needed
            case 'scr/up': return `\x1bM`;
            // save cursor position (DEC)
            case 'save/dec': return `\x1b7`;
            // restores the cursor to the last saved position (DEC)
            case 'load/dec': return `\x1b8`;
            // save cursor position (SCO)
            case 'save': return `\x1b[s`;
            // restores the cursor to the last saved position (SCO)
            case 'load': return `\x1b[u`;
            // make cursor invisible
            case 'hide': return `\x1b[?25l`;
            // make cursor visible
            case 'show': return `\x1b[?25h`;
            default: return '';
        }
    };
    const cmd = (code) => {
        switch (code.toLowerCase()) {
            // save screen
            case 'save/scr': return `\x1b[?47h`;
            // resore scree
            case 'load/scr': return `\x1b[?47l`;
            // enables the alternative buffer
            case 'altbuf/on': return `\x1b[?1049h`;
            // disables the alternative buffer
            case 'altbuf/off': return `\x1b[?1049l`;
            default: return '';
        }
    };
    const eightBit = ([foreground, background] = [], s) => {
        const on = (background
            ? `38;5;${foreground};48;5;${background}`
            : `38;5;${foreground}`);
        const off = (background
            ? `39;49`
            : `39`);
        return toggle([on, off], s);
    };
    const twentyFour = ([fRed, fGreen, fBlue, bRed, bGreen, bBlue] = [], s) => {
        const defd = v => typeof v !== 'undefined';
        const background = (defd(bRed) && defd(bGreen) && defd(bBlue));
        const on = (background
            ? `38;2;${fRed};${fGreen};${fBlue};48;2;${bRed};${bGreen};${bBlue}`
            : `38;2;${fRed};${fGreen};${fBlue}`);
        const off = (background
            ? `39;49`
            : `39`);
        return toggle([on, off], s);
    };
    return {
        run: (code, count = 0) => console.log(`${cursor(code, count)}${cmd(code)}`),
        cursor,
        cmd,
        slim: s => killCruft(s),
        toggle,
        reset: s => toggle(codes.get('reset'), s),
        bold: s => toggle(codes.get('bold'), s),
        underlined: s => toggle(codes.get('underlined'), s),
        italics: s => toggle(codes.get('italics'), s),
        blinking: s => toggle(codes.get('blinking'), s),
        reversed: s => toggle(codes.get('reversed'), s),
        strikethru: s => toggle(codes.get('strikethru'), s),
        black: s => toggle(codes.get('black'), s),
        red: s => toggle(codes.get('red'), s),
        green: s => toggle(codes.get('green'), s),
        yellow: s => toggle(codes.get('yellow'), s),
        blue: s => toggle(codes.get('blue'), s),
        magenta: s => toggle(codes.get('magenta'), s),
        cyan: s => toggle(codes.get('cyan'), s),
        white: s => toggle(codes.get('white'), s),
        Black: s => toggle(codes.get('Black'), s),
        Red: s => toggle(codes.get('Red'), s),
        Green: s => toggle(codes.get('Green'), s),
        Yellow: s => toggle(codes.get('Yellow'), s),
        Blue: s => toggle(codes.get('Blue'), s),
        Magenta: s => toggle(codes.get('Magenta'), s),
        Cyan: s => toggle(codes.get('Cyan'), s),
        White: s => toggle(codes.get('White'), s),
        _black: s => toggle(codes.get('_black'), s),
        _red: s => toggle(codes.get('_red'), s),
        _green: s => toggle(codes.get('_green'), s),
        _yellow: s => toggle(codes.get('_yellow'), s),
        _blue: s => toggle(codes.get('_blue'), s),
        _magenta: s => toggle(codes.get('_magenta'), s),
        _cyan: s => toggle(codes.get('_cyan'), s),
        _white: s => toggle(codes.get('_white'), s),
        _Black: s => toggle(codes.get('_Black'), s),
        _Red: s => toggle(codes.get('_Red'), s),
        _Green: s => toggle(codes.get('_Green'), s),
        _Yellow: s => toggle(codes.get('_Yellow'), s),
        _Blue: s => toggle(codes.get('_Blue'), s),
        _Magenta: s => toggle(codes.get('_Magenta'), s),
        _Cyan: s => toggle(codes.get('_Cyan'), s),
        _White: s => toggle(codes.get('_White'), s),
        // https://user-images.githubusercontent.com/995050/47952855-ecb12480-df75-11e8-89d4-ac26c50e80b9.png
        eightBit,
        twentyFour,
        f0: s => toggle(codes.get('black'), s),
        f1: s => toggle(codes.get('red'), s),
        f2: s => toggle(codes.get('green'), s),
        f3: s => toggle(codes.get('yellow'), s),
        f4: s => toggle(codes.get('blue'), s),
        f5: s => toggle(codes.get('magenta'), s),
        f6: s => toggle(codes.get('cyan'), s),
        f7: s => toggle(codes.get('white'), s),
        b0: s => toggle(codes.get('_black'), s),
        b1: s => toggle(codes.get('_red'), s),
        b2: s => toggle(codes.get('_green'), s),
        b3: s => toggle(codes.get('_yellow'), s),
        b4: s => toggle(codes.get('_blue'), s),
        b5: s => toggle(codes.get('_magenta'), s),
        b6: s => toggle(codes.get('_cyan'), s),
        b7: s => toggle(codes.get('_white'), s),
        h0: s => toggle(codes.get('Black'), s),
        h1: s => toggle(codes.get('Red'), s),
        h2: s => toggle(codes.get('Green'), s),
        h3: s => toggle(codes.get('Yellow'), s),
        h4: s => toggle(codes.get('Blue'), s),
        h5: s => toggle(codes.get('Magenta'), s),
        h6: s => toggle(codes.get('Cyan'), s),
        h7: s => toggle(codes.get('White'), s),
        hb0: s => toggle(codes.get('_Black'), s),
        hb1: s => toggle(codes.get('_Red'), s),
        hb2: s => toggle(codes.get('_Green'), s),
        hb3: s => toggle(codes.get('_Yellow'), s),
        hb4: s => toggle(codes.get('_Blue'), s),
        hb5: s => toggle(codes.get('_Magenta'), s),
        hb6: s => toggle(codes.get('_Cyan'), s),
        hb7: s => toggle(codes.get('_White'), s),
        slimVal: val => killCruft(inspect(val, { ...opts, depth }).trim()),
        val: val => inspect(val, { ...opts, depth }).trim(),
    };
}
exports.inspectToolKit = inspectToolKit;
