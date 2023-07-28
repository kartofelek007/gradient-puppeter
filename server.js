const gradientType = {
    linear: "linear",
    radial: "radial",
    conic: "conic",
    repeatLinear: "repeating linear",
    repeatRadial: "repeating radial",
    repeatConic: "repeating conic"
}

const TRANSPARENT = {r: 0, g: 0, b: 0, a: 0}

const gradientRepeatType = {
    default: "repeat",
    repeatX: "repeat-x",
    repeatY: "repeat-y",
    noRepeat: "no-repeat"
}

const blendMode = {
    default: "normal",
    multiply: "multiply",
    screen: "screen",
    overlay: "overlay",
    darken: "darken",
    lighten: "lighten",
    colorDodge: "color-dodge",
    colorBurn: "color-burn",
    hardLight: "hard-light",
    softLight: "soft-light",
    difference: "difference",
    exclusion: "exclusion",
    hue: "hue",
    saturation: "saturation",
    color: "color",
    luminosity: "luminosity",
}

/**
 * normalize number
 * @param {number} val
 * @param {number} max
 * @param {number} min
 * @returns {number}
 */
function normalize(val, max, min) {
    return (val - min) / (max - min);
}

/**
 * make clamp of number
 * @param min
 * @param nr
 * @param max
 * @returns {number}
 */
function clamp(min, nr, max) {
    return Math.min(Math.max(nr, min), max);
}

/**
 * convert rgba color to rgba text declaration
 * @param {object} color
 * @param {number} overwriteOpacity
 * @returns {string}
 */
function colorToRGBAText(color, overwriteOpacity = 100) {
    let alpha = normalize(color.a * overwriteOpacity, 1, 0);
    alpha = alpha / 100;
    return (alpha === 0) ? "transparent" : `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`
}

/**
 * generate gradient
 * @param gradient - gradient data
 * @param {number} overwriteDirection
 * @param {string} overwriteType
 * @param {number} overwriteOpacity
 * @param {string} overwriteSize
 * @returns {string}
 */
function generateGradient(gradient, overwriteDirection = null, overwriteType = null, overwriteOpacity = null, overwriteSize = null) {
    let format = number => {
        if (Math.floor(number) !== number) {
            return Number(number).toFixed(2);
        } else {
            return Math.round(number)
        }
    }

    let gSize = overwriteSize ? overwriteSize : `${gradient.size.width.size}${gradient.size.width.unit} ${gradient.size.height.size}${gradient.size.height.unit}`;
    let gPos = ` ${format(gradient.position.x.size)}${gradient.position.x.unit} ${format(gradient.position.y.size)}${gradient.position.y.unit}`
    let gCenterPos = `${format(gradient.center.x.size)}${gradient.center.x.unit} ${format(gradient.center.y.size)}${gradient.center.y.unit}`
    let gRepeat = ` ${gradient.repeat}`;
    let gDirection = overwriteDirection !== null ? `${overwriteDirection}deg` : `${gradient.direction}deg`;
    let gOpacity = overwriteOpacity ? overwriteOpacity : gradient.opacity;
    let gType = overwriteType ? overwriteType : gradient.type;

    if (gradient.repeat === gradientRepeatType.default) {
        gRepeat = "";
    }

    let lastPart;
    if (gSize === `100% 100%`) {
        lastPart = `${gPos}${gRepeat}`
    } else {
        lastPart = `${gPos} / ${gSize}${gRepeat}`
    }

    let colorFn = colorToRGBAText;

    const generatePointsWithCuts = (points) => {
        let arr = [];
        points.forEach((pt, i) => {
            if (pt.active !== undefined) delete pt.active;

            if (pt.x > 0) {
                if (pt.solidLeft && !pt.cutLeft && pt !== points.at(0)) {
                    const {solidLeft, ...point} = pt;
                    point.color = structuredClone(points[i - 1].color);
                    arr.push(point);
                }
                if (pt.cutLeft) {
                    const {cutLeft, solidLeft, ...point} = pt;
                    point.color = TRANSPARENT;
                    arr.push(point);
                }
            }

            arr.push(structuredClone(pt));

            if (pt.x < 100) {
                if (pt.solidRight && !pt.cutRight && pt !== points.at(-1)) {
                    const {solidRight, ...point} = pt;
                    point.color = structuredClone(points[i + 1].color);
                    arr.push(point);
                }
                if (pt.cutRight) {
                    const {cutRight, ...point} = pt;
                    point.color = TRANSPARENT;
                    arr.push(point);
                }
            }
        });
        return arr
    }

    const newPoints = generatePointsWithCuts(structuredClone(gradient.points));

    if (gType === gradientType.linear) {
        const points = newPoints.map(el => `${colorFn(el.color, gOpacity)} ${format(el.x)}%`);
        return `linear-gradient(${gDirection}, ${points})${lastPart}`
    }

    if (gType === gradientType.radial) {
        const points = newPoints.map(el => `${colorFn(el.color, gOpacity)} ${format(el.x)}%`);
        return `radial-gradient(circle at ${gCenterPos}, ${points})${lastPart}`
    }

    if (gType === gradientType.conic) {
        const points = newPoints.map(el => `${colorFn(el.color, gOpacity)} ${format(360 * (el.x / 100))}deg`).join(', ');
        return `conic-gradient(from ${gDirection} at ${gCenterPos}, ${points})${lastPart}`
    }

    if (gType === gradientType.repeatLinear) {
        const points = newPoints.map(el => `${colorFn(el.color, gOpacity)} ${format(el.x)}%`);
        return `repeating-linear-gradient(${format(gradient.direction)}deg, ${points})${lastPart}`
    }

    if (gType === gradientType.repeatRadial) {
        const points = newPoints.map(el => `${colorFn(el.color, gOpacity)} ${format(el.x)}%`);
        return `repeating-radial-gradient(circle at ${gCenterPos}, ${points})${lastPart}`
    }

    if (gType === gradientType.repeatConic) {
        const points = newPoints.map(el => `${colorFn(el.color, gOpacity)} ${format(360 * (el.x / 100))}deg`).join(', ');
        return `repeat-conic-gradient(from ${gDirection} at ${gCenterPos}, ${points})${lastPart}`
    }
}

/**
 * generate blend mode
 * @param data - current store data
 * @returns {string}
 */
function generateBlendModes(data) {
    let gradients = structuredClone(data.gradients);
    let text = '';
    const blendModeExist = gradients.some(el => el.blend !== blendMode.default);
    if (blendModeExist) {
        text = gradients.reverse().map(el => {
            return (el.blend) ? el.blend : blendMode.default
        }).join(",");
    }
    return text;
}

/**
 * generate final gradient
 * @param data - current store data
 * @param {"rgba", "hex", "hsla"} colorType
 * @returns {string}
 */
function generateFinalGradient(data = null, colorType) {
    let gradients = data.gradients;

    if (!gradients.length) {
        return 'transparent'
    } else {
        let gradientsArr = [];

        for (let gradient of gradients) {
            if (gradient.visibility) {
                gradientsArr.push(generateGradient(gradient, colorType));
            }
        }

        let text = `background: ${[...gradientsArr].reverse().join(`, `)};`;
        if (generateBlendModes(data)) text += `\nbackground-blend-mode: ${generateBlendModes(data)};`;
        return text;
    }
}

/**
 * generate gradient in html
 * @param data
 */
function injectGradientIntoHTML(data = null) {
    const el = document.querySelector("#gradientInline");
    el.style.cssText = generateFinalGradient(data, )
}
