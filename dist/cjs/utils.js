"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPrimitive = exports.toInstance = exports.asBigIntObject = exports.maskAsString = exports.emitEnum = exports.inspectToolKit = exports.objectCopy = exports.stripNullish = void 0;
const descriptor_js_1 = require("./descriptor.js");
const util_1 = require("util");
const reducers_js_1 = require("./reducers.js");
const CustomInspect = Symbol.for('nodejs.util.inspect.custom');
/**
 * Removes nullish values from an object.
 *
 * @param {Object} object - The object to remove nullish values from.
 * @returns {Object} - The object with nullish values removed.
 */
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
/**
 * Copies properties from multiple objects into a new object.
 *
 * @param {Object} to - The target object to copy properties into.
 * @param {...Object} from - The source objects to copy properties from.
 * @returns {Object} - A new object with copied properties.
 */
function objectCopy(to, ...from) {
    const output = to ?? {};
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
/**
 * Creates an inspectToolKit object with various utility functions for
 * inspecting and manipulating text with ANSI escape codes.
 *
 * @param {number} [depth=10] - The maximum depth to recursively
 * inspect objects.
 * @param {object} [opts={ colors: true }] - Options for inspecting
 * objects, including whether to use colors.
 * @param {Function} [inspect=utilInspect] - The inspect function to
 * use for inspecting objects.
 * @returns {object} - The inspectToolKit object with utility functions.
 */
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
/**
 * Creates an immutable enum object with the specified name, cases,
 * and additional properties.
 *
 * @param {string} name - The name of the enum.
 * @param {string[]} cases - An array of strings representing the
 * enum cases.
 * @param {object} [enumStatic] - Additional properties to be added
 * to the enum object.
 * @returns {object} - The created enum object.
 */
function emitEnum(name, cases, perCaseProps = {}, enumStatic = {}) {
    const casesAndDescs = cases.reduce(reducers_js_1.ArrayValuesAsKeysAndDescsReducer, {});
    const _cases = Reflect.ownKeys(casesAndDescs.cases);
    const enumObject = {
        ...casesAndDescs.cases,
        ...casesAndDescs.descs,
        isValid(string) {
            return this.cases.includes(string);
        },
        get cases() { return _cases; },
        get name() { return name; },
        get desc() {
            const enumObj = this;
            const func = function description(keyName) {
                const symbol = Symbol.for(`Desc:${keyName}`);
                return this[symbol];
            };
            const proxy = new Proxy(func, {
                get(target, prop) {
                    return enumObj[Symbol.for(`Desc:${prop}`)];
                }
            });
            return proxy;
        },
        get [Symbol.toStringTag]() { return `Enum${name}`; },
    };
    objectCopy(enumObject, enumStatic);
    if (descriptor_js_1.Descriptor.keysFor(perCaseProps ?? {}).length) {
        _cases.forEach(thisCase => {
            if (typeof thisCase === 'string') {
                let newEntry = objectCopy({ name: thisCase }, perCaseProps);
                maskAsString(newEntry, () => thisCase);
                enumObject[thisCase] = newEntry;
            }
        });
    }
    return Object.freeze(enumObject);
}
exports.emitEnum = emitEnum;
/**
 * Masks an object as a string by defining special properties and
 * setting the prototype to String.prototype.
 *
 * @param {Object} object - The object to be masked.
 * @param {Function} [toPrimitive=(val) => String(val)] - The function
 * used to convert the object to a primitive value.
 */
function maskAsString(object, toPrimitive = (val) => String(val)) {
    const base = { configurable: true, enumerable: false };
    Object.defineProperties(object, {
        [Symbol.toPrimitive]: { value: toPrimitive, ...base },
        [Symbol.toStringTag]: { value: String.name, ...base },
        [Symbol.species]: { get() { return String; }, ...base },
        [CustomInspect]: { ...base, value(depth, opts, inspect) {
                return inspect(this[Symbol.toPrimitive](), { ...opts, depth });
            } }
    });
    Object.setPrototypeOf(object, String.prototype);
}
exports.maskAsString = maskAsString;
function asBigIntObject(bigIntPrimitive) {
    const base = { configurable: true, enumerable: false };
    const object = { value: bigIntPrimitive };
    Object.defineProperties(object, {
        [Symbol.toPrimitive]: { value: function () { return bigIntPrimitive; }, ...base },
        [Symbol.toStringTag]: { value: BigInt.name, ...base },
        [Symbol.species]: { get() { return BigInt; }, ...base },
        [CustomInspect]: { ...base, value(depth, opts, inspect) {
                return inspect(this[Symbol.toPrimitive](), { ...opts, depth });
            } }
    });
    Object.setPrototypeOf(object, BigInt.prototype);
    Reflect.ownKeys(BigInt.prototype).forEach(key => {
        if (typeof object[key] !== 'function') {
            return;
        }
        object[key] = (function (...args) {
            return BigInt.prototype[key].apply(this, args);
        }).bind(object.value);
    });
    return object;
}
exports.asBigIntObject = asBigIntObject;
function toInstance(object, passthru = true) {
    if (!object)
        return null;
    switch (typeof object) {
        case 'number': return new Number(object);
        case 'string': return new String(object);
        case 'boolean': return new Boolean(object);
        case 'bigint': return asBigIntObject(object);
        case 'object': return object;
        default:
            break;
    }
    return passthru ? object : null;
}
exports.toInstance = toInstance;
function isPrimitive(value) {
    // Check for null as a special case because typeof null
    // is 'object'
    if (value === null) {
        return true;
    }
    // Check for other primitives
    switch (typeof value) {
        case 'string':
        case 'number':
        case 'bigint':
        case 'boolean':
        case 'undefined':
        case 'symbol':
            return true;
        default:
            return false;
    }
}
exports.isPrimitive = isPrimitive;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbURBQTRDO0FBQzVDLCtCQUE2QztBQUM3QywrQ0FBZ0U7QUFFaEUsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFBO0FBRTlEOzs7OztHQUtHO0FBQ0gsU0FBZ0IsWUFBWSxDQUFDLE1BQU07SUFDakMsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRO1FBQzVCLE9BQU8sTUFBTSxDQUFBO0lBRWYsS0FBSyxNQUFNLEdBQUcsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQ3pDLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUksSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssU0FBUztZQUNuRCxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtLQUNyQjtJQUVELE9BQU8sTUFBTSxDQUFBO0FBQ2YsQ0FBQztBQVZELG9DQVVDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsVUFBVSxDQUFDLEVBQUUsRUFBRSxHQUFHLElBQUk7SUFDcEMsTUFBTSxNQUFNLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQTtJQUV2QixLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksRUFBRTtRQUN6QixJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxNQUFNLEtBQUssUUFBUSxDQUFDO1lBQ3pDLFNBQVE7UUFFVixNQUFNLFdBQVcsR0FBRywwQkFBVSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBO1FBQ2pFLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsSUFBSSxXQUFXLEVBQUU7WUFDNUMsTUFBTSxVQUFVLEdBQUcsSUFBSSwwQkFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1lB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QyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM3QyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzFDLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFM0MsK0RBQStEO1FBQy9ELGdFQUFnRTtRQUNoRSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsQ0FBQyxFQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxFQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUMsRUFBRSxDQUFDLENBQUMsRUFBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBQyxFQUFF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QUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMvQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDL0MsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRW5ELEtBQUssRUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1QyxHQUFHLEVBQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUMsS0FBSyxFQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLE1BQU0sRUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3QyxJQUFJLEVBQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDM0MsT0FBTyxFQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLElBQUksRUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMzQyxLQUFLLEVBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFNUMsS0FBSyxFQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLEdBQUcsRUFBTyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMxQyxLQUFLLEVBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDNUMsTUFBTSxFQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzdDLElBQUksRUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMzQyxPQUFPLEVBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUMsSUFBSSxFQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzNDLEtBQUssRUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUU1QyxNQUFNLEVBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDN0MsSUFBSSxFQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzNDLE1BQU0sRUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3QyxPQUFPLEVBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUMsS0FBSyxFQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMvQyxLQUFLLEVBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDNUMsTUFBTSxFQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRTdDLE1BQU0sRUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3QyxJQUFJLEVBQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDM0MsTUFBTSxFQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzdDLE9BQU8sRUFBRyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM5QyxLQUFLLEVBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDNUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQy9DLEtBQUssRUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1QyxNQUFNLEVBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFN0MscUdBQXFHO1FBQ3JHLFFBQVE7UUFDUixVQUFVO1FBRVYsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNyQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDeEMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdkMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2QyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDeEMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6QyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRXZDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2QyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3hDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNyQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3hDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDeEMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2QyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUV4QyxPQUFPLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsSUFBSSxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsSUFBSSxFQUFFLEtBQUss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