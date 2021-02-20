
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
class EventDispatcher {
    constructor() {
        this.listeners = new Map();
        this._name = '';
    }
    dispatchEvent(event) {
        const typeListeners = this.listeners.get(event.type);
        if (typeListeners !== undefined) {
            for (const listener of typeListeners) {
                listener(event);
            }
        }
        return true;
    }
    dispatch(type, payload = undefined) {
        const typeListeners = this.listeners.get(type);
        if (typeListeners !== undefined) {
            const customEvent = new CustomEvent(type, { detail: payload });
            for (const listener of typeListeners) {
                listener(customEvent);
            }
        }
    }
    addEventListener(type, listener) {
        let typeListeners = this.listeners.get(type);
        if (typeListeners === undefined) {
            typeListeners = [];
            this.listeners.set(type, typeListeners);
        }
        typeListeners.push(listener);
    }
    removeEventListener(type, listener) {
        const typeListeners = this.listeners.get(type);
        if (typeListeners !== undefined) {
            for (const method of typeListeners) {
                if (method === listener) {
                    const index = typeListeners.indexOf(listener);
                    typeListeners.splice(index, 1);
                    break;
                }
            }
        }
    }
    set name(value) {
        if (this._name !== value) {
            this._name = value;
        }
    }
    get name() {
        return this._name;
    }
}

class Size {
    constructor(width = 0, height = 0) {
        this._width = 0;
        this._height = 0;
        this.width = width;
        this.height = height;
    }
    set width(value) {
        if (isNaN(value)) {
            return;
        }
        if (value < 0) {
            if (this._width !== 0) {
                this._width = 0;
                return;
            }
        }
        this._width = value;
    }
    get width() {
        return this._width;
    }
    set height(value) {
        if (isNaN(value)) {
            return;
        }
        if (value < 0) {
            if (this._height !== 0) {
                this._height = 0;
                return;
            }
        }
        this._height = value;
    }
    get height() {
        return this._height;
    }
}

class AbsoluteLayout extends EventDispatcher {
    constructor() {
        super();
        this.name = 'AbsoluteLayout';
    }
    updateChildrenSizes(container, elements) {
        const insideWidth = container.measuredWidth - container.paddingLeft - container.paddingRight;
        const insideHeight = container.measuredHeight - container.paddingTop - container.paddingBottom;
        for (const element of elements) {
            if (!isNaN(element.percentWidth) && !isNaN(element.percentHeight)) {
                element.size(insideWidth * element.percentWidth / 100, insideHeight * element.percentHeight / 100);
            }
            else if (!isNaN(element.percentWidth) && isNaN(element.percentHeight)) {
                element.width = insideWidth * element.percentWidth / 100;
            }
            else if (isNaN(element.percentWidth) && !isNaN(element.percentHeight)) {
                element.height = insideHeight * element.percentHeight / 100;
            }
        }
    }
    updateLayout(container, elements) {
        for (const element of elements) {
            element.x = container.paddingLeft;
            element.y = container.paddingTop;
        }
    }
    getInternalSize(container, elements) {
        let width = 0;
        let height = 0;
        for (const element of elements) {
            if (width < element.measuredWidth) {
                width = element.measuredWidth;
            }
            if (height < element.measuredHeight) {
                height = element.measuredHeight;
            }
        }
        width = container.paddingLeft + width + container.paddingRight;
        height = container.paddingTop + height + container.paddingBottom;
        return new Size(width, height);
    }
    getInternalWidth(container, elements) {
        let width = 0;
        for (const element of elements) {
            if (width < element.measuredWidth) {
                width = element.measuredWidth;
            }
        }
        return container.paddingLeft + width + container.paddingRight;
    }
    getInternalHeight(container, elements) {
        let height = 0;
        for (const element of elements) {
            if (height < element.measuredHeight) {
                height = element.measuredHeight;
            }
        }
        return container.paddingTop + height + container.paddingBottom;
    }
}

class Color extends EventDispatcher {
    constructor(hue = 0, saturation = 0, lightness = 0, opacity = 1.0) {
        super();
        this._hue = 0;
        this._saturation = 0;
        this._lightness = 0;
        this._opacity = 1.0;
        this.name = 'Color';
        if (this._hue !== hue) {
            if (isNaN(hue) || hue < 0 || hue >= 360) {
                this._hue = 0;
            }
            else {
                this._hue = hue;
            }
        }
        if (this._saturation !== saturation) {
            if (isNaN(saturation) || saturation < 0) {
                this._saturation = 0;
            }
            else if (saturation > 100) {
                this._saturation = 100;
            }
            else {
                this._saturation = saturation;
            }
        }
        if (this._lightness !== lightness) {
            if (isNaN(lightness) || lightness < 0) {
                this._lightness = 0;
            }
            else if (lightness > 100) {
                this._lightness = 100;
            }
            else {
                this._lightness = lightness;
            }
        }
        if (this._opacity !== opacity) {
            if (isNaN(opacity) || opacity > 1.0) {
                this._opacity = 1.0;
            }
            else if (opacity < 0) {
                this._opacity = 0;
            }
            else {
                this._opacity = opacity;
            }
        }
    }
    set hue(value) {
        if (this._hue === value) {
            return;
        }
        if (isNaN(value) || value < 0 || value >= 360) {
            if (this._hue !== 0) {
                this._hue = 0;
                this.notify();
            }
            return;
        }
        this._hue = value;
        this.notify();
    }
    get hue() {
        return this._hue;
    }
    set saturation(value) {
        if (this._saturation === value) {
            return;
        }
        if (isNaN(value) || value < 0) {
            if (this._saturation !== 0) {
                this._saturation = 0;
                this.notify();
            }
            return;
        }
        if (value > 100) {
            if (this._saturation !== 100) {
                this._saturation = 100;
                this.notify();
                return;
            }
        }
        this._saturation = value;
        this.notify();
    }
    get saturation() {
        return this._saturation;
    }
    set lightness(value) {
        if (this._lightness === value) {
            return;
        }
        if (isNaN(value) || value < 0) {
            if (this._lightness !== 0) {
                this._lightness = 0;
                this.notify();
            }
            return;
        }
        if (value > 100) {
            if (this._lightness !== 100) {
                this._lightness = 100;
                this.notify();
            }
            return;
        }
        this._lightness = value;
        this.notify();
    }
    get lightness() {
        return this._lightness;
    }
    set opacity(value) {
        if (this._opacity === value) {
            return;
        }
        if (isNaN(value) || value > 1.0) {
            if (this._opacity !== 1.0) {
                this._opacity = 1.0;
                this.notify();
            }
            return;
        }
        if (value < 0) {
            if (this._opacity !== 0.0) {
                this._opacity = 0.0;
                this.notify();
            }
            return;
        }
        this._opacity = value;
        this.notify();
    }
    get opacity() {
        return this._opacity;
    }
    toString() {
        return 'hsla(' + this.hue + ', ' + this.saturation + '%, ' + this.lightness + '%, ' + this.opacity + ')';
    }
    notify() {
        this.dispatch(Color.CHANGED, this);
    }
}
Color.NONE = '';
Color.CHANGED = 'Color.CHANGED';

class ColorScale {
    set c0(value) {
        this._c0 = value;
    }
    get c0() {
        if (!this._c0) {
            this._c0 = new Color(0, 0, 100); // White
        }
        return this._c0;
    }
    set c50(value) {
        this._c50 = value;
    }
    get c50() {
        if (!this._c50) {
            this._c50 = new Color(0, 0, 98); // Gray 50
        }
        return this._c50;
    }
    set c100(value) {
        this._c100 = value;
    }
    get c100() {
        if (!this._c100) {
            this._c100 = new Color(240, 5, 96); // Gray 100
        }
        return this._c100;
    }
    set c200(value) {
        this._c200 = value;
    }
    get c200() {
        if (!this._c200) {
            this._c200 = new Color(240, 6, 90); // Gray 200
        }
        return this._c200;
    }
    set c300(value) {
        this._c300 = value;
    }
    get c300() {
        if (!this._c300) {
            this._c300 = new Color(240, 5, 84); // Gray 300
        }
        return this._c300;
    }
    set c400(value) {
        this._c400 = value;
    }
    get c400() {
        if (!this._c400) {
            this._c400 = new Color(240, 5, 65); // Gray 400
        }
        return this._c400;
    }
    set c500(value) {
        this._c500 = value;
    }
    get c500() {
        if (!this._c500) {
            this._c500 = new Color(240, 4, 46); // Gray 500
        }
        return this._c500;
    }
    set c600(value) {
        this._c600 = value;
    }
    get c600() {
        if (!this._c600) {
            this._c600 = new Color(240, 5, 34); // Gray 600
        }
        return this._c600;
    }
    set c700(value) {
        this._c700 = value;
    }
    get c700() {
        if (!this._c700) {
            this._c700 = new Color(240, 5, 26); // Gray 700
        }
        return this._c700;
    }
    set c800(value) {
        this._c800 = value;
    }
    get c800() {
        if (!this._c800) {
            this._c800 = new Color(240, 4, 16); // Gray 800
        }
        return this._c800;
    }
    set c900(value) {
        this._c900 = value;
    }
    get c900() {
        if (!this._c900) {
            this._c900 = new Color(240, 6, 10); // Gray 900
        }
        return this._c900;
    }
    set c1000(value) {
        this._c1000 = value;
    }
    get c1000() {
        if (!this._c1000) {
            this._c1000 = new Color(0, 0, 0); // Black
        }
        return this._c1000;
    }
}

class Colors {
    constructor() {
        this.name = '';
        this.name = 'Colors';
    }
    get primary() {
        if (!this._primary) {
            this._primary = new ColorScale(); // Teal
            this._primary.c50 = new Color(166, 76, 97);
            this._primary.c100 = new Color(167, 85, 89);
            this._primary.c200 = new Color(168, 84, 78);
            this._primary.c300 = new Color(171, 77, 64);
            this._primary.c400 = new Color(172, 66, 50);
            this._primary.c500 = new Color(173, 80, 40);
            this._primary.c600 = new Color(175, 84, 32);
            this._primary.c700 = new Color(175, 77, 26);
            this._primary.c800 = new Color(176, 69, 22);
            this._primary.c900 = new Color(176, 61, 19);
        }
        return this._primary;
    }
    get secondary() {
        if (!this._secondary) {
            this._secondary = new ColorScale(); // Pink
            this._secondary.c50 = new Color(327, 73, 97);
            this._secondary.c100 = new Color(326, 78, 95);
            this._secondary.c200 = new Color(326, 85, 90);
            this._secondary.c300 = new Color(327, 87, 82);
            this._secondary.c400 = new Color(329, 86, 70);
            this._secondary.c500 = new Color(330, 81, 60);
            this._secondary.c600 = new Color(333, 71, 51);
            this._secondary.c700 = new Color(335, 78, 42);
            this._secondary.c800 = new Color(336, 74, 35);
            this._secondary.c900 = new Color(336, 69, 30);
        }
        return this._secondary;
    }
    get success() {
        if (!this._success) {
            this._success = new ColorScale();
            this._success.c50 = new Color(138, 76, 97);
            this._success.c100 = new Color(141, 84, 93);
            this._success.c200 = new Color(141, 79, 85);
            this._success.c300 = new Color(142, 77, 73);
            this._success.c400 = new Color(142, 69, 58);
            this._success.c500 = new Color(142, 71, 45);
            this._success.c600 = new Color(142, 76, 36);
            this._success.c700 = new Color(142, 72, 29);
            this._success.c800 = new Color(143, 64, 24);
            this._success.c900 = new Color(144, 61, 20);
        }
        return this._success;
    }
    get danger() {
        if (!this._danger) {
            this._danger = new ColorScale();
            this._danger.c50 = new Color(0, 86, 97);
            this._danger.c100 = new Color(0, 93, 94);
            this._danger.c200 = new Color(0, 96, 89);
            this._danger.c300 = new Color(0, 94, 82);
            this._danger.c400 = new Color(0, 91, 71);
            this._danger.c500 = new Color(0, 84, 60);
            this._danger.c600 = new Color(0, 72, 51);
            this._danger.c700 = new Color(0, 74, 42);
            this._danger.c800 = new Color(0, 70, 35);
            this._danger.c900 = new Color(0, 63, 31);
        }
        return this._danger;
    }
    get neutral() {
        if (!this._neutral) {
            this._neutral = new ColorScale();
        }
        return this._neutral;
    }
}

/**
 * Verdana 400 capHeight = 0.73, verticalOffset = 0.044, horizontalOffset = 0.13;
 * Montserrat 400 capHeight = 0.7, verticalOffset = -0.013, horizontalOffset = 0.163;
 * SegoeUI 400 capHeight = 0.7, verticalOffset = -0.091, horizontalOffset = 0.13;
 * SegoeUI 600 capHeight = 0.7, verticalOffset = -0.091, horizontalOffset = 0.123;
 *
 * new TypeFace('Arial', FontWeight.REGULAR_400, 0.715, 0.11, 0.015);
 * new TypeFace('Arial', FontWeight.MEDIUM_500, 0.715, 0.11, 0.015);
 * new TypeFace('Arial', FontWeight.BOLD_700, 0.715, 0.11, 0.015);
 *
 * new TypeFace('Inter', 400, 0.727, 0.09, 0.0);
 * new TypeFace('Inter', 500, 0.727, 0.09, 0.0);
 * new TypeFace('Inter', 700, 0.727, 0.09, 0.0);
 *
 * new TypeFace('Bitter', 400, 0.71, 0.03, 0.02);
 *
 * new TypeFace('Eurostile', FontWeight.REGULAR_400, 0.67, 0.1, 0.01);
 * new TypeFace('Eurostile', FontWeight.BOLD_700, 0.67, 0.09, -0.003);
 */
class TypeFace extends EventDispatcher {
    constructor(fontFamily = 'Arial', capHeight = 0.715, offsetX = 0.09, offsetY = 0.015) {
        super();
        this._fontFamily = 'Arial';
        this._capHeight = 0.715;
        this._offsetX = 0.11;
        this._offsetY = 0.015;
        this.name = 'TypeFace';
        if (this._fontFamily !== fontFamily) {
            this._fontFamily = fontFamily;
        }
        if (this._capHeight !== capHeight) {
            if (!isNaN(capHeight) && capHeight > 0) {
                this._capHeight = capHeight;
            }
        }
        if (this._offsetX !== offsetX) {
            if (!isNaN(offsetX)) {
                this._offsetX = offsetX;
            }
        }
        if (this._offsetY !== offsetY) {
            if (!isNaN(offsetY)) {
                this._offsetY = offsetY;
            }
        }
    }
    set fontFamily(value) {
        if (this._fontFamily === value) {
            return;
        }
        this._fontFamily = value;
        this.notifyChange();
    }
    get fontFamily() {
        return this._fontFamily;
    }
    set capHeight(value) {
        if (this._capHeight === value) {
            return;
        }
        if (isNaN(value) || value < 0) {
            if (this._capHeight !== 0.715) {
                this._capHeight = 0.715;
                this.notifyChange();
            }
            return;
        }
        this._capHeight = value;
        this.notifyChange();
    }
    get capHeight() {
        return this._capHeight;
    }
    set offsetX(value) {
        if (this._offsetX === value) {
            return;
        }
        if (isNaN(value)) {
            if (this._offsetX !== 0.11) {
                this._offsetX = 0.11;
                this.notifyChange();
            }
            return;
        }
        this._offsetX = value;
        this.notifyChange();
    }
    get offsetX() {
        return this._offsetX;
    }
    set offsetY(value) {
        if (this._offsetY === value) {
            return;
        }
        if (isNaN(value)) {
            if (this._offsetY !== 0.015) {
                this._offsetY = 0.015;
                this.notifyChange();
            }
            return;
        }
        this._offsetY = value;
        this.notifyChange();
    }
    get offsetY() {
        return this._offsetY;
    }
    notifyChange() {
        this.dispatch(TypeFace.CHANGED, this);
    }
}
TypeFace.CHANGED = 'TypeFace.CHANGED';

class Typography {
    set primary(value) {
        if (this._primary === value) {
            return;
        }
        this._primary = value;
    }
    get primary() {
        if (!this._primary) {
            this._primary = new TypeFace('Arial', 0.715, 0.11, 0.015);
        }
        return this._primary;
    }
    set secondary(value) {
        if (this._secondary === value) {
            return;
        }
        this._secondary = value;
    }
    get secondary() {
        if (!this._secondary) {
            this._secondary = new TypeFace('Verdana', 0.73, 0.13, 0.044);
        }
        return this._secondary;
    }
}

class Theme extends EventDispatcher {
    constructor() {
        super();
        this.name = 'Theme';
    }
    get colors() {
        if (!this._colors) {
            this._colors = new Colors();
        }
        return this._colors;
    }
    get typography() {
        if (!this._typography) {
            this._typography = new Typography();
        }
        return this._typography;
    }
}

class Design {
    static set theme(value) {
        if (this._theme === value) {
            return;
        }
        this._theme = value;
        this.dispatcher.dispatch(Design.THEME_CHANGED, null, false);
    }
    static get theme() {
        if (!this._theme) {
            this._theme = new Theme();
        }
        return this._theme;
    }
}
Design.THEME_CHANGED = 'Design.THEME_CHANGED';
Design.dispatcher = new EventDispatcher();

class BaseElement extends HTMLElement {
    constructor() {
        super();
        this.connected = false;
        this.name = '';
        this._visible = true;
        this._notifyThemeChange = false;
        this.name = 'BaseElement';
        this.invalidate = this.invalidate.bind(this);
        this.themeChanged = this.themeChanged.bind(this);
    }
    dispatch(typeArg, payload = null, bubbles = false) {
        this.dispatchEvent(new CustomEvent(typeArg, { detail: payload, bubbles: bubbles }));
    }
    connectedCallback() {
        this.connected = true;
        this.validate();
    }
    disconnectedCallback() {
        this.connected = false;
    }
    invalidate() {
        if (this.connected) {
            this.validate();
        }
    }
    validate() {
        // override
    }
    set visible(value) {
        if (this._visible === value) {
            return;
        }
        this._visible = value;
        if (this._visible) {
            this.style.visibility = '';
            return;
        }
        this.style.visibility = 'hidden';
    }
    get visible() {
        return this._visible;
    }
    set notifyThemeChange(value) {
        if (this._notifyThemeChange === value) {
            return;
        }
        if (this._notifyThemeChange) {
            Design.dispatcher.removeEventListener(Design.THEME_CHANGED, this.themeChanged);
        }
        this._notifyThemeChange = value;
        if (this._notifyThemeChange) {
            Design.dispatcher.addEventListener(Design.THEME_CHANGED, this.themeChanged);
        }
    }
    get notifyThemeChange() {
        return this._notifyThemeChange;
    }
    get theme() {
        return Design.theme;
    }
    get typography() {
        return Design.theme.typography;
    }
    get colors() {
        return Design.theme.colors;
    }
    themeChanged() {
        // override
    }
}
customElements.define('base-element', BaseElement);

class PositionElement extends BaseElement {
    constructor() {
        super();
        this._x = 0;
        this._y = 0;
        this.name = 'PositionElement';
        this.style.position = 'absolute';
    }
    move(x, y) {
        this.x = x;
        this.y = y;
    }
    set x(value) {
        if (this._x === value) {
            return;
        }
        if (isNaN(value)) {
            if (this._x !== 0) {
                this._x = 0;
                this.updateTransform();
            }
            return;
        }
        this._x = value;
        this.updateTransform();
    }
    get x() {
        return this._x;
    }
    set y(value) {
        if (this._y === value) {
            return;
        }
        if (isNaN(value)) {
            if (this._y !== 0) {
                this._y = 0;
                this.updateTransform();
            }
            return;
        }
        this._y = value;
        this.updateTransform();
    }
    get y() {
        return this._y;
    }
    updateTransform() {
        this.style.transform = 'translate(' + this.x + 'px, ' + this.y + 'px)';
    }
}
customElements.define('position-element', PositionElement);

class SizeElement extends PositionElement {
    constructor() {
        super();
        this._minWidth = 0;
        this._width = NaN;
        this._maxWidth = Infinity;
        this._minHeight = 0;
        this._height = NaN;
        this._maxHeight = Infinity;
        this._percentWidth = NaN;
        this._percentHeight = NaN;
        this._actualWidth = 0;
        this._actualHeight = 0;
        this._internalWidth = 0;
        this._internalHeight = 0;
        this.name = 'SizeElement';
    }
    size(width, height) {
        let widthChanged = false;
        if (isNaN(this._width) && !isNaN(width)) {
            if (width < this.minWidth) {
                this._width = this.minWidth;
            }
            else if (width > this.maxWidth) {
                this._width = this.maxWidth;
            }
            else {
                this._width = width;
            }
            this.actualWidth = this._width;
            widthChanged = true;
        }
        else if (!isNaN(this._width) && isNaN(width)) {
            this._width = NaN;
            widthChanged = true;
        }
        else if (this._width !== width) {
            if (width < this.minWidth) {
                this._width = this.minWidth;
            }
            else if (width > this.maxWidth) {
                this._width = this.maxWidth;
            }
            else {
                this._width = width;
            }
            this.actualWidth = this._width;
            widthChanged = true;
        }
        let heightChanged = false;
        if (isNaN(this._height) && !isNaN(height)) {
            if (height < this.minHeight) {
                this._height = this.minHeight;
            }
            else if (height > this.maxHeight) {
                this._height = this.maxHeight;
            }
            else {
                this._height = height;
            }
            this.actualHeight = this._height;
            heightChanged = true;
        }
        else if (!isNaN(this._height) && isNaN(height)) {
            this._height = NaN;
            heightChanged = true;
        }
        else if (this._height !== height) {
            if (height < this.minHeight) {
                this._height = this.minHeight;
            }
            else if (height > this.maxHeight) {
                this._height = this.maxHeight;
            }
            else {
                this._height = height;
            }
            this.actualHeight = this._height;
            heightChanged = true;
        }
        if (widthChanged || heightChanged) {
            this.invalidate();
        }
    }
    set minWidth(value) {
        if (isNaN(value) || value < 0) {
            if (this._minWidth !== 0) {
                this._minWidth = value;
            }
            return;
        }
        if (value > this.maxWidth) {
            if (this._minWidth !== this.maxWidth) {
                this._minWidth = this.maxWidth;
            }
            if (isNaN(this.width) || this.width < this._minWidth) {
                this.width = this._minWidth;
            }
            return;
        }
        if (this._minWidth === value) {
            return;
        }
        this._minWidth = value;
        if (isNaN(this.width) || this.width < this._minWidth) {
            this.width = this._minWidth;
        }
    }
    get minWidth() {
        return this._minWidth;
    }
    set width(value) {
        if (isNaN(this._width) && isNaN(value)) {
            return;
        }
        if (this._width === value) {
            return;
        }
        if (isNaN(value)) {
            this._width = NaN;
            this.invalidate();
            return;
        }
        if (value < this.minWidth) {
            if (this._width !== this.minWidth) {
                this._width = this.minWidth;
                this._internalWidth = this._width;
                this.actualWidth = this._width;
                this.invalidate();
            }
            return;
        }
        if (value > this.maxWidth) {
            if (this._width !== this.maxWidth) {
                this._width = this.maxWidth;
                this._internalWidth = this._width;
                this.actualWidth = this._width;
                this.invalidate();
            }
            return;
        }
        this._width = value;
        this._internalWidth = this._width;
        this.actualWidth = this._width;
        this.invalidate();
    }
    get width() {
        return this._width;
    }
    set maxWidth(value) {
        if (isNaN(value)) {
            if (this._maxWidth !== Infinity) {
                this._maxWidth = Infinity;
            }
            return;
        }
        if (this._maxWidth === value) {
            return;
        }
        if (value < this.minWidth) {
            if (this._maxWidth !== this.minWidth) {
                this._maxWidth = this.minWidth;
            }
            if (!isNaN(this.width) && this.width > this._maxWidth) {
                this.width = this._maxWidth;
            }
            return;
        }
        this._maxWidth = value;
        if (!isNaN(this.width) && this.width > this._maxWidth) {
            this.width = this._maxWidth;
        }
    }
    get maxWidth() {
        return this._maxWidth;
    }
    set minHeight(value) {
        if (isNaN(value) || value < 0) {
            if (this._minHeight !== 0) {
                this._minHeight = value;
            }
            return;
        }
        if (this._minHeight === value) {
            return;
        }
        if (value > this.maxHeight) {
            if (this._minHeight !== this.maxHeight) {
                this._minHeight = this.maxHeight;
            }
            if (isNaN(this.height) || this.height < this._minHeight) {
                this.height = this._minHeight;
            }
            return;
        }
        this._minHeight = value;
        if (isNaN(this.height) || this.height < this._minHeight) {
            this.height = this._minHeight;
        }
    }
    get minHeight() {
        return this._minHeight;
    }
    set height(value) {
        if (isNaN(this._height) && isNaN(value)) {
            return;
        }
        if (this._height === value) {
            return;
        }
        if (isNaN(value)) {
            this._height = value;
            this.invalidate();
            return;
        }
        if (value < this.minHeight) {
            if (this._height !== this.minHeight) {
                this._height = this.minHeight;
                this._internalHeight = this._height;
                this.actualHeight = this._height;
                this.invalidate();
            }
            return;
        }
        if (value > this.maxHeight) {
            if (this._height !== this.maxHeight) {
                this._height = this.maxHeight;
                this._internalHeight = this._height;
                this.actualHeight = this._height;
                this.invalidate();
            }
            return;
        }
        this._height = value;
        this._internalHeight = this._height;
        this.actualHeight = this._height;
        this.invalidate();
    }
    get height() {
        return this._height;
    }
    set maxHeight(value) {
        if (isNaN(value)) {
            if (this._maxHeight !== Infinity) {
                this._maxHeight = Infinity;
            }
            return;
        }
        if (this._maxHeight === value) {
            return;
        }
        if (value < this.minHeight) {
            if (this._maxHeight !== this.minHeight) {
                this._maxHeight = this.minHeight;
            }
            if (!isNaN(this.height) && this.height > this._maxHeight) {
                this.height = this._maxHeight;
            }
            return;
        }
        this._maxHeight = value;
        if (!isNaN(this.height) && this.height > this._maxHeight) {
            this.height = this._maxHeight;
        }
    }
    get maxHeight() {
        return this._maxHeight;
    }
    set percentWidth(value) {
        if (isNaN(this._percentWidth) && isNaN(value)) {
            return;
        }
        if (this._percentWidth === value) {
            return;
        }
        if (isNaN(value)) {
            this._width = NaN;
            this._internalWidth = this.minWidth;
            this._percentWidth = NaN;
            this.actualWidth = this.minWidth;
            this.invalidate();
            return;
        }
        if (value < 0) {
            if (this._percentWidth !== 0) {
                this._percentWidth = 0;
                this.notify();
            }
            return;
        }
        if (value > 100) {
            if (this._percentWidth !== 100) {
                this._percentWidth = 100;
                this.notify();
            }
            return;
        }
        this._percentWidth = value;
        this.notify();
    }
    get percentWidth() {
        return this._percentWidth;
    }
    set percentHeight(value) {
        if (isNaN(this._percentHeight) && isNaN(value)) {
            return;
        }
        if (this._percentHeight === value) {
            return;
        }
        if (isNaN(value)) {
            this._height = NaN;
            this._internalHeight = this.minHeight;
            this._percentHeight = NaN;
            this.actualHeight = this.minHeight;
            this.invalidate();
            return;
        }
        if (value < 0) {
            if (this._percentHeight !== 0) {
                this._percentHeight = 0;
            }
            return;
        }
        if (value > 100) {
            if (this._percentHeight !== 100) {
                this._percentHeight = 100;
            }
            return;
        }
        this._percentHeight = value;
        this.notify();
    }
    get percentHeight() {
        return this._percentHeight;
    }
    get measuredWidth() {
        if (isNaN(this.width) && !isNaN(this.percentWidth)) {
            return this.minWidth;
        }
        if (!isNaN(this.width)) {
            return this.width;
        }
        return this.internalWidth;
    }
    get measuredHeight() {
        if (isNaN(this.height) && !isNaN(this.percentHeight)) {
            return this.minHeight;
        }
        if (!isNaN(this.height)) {
            return this.height;
        }
        return this.internalHeight;
    }
    set actualWidth(value) {
        this._actualWidth = value;
        this.style.width = this._actualWidth + 'px';
    }
    get actualWidth() {
        return this._actualWidth;
    }
    set actualHeight(value) {
        this._actualHeight = value;
        this.style.height = this._actualHeight + 'px';
    }
    get actualHeight() {
        return this._actualHeight;
    }
    internalSize(width, height) {
        let widthChanged = false;
        if (width < this.minWidth) {
            this._internalWidth = this.minWidth;
            this.actualWidth = this._internalWidth;
            widthChanged = true;
        }
        else if (width > this.maxWidth) {
            this._internalWidth = this.maxWidth;
            this.actualWidth = this._internalWidth;
            widthChanged = true;
        }
        else if (this._internalWidth !== width) {
            this._internalWidth = width;
            this.actualWidth = this._internalWidth;
            widthChanged = true;
        }
        let heightChanged = false;
        if (height < this.minHeight) {
            this._internalHeight = this.minHeight;
            this.actualHeight = this._internalHeight;
            heightChanged = true;
        }
        else if (height > this.maxHeight) {
            this._internalHeight = this.maxHeight;
            this.actualHeight = this._internalHeight;
            heightChanged = true;
        }
        else if (this._internalHeight !== height) {
            this._internalHeight = height;
            this.actualHeight = this._internalHeight;
            heightChanged = true;
        }
        if (widthChanged || heightChanged) {
            this.notify();
        }
    }
    set internalWidth(value) {
        if (this._internalWidth === value) {
            return;
        }
        if (value < this.minWidth) {
            if (this._internalWidth !== this.minWidth) {
                this._internalWidth = this.minWidth;
                this.actualWidth = this._internalWidth;
                this.notify();
            }
            return;
        }
        if (value > this.maxWidth) {
            if (this._internalWidth !== this.maxWidth) {
                this._internalWidth = this.maxWidth;
                this.actualWidth = this._internalWidth;
                this.notify();
            }
            return;
        }
        this._internalWidth = value;
        this.actualWidth = this._internalWidth;
        this.notify();
    }
    get internalWidth() {
        return this._internalWidth;
    }
    set internalHeight(value) {
        if (this._internalHeight === value) {
            return;
        }
        if (value < this.minHeight) {
            if (this._internalHeight !== this.minHeight) {
                this._internalHeight = this.minHeight;
                this.actualHeight = this._internalHeight;
                this.notify();
            }
            return;
        }
        if (value > this.maxHeight) {
            if (this._internalHeight !== this.maxHeight) {
                this._internalHeight = this.maxHeight;
                this.actualHeight = this._internalHeight;
                this.notify();
            }
            return;
        }
        this._internalHeight = value;
        this.actualHeight = this._internalHeight;
        this.notify();
    }
    get internalHeight() {
        return this._internalHeight;
    }
    invalidateInternalSize() {
        if (!isNaN(this.width) && !isNaN(this.height)) {
            return;
        }
        if (isNaN(this.width) && isNaN(this.height)) {
            if (isNaN(this.percentWidth) && isNaN(this.percentHeight)) {
                this.updateInternalSize();
                return;
            }
            if (isNaN(this.percentWidth) && !isNaN(this.percentHeight)) {
                this.updateInternalWidth();
                return;
            }
            if (!isNaN(this.percentWidth) && isNaN(this.percentHeight)) {
                this.updateInternalHeight();
                return;
            }
            this.updateInternalSize();
            return;
        }
        if (isNaN(this.width) && !isNaN(this.height)) {
            if (isNaN(this.percentWidth)) {
                this.updateInternalWidth();
                return;
            }
        }
        if (!isNaN(this.width) && isNaN(this.height)) {
            if (isNaN(this.percentHeight)) {
                this.updateInternalHeight();
            }
        }
    }
    updateInternalSize() {
        // override
    }
    updateInternalWidth() {
        // override
    }
    updateInternalHeight() {
        // override
    }
    notify() {
        if (!this.connected) {
            return;
        }
        this.dispatch('invalidate', this, true);
    }
}
customElements.define('size-element', SizeElement);

class LinearGradient extends EventDispatcher {
    constructor(degrees = 0, colors = []) {
        super();
        this.colors = [];
        this._degrees = 0;
        this.name = 'LinearGradient';
        this.colorChanged = this.colorChanged.bind(this);
        if (this._degrees !== degrees) {
            if (isNaN(degrees) || degrees < 0 || degrees > 360) {
                if (this._degrees !== 0) {
                    this._degrees = 0;
                }
            }
            else {
                this._degrees = degrees;
            }
        }
        for (const color of colors) {
            this.colors.push(color);
            color.addEventListener(Color.CHANGED, this.colorChanged);
        }
    }
    colorChanged(e) {
        this.dispatch(LinearGradient.COLOR_CHANGED, e.detail);
    }
    addColor(value) {
        this.colors.push(value);
        value.addEventListener(Color.CHANGED, this.colorChanged);
        this.dispatch(LinearGradient.COLOR_ADDED, value);
    }
    addColors(value) {
        for (const color of value) {
            this.colors.push(color);
            color.addEventListener(Color.CHANGED, this.colorChanged);
        }
        if (value.length > 0) {
            this.dispatch(LinearGradient.COLORS_ADDED, value);
        }
    }
    set degrees(value) {
        if (this._degrees === value) {
            return;
        }
        if (isNaN(value) || value < 0 || value >= 360) {
            if (this._degrees !== 0) {
                this._degrees = 0;
                this.dispatch(LinearGradient.DEGREES_CHANGED, 0);
                return;
            }
        }
        this._degrees = value;
        this.dispatch(LinearGradient.DEGREES_CHANGED, this._degrees);
    }
    get degrees() {
        return this._degrees;
    }
    toString() {
        if (this.colors.length === 0) {
            return '';
        }
        let linearGradient = 'linear-gradient(' + this.degrees + 'deg, ';
        for (const color of this.colors) {
            linearGradient += color.toString() + ', ';
        }
        return linearGradient.substr(0, linearGradient.length - 2) + ')';
    }
}
LinearGradient.COLOR_CHANGED = 'LinearGradient.COLOR_CHANGED';
LinearGradient.COLOR_ADDED = 'LinearGradient.COLOR_ADDED';
LinearGradient.COLORS_ADDED = 'LinearGradient.COLORS_ADDED';
LinearGradient.DEGREES_CHANGED = 'LinearGradient.DEGREES_CHANGED';

class BoxShadowFilter extends EventDispatcher {
    constructor(x = 0, y = 4, blur = 8, spread = 0, color = new Color(0, 0, 0, 0.3), inset = false) {
        super();
        this._x = 0;
        this._y = 4;
        this._blur = 8;
        this._spread = 0;
        this._inset = false;
        this.name = 'BoxShadowFilter';
        this.colorChanged = this.colorChanged.bind(this);
        if (!isNaN(x)) {
            this._x = x;
        }
        if (!isNaN(y)) {
            this._y = y;
        }
        if (!isNaN(blur) && blur > 0) {
            this._blur = blur;
        }
        if (!isNaN(spread)) {
            this._spread = spread;
        }
        this._color = color;
        this._color.addEventListener('invalidate', this.colorChanged);
        this._inset = inset;
    }
    colorChanged() {
        this.notify();
    }
    set x(value) {
        if (this._x === value) {
            return;
        }
        if (isNaN(value)) {
            if (this._x !== 0) {
                this._x = value;
                this.notify();
            }
            return;
        }
        this._x = value;
        this.notify();
    }
    get x() {
        return this._x;
    }
    set y(value) {
        if (this._y === value) {
            return;
        }
        if (isNaN(value)) {
            if (this._y !== 4) {
                this._y = value;
                this.notify();
            }
            return;
        }
        this._y = value;
        this.notify();
    }
    get y() {
        return this._y;
    }
    set blur(value) {
        if (this._blur === value) {
            return;
        }
        if (isNaN(value)) {
            if (this._blur !== 8) {
                this._blur = value;
                this.notify();
            }
            return;
        }
        this._blur = value;
        this.notify();
    }
    get blur() {
        return this._blur;
    }
    set spread(value) {
        if (this._spread === value) {
            return;
        }
        if (isNaN(value)) {
            if (this._spread !== 0) {
                this._spread = value;
                this.notify();
            }
            return;
        }
        this._spread = value;
        this.notify();
    }
    get spread() {
        return this._spread;
    }
    set color(value) {
        if (this._color === value) {
            return;
        }
        this._color.removeEventListener('invalidate', this.colorChanged);
        this._color = value;
        this._color.addEventListener('invalidate', this.colorChanged);
        this.notify();
    }
    get color() {
        return this._color;
    }
    set inset(value) {
        if (this._inset === value) {
            return;
        }
        this._inset = value;
        this.notify();
    }
    get inset() {
        return this._inset;
    }
    toString() {
        let shadow = '';
        if (this.inset) {
            shadow += 'inset ';
        }
        return shadow + this.x + 'px ' + this.y + 'px ' + this.blur + 'px ' + this.spread + 'px ' + this.color.toString();
    }
    notify() {
        this.dispatch('invalidate');
    }
}

class DisplayElement extends SizeElement {
    constructor() {
        super();
        this.filters = [];
        this._backgroundColor = null;
        this._cornerSize = 0;
        this._clip = 'visible';
        this._clipX = 'visible';
        this._clipY = 'visible';
        this._enabled = true;
        this.name = 'DisplayElement';
        this.backgroundColorChanged = this.backgroundColorChanged.bind(this);
        this.filtersChanged = this.filtersChanged.bind(this);
        this.style.border = "none" /* NONE */;
        this.style.outline = "none" /* NONE */;
        this.style.boxSizing = "border-box" /* BORDER_BOX */;
    }
    addFilter(value) {
        this.filters.push(value);
        value.addEventListener('invalidate', this.filtersChanged);
        this.filtersChanged();
    }
    filtersChanged() {
        let filterString = '';
        let boxShadowString = '';
        if (this.filters.length === 0) {
            this.style.filter = filterString;
            this.style.boxShadow = boxShadowString;
            return;
        }
        for (const filter of this.filters) {
            if (filter instanceof BoxShadowFilter) {
                boxShadowString += filter.toString() + ', ';
            }
            else {
                filterString += filter.toString() + ' ';
            }
        }
        this.style.filter = filterString.substr(0, filterString.length - 2);
        this.style.boxShadow = boxShadowString.substr(0, boxShadowString.length - 2);
    }
    backgroundColorChanged() {
        if (this.backgroundColor) {
            if (this.backgroundColor instanceof Color) {
                this.style.background = '';
                this.style.backgroundColor = this.backgroundColor.toString();
                return;
            }
            if (this.backgroundColor instanceof LinearGradient) {
                this.style.backgroundColor = '';
                this.style.background = this.backgroundColor.toString();
                return;
            }
        }
        this.style.backgroundColor = '';
        this.style.background = '';
    }
    set backgroundColor(value) {
        if (this._backgroundColor === value) {
            return;
        }
        if (this._backgroundColor instanceof Color) {
            this._backgroundColor.removeEventListener(Color.CHANGED, this.backgroundColorChanged);
        }
        else if (this._backgroundColor instanceof LinearGradient) {
            this._backgroundColor.removeEventListener(LinearGradient.COLOR_ADDED, this.backgroundColorChanged);
            this._backgroundColor.removeEventListener(LinearGradient.COLORS_ADDED, this.backgroundColorChanged);
            this._backgroundColor.removeEventListener(LinearGradient.COLOR_CHANGED, this.backgroundColorChanged);
            this._backgroundColor.removeEventListener(LinearGradient.DEGREES_CHANGED, this.backgroundColorChanged);
        }
        this._backgroundColor = value;
        if (this._backgroundColor instanceof Color) {
            this._backgroundColor.addEventListener(Color.CHANGED, this.backgroundColorChanged);
            this.style.background = '';
            this.style.backgroundColor = this._backgroundColor.toString();
            return;
        }
        if (this._backgroundColor instanceof LinearGradient) {
            this._backgroundColor.addEventListener(LinearGradient.COLOR_ADDED, this.backgroundColorChanged);
            this._backgroundColor.addEventListener(LinearGradient.COLORS_ADDED, this.backgroundColorChanged);
            this._backgroundColor.addEventListener(LinearGradient.COLOR_CHANGED, this.backgroundColorChanged);
            this._backgroundColor.addEventListener(LinearGradient.DEGREES_CHANGED, this.backgroundColorChanged);
            this.style.backgroundColor = '';
            this.style.background = this._backgroundColor.toString();
            return;
        }
        this.style.backgroundColor = '';
        this.style.background = '';
    }
    get backgroundColor() {
        return this._backgroundColor;
    }
    set cornerSize(value) {
        if (this._cornerSize === value) {
            return;
        }
        if (isNaN(value) || value < 0) {
            if (this._cornerSize !== 0) {
                this._cornerSize = 0;
                this.style.borderRadius = '0';
            }
            return;
        }
        this._cornerSize = value;
        this.style.borderRadius = this._cornerSize + "px" /* PX */;
    }
    get cornerSize() {
        return this._cornerSize;
    }
    set clip(value) {
        if (this._clip === value) {
            return;
        }
        this._clip = value;
        this.style.overflow = this._clip;
    }
    get clip() {
        return this._clip;
    }
    set clipX(value) {
        if (this._clipX === value) {
            return;
        }
        this._clipX = value;
        this.style.overflowX = this._clipX;
    }
    get clipX() {
        return this._clipX;
    }
    set clipY(value) {
        if (this._clipY === value) {
            return;
        }
        this._clipY = value;
        this.style.overflowY = this._clipY;
    }
    get clipY() {
        return this._clipY;
    }
    set enabled(value) {
        if (this._enabled === value) {
            return;
        }
        this._enabled = value;
        if (value) {
            this.style.pointerEvents = '';
            this.style.userSelect = 'auto';
        }
        else {
            this.style.pointerEvents = 'none';
            this.style.userSelect = 'none';
        }
    }
    get enabled() {
        return this._enabled;
    }
}
customElements.define('display-element', DisplayElement);

class DisplayContainer extends DisplayElement {
    constructor() {
        super();
        this.elements = [];
        this._padding = 0;
        this._paddingTop = 0;
        this._paddingRight = 0;
        this._paddingBottom = 0;
        this._paddingLeft = 0;
        this._paddingX = 0;
        this._paddingY = 0;
        this.name = 'DisplayContainer';
        this.addEventListener('invalidate', this.childInvalid);
    }
    validate() {
        super.validate();
        this.invalidateInternalSize();
        this.updateChildrenSizes();
        this.updateLayout();
    }
    updateChildrenSizes() {
        this.layout.updateChildrenSizes(this, this.elements);
    }
    updateLayout() {
        this.layout.updateLayout(this, this.elements);
    }
    childInvalid(e) {
        if (e.target === this) {
            return;
        }
        e.stopImmediatePropagation();
        this.invalidate();
    }
    addElement(element) {
        this.elements.push(element);
        this.appendChild(element);
        this.invalidate();
    }
    addElements(elements) {
        const frag = document.createDocumentFragment();
        for (const element of elements) {
            this.elements.push(element);
            frag.appendChild(element);
        }
        this.appendChild(frag);
        this.invalidate();
    }
    removeElement(element) {
        const start = this.elements.indexOf(element);
        this.elements.splice(start, 1);
        this.removeChild(element);
        this.invalidate();
    }
    removeElements() {
        if (this.elements.length > 0) {
            while (this.elements.length > 0) {
                const element = this.elements.splice(0, 1)[0];
                this.removeChild(element);
            }
            this.invalidate();
        }
    }
    updateInternalSize() {
        const size = this.layout.getInternalSize(this, this.elements);
        this.internalSize(size.width, size.height);
    }
    updateInternalWidth() {
        this.internalWidth = this.layout.getInternalWidth(this, this.elements);
    }
    updateInternalHeight() {
        this.internalHeight = this.layout.getInternalHeight(this, this.elements);
    }
    set layout(value) {
        if (this._layout === value) {
            return;
        }
        if (this._layout) {
            this._layout.removeEventListener('invalidate', this.invalidate);
        }
        this._layout = value;
        this._layout.addEventListener('invalidate', this.invalidate);
        this.invalidate();
    }
    get layout() {
        if (!this._layout) {
            this._layout = new AbsoluteLayout();
            this._layout.addEventListener('invalidate', this.invalidate);
        }
        return this._layout;
    }
    set padding(value) {
        if (isNaN(value) || value < 0) {
            this._padding = 0;
            this._paddingLeft = 0;
            this._paddingTop = 0;
            this._paddingRight = 0;
            this._paddingBottom = 0;
            this.invalidate();
            return;
        }
        this._padding = value;
        this._paddingTop = value;
        this._paddingRight = value;
        this._paddingBottom = value;
        this._paddingLeft = value;
        this.invalidate();
    }
    get padding() {
        return this._padding;
    }
    set paddingTop(value) {
        if (this._paddingTop === value) {
            return;
        }
        if (isNaN(value) || value < 0) {
            if (this._paddingTop !== 0) {
                this._paddingTop = 0;
                this.invalidate();
            }
            return;
        }
        this._paddingTop = value;
        this.invalidate();
    }
    get paddingTop() {
        return this._paddingTop;
    }
    set paddingRight(value) {
        if (isNaN(value) || value < 0) {
            if (this._paddingRight !== 0) {
                this._paddingRight = 0;
                this.invalidate();
            }
            return;
        }
        this._paddingRight = value;
        this.invalidate();
    }
    get paddingRight() {
        return this._paddingRight;
    }
    set paddingBottom(value) {
        if (isNaN(value) || value < 0) {
            if (this._paddingBottom !== 0) {
                this._paddingBottom = 0;
                this.invalidate();
            }
            return;
        }
        this._paddingBottom = value;
        this.invalidate();
    }
    get paddingBottom() {
        return this._paddingBottom;
    }
    set paddingLeft(value) {
        if (this._paddingLeft === value) {
            return;
        }
        if (isNaN(value) || value < 0) {
            if (this._paddingLeft !== 0) {
                this._paddingLeft = 0;
                this.invalidate();
            }
            return;
        }
        this._paddingLeft = value;
        this.invalidate();
    }
    get paddingLeft() {
        return this._paddingLeft;
    }
    set paddingX(value) {
        if (this._paddingX === value) {
            return;
        }
        if (isNaN(value) || value < 0) {
            if (this._paddingX !== 0) {
                this._paddingX = 0;
                this._paddingLeft = 0;
                this._paddingRight = 0;
                this.invalidate();
            }
            return;
        }
        this._paddingX = value;
        this._paddingLeft = value;
        this._paddingRight = value;
        this.invalidate();
    }
    get paddingX() {
        return this._paddingX;
    }
    set paddingY(value) {
        if (this._paddingY === value) {
            return;
        }
        if (isNaN(value) || value < 0) {
            if (this._paddingY !== 0) {
                this._paddingY = 0;
                this._paddingTop = 0;
                this._paddingBottom = 0;
                this.invalidate();
            }
            return;
        }
        this._paddingY = value;
        this._paddingTop = value;
        this._paddingBottom = value;
        this.invalidate();
    }
    get paddingY() {
        return this._paddingY;
    }
}
customElements.define('display-container', DisplayContainer);

class TextRenderer extends DisplayElement {
    constructor() {
        super();
        this._text = '';
        this._textColor = null;
        this._fontFamily = '';
        this._fontSize = NaN;
        this._fontWeight = 400;
        this._letterSpacing = 0.0;
        this._lineHeight = NaN;
        this._textAlign = 'left';
        this.name = 'TextRenderer';
        this.fontFamily = 'Arial';
        this.fontSize = 16;
        this.lineHeight = 1.2;
    }
    set text(value) {
        if (this._text === value) {
            return;
        }
        this._text = value;
        this.innerText = value;
    }
    get text() {
        return this._text;
    }
    set textColor(value) {
        if (this._textColor === value) {
            return;
        }
        this._textColor = value;
        if (this._textColor) {
            this.style.color = this._textColor.toString();
        }
        else {
            this.style.color = '';
        }
    }
    get textColor() {
        return this._textColor;
    }
    set fontFamily(value) {
        if (this._fontFamily === value) {
            return;
        }
        this._fontFamily = value;
        this.style.fontFamily = this._fontFamily;
    }
    get fontFamily() {
        return this._fontFamily;
    }
    set fontSize(value) {
        if (this._fontSize === value) {
            return;
        }
        if (isNaN(value) || value < 0) {
            if (this._fontSize !== 16) {
                this._fontSize = 16;
                this.style.fontSize = this._fontSize + "px" /* PX */;
            }
            return;
        }
        this._fontSize = value;
        this.style.fontSize = this._fontSize + "px" /* PX */;
    }
    get fontSize() {
        return this._fontSize;
    }
    set fontWeight(value) {
        if (this._fontWeight === value) {
            return;
        }
        this._fontWeight = value;
        this.style.fontWeight = this._fontWeight.toString();
    }
    get fontWeight() {
        return this._fontWeight;
    }
    set letterSpacing(value) {
        if (this._letterSpacing === value) {
            return;
        }
        if (isNaN(value)) {
            if (this._letterSpacing !== 0) {
                this._letterSpacing = 0;
                this.style.letterSpacing = this._letterSpacing + "px" /* PX */;
            }
            return;
        }
        this._letterSpacing = value;
        this.style.letterSpacing = this._letterSpacing + "px" /* PX */;
    }
    get letterSpacing() {
        return this._letterSpacing;
    }
    set lineHeight(value) {
        if (this._lineHeight === value) {
            return;
        }
        if (isNaN(value) || value < 0) {
            this._lineHeight = 1.2;
            this.style.lineHeight = this._lineHeight.toString();
            return;
        }
        this._lineHeight = value;
        this.style.lineHeight = this._lineHeight.toString();
    }
    get lineHeight() {
        return this._lineHeight;
    }
    set textAlign(value) {
        if (this._textAlign === value) {
            return;
        }
        this._textAlign = value;
        this.style.textAlign = this._textAlign;
    }
    get textAlign() {
        return this._textAlign;
    }
}
customElements.define('text-renderer', TextRenderer);

class BaseText extends DisplayElement {
    constructor() {
        super();
        this.name = 'BaseText';
        this.appendChild(this.textRenderer);
    }
    get textRenderer() {
        if (!this._textRenderer) {
            this._textRenderer = new TextRenderer();
        }
        return this._textRenderer;
    }
    set text(value) {
        this.textRenderer.text = value;
        this.invalidate();
    }
    get text() {
        return this.textRenderer.text;
    }
    set fontWeight(value) {
        this.textRenderer.fontWeight = value;
        this.invalidate();
    }
    get fontWeight() {
        return this.textRenderer.fontWeight;
    }
    set typeFace(value) {
        if (this._typeFace === value) {
            return;
        }
        this._typeFace = value;
        this.textRenderer.fontFamily = this._typeFace.fontFamily;
        this.invalidate();
    }
    get typeFace() {
        if (!this._typeFace) {
            this._typeFace = new TypeFace();
        }
        return this._typeFace;
    }
    set fontSize(value) {
        this.textRenderer.fontSize = value;
        this.invalidate();
    }
    get fontSize() {
        return this.textRenderer.fontSize;
    }
    set textColor(value) {
        this.textRenderer.textColor = value;
    }
    get textColor() {
        return this.textRenderer.textColor;
    }
    set letterSpacing(value) {
        this.textRenderer.letterSpacing = value;
        this.invalidate();
    }
    get letterSpacing() {
        return this.textRenderer.letterSpacing;
    }
    set lineHeight(value) {
        this.textRenderer.lineHeight = value;
        this.invalidate();
    }
    get lineHeight() {
        return this.textRenderer.lineHeight;
    }
    set textAlign(value) {
        this.textRenderer.textAlign = value;
    }
    get textAlign() {
        return this.textRenderer.textAlign;
    }
    resetTextRendererStyles() {
        this.textRenderer.style.width = '';
        this.textRenderer.style.height = '';
    }
    get actualFontSize() {
        return Math.ceil(this.fontSize * this.typeFace.capHeight);
    }
    get topPadding() {
        return (this.fontSize * this.lineHeight - this.actualFontSize) * 0.5;
    }
    get actualRendererWidth() {
        return Math.ceil(this.textRenderer.clientWidth - this.typeFace.offsetX * 2 * this.fontSize - this.letterSpacing);
    }
    get actualRendererHeight() {
        return Math.ceil(this.textRenderer.clientHeight - this.topPadding * 2);
    }
    updateTextRendererPosition() {
        this.textRenderer.x = -this.typeFace.offsetX * this.fontSize;
        this.textRenderer.y = -this.topPadding + this.typeFace.offsetY * this.fontSize;
    }
}
customElements.define('base-text', BaseText);

class LabelElement extends BaseText {
    constructor() {
        super();
        this.name = 'LabelElement';
        this.lineHeight = 2;
        this.textRenderer.style.whiteSpace = 'nowrap';
        this.textRenderer.style.textOverflow = 'ellipsis';
        this.textRenderer.style.overflow = 'hidden';
    }
    validate() {
        super.validate();
        this.invalidateInternalSize();
        this.updateTextRendererWidth();
        this.updateTextRendererPosition();
    }
    updateInternalSize() {
        this.resetTextRendererStyles();
        this.internalSize(this.actualRendererWidth, this.actualFontSize);
    }
    updateInternalWidth() {
        this.resetTextRendererStyles();
        this.internalWidth = this.actualRendererWidth;
    }
    updateInternalHeight() {
        this.resetTextRendererStyles();
        this.internalHeight = this.actualFontSize;
    }
    updateTextRendererWidth() {
        this.textRenderer.width = Math.ceil(this.measuredWidth + Math.ceil(this.typeFace.offsetX * 2 * this.fontSize * 2) + this.letterSpacing * 2);
    }
}
customElements.define('label-element', LabelElement);

class Badge extends DisplayContainer {
    constructor() {
        super();
        this.name = 'BadgeElement';
        this.typeFace = this.typography.secondary;
        this.backgroundColor = this.colors.success.c200;
        this.textColor = this.theme.colors.success.c700;
        this.fontSize = 10;
        this.fontWeight = 700;
        this.paddingX = 8;
        this.paddingY = 4;
        this.cornerSize = 8;
        this.addElement(this.labelElement);
    }
    get labelElement() {
        if (!this._labelElement) {
            this._labelElement = new LabelElement();
        }
        return this._labelElement;
    }
    set text(value) {
        this.labelElement.text = value;
    }
    get text() {
        return this.labelElement.text;
    }
    set textColor(value) {
        this.labelElement.textColor = value;
    }
    get textColor() {
        return this.labelElement.textColor;
    }
    set fontWeight(value) {
        this.labelElement.fontWeight = value;
    }
    get fontWeight() {
        return this.labelElement.fontWeight;
    }
    set fontSize(value) {
        this.labelElement.fontSize = value;
    }
    get fontSize() {
        return this.labelElement.fontSize;
    }
    set typeFace(value) {
        this.labelElement.typeFace = value;
    }
    get typeFace() {
        return this.labelElement.typeFace;
    }
}
customElements.define('badge-element', Badge);

class Button extends DisplayContainer {
    constructor() {
        super();
        this.name = 'Button';
        this.typeFace = this.typography.secondary;
        this.backgroundColor = this.colors.secondary.c500;
        this.textColor = this.colors.secondary.c100;
        this.paddingLeft = this.paddingRight = 16;
        this.paddingTop = this.paddingBottom = 10.5;
        this.cornerSize = 4;
        this.label = 'Button';
        this.addElement(this.labelElement);
    }
    get labelElement() {
        if (!this._labelElement) {
            this._labelElement = new LabelElement();
            this._labelElement.fontSize = 14;
            this._labelElement.fontWeight = 500;
        }
        return this._labelElement;
    }
    set letterSpacing(value) {
        this.labelElement.letterSpacing = value;
    }
    get letterSpacing() {
        return this.labelElement.letterSpacing;
    }
    set fontSize(value) {
        this.labelElement.fontSize = value;
    }
    get fontSize() {
        return this.labelElement.fontSize;
    }
    set fontWeight(value) {
        this.labelElement.fontWeight = value;
    }
    get fontWeight() {
        return this.labelElement.fontWeight;
    }
    set textColor(value) {
        this.labelElement.textColor = value;
    }
    get textColor() {
        return this.labelElement.textColor;
    }
    set typeFace(value) {
        this.labelElement.typeFace = value;
    }
    get typeFace() {
        return this.labelElement.typeFace;
    }
    set label(value) {
        this.labelElement.text = value;
    }
    get label() {
        return this.labelElement.text;
    }
}
customElements.define('button-element', Button);

class Point {
    constructor(x = 0, y = 0) {
        this._x = 0;
        this._y = 0;
        this.x = x;
        this.y = y;
    }
    set x(value) {
        if (this._x === value) {
            return;
        }
        if (isNaN(value)) {
            this._x = 0;
            return;
        }
        this._x = value;
    }
    get x() {
        return this._x;
    }
    set y(value) {
        if (this._y === value) {
            return;
        }
        if (isNaN(value)) {
            this._y = 0;
            return;
        }
        this._y = value;
    }
    get y() {
        return this._y;
    }
}

class State {
    constructor(name) {
        this.event = null;
        this.entry = null;
        this.on = null;
        this.exit = null;
        this.targets = new Map();
        this.name = name;
    }
    addTransition(type, target) {
        this.targets.set(type, target);
        return this;
    }
    getState(type) {
        return this.targets.get(type) || this;
    }
}

class Machine {
    constructor(host) {
        this.initial = new State('initial');
        this.host = host;
        this.current = this.initial;
        this.send = this.send.bind(this);
    }
    send(e) {
        const state = this.current.getState(e.type);
        if (this.current !== state) {
            if (this.current.exit) {
                this.current.exit(e);
            }
            this.current = state;
            if (this.current.entry) {
                this.current.entry(e);
            }
            if (this.current.on) {
                this.current.on(e);
            }
        }
    }
}

class TouchMachine extends Machine {
    constructor(host) {
        super(host);
        this.initial.addTransition('mouseover', this.hover);
        this.initial.addTransition('touchstart', this.pressed);
        this.initial.entry = this.initialEntry.bind(this);
        this.initial.on = this.host.initial.bind(this.host);
        this.host.addEventListener('mouseover', this.send);
        this.host.addEventListener('mousedown', this.send);
        this.host.addEventListener('mouseup', this.send);
        this.host.addEventListener('mouseleave', this.send);
        this.host.addEventListener('touchstart', this.send);
        this.host.addEventListener('touchend', this.send);
        this.host.addEventListener('click', this.host.triggered);
    }
    initialEntry(e) {
        if (!window.TouchEvent) {
            return;
        }
        if (e instanceof TouchEvent) {
            e.preventDefault();
            if (e.changedTouches && e.changedTouches.length > 0) {
                const touch = e.changedTouches[0];
                const px = touch.pageX;
                const py = touch.pageY;
                const rect = this.host.getBoundingClientRect();
                if (px > rect.x && px < rect.x + rect.width) {
                    if (py > rect.y && py < rect.y + rect.height) {
                        this.host.triggered();
                    }
                }
            }
        }
    }
    get hover() {
        if (!this._hover) {
            this._hover = new State('hover');
            this._hover.addTransition('mouseleave', this.initial);
            this._hover.addTransition('mousedown', this.pressed);
            this._hover.on = this.host.hover.bind(this.host);
        }
        return this._hover;
    }
    get pressed() {
        if (!this._pressed) {
            this._pressed = new State('pressed');
            this._pressed.addTransition('mouseleave', this.initial);
            this._pressed.addTransition('mouseup', this.hover);
            this._pressed.addTransition('touchend', this.initial);
            this._pressed.on = this.onPressed.bind(this);
        }
        return this._pressed;
    }
    onPressed(e) {
        this.host.pressed(this.getTouchPoint(e));
    }
    getTouchPoint(e) {
        if (!window.TouchEvent) {
            return new Point();
        }
        if (e instanceof TouchEvent) {
            if (e.changedTouches && e.changedTouches.length > 0) {
                const touch = e.changedTouches[0];
                const rect = this.host.getBoundingClientRect();
                return new Point(touch.pageX - rect.x, touch.pageY - rect.y);
            }
        }
        if (e instanceof MouseEvent) {
            return new Point(e.offsetX, e.offsetY);
        }
        return new Point();
    }
}

class ItemRenderer extends DisplayContainer {
    constructor() {
        super();
        this.machine = new TouchMachine(this);
        this._data = null;
        this._selected = false;
        this.name = 'ListItemRenderer';
    }
    initial() {
        // override
    }
    hover() {
        // override
    }
    // eslint-disable-next-line
    pressed(point) {
        // override
    }
    triggered() {
        this.dispatch('itemRendererTriggered', this.data, true);
    }
    dataChanged() {
        // override
    }
    selectedChanged() {
        // override
    }
    set data(value) {
        if (this._data === value) {
            return;
        }
        this._data = value;
        this.dataChanged();
    }
    get data() {
        return this._data;
    }
    set selected(value) {
        if (this._selected === value) {
            return;
        }
        this._selected = value;
        this.selectedChanged();
    }
    get selected() {
        return this._selected;
    }
}
customElements.define('item-renderer', ItemRenderer);

class ScrollContainer extends DisplayElement {
    constructor() {
        super();
        this._scrollEnabled = false;
        this._horizontalScrollEnabled = false;
        this._verticalScrollEnabled = false;
        this.name = 'ScrollContainer';
        this.verticalScrollEnabled = true;
        this.clip = 'hidden';
        this.addEventListener('invalidate', this.childInvalid);
        this.appendChild(this.outerElement);
    }
    childInvalid(e) {
        if (e.target === this) {
            return;
        }
        e.stopImmediatePropagation();
        this.invalidate();
    }
    validate() {
        super.validate();
        this.invalidateInternalSize();
        this.updateChildrenSizes();
    }
    updateChildrenSizes() {
        this.outerElement.size(this.measuredWidth + this.scrollBarWidth, this.measuredHeight + this.scrollBarHeight);
        if (!this.horizontalScrollEnabled && !this.verticalScrollEnabled) {
            this.elementsContainer.size(this.measuredWidth, this.measuredHeight);
            return;
        }
        if (!this.horizontalScrollEnabled && this.verticalScrollEnabled) {
            this.elementsContainer.width = this.measuredWidth;
            return;
        }
        if (this.horizontalScrollEnabled && !this.verticalScrollEnabled) {
            this.elementsContainer.height = this.measuredHeight;
        }
    }
    get scrollBarWidth() {
        const width = this.outerElement.offsetWidth - this.outerElement.clientWidth;
        // Just to be sure, we check if clientWidth is above 17, look below for IE11 bug
        if (width > 17) {
            return 17;
        }
        return width;
    }
    get scrollBarHeight() {
        const height = this.outerElement.offsetHeight - this.outerElement.clientHeight;
        // IE11 has a bug that will return a wrong clientHeight, so we check if it'< above 17 here
        if (height > 17) {
            return 17;
        }
        return height;
    }
    updateInternalSize() {
        this.internalSize(this.elementsContainer.measuredWidth, this.elementsContainer.measuredHeight);
    }
    updateInternalWidth() {
        this.internalWidth = this.elementsContainer.measuredWidth;
    }
    updateInternalHeight() {
        this.internalHeight = this.elementsContainer.measuredHeight;
    }
    get outerElement() {
        if (!this._outerElement) {
            this._outerElement = new DisplayElement();
            this._outerElement.clip = 'scroll';
            this._outerElement.appendChild(this.elementsContainer);
        }
        return this._outerElement;
    }
    get elementsContainer() {
        if (!this._elementsContainer) {
            this._elementsContainer = new DisplayContainer();
            // this will boost scroll performance, no repaints
            this._elementsContainer.style.willChange = 'transform';
        }
        return this._elementsContainer;
    }
    addElement(element) {
        this.elementsContainer.addElement(element);
    }
    addElements(elements) {
        this.elementsContainer.addElements(elements);
    }
    removeElement(element) {
        this.elementsContainer.removeElement(element);
    }
    removeElements() {
        this.elementsContainer.removeElements();
    }
    set scrollEnabled(value) {
        if (this._scrollEnabled === value) {
            return;
        }
        this._scrollEnabled = value;
        this._horizontalScrollEnabled = value;
        this._verticalScrollEnabled = value;
        this.outerElement.clip = this.scrollEnabled ? 'scroll' : 'hidden';
        this.invalidate();
    }
    get scrollEnabled() {
        return this._scrollEnabled;
    }
    set horizontalScrollEnabled(value) {
        if (this._horizontalScrollEnabled === value) {
            return;
        }
        this._horizontalScrollEnabled = value;
        this._scrollEnabled = value && this.verticalScrollEnabled;
        this.outerElement.clipX = this.horizontalScrollEnabled ? 'scroll' : 'hidden';
        this.invalidate();
    }
    get horizontalScrollEnabled() {
        return this._horizontalScrollEnabled;
    }
    set verticalScrollEnabled(value) {
        if (this._verticalScrollEnabled === value) {
            return;
        }
        this._verticalScrollEnabled = value;
        this._scrollEnabled = value && this._horizontalScrollEnabled;
        this.outerElement.clipY = this.verticalScrollEnabled ? 'scroll' : 'hidden';
        this.invalidate();
    }
    get verticalScrollEnabled() {
        return this._verticalScrollEnabled;
    }
    set layout(value) {
        this.elementsContainer.layout = value;
    }
    get layout() {
        return this.elementsContainer.layout;
    }
    set padding(value) {
        this.elementsContainer.padding = value;
    }
    get padding() {
        return this.elementsContainer.padding;
    }
    set paddingLeft(value) {
        this.elementsContainer.paddingLeft = value;
    }
    get paddingLeft() {
        return this.elementsContainer.paddingLeft;
    }
    set paddingTop(value) {
        this.elementsContainer.paddingTop = value;
    }
    get paddingTop() {
        return this.elementsContainer.paddingTop;
    }
    set paddingRight(value) {
        this.elementsContainer.paddingRight = value;
    }
    get paddingRight() {
        return this.elementsContainer.paddingRight;
    }
    set paddingBottom(value) {
        this.elementsContainer.paddingBottom = value;
    }
    get paddingBottom() {
        return this.elementsContainer.paddingBottom;
    }
    set paddingX(value) {
        this.elementsContainer.paddingX = value;
    }
    get paddingX() {
        return this.elementsContainer.paddingX;
    }
    set paddingY(value) {
        this.elementsContainer.paddingY = value;
    }
    get paddingY() {
        return this.elementsContainer.paddingY;
    }
}
customElements.define('scroll-container', ScrollContainer);

class List extends ScrollContainer {
    constructor() {
        super();
        this.listItemRendererLookup = new Map();
        this._dataProvider = null;
        this._selectedItemRenderer = undefined;
        this._selectedIndex = NaN;
        this.name = 'List';
        this.itemAdded = this.itemAdded.bind(this);
        this.itemsAdded = this.itemsAdded.bind(this);
        this.itemRemoved = this.itemRemoved.bind(this);
        this.reset = this.reset.bind(this);
        this.addEventListener('itemRendererTriggered', this.itemRenderTriggered);
    }
    itemRenderTriggered(e) {
        e.stopImmediatePropagation();
        if (this.dataProvider) {
            this.selectedIndex = this.dataProvider.getItemIndex(e.detail);
            this.dispatch('selectedItemChanged', e.detail);
            this.dispatch('selectedIndexChanged', this.selectedIndex);
        }
    }
    addItemRenderers(items) {
        const listItemRenderers = [];
        for (const item of items) {
            const listItemRenderer = new this.ItemRendererClass();
            listItemRenderer.data = item;
            this.listItemRendererLookup.set(item, listItemRenderer);
            listItemRenderers.push(listItemRenderer);
        }
        this.addElements(listItemRenderers);
        this.updateSelectedItemRenderer();
    }
    itemAdded(e) {
        const itemRenderer = new this.ItemRendererClass();
        itemRenderer.data = e.detail;
        this.listItemRendererLookup.set(e.detail, itemRenderer);
        this.addElement(itemRenderer);
        this.updateSelectedItemRenderer();
    }
    itemsAdded(e) {
        this.addItemRenderers(e.detail);
    }
    itemRemoved(e) {
        const itemRenderer = this.listItemRendererLookup.get(e.detail);
        if (itemRenderer) {
            this.removeElement(itemRenderer);
        }
        this.updateSelectedItemRenderer();
    }
    reset() {
        this.removeElements();
        this.listItemRendererLookup.clear();
        if (this.dataProvider) {
            this.addItemRenderers(this.dataProvider.source);
        }
    }
    updateSelectedItemRenderer() {
        if (this.selectedItem) {
            const itemRenderer = this.listItemRendererLookup.get(this.selectedItem);
            if (itemRenderer) {
                this.selectedItemRenderer = itemRenderer;
                return;
            }
            this.selectedItemRenderer = undefined;
            return;
        }
        this.selectedItemRenderer = undefined;
    }
    set ItemRendererClass(value) {
        if (this._ItemRendererClass === value) {
            return;
        }
        this._ItemRendererClass = value;
        this.reset();
    }
    get ItemRendererClass() {
        if (!this._ItemRendererClass) {
            this._ItemRendererClass = ItemRenderer;
        }
        return this._ItemRendererClass;
    }
    set dataProvider(value) {
        if (this._dataProvider === value) {
            return;
        }
        if (this._dataProvider) {
            this._dataProvider.removeEventListener('itemAdded', this.itemAdded);
            this._dataProvider.removeEventListener('itemsAdded', this.itemsAdded);
            this._dataProvider.removeEventListener('itemRemoved', this.itemRemoved);
            this._dataProvider.removeEventListener('reset', this.reset);
        }
        this._dataProvider = value;
        if (this._dataProvider) {
            this._dataProvider.addEventListener('itemAdded', this.itemAdded);
            this._dataProvider.addEventListener('itemsAdded', this.itemsAdded);
            this._dataProvider.addEventListener('itemRemoved', this.itemRemoved);
            this._dataProvider.addEventListener('reset', this.reset);
        }
        this.reset();
    }
    get dataProvider() {
        return this._dataProvider;
    }
    get selectedItem() {
        if (this.dataProvider) {
            return this.dataProvider.getItemAt(this.selectedIndex);
        }
        return null;
    }
    set selectedItemRenderer(value) {
        if (this._selectedItemRenderer === value) {
            return;
        }
        if (this._selectedItemRenderer) {
            this._selectedItemRenderer.selected = false;
        }
        this._selectedItemRenderer = value;
        if (this._selectedItemRenderer) {
            this._selectedItemRenderer.selected = true;
        }
    }
    get selectedItemRenderer() {
        return this._selectedItemRenderer;
    }
    set selectedIndex(value) {
        if (isNaN(this._selectedIndex) && isNaN(value)) {
            return;
        }
        if (this._selectedIndex === value) {
            return;
        }
        this._selectedIndex = value;
        this.updateSelectedItemRenderer();
    }
    get selectedIndex() {
        return this._selectedIndex;
    }
}
customElements.define('list-element', List);

class HorizontalLayout extends EventDispatcher {
    constructor(horizontalGap = 0, horizontalAlign = 'left', verticalAlign = 'top') {
        super();
        this._horizontalGap = 0;
        this._horizontalAlign = 'left';
        this._verticalAlign = 'top';
        this.name = 'HorizontalLayout';
        this.horizontalGap = horizontalGap;
        this.horizontalAlign = horizontalAlign;
        this.verticalAlign = verticalAlign;
    }
    updateChildrenSizes(container, elements) {
        let widthSum = 0;
        let percentWidthSum = 0;
        for (const element of elements) {
            if (isNaN(element.percentWidth)) {
                widthSum += element.measuredWidth;
            }
            else {
                percentWidthSum += element.percentWidth;
            }
        }
        const actualWidth = container.measuredWidth - container.paddingLeft - container.paddingRight;
        const actualHeight = container.measuredHeight - container.paddingTop - container.paddingBottom;
        const horizontalGapSumWidth = this.horizontalGap * (elements.length - 1);
        const actualWidthLeftForPercentWidth = actualWidth - widthSum - horizontalGapSumWidth;
        let pixelPercentRatio;
        if (percentWidthSum > 100) {
            pixelPercentRatio = actualWidthLeftForPercentWidth / percentWidthSum;
        }
        else {
            pixelPercentRatio = actualWidthLeftForPercentWidth / 100;
        }
        if (this.verticalAlign !== 'fill') {
            for (const element of elements) {
                if (!isNaN(element.percentWidth) && !isNaN(element.percentHeight)) {
                    element.size(pixelPercentRatio * element.percentWidth, actualHeight * element.percentHeight / 100);
                }
                else if (!isNaN(element.percentWidth) && isNaN(element.percentHeight)) {
                    element.width = pixelPercentRatio * element.percentWidth;
                }
                else if (isNaN(element.percentWidth) && !isNaN(element.percentHeight)) {
                    element.height = actualHeight * element.percentHeight / 100;
                }
            }
            return;
        }
        for (const element of elements) {
            if (!isNaN(element.percentWidth)) {
                element.size(pixelPercentRatio * element.percentWidth, actualHeight);
            }
            else {
                element.height = actualHeight;
            }
        }
    }
    updateLayout(container, elements) {
        if (this.verticalAlign === 'top') {
            this.layoutElementsTop(container, elements);
            return;
        }
        if (this.verticalAlign === 'bottom') {
            this.layoutElementsBottom(container, elements);
            return;
        }
        this.layoutElementsMiddle(container, elements);
    }
    getHorizontalXStartValue(container, elements) {
        let x = container.paddingLeft;
        if (this.horizontalAlign === 'center' || this.horizontalAlign === 'right') {
            const actualWidth = container.measuredWidth - container.paddingLeft - container.paddingRight;
            let elementsWidthSum = 0;
            for (const element of elements) {
                elementsWidthSum += element.measuredWidth;
            }
            const horizontalGapSumWidth = this.horizontalGap * (elements.length - 1);
            if (this.horizontalAlign === 'center') {
                x += (actualWidth - elementsWidthSum - horizontalGapSumWidth) * 0.5;
            }
            else {
                x += (actualWidth - elementsWidthSum - horizontalGapSumWidth);
            }
        }
        return x;
    }
    layoutElementsTop(container, elements) {
        let x = this.getHorizontalXStartValue(container, elements);
        for (const element of elements) {
            element.move(x, container.paddingTop);
            x += element.measuredWidth + this.horizontalGap;
        }
    }
    layoutElementsMiddle(container, elements) {
        let x = this.getHorizontalXStartValue(container, elements);
        let y = 0;
        for (const element of elements) {
            y = container.measuredHeight * 0.5 - element.measuredHeight * 0.5;
            element.move(x, y);
            x += element.measuredWidth + this.horizontalGap;
        }
    }
    layoutElementsBottom(container, elements) {
        let x = this.getHorizontalXStartValue(container, elements);
        let y = 0;
        for (const element of elements) {
            y = container.measuredHeight - container.paddingBottom - element.measuredHeight;
            element.move(x, y);
            x += element.measuredWidth + this.horizontalGap;
        }
    }
    getInternalSize(container, elements) {
        let width = 0;
        let height = 0;
        for (const element of elements) {
            if (height < element.measuredHeight) {
                height = element.measuredHeight;
            }
            width += element.measuredWidth + this.horizontalGap;
        }
        width = container.paddingLeft + width - this.horizontalGap + container.paddingRight;
        height = container.paddingTop + height + container.paddingBottom;
        return new Size(width, height);
    }
    getInternalWidth(container, elements) {
        let width = 0;
        for (const element of elements) {
            width += element.measuredWidth + this.horizontalGap;
        }
        return container.paddingLeft + width - this.horizontalGap + container.paddingRight;
    }
    getInternalHeight(container, elements) {
        let height = 0;
        for (const element of elements) {
            if (height < element.measuredHeight) {
                height = element.measuredHeight;
            }
        }
        return container.paddingTop + height + container.paddingBottom;
    }
    set horizontalGap(value) {
        if (this._horizontalGap === value) {
            return;
        }
        if (isNaN(value) || value < 0) {
            if (this._horizontalGap !== 0) {
                this._horizontalGap = 0;
                this.notify();
                return;
            }
        }
        this._horizontalGap = value;
        this.notify();
    }
    get horizontalGap() {
        return this._horizontalGap;
    }
    set horizontalAlign(value) {
        if (this._horizontalAlign === value) {
            return;
        }
        this._horizontalAlign = value;
        this.notify();
    }
    get horizontalAlign() {
        return this._horizontalAlign;
    }
    set verticalAlign(value) {
        if (this._verticalAlign === value) {
            return;
        }
        this._verticalAlign = value;
        this.notify();
    }
    get verticalAlign() {
        return this._verticalAlign;
    }
    notify() {
        this.dispatch('invalidate');
    }
}

class VerticalLayout extends EventDispatcher {
    constructor(verticalGap = 0, horizontalAlign = 'left', verticalAlign = 'top') {
        super();
        this._horizontalAlign = 'left';
        this._verticalAlign = 'top';
        this._verticalGap = 0;
        this.name = 'VerticalLayout';
        this.verticalGap = verticalGap;
        this.horizontalAlign = horizontalAlign;
        this.verticalAlign = verticalAlign;
    }
    updateChildrenSizes(container, elements) {
        let heightSum = 0;
        let percentHeightSum = 0;
        for (const element of elements) {
            if (!isNaN(element.percentHeight)) {
                percentHeightSum += element.percentHeight;
            }
            else {
                heightSum += element.measuredHeight;
            }
        }
        const actualWidth = container.measuredWidth - container.paddingLeft - container.paddingRight;
        const actualHeight = container.measuredHeight - container.paddingTop - container.paddingBottom;
        const verticalGapSumHeight = this.verticalGap * (elements.length - 1);
        const actualHeightLeftForPercentHeight = actualHeight - heightSum - verticalGapSumHeight;
        let pixelPercentRatio;
        if (percentHeightSum > 100) {
            pixelPercentRatio = actualHeightLeftForPercentHeight / percentHeightSum;
        }
        else {
            pixelPercentRatio = actualHeightLeftForPercentHeight / 100;
        }
        if (this.horizontalAlign !== 'fill') {
            for (const element of elements) {
                if (!isNaN(element.percentWidth) && !isNaN(element.percentHeight)) {
                    element.size(actualWidth * element.percentWidth / 100, pixelPercentRatio * element.percentHeight);
                }
                else if (!isNaN(element.percentWidth) && isNaN(element.percentHeight)) {
                    element.width = actualWidth * element.percentWidth / 100;
                }
                else if (isNaN(element.percentWidth) && !isNaN(element.percentHeight)) {
                    element.height = pixelPercentRatio * element.percentHeight;
                }
            }
            return;
        }
        for (const element of elements) {
            if (!isNaN(element.percentHeight)) {
                element.size(actualWidth, pixelPercentRatio * element.percentHeight);
            }
            else {
                element.width = actualWidth;
            }
        }
    }
    updateLayout(container, elements) {
        if (this.horizontalAlign === 'left') {
            this.layoutElementsLeft(container, elements);
            return;
        }
        if (this.horizontalAlign === 'right') {
            this.layoutElementsRight(container, elements);
            return;
        }
        this.layoutElementsCenter(container, elements);
    }
    getVerticalYStartValue(container, elements) {
        let y = container.paddingTop;
        if (this.verticalAlign === 'middle' || this.verticalAlign === 'bottom') {
            const actualHeight = container.measuredHeight - container.paddingTop - container.paddingBottom;
            let elementsHeightSum = 0;
            for (const element of elements) {
                elementsHeightSum += element.measuredHeight;
            }
            const verticalGapSumHeight = this.verticalGap * (elements.length - 1);
            if (this.verticalAlign === 'middle') {
                y += (actualHeight - elementsHeightSum - verticalGapSumHeight) * 0.5;
            }
            else {
                y += (actualHeight - elementsHeightSum - verticalGapSumHeight);
            }
        }
        return y;
    }
    layoutElementsLeft(container, elements) {
        let y = this.getVerticalYStartValue(container, elements);
        for (const element of elements) {
            element.move(container.paddingLeft, y);
            y += element.measuredHeight + this.verticalGap;
        }
    }
    layoutElementsCenter(container, elements) {
        let x = 0;
        let y = this.getVerticalYStartValue(container, elements);
        for (const element of elements) {
            x = container.measuredWidth * 0.5 - element.measuredWidth * 0.5;
            element.move(x, y);
            y += element.measuredHeight + this.verticalGap;
        }
    }
    layoutElementsRight(container, elements) {
        let x = 0;
        let y = this.getVerticalYStartValue(container, elements);
        for (const element of elements) {
            x = container.measuredWidth - container.paddingRight - element.measuredWidth;
            element.move(x, y);
            y += element.measuredHeight + this.verticalGap;
        }
    }
    getInternalSize(container, elements) {
        let width = 0;
        let height = 0;
        for (const element of elements) {
            if (width < element.measuredWidth) {
                width = element.measuredHeight;
            }
            height += element.measuredHeight + this.verticalGap;
        }
        width = container.paddingLeft + width + container.paddingRight;
        height = container.paddingTop + height - this.verticalGap + container.paddingBottom;
        return new Size(width, height);
    }
    getInternalWidth(container, elements) {
        let width = 0;
        for (const element of elements) {
            if (width < element.measuredWidth) {
                width = element.measuredHeight;
            }
        }
        return container.paddingLeft + width + container.paddingRight;
    }
    getInternalHeight(container, elements) {
        let height = 0;
        for (const element of elements) {
            height += element.measuredHeight + this.verticalGap;
        }
        return container.paddingTop + height - this.verticalGap + container.paddingBottom;
    }
    set horizontalAlign(value) {
        if (this._horizontalAlign === value) {
            return;
        }
        this._horizontalAlign = value;
        this.notify();
    }
    get horizontalAlign() {
        return this._horizontalAlign;
    }
    set verticalAlign(value) {
        if (this._verticalAlign === value) {
            return;
        }
        this._verticalAlign = value;
        this.notify();
    }
    get verticalAlign() {
        return this._verticalAlign;
    }
    set verticalGap(value) {
        if (this._verticalGap === value) {
            return;
        }
        if (isNaN(value) || value < 0) {
            if (this._verticalGap !== 0) {
                this._verticalGap = 0;
                this.notify();
                return;
            }
        }
        this._verticalGap = value;
        this.notify();
    }
    get verticalGap() {
        return this._verticalGap;
    }
    notify() {
        this.dispatch('invalidate');
    }
}

class TextElement extends BaseText {
    constructor() {
        super();
        this.name = 'TextElement';
        this.lineHeight = 1.2;
    }
    validate() {
        super.validate();
        this.invalidateInternalSize();
        this.textRenderer.width = this.measuredWidth;
        this.updateTextRendererPosition();
    }
    updateInternalSize() {
        this.resetTextRendererStyles();
        this.internalSize(this.actualRendererWidth, this.actualRendererHeight);
    }
    updateInternalWidth() {
        this.resetTextRendererStyles();
        this.internalWidth = this.actualRendererWidth;
    }
    updateInternalHeight() {
        this.resetTextRendererStyles();
        this.internalHeight = this.actualRendererHeight;
    }
}
customElements.define('text-element', TextElement);

class Modal extends DisplayContainer {
    constructor() {
        super();
        this.name = 'Modal';
        this.backgroundColor = this.colors.neutral.c0;
        this.minWidth = 300;
        this.percentWidth = 50;
        this.addFilter(new BoxShadowFilter(0, 4, 6, -1, new Color(0, 0, 0, 0.1)));
        this.addFilter(new BoxShadowFilter(0, 2, 4, -1, new Color(0, 0, 0, 0.06)));
        this.cornerSize = 8;
        this.layout = new VerticalLayout(0, 'fill');
        this.addElement(this.body);
        this.addElement(this.bottomBar);
    }
    get body() {
        if (!this._body) {
            this._body = new DisplayContainer();
            this._body.padding = 24;
            this._body.layout = new VerticalLayout(24, 'fill');
            this._body.addElements([this.header, this.textElement]);
        }
        return this._body;
    }
    get header() {
        if (!this._header) {
            this._header = new DisplayContainer();
            this._header.layout = new HorizontalLayout();
            this._header.addElements([this.titleLabel, this.badge]);
        }
        return this._header;
    }
    get titleLabel() {
        if (!this._titleLabel) {
            this._titleLabel = new LabelElement();
            this._titleLabel.percentWidth = 100;
            this._titleLabel.text = 'Lorem Ipsum';
            this._titleLabel.typeFace = this.typography.primary;
            this._titleLabel.fontSize = 32;
            this._titleLabel.fontWeight = 700;
            this._titleLabel.textColor = this.colors.neutral.c700;
        }
        return this._titleLabel;
    }
    get badge() {
        if (!this._badge) {
            this._badge = new Badge();
            this._badge.text = '1.254,43';
        }
        return this._badge;
    }
    get textElement() {
        if (!this._textElement) {
            this._textElement = new TextElement();
            this._textElement.typeFace = this.typography.secondary;
            this._textElement.textColor = this.colors.neutral.c500;
            this._textElement.fontWeight = 500;
            this._textElement.text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ';
        }
        return this._textElement;
    }
    get bottomBar() {
        if (!this._bottomBar) {
            this._bottomBar = new DisplayContainer();
            // this._bottomBar.height = 56;
            this._bottomBar.paddingTop = this._bottomBar.paddingBottom = 8;
            this._bottomBar.paddingRight = 8;
            this._bottomBar.backgroundColor = this.colors.neutral.c100;
            this._bottomBar.layout = new HorizontalLayout(8, 'right');
            this._bottomBar.addElements([this.cancelButton, this.okButton]);
        }
        return this._bottomBar;
    }
    get cancelButton() {
        if (!this._cancelButton) {
            this._cancelButton = new Button();
            this._cancelButton.label = 'Cancel';
        }
        return this._cancelButton;
    }
    get okButton() {
        if (!this._okButton) {
            this._okButton = new Button();
            this._okButton.label = 'Continue';
            this._okButton.backgroundColor = this.colors.success.c500;
            this._okButton.textColor = this.colors.success.c50;
        }
        return this._okButton;
    }
}
customElements.define('modal-element', Modal);

class ApplicationElement extends DisplayContainer {
    constructor() {
        super();
        this.name = 'ApplicationElement';
        this.style.overflow = "hidden" /* HIDDEN */;
        document.body.style.setProperty('position', 'absolute');
        document.body.style.setProperty('-webkit-overflow-scrolling', 'touch');
        document.body.style.setProperty('-webkit-tap-highlight-color', 'transparent');
        document.body.style.setProperty('-moz-tap-highlight-color', 'transparent');
        document.body.style.setProperty('margin', '0');
        window.addEventListener('resize', this.resize.bind(this));
        this.resize();
    }
    resize() {
        this.size(window.innerWidth, window.innerHeight);
    }
}
customElements.define('application-element', ApplicationElement);

class ArrayCollection extends EventDispatcher {
    constructor(source = null) {
        super();
        this.name = 'ArrayList';
        if (source) {
            this._source = source;
            return;
        }
        this._source = [];
    }
    addItem(item) {
        this.source.push(item);
        this.dispatch('itemAdded', item);
    }
    addItems(items) {
        this._source = this.source.concat(items);
        this.dispatch('itemsAdded', items);
    }
    getItemIndex(item) {
        const index = this.source.indexOf(item);
        if (index === -1) {
            return NaN;
        }
        return index;
    }
    getItemAt(index) {
        if (isNaN(index) || index < 0) {
            return null;
        }
        if (index < this.source.length) {
            return this.source[index];
        }
        return null;
    }
    removeItem(item) {
        const index = this.source.indexOf(item);
        if (index > -1) {
            this.source.splice(index, 1);
            this.dispatch('itemRemoved', item);
        }
    }
    removeItemAt(index) {
        const item = this.getItemAt(index);
        if (item) {
            this.source.splice(index, 1);
            this.dispatch('itemRemoved', item);
        }
    }
    removeAll() {
        if (this.length > 0) {
            this.source.length = 0;
            this.dispatchEvent(new Event('reset'));
        }
    }
    get length() {
        return this.source.length;
    }
    get source() {
        return this._source;
    }
}

class SvgElement extends SizeElement {
    constructor() {
        super();
        this._viewBox = null;
        this._enabled = true;
        this.name = 'SvgElement';
        this.enabled = false;
        this.appendChild(this.svg);
    }
    validate() {
        super.validate();
        this.updateSvgAttributes();
    }
    updateSvgAttributes() {
        this.svg.setAttribute('width', this.measuredWidth.toString());
        this.svg.setAttribute('height', this.measuredHeight.toString());
    }
    addFilter(value) {
        console.log(this.name, value);
    }
    get svg() {
        if (!this._svg) {
            this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this._svg.style.position = 'absolute';
            this._svg.style.overflow = 'visible';
            this._svg.appendChild(this.defs);
            this._svg.appendChild(this.group);
            this._svg.setAttribute('preserveAspectRatio', 'none');
        }
        return this._svg;
    }
    get defs() {
        if (!this._defs) {
            this._defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        }
        return this._defs;
    }
    get group() {
        if (!this._group) {
            this._group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        }
        return this._group;
    }
    set viewBox(value) {
        if (this._viewBox === value) {
            return;
        }
        this._viewBox = value;
        if (this._viewBox) {
            const box = this._viewBox;
            this.svg.setAttribute('viewBox', box.x + ' ' + box.y + ' ' + box.width + ' ' + box.height);
            return;
        }
        this.svg.removeAttribute('viewBox');
    }
    get viewBox() {
        return this._viewBox;
    }
    set enabled(value) {
        if (this._enabled === value) {
            return;
        }
        this._enabled = value;
        if (value) {
            this.style.pointerEvents = '';
            this.style.userSelect = 'auto';
        }
        else {
            this.style.pointerEvents = 'none';
            this.style.userSelect = 'none';
        }
    }
    get enabled() {
        return this._enabled;
    }
}
customElements.define('svg-element', SvgElement);

class PathElement extends SvgElement {
    constructor() {
        super();
        this._pathData = '';
        this.strokeLinearGradientId = Math.random().toString();
        this.fillLinearGradientId = Math.random().toString();
        this._strokeColor = null;
        this._fillColor = null;
        this.strokeColorStopMapping = new Map();
        this.fillColorStopMapping = new Map();
        this._strokeWidth = 0;
        this.name = 'PathElement';
        this.strokeColorChanged = this.strokeColorChanged.bind(this);
        this.fillColorChanged = this.fillColorChanged.bind(this);
        this.strokeLinearGradientColorAdded = this.strokeLinearGradientColorAdded.bind(this);
        this.strokeLinearGradientColorsAdded = this.strokeLinearGradientColorsAdded.bind(this);
        this.strokeLinearGradientColorChanged = this.strokeLinearGradientColorChanged.bind(this);
        this.strokeLinearGradientDegreesChanged = this.strokeLinearGradientDegreesChanged.bind(this);
        this.fillLinearGradientColorAdded = this.fillLinearGradientColorAdded.bind(this);
        this.fillLinearGradientColorsAdded = this.fillLinearGradientColorsAdded.bind(this);
        this.fillLinearGradientColorChanged = this.fillLinearGradientColorChanged.bind(this);
        this.fillLinearGradientDegreesChanged = this.fillLinearGradientDegreesChanged.bind(this);
        this.group.appendChild(this.path);
    }
    validate() {
        super.validate();
        if (this.fillColor instanceof LinearGradient) {
            this.updateLinearGradientRotation(this.fillLinearGradient, this.fillColor.degrees);
        }
        if (this.strokeColor instanceof LinearGradient) {
            this.updateLinearGradientRotation(this.strokeLinearGradient, this.strokeColor.degrees);
        }
    }
    set pathData(value) {
        if (this._pathData === value) {
            return;
        }
        this._pathData = value;
        this.path.setAttribute("d" /* D */, value);
    }
    get pathData() {
        return this._pathData;
    }
    get path() {
        if (!this._path) {
            this._path = document.createElementNS("http://www.w3.org/2000/svg" /* SVG_NS */, "path" /* PATH */);
        }
        return this._path;
    }
    get strokeLinearGradient() {
        if (!this._strokeLinearGradient) {
            this._strokeLinearGradient = this.getLinearGradient(this.strokeLinearGradientId);
        }
        return this._strokeLinearGradient;
    }
    get fillLinearGradient() {
        if (!this._fillLinearGradient) {
            this._fillLinearGradient = this.getLinearGradient(this.fillLinearGradientId);
        }
        return this._fillLinearGradient;
    }
    getLinearGradient(id) {
        const linearGradient = document.createElementNS("http://www.w3.org/2000/svg" /* SVG_NS */, "linearGradient" /* LINEAR_GRADIENT */);
        linearGradient.setAttribute("id" /* ID */, id);
        linearGradient.setAttribute("gradientUnits" /* GRADIENT_UNITS */, "userSpaceOnUse" /* USER_SPACE_ON_USE */);
        return linearGradient;
    }
    resetLinearGradient(linearGradient) {
        while (linearGradient.firstChild) {
            linearGradient.removeChild(linearGradient.firstChild);
        }
        linearGradient.removeAttribute("gradientTransform" /* GRADIENT_TRANSFORM */);
    }
    strokeColorChanged(e) {
        this.path.setAttribute("stroke" /* STROKE */, e.detail.toString());
    }
    fillColorChanged(e) {
        this.path.setAttribute("fill" /* FILL */, e.detail.toString());
    }
    strokeLinearGradientColorChanged(e) {
        const color = e.detail;
        const stops = this.strokeColorStopMapping.get(color);
        if (stops) {
            for (const stop of stops) {
                stop.setAttribute("stop-color" /* STOP_COLOR */, color.toString());
            }
        }
    }
    fillLinearGradientColorChanged(e) {
        const color = e.detail;
        const stops = this.fillColorStopMapping.get(color);
        if (stops) {
            for (const stop of stops) {
                stop.setAttribute("stop-color" /* STOP_COLOR */, color.toString());
            }
        }
    }
    fillLinearGradientColorAdded(e) {
        this.addStopColorToFillLinearGradient(e.detail);
        this.updateLinearGradientStopOffsets(this.fillLinearGradient);
    }
    strokeLinearGradientColorAdded(e) {
        this.addStopColorToStrokeLinearGradient(e.detail);
        this.updateLinearGradientStopOffsets(this.strokeLinearGradient);
    }
    fillLinearGradientColorsAdded(e) {
        this.addStopColorsToFillLinearGradient(e.detail);
        this.updateLinearGradientStopOffsets(this.fillLinearGradient);
    }
    strokeLinearGradientColorsAdded(e) {
        this.addStopColorsToStrokeLinearGradient(e.detail);
        this.updateLinearGradientStopOffsets(this.strokeLinearGradient);
    }
    fillLinearGradientDegreesChanged(e) {
        this.updateLinearGradientRotation(this.fillLinearGradient, e.detail);
    }
    strokeLinearGradientDegreesChanged(e) {
        this.updateLinearGradientRotation(this.strokeLinearGradient, e.detail);
    }
    set strokeColor(value) {
        if (this._strokeColor === value) {
            return;
        }
        if (this._strokeColor instanceof Color) {
            this._strokeColor.removeEventListener(Color.CHANGED, this.strokeColorChanged);
        }
        else if (this._strokeColor instanceof LinearGradient) {
            this.defs.removeChild(this.strokeLinearGradient);
            this.resetLinearGradient(this.strokeLinearGradient);
            this.strokeColorStopMapping.clear();
            this.removeStrokeLinearGradientListeners(this._strokeColor);
        }
        this._strokeColor = value;
        if (this._strokeColor instanceof Color) {
            this._strokeColor.addEventListener(Color.CHANGED, this.strokeColorChanged);
            this.path.setAttribute("stroke" /* STROKE */, this._strokeColor.toString());
            return;
        }
        if (this._strokeColor instanceof LinearGradient) {
            this.updateLinearGradientRotation(this.strokeLinearGradient, this._strokeColor.degrees);
            if (this._strokeColor.colors.length) {
                this.addStopColorsToStrokeLinearGradient(this._strokeColor.colors);
                this.updateLinearGradientStopOffsets(this.strokeLinearGradient);
            }
            this.defs.appendChild(this.strokeLinearGradient);
            this.addStrokeLinearGradientListeners(this._strokeColor);
            this.path.setAttribute("stroke" /* STROKE */, "url" /* URL */ + "('#" + this.strokeLinearGradientId + "')");
            return;
        }
        this.path.removeAttribute("stroke" /* STROKE */);
    }
    get strokeColor() {
        return this._strokeColor;
    }
    set fillColor(value) {
        if (this._fillColor === value) {
            return;
        }
        if (this._fillColor instanceof Color) {
            this._fillColor.removeEventListener(Color.CHANGED, this.fillColorChanged);
        }
        else if (this._fillColor instanceof LinearGradient) {
            this.defs.removeChild(this.fillLinearGradient);
            this.resetLinearGradient(this.fillLinearGradient);
            this.fillColorStopMapping.clear();
            this.removeFillLinearGradientListeners(this._fillColor);
        }
        this._fillColor = value;
        if (this._fillColor instanceof Color) {
            this._fillColor.addEventListener(Color.CHANGED, this.fillColorChanged);
            this.path.setAttribute("fill" /* FILL */, this._fillColor.toString());
            return;
        }
        if (this._fillColor instanceof LinearGradient) {
            this.updateLinearGradientRotation(this.fillLinearGradient, this._fillColor.degrees);
            if (this._fillColor.colors.length) {
                this.addStopColorsToFillLinearGradient(this._fillColor.colors);
                this.updateLinearGradientStopOffsets(this.fillLinearGradient);
            }
            this.defs.appendChild(this.fillLinearGradient);
            this.addFillLinearGradientListeners(this._fillColor);
            this.path.setAttribute("fill" /* FILL */, "url" /* URL */ + "('#" + this.fillLinearGradientId + "')");
            return;
        }
        this.path.removeAttribute("fill" /* FILL */);
    }
    get fillColor() {
        return this._fillColor;
    }
    removeStrokeLinearGradientListeners(linearGradient) {
        linearGradient.removeEventListener(LinearGradient.COLOR_ADDED, this.strokeLinearGradientColorAdded);
        linearGradient.removeEventListener(LinearGradient.COLORS_ADDED, this.strokeLinearGradientColorsAdded);
        linearGradient.removeEventListener(LinearGradient.COLOR_CHANGED, this.strokeLinearGradientColorChanged);
        linearGradient.removeEventListener(LinearGradient.DEGREES_CHANGED, this.strokeLinearGradientDegreesChanged);
    }
    addStrokeLinearGradientListeners(linearGradient) {
        linearGradient.addEventListener(LinearGradient.COLOR_ADDED, this.strokeLinearGradientColorAdded);
        linearGradient.addEventListener(LinearGradient.COLORS_ADDED, this.strokeLinearGradientColorsAdded);
        linearGradient.addEventListener(LinearGradient.COLOR_CHANGED, this.strokeLinearGradientColorChanged);
        linearGradient.addEventListener(LinearGradient.DEGREES_CHANGED, this.strokeLinearGradientDegreesChanged);
    }
    removeFillLinearGradientListeners(linearGradient) {
        linearGradient.removeEventListener(LinearGradient.COLOR_ADDED, this.fillLinearGradientColorAdded);
        linearGradient.removeEventListener(LinearGradient.COLORS_ADDED, this.fillLinearGradientColorsAdded);
        linearGradient.removeEventListener(LinearGradient.COLOR_CHANGED, this.fillLinearGradientColorChanged);
        linearGradient.removeEventListener(LinearGradient.DEGREES_CHANGED, this.fillLinearGradientDegreesChanged);
    }
    addFillLinearGradientListeners(linearGradient) {
        linearGradient.addEventListener(LinearGradient.COLOR_ADDED, this.fillLinearGradientColorAdded);
        linearGradient.addEventListener(LinearGradient.COLORS_ADDED, this.fillLinearGradientColorsAdded);
        linearGradient.addEventListener(LinearGradient.COLOR_CHANGED, this.fillLinearGradientColorChanged);
        linearGradient.addEventListener(LinearGradient.DEGREES_CHANGED, this.fillLinearGradientDegreesChanged);
    }
    updateLinearGradientRotation(linearGradientElement, degrees) {
        let transform = "rotate" /* ROTATE */ + '(' + degrees + ' ';
        if (this.viewBox) {
            transform += this.viewBox.width * 0.5 + ' ' + this.viewBox.height * 0.5 + ')';
        }
        else {
            transform += this.measuredWidth * 0.5 + ' ' + this.measuredHeight * 0.5 + ')';
        }
        linearGradientElement.setAttribute("gradientTransform" /* GRADIENT_TRANSFORM */, transform);
    }
    addStopColorsToStrokeLinearGradient(colors) {
        for (const color of colors) {
            this.addStopColorToStrokeLinearGradient(color);
        }
    }
    addStopColorToStrokeLinearGradient(color) {
        const stop = this.getStopFromColor(color);
        let stops = this.strokeColorStopMapping.get(color);
        if (!stops) {
            stops = [];
        }
        stops.push(stop);
        this.strokeColorStopMapping.set(color, stops);
        this.strokeLinearGradient.appendChild(stop);
    }
    addStopColorsToFillLinearGradient(colors) {
        for (const color of colors) {
            this.addStopColorToFillLinearGradient(color);
        }
    }
    addStopColorToFillLinearGradient(color) {
        const stop = this.getStopFromColor(color);
        let stops = this.fillColorStopMapping.get(color);
        if (!stops) {
            stops = [];
        }
        stops.push(stop);
        this.fillColorStopMapping.set(color, stops);
        this.fillLinearGradient.appendChild(stop);
    }
    getStopFromColor(color) {
        const stop = document.createElementNS("http://www.w3.org/2000/svg" /* SVG_NS */, "stop" /* STOP */);
        stop.setAttribute("stop-color" /* STOP_COLOR */, color.toString());
        return stop;
    }
    updateLinearGradientStopOffsets(linearGradientElement) {
        if (linearGradientElement.childNodes.length) {
            let offset = 0.0;
            const offsetStep = 1 / (linearGradientElement.childNodes.length - 1);
            for (const child of linearGradientElement.childNodes) {
                const stop = child;
                stop.setAttribute("offset" /* OFFSET */, offset + '');
                offset = offset + offsetStep;
            }
        }
    }
    set strokeWidth(value) {
        if (this._strokeWidth === value) {
            return;
        }
        if (isNaN(value) || value < 0) {
            if (this._strokeWidth !== 0) {
                this._strokeWidth = 0;
                this.path.removeAttribute("stroke-width" /* STROKE_WIDTH */);
            }
            return;
        }
        this._strokeWidth = value;
        this.path.setAttribute("stroke-width" /* STROKE_WIDTH */, this._strokeWidth.toString());
    }
    get strokeWidth() {
        return this._strokeWidth;
    }
}
customElements.define('path-element', PathElement);

class SurfaceElement extends PathElement {
    constructor() {
        super();
        this._cornerSize = 0;
        this._cornerType = 'round';
        this.name = 'SurfaceElement';
        this.group.appendChild(this.path);
    }
    validate() {
        super.validate();
        this.updatePathData();
    }
    updatePathData() {
        if (this.cornerType === 'round') {
            this.path.setAttribute('d', this.getRoundData());
            return;
        }
        this.path.setAttribute('d', this.getCutData());
    }
    set cornerSize(value) {
        if (this._cornerSize === value) {
            return;
        }
        if (isNaN(value) || value < 0) {
            this._cornerSize = 0;
            this.invalidate();
            return;
        }
        this._cornerSize = value;
        this.invalidate();
    }
    get cornerSize() {
        return this._cornerSize;
    }
    set cornerType(value) {
        if (this._cornerType === value) {
            return;
        }
        this._cornerType = value;
        this.invalidate();
    }
    get cornerType() {
        return this._cornerType;
    }
    getCutData() {
        const tlc = this.cornerSize;
        const trc = tlc;
        const brc = tlc;
        const blc = tlc;
        const w = this.measuredWidth;
        const h = this.measuredHeight;
        let d = '';
        d += 'M ' + tlc + ' 0 ';
        d += 'L ' + (w - trc) + ' 0 ';
        d += 'L ' + w + ' ' + trc;
        d += 'L ' + w + ' ' + (h - brc);
        d += 'L ' + (w - brc) + ' ' + h;
        d += 'L ' + blc + ' ' + h;
        d += 'L 0 ' + (h - blc);
        d += 'L 0 ' + tlc;
        d += 'Z';
        return d;
    }
    getRoundData() {
        const tlc = this.cornerSize;
        const trc = tlc;
        const brc = tlc;
        const blc = tlc;
        const w = this.measuredWidth;
        const h = this.measuredHeight;
        let d = '';
        // mov top left arc start
        d += 'M 0 ' + tlc + ' ';
        // tlc arc
        d += 'A ' + tlc + ' ' + tlc + ' 0 0 1 ' + tlc + ' 0 ';
        // line to topRightCorner
        d += 'L ' + (w - trc) + ' 0 ';
        // trc arc
        d += 'A ' + trc + ' ' + trc + ' 1 0 1 ' + w + ' ' + trc + ' ';
        // line to bottomRightCorner
        d += 'L ' + w + ' ' + (h - brc) + ' ';
        // brc arc
        d += 'A ' + brc + ' ' + brc + ' 1 0 1 ' + (w - brc) + ' ' + h + ' ';
        // line to bottomLeftCorner
        d += 'L ' + blc + ' ' + h + ' ';
        // blc arc
        d += 'A ' + blc + ' ' + blc + ' 0 0 1 ' + '0 ' + (h - blc) + ' ';
        // close path
        d += 'Z';
        return d;
    }
}
customElements.define('surface-element', SurfaceElement);

class BottomNavigationItemRenderer extends ItemRenderer {
    constructor() {
        super();
        this.name = 'BottomNavigationItemRenderer';
        this.height = 56;
        this.percentWidth = 100;
        this.paddingY = 6;
        this.layout = new VerticalLayout(4, 'center');
        this.addElement(this.pathElement);
        this.addElement(this.labelElement);
    }
    dataChanged() {
        if (this.data) {
            this.labelElement.text = this.data.text;
            this.pathElement.pathData = this.data.icon;
        }
    }
    initial() {
        if (!this.selected) {
            this.backgroundColor = null;
        }
        else {
            this.backgroundColor = this.colors.primary.c800;
        }
    }
    hover() {
        this.backgroundColor = this.colors.primary.c900;
    }
    // eslint-disable-next-line
    pressed(point) {
        this.backgroundColor = this.colors.primary.c800;
    }
    selectedChanged() {
        if (this.selected) {
            this.backgroundColor = this.colors.primary.c800;
            return;
        }
        this.backgroundColor = null;
    }
    get pathElement() {
        if (!this._pathElement) {
            this._pathElement = new PathElement();
            this._pathElement.size(24, 24);
            this._pathElement.strokeWidth = 2;
            this._pathElement.strokeColor = this.colors.primary.c300;
            this._pathElement.fillColor = new Color(0, 0, 0, 0.0);
        }
        return this._pathElement;
    }
    get labelElement() {
        if (!this._labelElement) {
            this._labelElement = new LabelElement();
            this._labelElement.enabled = false;
            this._labelElement.typeFace = this.typography.secondary;
            this._labelElement.fontSize = 14;
            this._labelElement.fontWeight = 500;
            this._labelElement.textColor = this.colors.primary.c300;
        }
        return this._labelElement;
    }
}
customElements.define('bottom-navigation-item-renderer', BottomNavigationItemRenderer);

class NavigationItemRenderer extends ItemRenderer {
    constructor() {
        super();
        this.name = 'NavigationItemRenderer';
        this.height = 40;
        this.paddingX = 8;
        this.cornerSize = 4;
        this.percentWidth = 100;
        this.layout = new HorizontalLayout(16, 'left', 'middle');
        this.addElement(this.pathElement);
        this.addElement(this.labelElement);
    }
    initial() {
        if (!this.selected) {
            this.backgroundColor = null;
        }
        else {
            this.backgroundColor = this.colors.primary.c800;
        }
    }
    hover() {
        this.backgroundColor = this.colors.primary.c900;
    }
    // eslint-disable-next-line
    pressed(point) {
        this.backgroundColor = this.colors.primary.c800;
    }
    selectedChanged() {
        if (this.selected) {
            this.backgroundColor = this.colors.primary.c800;
            return;
        }
        this.backgroundColor = null;
    }
    dataChanged() {
        if (this.data) {
            this.labelElement.text = this.data.text;
            this.pathElement.pathData = this.data.icon;
        }
    }
    get pathElement() {
        if (!this._pathElement) {
            this._pathElement = new PathElement();
            this._pathElement.size(24, 24);
            this._pathElement.strokeWidth = 2;
            this._pathElement.strokeColor = this.colors.primary.c300;
            this._pathElement.fillColor = new Color(0, 0, 0, 0.0);
        }
        return this._pathElement;
    }
    get labelElement() {
        if (!this._labelElement) {
            this._labelElement = new LabelElement();
            this._labelElement.enabled = false;
            this._labelElement.typeFace = this.typography.secondary;
            this._labelElement.fontSize = 14;
            this._labelElement.fontWeight = 500;
            this._labelElement.percentWidth = 100;
            this._labelElement.textColor = this.colors.primary.c300;
        }
        return this._labelElement;
    }
}
customElements.define('navigation-item-renderer', NavigationItemRenderer);

class NavigationItem {
    constructor(text, icon) {
        this.text = text;
        this.icon = icon;
    }
}

class UnamiDev extends ApplicationElement {
    constructor() {
        super();
        this.name = 'UnamiDev';
        this.backgroundColor = new Color(218, 60, 8);
        // this.backgroundColor = this.colors.neutral.c100;
        // this.theme.typography.primary = new TypeFace('Bitter', 0.71, 0.03, 0.02);
        this.theme.typography.primary = new TypeFace('Eurostile Extended', 0.68, 0.09, 0.025);
        this.theme.typography.secondary = new TypeFace('Inter', 0.727, 0.09, 0.0);
        // this.theme.typography.secondary = new TypeFace('Eurostile', 0.67, 0.06, 0.01);
        this.layout = new VerticalLayout(200, 'center', 'middle');
        window.addEventListener('load', () => {
            // this.addElement(this.list);
            this.addElement(this.bottomNavigationList);
            // this.addElement(this.labelElement);
            // this.addElement(this.labelElement2);
        });
        window.addEventListener('click', () => {
            // this.list.dataProvider = this.navigationItems;
        });
        this.addEventListener('triggered', (e) => {
            console.log(this.name, e.type);
        });
    }
    selectedItemChanged(e) {
        console.log('unami', this.name, e.type, e.detail);
    }
    selectedIndexChanged(e) {
        console.log('unami', this.name, e.type, e.detail);
    }
    get labelElement() {
        if (!this._labelElement) {
            this._labelElement = new LabelElement();
            this._labelElement.text = 'TRON 80';
            this._labelElement.fontSize = 50;
            this._labelElement.fontWeight = 400;
            this._labelElement.letterSpacing = 10;
            this._labelElement.textColor = new Color(18, 100, 46); // hsl(18,100,46)
            this._labelElement.typeFace = this.theme.typography.primary;
        }
        return this._labelElement;
    }
    get labelElement2() {
        if (!this._labelElement2) {
            this._labelElement2 = new LabelElement();
            this._labelElement2.text = 'TRON 80';
            this._labelElement2.fontSize = 50;
            this._labelElement2.fontWeight = 700;
            this._labelElement2.letterSpacing = 10;
            this._labelElement2.textColor = new Color(0, 100, 38); // hsl(0,100,38) red new Color(50, 98, 51); // yellow new Color(204, 97, 48);light blue
            this._labelElement2.typeFace = this.theme.typography.secondary;
        }
        return this._labelElement2;
    }
    get bottomNavigationList() {
        if (!this._bottomNavigationList) {
            this._bottomNavigationList = new List();
            this._bottomNavigationList.selectedIndex = 0;
            this._bottomNavigationList.height = 56;
            this._bottomNavigationList.percentWidth = 100;
            this._bottomNavigationList.backgroundColor = this.colors.primary.c700;
            this._bottomNavigationList.addFilter(new BoxShadowFilter(0, -4, 6, -1, new Color(0, 0, 0, 0.1)));
            this._bottomNavigationList.addFilter(new BoxShadowFilter(0, -2, 4, -1, new Color(0, 0, 0, 0.06)));
            this._bottomNavigationList.dataProvider = this.navigationItems;
            this._bottomNavigationList.ItemRendererClass = BottomNavigationItemRenderer;
            this._bottomNavigationList.layout = new HorizontalLayout(0, 'center', 'middle');
        }
        return this._bottomNavigationList;
    }
    get list() {
        if (!this._list) {
            this._list = new List();
            this._list.backgroundColor = this.colors.primary.c700;
            // this._list.cornerSize = 4;
            this._list.selectedIndex = 0;
            this._list.padding = 8;
            this._list.width = 200;
            this._list.percentHeight = 100;
            this._list.ItemRendererClass = NavigationItemRenderer;
            this._list.dataProvider = this.navigationItems;
            this._list.layout = new VerticalLayout(8, 'fill');
            // this._list.addFilter(new BoxShadowFilter(0, 4, 6, -1, new Color(0, 0, 0, 0.1)));
            // this._list.addFilter(new BoxShadowFilter(0, 2, 4, -1, new Color(0, 0, 0, 0.06)));
            this._list.horizontalScrollEnabled = false;
            this._list.verticalScrollEnabled = true;
            this._list.addEventListener('selectedItemChanged', this.selectedItemChanged.bind(this));
            this._list.addEventListener('selectedIndexChanged', this.selectedIndexChanged.bind(this));
        }
        return this._list;
    }
    get navigationItems() {
        if (!this._navigationItems) {
            this._navigationItems = new ArrayCollection([
                new NavigationItem('Home', "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /* HOME */),
                new NavigationItem('Blog', "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /* PENCIL_ALT */),
                new NavigationItem('About', "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /* USER */),
                new NavigationItem('Work', "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /* TERMINAL */),
                new NavigationItem('Design', "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /* SPARKLES */)
            ]);
        }
        return this._navigationItems;
    }
    get button() {
        if (!this._button) {
            this._button = new Button();
        }
        return this._button;
    }
    get badge() {
        if (!this._badge) {
            this._badge = new Badge();
            this._badge.text = 'DEFAULT';
        }
        return this._badge;
    }
}
customElements.define('unami-dev', UnamiDev);

class MartinRossil extends ApplicationElement {
    constructor() {
        super();
        this.layout = new VerticalLayout(0, 'center', 'middle');
        this.theme.typography.primary = new TypeFace('Inter', 0.727, 0.09, 0.0);
        window.addEventListener('load', () => {
            this.addElement(this.labelElement);
        });
    }
    get labelElement() {
        if (!this._labelElement) {
            this._labelElement = new LabelElement();
            this._labelElement.text = 'Martin Rossil';
            this._labelElement.fontSize = 50;
            this._labelElement.fontWeight = 700;
            this._labelElement.letterSpacing = 10;
            this._labelElement.textColor = this.colors.primary.c500;
            this._labelElement.typeFace = this.theme.typography.primary;
        }
        return this._labelElement;
    }
}
customElements.define('martin-rossil', MartinRossil);

export default MartinRossil;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFydGluUm9zc2lsLmpzIiwic291cmNlcyI6WyIuLi9ub2RlX21vZHVsZXMvdW5hbWkvZGlzdC9pbmRleC5qcyIsIi4uL3NyYy9NYXJ0aW5Sb3NzaWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgRXZlbnREaXNwYXRjaGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHRoaXMuX25hbWUgPSAnJztcclxuICAgIH1cclxuICAgIGRpc3BhdGNoRXZlbnQoZXZlbnQpIHtcclxuICAgICAgICBjb25zdCB0eXBlTGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnMuZ2V0KGV2ZW50LnR5cGUpO1xyXG4gICAgICAgIGlmICh0eXBlTGlzdGVuZXJzICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBsaXN0ZW5lciBvZiB0eXBlTGlzdGVuZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcihldmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBkaXNwYXRjaCh0eXBlLCBwYXlsb2FkID0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgY29uc3QgdHlwZUxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzLmdldCh0eXBlKTtcclxuICAgICAgICBpZiAodHlwZUxpc3RlbmVycyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1c3RvbUV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KHR5cGUsIHsgZGV0YWlsOiBwYXlsb2FkIH0pO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGxpc3RlbmVyIG9mIHR5cGVMaXN0ZW5lcnMpIHtcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVyKGN1c3RvbUV2ZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcclxuICAgICAgICBsZXQgdHlwZUxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzLmdldCh0eXBlKTtcclxuICAgICAgICBpZiAodHlwZUxpc3RlbmVycyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHR5cGVMaXN0ZW5lcnMgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5saXN0ZW5lcnMuc2V0KHR5cGUsIHR5cGVMaXN0ZW5lcnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0eXBlTGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xyXG4gICAgfVxyXG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xyXG4gICAgICAgIGNvbnN0IHR5cGVMaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVycy5nZXQodHlwZSk7XHJcbiAgICAgICAgaWYgKHR5cGVMaXN0ZW5lcnMgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IG1ldGhvZCBvZiB0eXBlTGlzdGVuZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWV0aG9kID09PSBsaXN0ZW5lcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gdHlwZUxpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKTtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlTGlzdGVuZXJzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzZXQgbmFtZSh2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9uYW1lICE9PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9uYW1lID0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0IG5hbWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX25hbWU7XHJcbiAgICB9XHJcbn1cblxuY2xhc3MgU2l6ZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih3aWR0aCA9IDAsIGhlaWdodCA9IDApIHtcclxuICAgICAgICB0aGlzLl93aWR0aCA9IDA7XHJcbiAgICAgICAgdGhpcy5faGVpZ2h0ID0gMDtcclxuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICB9XHJcbiAgICBzZXQgd2lkdGgodmFsdWUpIHtcclxuICAgICAgICBpZiAoaXNOYU4odmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZhbHVlIDwgMCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fd2lkdGggIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3dpZHRoID0gMDtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl93aWR0aCA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgZ2V0IHdpZHRoKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl93aWR0aDtcclxuICAgIH1cclxuICAgIHNldCBoZWlnaHQodmFsdWUpIHtcclxuICAgICAgICBpZiAoaXNOYU4odmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZhbHVlIDwgMCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faGVpZ2h0ICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oZWlnaHQgPSAwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2hlaWdodCA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgZ2V0IGhlaWdodCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faGVpZ2h0O1xyXG4gICAgfVxyXG59XG5cbmNsYXNzIEFic29sdXRlTGF5b3V0IGV4dGVuZHMgRXZlbnREaXNwYXRjaGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gJ0Fic29sdXRlTGF5b3V0JztcclxuICAgIH1cclxuICAgIHVwZGF0ZUNoaWxkcmVuU2l6ZXMoY29udGFpbmVyLCBlbGVtZW50cykge1xyXG4gICAgICAgIGNvbnN0IGluc2lkZVdpZHRoID0gY29udGFpbmVyLm1lYXN1cmVkV2lkdGggLSBjb250YWluZXIucGFkZGluZ0xlZnQgLSBjb250YWluZXIucGFkZGluZ1JpZ2h0O1xyXG4gICAgICAgIGNvbnN0IGluc2lkZUhlaWdodCA9IGNvbnRhaW5lci5tZWFzdXJlZEhlaWdodCAtIGNvbnRhaW5lci5wYWRkaW5nVG9wIC0gY29udGFpbmVyLnBhZGRpbmdCb3R0b207XHJcbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XHJcbiAgICAgICAgICAgIGlmICghaXNOYU4oZWxlbWVudC5wZXJjZW50V2lkdGgpICYmICFpc05hTihlbGVtZW50LnBlcmNlbnRIZWlnaHQpKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNpemUoaW5zaWRlV2lkdGggKiBlbGVtZW50LnBlcmNlbnRXaWR0aCAvIDEwMCwgaW5zaWRlSGVpZ2h0ICogZWxlbWVudC5wZXJjZW50SGVpZ2h0IC8gMTAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICghaXNOYU4oZWxlbWVudC5wZXJjZW50V2lkdGgpICYmIGlzTmFOKGVsZW1lbnQucGVyY2VudEhlaWdodCkpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQud2lkdGggPSBpbnNpZGVXaWR0aCAqIGVsZW1lbnQucGVyY2VudFdpZHRoIC8gMTAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzTmFOKGVsZW1lbnQucGVyY2VudFdpZHRoKSAmJiAhaXNOYU4oZWxlbWVudC5wZXJjZW50SGVpZ2h0KSkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5oZWlnaHQgPSBpbnNpZGVIZWlnaHQgKiBlbGVtZW50LnBlcmNlbnRIZWlnaHQgLyAxMDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB1cGRhdGVMYXlvdXQoY29udGFpbmVyLCBlbGVtZW50cykge1xyXG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cykge1xyXG4gICAgICAgICAgICBlbGVtZW50LnggPSBjb250YWluZXIucGFkZGluZ0xlZnQ7XHJcbiAgICAgICAgICAgIGVsZW1lbnQueSA9IGNvbnRhaW5lci5wYWRkaW5nVG9wO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldEludGVybmFsU2l6ZShjb250YWluZXIsIGVsZW1lbnRzKSB7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gMDtcclxuICAgICAgICBsZXQgaGVpZ2h0ID0gMDtcclxuICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcclxuICAgICAgICAgICAgaWYgKHdpZHRoIDwgZWxlbWVudC5tZWFzdXJlZFdpZHRoKSB7XHJcbiAgICAgICAgICAgICAgICB3aWR0aCA9IGVsZW1lbnQubWVhc3VyZWRXaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaGVpZ2h0IDwgZWxlbWVudC5tZWFzdXJlZEhlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gZWxlbWVudC5tZWFzdXJlZEhlaWdodDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB3aWR0aCA9IGNvbnRhaW5lci5wYWRkaW5nTGVmdCArIHdpZHRoICsgY29udGFpbmVyLnBhZGRpbmdSaWdodDtcclxuICAgICAgICBoZWlnaHQgPSBjb250YWluZXIucGFkZGluZ1RvcCArIGhlaWdodCArIGNvbnRhaW5lci5wYWRkaW5nQm90dG9tO1xyXG4gICAgICAgIHJldHVybiBuZXcgU2l6ZSh3aWR0aCwgaGVpZ2h0KTtcclxuICAgIH1cclxuICAgIGdldEludGVybmFsV2lkdGgoY29udGFpbmVyLCBlbGVtZW50cykge1xyXG4gICAgICAgIGxldCB3aWR0aCA9IDA7XHJcbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XHJcbiAgICAgICAgICAgIGlmICh3aWR0aCA8IGVsZW1lbnQubWVhc3VyZWRXaWR0aCkge1xyXG4gICAgICAgICAgICAgICAgd2lkdGggPSBlbGVtZW50Lm1lYXN1cmVkV2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNvbnRhaW5lci5wYWRkaW5nTGVmdCArIHdpZHRoICsgY29udGFpbmVyLnBhZGRpbmdSaWdodDtcclxuICAgIH1cclxuICAgIGdldEludGVybmFsSGVpZ2h0KGNvbnRhaW5lciwgZWxlbWVudHMpIHtcclxuICAgICAgICBsZXQgaGVpZ2h0ID0gMDtcclxuICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcclxuICAgICAgICAgICAgaWYgKGhlaWdodCA8IGVsZW1lbnQubWVhc3VyZWRIZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgIGhlaWdodCA9IGVsZW1lbnQubWVhc3VyZWRIZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNvbnRhaW5lci5wYWRkaW5nVG9wICsgaGVpZ2h0ICsgY29udGFpbmVyLnBhZGRpbmdCb3R0b207XHJcbiAgICB9XHJcbn1cblxuY2xhc3MgQ29sb3IgZXh0ZW5kcyBFdmVudERpc3BhdGNoZXIge1xyXG4gICAgY29uc3RydWN0b3IoaHVlID0gMCwgc2F0dXJhdGlvbiA9IDAsIGxpZ2h0bmVzcyA9IDAsIG9wYWNpdHkgPSAxLjApIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuX2h1ZSA9IDA7XHJcbiAgICAgICAgdGhpcy5fc2F0dXJhdGlvbiA9IDA7XHJcbiAgICAgICAgdGhpcy5fbGlnaHRuZXNzID0gMDtcclxuICAgICAgICB0aGlzLl9vcGFjaXR5ID0gMS4wO1xyXG4gICAgICAgIHRoaXMubmFtZSA9ICdDb2xvcic7XHJcbiAgICAgICAgaWYgKHRoaXMuX2h1ZSAhPT0gaHVlKSB7XHJcbiAgICAgICAgICAgIGlmIChpc05hTihodWUpIHx8IGh1ZSA8IDAgfHwgaHVlID49IDM2MCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faHVlID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2h1ZSA9IGh1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fc2F0dXJhdGlvbiAhPT0gc2F0dXJhdGlvbikge1xyXG4gICAgICAgICAgICBpZiAoaXNOYU4oc2F0dXJhdGlvbikgfHwgc2F0dXJhdGlvbiA8IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NhdHVyYXRpb24gPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHNhdHVyYXRpb24gPiAxMDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NhdHVyYXRpb24gPSAxMDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zYXR1cmF0aW9uID0gc2F0dXJhdGlvbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fbGlnaHRuZXNzICE9PSBsaWdodG5lc3MpIHtcclxuICAgICAgICAgICAgaWYgKGlzTmFOKGxpZ2h0bmVzcykgfHwgbGlnaHRuZXNzIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbGlnaHRuZXNzID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChsaWdodG5lc3MgPiAxMDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2xpZ2h0bmVzcyA9IDEwMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2xpZ2h0bmVzcyA9IGxpZ2h0bmVzcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fb3BhY2l0eSAhPT0gb3BhY2l0eSkge1xyXG4gICAgICAgICAgICBpZiAoaXNOYU4ob3BhY2l0eSkgfHwgb3BhY2l0eSA+IDEuMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fb3BhY2l0eSA9IDEuMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChvcGFjaXR5IDwgMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fb3BhY2l0eSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vcGFjaXR5ID0gb3BhY2l0eTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHNldCBodWUodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5faHVlID09PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPCAwIHx8IHZhbHVlID49IDM2MCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faHVlICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9odWUgPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2h1ZSA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMubm90aWZ5KCk7XHJcbiAgICB9XHJcbiAgICBnZXQgaHVlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9odWU7XHJcbiAgICB9XHJcbiAgICBzZXQgc2F0dXJhdGlvbih2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9zYXR1cmF0aW9uID09PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPCAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9zYXR1cmF0aW9uICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zYXR1cmF0aW9uID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmFsdWUgPiAxMDApIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3NhdHVyYXRpb24gIT09IDEwMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2F0dXJhdGlvbiA9IDEwMDtcclxuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fc2F0dXJhdGlvbiA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMubm90aWZ5KCk7XHJcbiAgICB9XHJcbiAgICBnZXQgc2F0dXJhdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2F0dXJhdGlvbjtcclxuICAgIH1cclxuICAgIHNldCBsaWdodG5lc3ModmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fbGlnaHRuZXNzID09PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPCAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9saWdodG5lc3MgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2xpZ2h0bmVzcyA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZhbHVlID4gMTAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9saWdodG5lc3MgIT09IDEwMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbGlnaHRuZXNzID0gMTAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2xpZ2h0bmVzcyA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMubm90aWZ5KCk7XHJcbiAgICB9XHJcbiAgICBnZXQgbGlnaHRuZXNzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9saWdodG5lc3M7XHJcbiAgICB9XHJcbiAgICBzZXQgb3BhY2l0eSh2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9vcGFjaXR5ID09PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPiAxLjApIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX29wYWNpdHkgIT09IDEuMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fb3BhY2l0eSA9IDEuMDtcclxuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmFsdWUgPCAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9vcGFjaXR5ICE9PSAwLjApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX29wYWNpdHkgPSAwLjA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fb3BhY2l0eSA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMubm90aWZ5KCk7XHJcbiAgICB9XHJcbiAgICBnZXQgb3BhY2l0eSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fb3BhY2l0eTtcclxuICAgIH1cclxuICAgIHRvU3RyaW5nKCkge1xyXG4gICAgICAgIHJldHVybiAnaHNsYSgnICsgdGhpcy5odWUgKyAnLCAnICsgdGhpcy5zYXR1cmF0aW9uICsgJyUsICcgKyB0aGlzLmxpZ2h0bmVzcyArICclLCAnICsgdGhpcy5vcGFjaXR5ICsgJyknO1xyXG4gICAgfVxyXG4gICAgbm90aWZ5KCkge1xyXG4gICAgICAgIHRoaXMuZGlzcGF0Y2goQ29sb3IuQ0hBTkdFRCwgdGhpcyk7XHJcbiAgICB9XHJcbn1cclxuQ29sb3IuTk9ORSA9ICcnO1xyXG5Db2xvci5DSEFOR0VEID0gJ0NvbG9yLkNIQU5HRUQnO1xuXG5jbGFzcyBDb2xvclNjYWxlIHtcclxuICAgIHNldCBjMCh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuX2MwID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBnZXQgYzAoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jMCkge1xyXG4gICAgICAgICAgICB0aGlzLl9jMCA9IG5ldyBDb2xvcigwLCAwLCAxMDApOyAvLyBXaGl0ZVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fYzA7XHJcbiAgICB9XHJcbiAgICBzZXQgYzUwKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5fYzUwID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBnZXQgYzUwKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fYzUwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2M1MCA9IG5ldyBDb2xvcigwLCAwLCA5OCk7IC8vIEdyYXkgNTBcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2M1MDtcclxuICAgIH1cclxuICAgIHNldCBjMTAwKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5fYzEwMCA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgZ2V0IGMxMDAoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jMTAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2MxMDAgPSBuZXcgQ29sb3IoMjQwLCA1LCA5Nik7IC8vIEdyYXkgMTAwXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9jMTAwO1xyXG4gICAgfVxyXG4gICAgc2V0IGMyMDAodmFsdWUpIHtcclxuICAgICAgICB0aGlzLl9jMjAwID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBnZXQgYzIwMCgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2MyMDApIHtcclxuICAgICAgICAgICAgdGhpcy5fYzIwMCA9IG5ldyBDb2xvcigyNDAsIDYsIDkwKTsgLy8gR3JheSAyMDBcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2MyMDA7XHJcbiAgICB9XHJcbiAgICBzZXQgYzMwMCh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuX2MzMDAgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIGdldCBjMzAwKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fYzMwMCkge1xyXG4gICAgICAgICAgICB0aGlzLl9jMzAwID0gbmV3IENvbG9yKDI0MCwgNSwgODQpOyAvLyBHcmF5IDMwMFxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fYzMwMDtcclxuICAgIH1cclxuICAgIHNldCBjNDAwKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5fYzQwMCA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgZ2V0IGM0MDAoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jNDAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2M0MDAgPSBuZXcgQ29sb3IoMjQwLCA1LCA2NSk7IC8vIEdyYXkgNDAwXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9jNDAwO1xyXG4gICAgfVxyXG4gICAgc2V0IGM1MDAodmFsdWUpIHtcclxuICAgICAgICB0aGlzLl9jNTAwID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBnZXQgYzUwMCgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2M1MDApIHtcclxuICAgICAgICAgICAgdGhpcy5fYzUwMCA9IG5ldyBDb2xvcigyNDAsIDQsIDQ2KTsgLy8gR3JheSA1MDBcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2M1MDA7XHJcbiAgICB9XHJcbiAgICBzZXQgYzYwMCh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuX2M2MDAgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIGdldCBjNjAwKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fYzYwMCkge1xyXG4gICAgICAgICAgICB0aGlzLl9jNjAwID0gbmV3IENvbG9yKDI0MCwgNSwgMzQpOyAvLyBHcmF5IDYwMFxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fYzYwMDtcclxuICAgIH1cclxuICAgIHNldCBjNzAwKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5fYzcwMCA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgZ2V0IGM3MDAoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jNzAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2M3MDAgPSBuZXcgQ29sb3IoMjQwLCA1LCAyNik7IC8vIEdyYXkgNzAwXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9jNzAwO1xyXG4gICAgfVxyXG4gICAgc2V0IGM4MDAodmFsdWUpIHtcclxuICAgICAgICB0aGlzLl9jODAwID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBnZXQgYzgwMCgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2M4MDApIHtcclxuICAgICAgICAgICAgdGhpcy5fYzgwMCA9IG5ldyBDb2xvcigyNDAsIDQsIDE2KTsgLy8gR3JheSA4MDBcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2M4MDA7XHJcbiAgICB9XHJcbiAgICBzZXQgYzkwMCh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuX2M5MDAgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIGdldCBjOTAwKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fYzkwMCkge1xyXG4gICAgICAgICAgICB0aGlzLl9jOTAwID0gbmV3IENvbG9yKDI0MCwgNiwgMTApOyAvLyBHcmF5IDkwMFxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fYzkwMDtcclxuICAgIH1cclxuICAgIHNldCBjMTAwMCh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuX2MxMDAwID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBnZXQgYzEwMDAoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jMTAwMCkge1xyXG4gICAgICAgICAgICB0aGlzLl9jMTAwMCA9IG5ldyBDb2xvcigwLCAwLCAwKTsgLy8gQmxhY2tcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2MxMDAwO1xyXG4gICAgfVxyXG59XG5cbmNsYXNzIENvbG9ycyB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSAnJztcclxuICAgICAgICB0aGlzLm5hbWUgPSAnQ29sb3JzJztcclxuICAgIH1cclxuICAgIGdldCBwcmltYXJ5KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fcHJpbWFyeSkge1xyXG4gICAgICAgICAgICB0aGlzLl9wcmltYXJ5ID0gbmV3IENvbG9yU2NhbGUoKTsgLy8gVGVhbFxyXG4gICAgICAgICAgICB0aGlzLl9wcmltYXJ5LmM1MCA9IG5ldyBDb2xvcigxNjYsIDc2LCA5Nyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByaW1hcnkuYzEwMCA9IG5ldyBDb2xvcigxNjcsIDg1LCA4OSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByaW1hcnkuYzIwMCA9IG5ldyBDb2xvcigxNjgsIDg0LCA3OCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByaW1hcnkuYzMwMCA9IG5ldyBDb2xvcigxNzEsIDc3LCA2NCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByaW1hcnkuYzQwMCA9IG5ldyBDb2xvcigxNzIsIDY2LCA1MCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByaW1hcnkuYzUwMCA9IG5ldyBDb2xvcigxNzMsIDgwLCA0MCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByaW1hcnkuYzYwMCA9IG5ldyBDb2xvcigxNzUsIDg0LCAzMik7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByaW1hcnkuYzcwMCA9IG5ldyBDb2xvcigxNzUsIDc3LCAyNik7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByaW1hcnkuYzgwMCA9IG5ldyBDb2xvcigxNzYsIDY5LCAyMik7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByaW1hcnkuYzkwMCA9IG5ldyBDb2xvcigxNzYsIDYxLCAxOSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9wcmltYXJ5O1xyXG4gICAgfVxyXG4gICAgZ2V0IHNlY29uZGFyeSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX3NlY29uZGFyeSkge1xyXG4gICAgICAgICAgICB0aGlzLl9zZWNvbmRhcnkgPSBuZXcgQ29sb3JTY2FsZSgpOyAvLyBQaW5rXHJcbiAgICAgICAgICAgIHRoaXMuX3NlY29uZGFyeS5jNTAgPSBuZXcgQ29sb3IoMzI3LCA3MywgOTcpO1xyXG4gICAgICAgICAgICB0aGlzLl9zZWNvbmRhcnkuYzEwMCA9IG5ldyBDb2xvcigzMjYsIDc4LCA5NSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NlY29uZGFyeS5jMjAwID0gbmV3IENvbG9yKDMyNiwgODUsIDkwKTtcclxuICAgICAgICAgICAgdGhpcy5fc2Vjb25kYXJ5LmMzMDAgPSBuZXcgQ29sb3IoMzI3LCA4NywgODIpO1xyXG4gICAgICAgICAgICB0aGlzLl9zZWNvbmRhcnkuYzQwMCA9IG5ldyBDb2xvcigzMjksIDg2LCA3MCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NlY29uZGFyeS5jNTAwID0gbmV3IENvbG9yKDMzMCwgODEsIDYwKTtcclxuICAgICAgICAgICAgdGhpcy5fc2Vjb25kYXJ5LmM2MDAgPSBuZXcgQ29sb3IoMzMzLCA3MSwgNTEpO1xyXG4gICAgICAgICAgICB0aGlzLl9zZWNvbmRhcnkuYzcwMCA9IG5ldyBDb2xvcigzMzUsIDc4LCA0Mik7XHJcbiAgICAgICAgICAgIHRoaXMuX3NlY29uZGFyeS5jODAwID0gbmV3IENvbG9yKDMzNiwgNzQsIDM1KTtcclxuICAgICAgICAgICAgdGhpcy5fc2Vjb25kYXJ5LmM5MDAgPSBuZXcgQ29sb3IoMzM2LCA2OSwgMzApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fc2Vjb25kYXJ5O1xyXG4gICAgfVxyXG4gICAgZ2V0IHN1Y2Nlc3MoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9zdWNjZXNzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3N1Y2Nlc3MgPSBuZXcgQ29sb3JTY2FsZSgpO1xyXG4gICAgICAgICAgICB0aGlzLl9zdWNjZXNzLmM1MCA9IG5ldyBDb2xvcigxMzgsIDc2LCA5Nyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3N1Y2Nlc3MuYzEwMCA9IG5ldyBDb2xvcigxNDEsIDg0LCA5Myk7XHJcbiAgICAgICAgICAgIHRoaXMuX3N1Y2Nlc3MuYzIwMCA9IG5ldyBDb2xvcigxNDEsIDc5LCA4NSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3N1Y2Nlc3MuYzMwMCA9IG5ldyBDb2xvcigxNDIsIDc3LCA3Myk7XHJcbiAgICAgICAgICAgIHRoaXMuX3N1Y2Nlc3MuYzQwMCA9IG5ldyBDb2xvcigxNDIsIDY5LCA1OCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3N1Y2Nlc3MuYzUwMCA9IG5ldyBDb2xvcigxNDIsIDcxLCA0NSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3N1Y2Nlc3MuYzYwMCA9IG5ldyBDb2xvcigxNDIsIDc2LCAzNik7XHJcbiAgICAgICAgICAgIHRoaXMuX3N1Y2Nlc3MuYzcwMCA9IG5ldyBDb2xvcigxNDIsIDcyLCAyOSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3N1Y2Nlc3MuYzgwMCA9IG5ldyBDb2xvcigxNDMsIDY0LCAyNCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3N1Y2Nlc3MuYzkwMCA9IG5ldyBDb2xvcigxNDQsIDYxLCAyMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9zdWNjZXNzO1xyXG4gICAgfVxyXG4gICAgZ2V0IGRhbmdlcigpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2Rhbmdlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9kYW5nZXIgPSBuZXcgQ29sb3JTY2FsZSgpO1xyXG4gICAgICAgICAgICB0aGlzLl9kYW5nZXIuYzUwID0gbmV3IENvbG9yKDAsIDg2LCA5Nyk7XHJcbiAgICAgICAgICAgIHRoaXMuX2Rhbmdlci5jMTAwID0gbmV3IENvbG9yKDAsIDkzLCA5NCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2Rhbmdlci5jMjAwID0gbmV3IENvbG9yKDAsIDk2LCA4OSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2Rhbmdlci5jMzAwID0gbmV3IENvbG9yKDAsIDk0LCA4Mik7XHJcbiAgICAgICAgICAgIHRoaXMuX2Rhbmdlci5jNDAwID0gbmV3IENvbG9yKDAsIDkxLCA3MSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2Rhbmdlci5jNTAwID0gbmV3IENvbG9yKDAsIDg0LCA2MCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2Rhbmdlci5jNjAwID0gbmV3IENvbG9yKDAsIDcyLCA1MSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2Rhbmdlci5jNzAwID0gbmV3IENvbG9yKDAsIDc0LCA0Mik7XHJcbiAgICAgICAgICAgIHRoaXMuX2Rhbmdlci5jODAwID0gbmV3IENvbG9yKDAsIDcwLCAzNSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2Rhbmdlci5jOTAwID0gbmV3IENvbG9yKDAsIDYzLCAzMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9kYW5nZXI7XHJcbiAgICB9XHJcbiAgICBnZXQgbmV1dHJhbCgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX25ldXRyYWwpIHtcclxuICAgICAgICAgICAgdGhpcy5fbmV1dHJhbCA9IG5ldyBDb2xvclNjYWxlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9uZXV0cmFsO1xyXG4gICAgfVxyXG59XG5cbi8qKlxyXG4gKiBWZXJkYW5hIDQwMCBjYXBIZWlnaHQgPSAwLjczLCB2ZXJ0aWNhbE9mZnNldCA9IDAuMDQ0LCBob3Jpem9udGFsT2Zmc2V0ID0gMC4xMztcclxuICogTW9udHNlcnJhdCA0MDAgY2FwSGVpZ2h0ID0gMC43LCB2ZXJ0aWNhbE9mZnNldCA9IC0wLjAxMywgaG9yaXpvbnRhbE9mZnNldCA9IDAuMTYzO1xyXG4gKiBTZWdvZVVJIDQwMCBjYXBIZWlnaHQgPSAwLjcsIHZlcnRpY2FsT2Zmc2V0ID0gLTAuMDkxLCBob3Jpem9udGFsT2Zmc2V0ID0gMC4xMztcclxuICogU2Vnb2VVSSA2MDAgY2FwSGVpZ2h0ID0gMC43LCB2ZXJ0aWNhbE9mZnNldCA9IC0wLjA5MSwgaG9yaXpvbnRhbE9mZnNldCA9IDAuMTIzO1xyXG4gKlxyXG4gKiBuZXcgVHlwZUZhY2UoJ0FyaWFsJywgRm9udFdlaWdodC5SRUdVTEFSXzQwMCwgMC43MTUsIDAuMTEsIDAuMDE1KTtcclxuICogbmV3IFR5cGVGYWNlKCdBcmlhbCcsIEZvbnRXZWlnaHQuTUVESVVNXzUwMCwgMC43MTUsIDAuMTEsIDAuMDE1KTtcclxuICogbmV3IFR5cGVGYWNlKCdBcmlhbCcsIEZvbnRXZWlnaHQuQk9MRF83MDAsIDAuNzE1LCAwLjExLCAwLjAxNSk7XHJcbiAqXHJcbiAqIG5ldyBUeXBlRmFjZSgnSW50ZXInLCA0MDAsIDAuNzI3LCAwLjA5LCAwLjApO1xyXG4gKiBuZXcgVHlwZUZhY2UoJ0ludGVyJywgNTAwLCAwLjcyNywgMC4wOSwgMC4wKTtcclxuICogbmV3IFR5cGVGYWNlKCdJbnRlcicsIDcwMCwgMC43MjcsIDAuMDksIDAuMCk7XHJcbiAqXHJcbiAqIG5ldyBUeXBlRmFjZSgnQml0dGVyJywgNDAwLCAwLjcxLCAwLjAzLCAwLjAyKTtcclxuICpcclxuICogbmV3IFR5cGVGYWNlKCdFdXJvc3RpbGUnLCBGb250V2VpZ2h0LlJFR1VMQVJfNDAwLCAwLjY3LCAwLjEsIDAuMDEpO1xyXG4gKiBuZXcgVHlwZUZhY2UoJ0V1cm9zdGlsZScsIEZvbnRXZWlnaHQuQk9MRF83MDAsIDAuNjcsIDAuMDksIC0wLjAwMyk7XHJcbiAqL1xyXG5jbGFzcyBUeXBlRmFjZSBleHRlbmRzIEV2ZW50RGlzcGF0Y2hlciB7XHJcbiAgICBjb25zdHJ1Y3Rvcihmb250RmFtaWx5ID0gJ0FyaWFsJywgY2FwSGVpZ2h0ID0gMC43MTUsIG9mZnNldFggPSAwLjA5LCBvZmZzZXRZID0gMC4wMTUpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuX2ZvbnRGYW1pbHkgPSAnQXJpYWwnO1xyXG4gICAgICAgIHRoaXMuX2NhcEhlaWdodCA9IDAuNzE1O1xyXG4gICAgICAgIHRoaXMuX29mZnNldFggPSAwLjExO1xyXG4gICAgICAgIHRoaXMuX29mZnNldFkgPSAwLjAxNTtcclxuICAgICAgICB0aGlzLm5hbWUgPSAnVHlwZUZhY2UnO1xyXG4gICAgICAgIGlmICh0aGlzLl9mb250RmFtaWx5ICE9PSBmb250RmFtaWx5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZvbnRGYW1pbHkgPSBmb250RmFtaWx5O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fY2FwSGVpZ2h0ICE9PSBjYXBIZWlnaHQpIHtcclxuICAgICAgICAgICAgaWYgKCFpc05hTihjYXBIZWlnaHQpICYmIGNhcEhlaWdodCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NhcEhlaWdodCA9IGNhcEhlaWdodDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fb2Zmc2V0WCAhPT0gb2Zmc2V0WCkge1xyXG4gICAgICAgICAgICBpZiAoIWlzTmFOKG9mZnNldFgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vZmZzZXRYID0gb2Zmc2V0WDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fb2Zmc2V0WSAhPT0gb2Zmc2V0WSkge1xyXG4gICAgICAgICAgICBpZiAoIWlzTmFOKG9mZnNldFkpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vZmZzZXRZID0gb2Zmc2V0WTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHNldCBmb250RmFtaWx5KHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2ZvbnRGYW1pbHkgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZm9udEZhbWlseSA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMubm90aWZ5Q2hhbmdlKCk7XHJcbiAgICB9XHJcbiAgICBnZXQgZm9udEZhbWlseSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZm9udEZhbWlseTtcclxuICAgIH1cclxuICAgIHNldCBjYXBIZWlnaHQodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fY2FwSGVpZ2h0ID09PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPCAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9jYXBIZWlnaHQgIT09IDAuNzE1KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jYXBIZWlnaHQgPSAwLjcxNTtcclxuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5Q2hhbmdlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9jYXBIZWlnaHQgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLm5vdGlmeUNoYW5nZSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0IGNhcEhlaWdodCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY2FwSGVpZ2h0O1xyXG4gICAgfVxyXG4gICAgc2V0IG9mZnNldFgodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fb2Zmc2V0WCA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4odmFsdWUpKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9vZmZzZXRYICE9PSAwLjExKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vZmZzZXRYID0gMC4xMTtcclxuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5Q2hhbmdlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9vZmZzZXRYID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5ub3RpZnlDaGFuZ2UoKTtcclxuICAgIH1cclxuICAgIGdldCBvZmZzZXRYKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9vZmZzZXRYO1xyXG4gICAgfVxyXG4gICAgc2V0IG9mZnNldFkodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fb2Zmc2V0WSA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4odmFsdWUpKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9vZmZzZXRZICE9PSAwLjAxNSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fb2Zmc2V0WSA9IDAuMDE1O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnlDaGFuZ2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX29mZnNldFkgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLm5vdGlmeUNoYW5nZSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0IG9mZnNldFkoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX29mZnNldFk7XHJcbiAgICB9XHJcbiAgICBub3RpZnlDaGFuZ2UoKSB7XHJcbiAgICAgICAgdGhpcy5kaXNwYXRjaChUeXBlRmFjZS5DSEFOR0VELCB0aGlzKTtcclxuICAgIH1cclxufVxyXG5UeXBlRmFjZS5DSEFOR0VEID0gJ1R5cGVGYWNlLkNIQU5HRUQnO1xuXG5jbGFzcyBUeXBvZ3JhcGh5IHtcclxuICAgIHNldCBwcmltYXJ5KHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3ByaW1hcnkgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcHJpbWFyeSA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgZ2V0IHByaW1hcnkoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9wcmltYXJ5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByaW1hcnkgPSBuZXcgVHlwZUZhY2UoJ0FyaWFsJywgMC43MTUsIDAuMTEsIDAuMDE1KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ByaW1hcnk7XHJcbiAgICB9XHJcbiAgICBzZXQgc2Vjb25kYXJ5KHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3NlY29uZGFyeSA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9zZWNvbmRhcnkgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIGdldCBzZWNvbmRhcnkoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9zZWNvbmRhcnkpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2Vjb25kYXJ5ID0gbmV3IFR5cGVGYWNlKCdWZXJkYW5hJywgMC43MywgMC4xMywgMC4wNDQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fc2Vjb25kYXJ5O1xyXG4gICAgfVxyXG59XG5cbmNsYXNzIFRoZW1lIGV4dGVuZHMgRXZlbnREaXNwYXRjaGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gJ1RoZW1lJztcclxuICAgIH1cclxuICAgIGdldCBjb2xvcnMoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jb2xvcnMpIHtcclxuICAgICAgICAgICAgdGhpcy5fY29sb3JzID0gbmV3IENvbG9ycygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fY29sb3JzO1xyXG4gICAgfVxyXG4gICAgZ2V0IHR5cG9ncmFwaHkoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl90eXBvZ3JhcGh5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3R5cG9ncmFwaHkgPSBuZXcgVHlwb2dyYXBoeSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fdHlwb2dyYXBoeTtcclxuICAgIH1cclxufVxuXG5jbGFzcyBEZXNpZ24ge1xyXG4gICAgc3RhdGljIHNldCB0aGVtZSh2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl90aGVtZSA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl90aGVtZSA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5kaXNwYXRjaChEZXNpZ24uVEhFTUVfQ0hBTkdFRCwgbnVsbCwgZmFsc2UpO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldCB0aGVtZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX3RoZW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RoZW1lID0gbmV3IFRoZW1lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl90aGVtZTtcclxuICAgIH1cclxufVxyXG5EZXNpZ24uVEhFTUVfQ0hBTkdFRCA9ICdEZXNpZ24uVEhFTUVfQ0hBTkdFRCc7XHJcbkRlc2lnbi5kaXNwYXRjaGVyID0gbmV3IEV2ZW50RGlzcGF0Y2hlcigpO1xuXG5jbGFzcyBCYXNlRWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm5hbWUgPSAnJztcclxuICAgICAgICB0aGlzLl92aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9ub3RpZnlUaGVtZUNoYW5nZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubmFtZSA9ICdCYXNlRWxlbWVudCc7XHJcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlID0gdGhpcy5pbnZhbGlkYXRlLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy50aGVtZUNoYW5nZWQgPSB0aGlzLnRoZW1lQ2hhbmdlZC5iaW5kKHRoaXMpO1xyXG4gICAgfVxyXG4gICAgZGlzcGF0Y2godHlwZUFyZywgcGF5bG9hZCA9IG51bGwsIGJ1YmJsZXMgPSBmYWxzZSkge1xyXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQodHlwZUFyZywgeyBkZXRhaWw6IHBheWxvYWQsIGJ1YmJsZXM6IGJ1YmJsZXMgfSkpO1xyXG4gICAgfVxyXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XHJcbiAgICAgICAgdGhpcy5jb25uZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMudmFsaWRhdGUoKTtcclxuICAgIH1cclxuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrKCkge1xyXG4gICAgICAgIHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBpbnZhbGlkYXRlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbm5lY3RlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnZhbGlkYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgdmFsaWRhdGUoKSB7XHJcbiAgICAgICAgLy8gb3ZlcnJpZGVcclxuICAgIH1cclxuICAgIHNldCB2aXNpYmxlKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3Zpc2libGUgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdmlzaWJsZSA9IHZhbHVlO1xyXG4gICAgICAgIGlmICh0aGlzLl92aXNpYmxlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3R5bGUudmlzaWJpbGl0eSA9ICcnO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xyXG4gICAgfVxyXG4gICAgZ2V0IHZpc2libGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Zpc2libGU7XHJcbiAgICB9XHJcbiAgICBzZXQgbm90aWZ5VGhlbWVDaGFuZ2UodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fbm90aWZ5VGhlbWVDaGFuZ2UgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX25vdGlmeVRoZW1lQ2hhbmdlKSB7XHJcbiAgICAgICAgICAgIERlc2lnbi5kaXNwYXRjaGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoRGVzaWduLlRIRU1FX0NIQU5HRUQsIHRoaXMudGhlbWVDaGFuZ2VkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbm90aWZ5VGhlbWVDaGFuZ2UgPSB2YWx1ZTtcclxuICAgICAgICBpZiAodGhpcy5fbm90aWZ5VGhlbWVDaGFuZ2UpIHtcclxuICAgICAgICAgICAgRGVzaWduLmRpc3BhdGNoZXIuYWRkRXZlbnRMaXN0ZW5lcihEZXNpZ24uVEhFTUVfQ0hBTkdFRCwgdGhpcy50aGVtZUNoYW5nZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldCBub3RpZnlUaGVtZUNoYW5nZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbm90aWZ5VGhlbWVDaGFuZ2U7XHJcbiAgICB9XHJcbiAgICBnZXQgdGhlbWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIERlc2lnbi50aGVtZTtcclxuICAgIH1cclxuICAgIGdldCB0eXBvZ3JhcGh5KCkge1xyXG4gICAgICAgIHJldHVybiBEZXNpZ24udGhlbWUudHlwb2dyYXBoeTtcclxuICAgIH1cclxuICAgIGdldCBjb2xvcnMoKSB7XHJcbiAgICAgICAgcmV0dXJuIERlc2lnbi50aGVtZS5jb2xvcnM7XHJcbiAgICB9XHJcbiAgICB0aGVtZUNoYW5nZWQoKSB7XHJcbiAgICAgICAgLy8gb3ZlcnJpZGVcclxuICAgIH1cclxufVxyXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2Jhc2UtZWxlbWVudCcsIEJhc2VFbGVtZW50KTtcblxuY2xhc3MgUG9zaXRpb25FbGVtZW50IGV4dGVuZHMgQmFzZUVsZW1lbnQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLl94ID0gMDtcclxuICAgICAgICB0aGlzLl95ID0gMDtcclxuICAgICAgICB0aGlzLm5hbWUgPSAnUG9zaXRpb25FbGVtZW50JztcclxuICAgICAgICB0aGlzLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuICAgIH1cclxuICAgIG1vdmUoeCwgeSkge1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgIH1cclxuICAgIHNldCB4KHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3ggPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzTmFOKHZhbHVlKSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5feCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5feCA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVRyYW5zZm9ybSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5feCA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVHJhbnNmb3JtKCk7XHJcbiAgICB9XHJcbiAgICBnZXQgeCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5feDtcclxuICAgIH1cclxuICAgIHNldCB5KHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3kgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzTmFOKHZhbHVlKSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5feSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5feSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVRyYW5zZm9ybSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5feSA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVHJhbnNmb3JtKCk7XHJcbiAgICB9XHJcbiAgICBnZXQgeSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5feTtcclxuICAgIH1cclxuICAgIHVwZGF0ZVRyYW5zZm9ybSgpIHtcclxuICAgICAgICB0aGlzLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIHRoaXMueCArICdweCwgJyArIHRoaXMueSArICdweCknO1xyXG4gICAgfVxyXG59XHJcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgncG9zaXRpb24tZWxlbWVudCcsIFBvc2l0aW9uRWxlbWVudCk7XG5cbmNsYXNzIFNpemVFbGVtZW50IGV4dGVuZHMgUG9zaXRpb25FbGVtZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5fbWluV2lkdGggPSAwO1xyXG4gICAgICAgIHRoaXMuX3dpZHRoID0gTmFOO1xyXG4gICAgICAgIHRoaXMuX21heFdpZHRoID0gSW5maW5pdHk7XHJcbiAgICAgICAgdGhpcy5fbWluSGVpZ2h0ID0gMDtcclxuICAgICAgICB0aGlzLl9oZWlnaHQgPSBOYU47XHJcbiAgICAgICAgdGhpcy5fbWF4SGVpZ2h0ID0gSW5maW5pdHk7XHJcbiAgICAgICAgdGhpcy5fcGVyY2VudFdpZHRoID0gTmFOO1xyXG4gICAgICAgIHRoaXMuX3BlcmNlbnRIZWlnaHQgPSBOYU47XHJcbiAgICAgICAgdGhpcy5fYWN0dWFsV2lkdGggPSAwO1xyXG4gICAgICAgIHRoaXMuX2FjdHVhbEhlaWdodCA9IDA7XHJcbiAgICAgICAgdGhpcy5faW50ZXJuYWxXaWR0aCA9IDA7XHJcbiAgICAgICAgdGhpcy5faW50ZXJuYWxIZWlnaHQgPSAwO1xyXG4gICAgICAgIHRoaXMubmFtZSA9ICdTaXplRWxlbWVudCc7XHJcbiAgICB9XHJcbiAgICBzaXplKHdpZHRoLCBoZWlnaHQpIHtcclxuICAgICAgICBsZXQgd2lkdGhDaGFuZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKGlzTmFOKHRoaXMuX3dpZHRoKSAmJiAhaXNOYU4od2lkdGgpKSB7XHJcbiAgICAgICAgICAgIGlmICh3aWR0aCA8IHRoaXMubWluV2lkdGgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3dpZHRoID0gdGhpcy5taW5XaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh3aWR0aCA+IHRoaXMubWF4V2lkdGgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3dpZHRoID0gdGhpcy5tYXhXaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3dpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5hY3R1YWxXaWR0aCA9IHRoaXMuX3dpZHRoO1xyXG4gICAgICAgICAgICB3aWR0aENoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICghaXNOYU4odGhpcy5fd2lkdGgpICYmIGlzTmFOKHdpZHRoKSkge1xyXG4gICAgICAgICAgICB0aGlzLl93aWR0aCA9IE5hTjtcclxuICAgICAgICAgICAgd2lkdGhDaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5fd2lkdGggIT09IHdpZHRoKSB7XHJcbiAgICAgICAgICAgIGlmICh3aWR0aCA8IHRoaXMubWluV2lkdGgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3dpZHRoID0gdGhpcy5taW5XaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh3aWR0aCA+IHRoaXMubWF4V2lkdGgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3dpZHRoID0gdGhpcy5tYXhXaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3dpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5hY3R1YWxXaWR0aCA9IHRoaXMuX3dpZHRoO1xyXG4gICAgICAgICAgICB3aWR0aENoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaGVpZ2h0Q2hhbmdlZCA9IGZhbHNlO1xyXG4gICAgICAgIGlmIChpc05hTih0aGlzLl9oZWlnaHQpICYmICFpc05hTihoZWlnaHQpKSB7XHJcbiAgICAgICAgICAgIGlmIChoZWlnaHQgPCB0aGlzLm1pbkhlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGVpZ2h0ID0gdGhpcy5taW5IZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoaGVpZ2h0ID4gdGhpcy5tYXhIZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hlaWdodCA9IHRoaXMubWF4SGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYWN0dWFsSGVpZ2h0ID0gdGhpcy5faGVpZ2h0O1xyXG4gICAgICAgICAgICBoZWlnaHRDaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIWlzTmFOKHRoaXMuX2hlaWdodCkgJiYgaXNOYU4oaGVpZ2h0KSkge1xyXG4gICAgICAgICAgICB0aGlzLl9oZWlnaHQgPSBOYU47XHJcbiAgICAgICAgICAgIGhlaWdodENoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLl9oZWlnaHQgIT09IGhlaWdodCkge1xyXG4gICAgICAgICAgICBpZiAoaGVpZ2h0IDwgdGhpcy5taW5IZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hlaWdodCA9IHRoaXMubWluSGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGhlaWdodCA+IHRoaXMubWF4SGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oZWlnaHQgPSB0aGlzLm1heEhlaWdodDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hlaWdodCA9IGhlaWdodDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmFjdHVhbEhlaWdodCA9IHRoaXMuX2hlaWdodDtcclxuICAgICAgICAgICAgaGVpZ2h0Q2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh3aWR0aENoYW5nZWQgfHwgaGVpZ2h0Q2hhbmdlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmludmFsaWRhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzZXQgbWluV2lkdGgodmFsdWUpIHtcclxuICAgICAgICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlIDwgMCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fbWluV2lkdGggIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX21pbldpZHRoID0gdmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmFsdWUgPiB0aGlzLm1heFdpZHRoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9taW5XaWR0aCAhPT0gdGhpcy5tYXhXaWR0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWluV2lkdGggPSB0aGlzLm1heFdpZHRoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpc05hTih0aGlzLndpZHRoKSB8fCB0aGlzLndpZHRoIDwgdGhpcy5fbWluV2lkdGgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMud2lkdGggPSB0aGlzLl9taW5XaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9taW5XaWR0aCA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9taW5XaWR0aCA9IHZhbHVlO1xyXG4gICAgICAgIGlmIChpc05hTih0aGlzLndpZHRoKSB8fCB0aGlzLndpZHRoIDwgdGhpcy5fbWluV2lkdGgpIHtcclxuICAgICAgICAgICAgdGhpcy53aWR0aCA9IHRoaXMuX21pbldpZHRoO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldCBtaW5XaWR0aCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbWluV2lkdGg7XHJcbiAgICB9XHJcbiAgICBzZXQgd2lkdGgodmFsdWUpIHtcclxuICAgICAgICBpZiAoaXNOYU4odGhpcy5fd2lkdGgpICYmIGlzTmFOKHZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl93aWR0aCA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4odmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3dpZHRoID0gTmFOO1xyXG4gICAgICAgICAgICB0aGlzLmludmFsaWRhdGUoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmFsdWUgPCB0aGlzLm1pbldpZHRoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl93aWR0aCAhPT0gdGhpcy5taW5XaWR0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fd2lkdGggPSB0aGlzLm1pbldpZHRoO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW50ZXJuYWxXaWR0aCA9IHRoaXMuX3dpZHRoO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hY3R1YWxXaWR0aCA9IHRoaXMuX3dpZHRoO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmFsdWUgPiB0aGlzLm1heFdpZHRoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl93aWR0aCAhPT0gdGhpcy5tYXhXaWR0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fd2lkdGggPSB0aGlzLm1heFdpZHRoO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW50ZXJuYWxXaWR0aCA9IHRoaXMuX3dpZHRoO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hY3R1YWxXaWR0aCA9IHRoaXMuX3dpZHRoO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl93aWR0aCA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuX2ludGVybmFsV2lkdGggPSB0aGlzLl93aWR0aDtcclxuICAgICAgICB0aGlzLmFjdHVhbFdpZHRoID0gdGhpcy5fd2lkdGg7XHJcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICB9XHJcbiAgICBnZXQgd2lkdGgoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dpZHRoO1xyXG4gICAgfVxyXG4gICAgc2V0IG1heFdpZHRoKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKGlzTmFOKHZhbHVlKSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fbWF4V2lkdGggIT09IEluZmluaXR5KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tYXhXaWR0aCA9IEluZmluaXR5O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX21heFdpZHRoID09PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2YWx1ZSA8IHRoaXMubWluV2lkdGgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX21heFdpZHRoICE9PSB0aGlzLm1pbldpZHRoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tYXhXaWR0aCA9IHRoaXMubWluV2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFpc05hTih0aGlzLndpZHRoKSAmJiB0aGlzLndpZHRoID4gdGhpcy5fbWF4V2lkdGgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMud2lkdGggPSB0aGlzLl9tYXhXaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX21heFdpZHRoID0gdmFsdWU7XHJcbiAgICAgICAgaWYgKCFpc05hTih0aGlzLndpZHRoKSAmJiB0aGlzLndpZHRoID4gdGhpcy5fbWF4V2lkdGgpIHtcclxuICAgICAgICAgICAgdGhpcy53aWR0aCA9IHRoaXMuX21heFdpZHRoO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldCBtYXhXaWR0aCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbWF4V2lkdGg7XHJcbiAgICB9XHJcbiAgICBzZXQgbWluSGVpZ2h0KHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA8IDApIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX21pbkhlaWdodCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWluSGVpZ2h0ID0gdmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fbWluSGVpZ2h0ID09PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2YWx1ZSA+IHRoaXMubWF4SGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9taW5IZWlnaHQgIT09IHRoaXMubWF4SGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9taW5IZWlnaHQgPSB0aGlzLm1heEhlaWdodDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaXNOYU4odGhpcy5oZWlnaHQpIHx8IHRoaXMuaGVpZ2h0IDwgdGhpcy5fbWluSGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuX21pbkhlaWdodDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX21pbkhlaWdodCA9IHZhbHVlO1xyXG4gICAgICAgIGlmIChpc05hTih0aGlzLmhlaWdodCkgfHwgdGhpcy5oZWlnaHQgPCB0aGlzLl9taW5IZWlnaHQpIHtcclxuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLl9taW5IZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0IG1pbkhlaWdodCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbWluSGVpZ2h0O1xyXG4gICAgfVxyXG4gICAgc2V0IGhlaWdodCh2YWx1ZSkge1xyXG4gICAgICAgIGlmIChpc05hTih0aGlzLl9oZWlnaHQpICYmIGlzTmFOKHZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9oZWlnaHQgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzTmFOKHZhbHVlKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9oZWlnaHQgPSB2YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZhbHVlIDwgdGhpcy5taW5IZWlnaHQpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2hlaWdodCAhPT0gdGhpcy5taW5IZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hlaWdodCA9IHRoaXMubWluSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW50ZXJuYWxIZWlnaHQgPSB0aGlzLl9oZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFjdHVhbEhlaWdodCA9IHRoaXMuX2hlaWdodDtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZhbHVlID4gdGhpcy5tYXhIZWlnaHQpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2hlaWdodCAhPT0gdGhpcy5tYXhIZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hlaWdodCA9IHRoaXMubWF4SGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW50ZXJuYWxIZWlnaHQgPSB0aGlzLl9oZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFjdHVhbEhlaWdodCA9IHRoaXMuX2hlaWdodDtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faGVpZ2h0ID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5faW50ZXJuYWxIZWlnaHQgPSB0aGlzLl9oZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5hY3R1YWxIZWlnaHQgPSB0aGlzLl9oZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICB9XHJcbiAgICBnZXQgaGVpZ2h0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9oZWlnaHQ7XHJcbiAgICB9XHJcbiAgICBzZXQgbWF4SGVpZ2h0KHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKGlzTmFOKHZhbHVlKSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fbWF4SGVpZ2h0ICE9PSBJbmZpbml0eSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWF4SGVpZ2h0ID0gSW5maW5pdHk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fbWF4SGVpZ2h0ID09PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2YWx1ZSA8IHRoaXMubWluSGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9tYXhIZWlnaHQgIT09IHRoaXMubWluSGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tYXhIZWlnaHQgPSB0aGlzLm1pbkhlaWdodDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWlzTmFOKHRoaXMuaGVpZ2h0KSAmJiB0aGlzLmhlaWdodCA+IHRoaXMuX21heEhlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLl9tYXhIZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9tYXhIZWlnaHQgPSB2YWx1ZTtcclxuICAgICAgICBpZiAoIWlzTmFOKHRoaXMuaGVpZ2h0KSAmJiB0aGlzLmhlaWdodCA+IHRoaXMuX21heEhlaWdodCkge1xyXG4gICAgICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuX21heEhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnZXQgbWF4SGVpZ2h0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9tYXhIZWlnaHQ7XHJcbiAgICB9XHJcbiAgICBzZXQgcGVyY2VudFdpZHRoKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKGlzTmFOKHRoaXMuX3BlcmNlbnRXaWR0aCkgJiYgaXNOYU4odmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX3BlcmNlbnRXaWR0aCA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4odmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3dpZHRoID0gTmFOO1xyXG4gICAgICAgICAgICB0aGlzLl9pbnRlcm5hbFdpZHRoID0gdGhpcy5taW5XaWR0aDtcclxuICAgICAgICAgICAgdGhpcy5fcGVyY2VudFdpZHRoID0gTmFOO1xyXG4gICAgICAgICAgICB0aGlzLmFjdHVhbFdpZHRoID0gdGhpcy5taW5XaWR0aDtcclxuICAgICAgICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZhbHVlIDwgMCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fcGVyY2VudFdpZHRoICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wZXJjZW50V2lkdGggPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2YWx1ZSA+IDEwMCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fcGVyY2VudFdpZHRoICE9PSAxMDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3BlcmNlbnRXaWR0aCA9IDEwMDtcclxuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9wZXJjZW50V2lkdGggPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLm5vdGlmeSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0IHBlcmNlbnRXaWR0aCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcGVyY2VudFdpZHRoO1xyXG4gICAgfVxyXG4gICAgc2V0IHBlcmNlbnRIZWlnaHQodmFsdWUpIHtcclxuICAgICAgICBpZiAoaXNOYU4odGhpcy5fcGVyY2VudEhlaWdodCkgJiYgaXNOYU4odmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX3BlcmNlbnRIZWlnaHQgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzTmFOKHZhbHVlKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9oZWlnaHQgPSBOYU47XHJcbiAgICAgICAgICAgIHRoaXMuX2ludGVybmFsSGVpZ2h0ID0gdGhpcy5taW5IZWlnaHQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3BlcmNlbnRIZWlnaHQgPSBOYU47XHJcbiAgICAgICAgICAgIHRoaXMuYWN0dWFsSGVpZ2h0ID0gdGhpcy5taW5IZWlnaHQ7XHJcbiAgICAgICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2YWx1ZSA8IDApIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3BlcmNlbnRIZWlnaHQgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3BlcmNlbnRIZWlnaHQgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZhbHVlID4gMTAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9wZXJjZW50SGVpZ2h0ICE9PSAxMDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3BlcmNlbnRIZWlnaHQgPSAxMDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9wZXJjZW50SGVpZ2h0ID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5ub3RpZnkoKTtcclxuICAgIH1cclxuICAgIGdldCBwZXJjZW50SGVpZ2h0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wZXJjZW50SGVpZ2h0O1xyXG4gICAgfVxyXG4gICAgZ2V0IG1lYXN1cmVkV2lkdGgoKSB7XHJcbiAgICAgICAgaWYgKGlzTmFOKHRoaXMud2lkdGgpICYmICFpc05hTih0aGlzLnBlcmNlbnRXaWR0aCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWluV2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghaXNOYU4odGhpcy53aWR0aCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMud2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmludGVybmFsV2lkdGg7XHJcbiAgICB9XHJcbiAgICBnZXQgbWVhc3VyZWRIZWlnaHQoKSB7XHJcbiAgICAgICAgaWYgKGlzTmFOKHRoaXMuaGVpZ2h0KSAmJiAhaXNOYU4odGhpcy5wZXJjZW50SGVpZ2h0KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5taW5IZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghaXNOYU4odGhpcy5oZWlnaHQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxIZWlnaHQ7XHJcbiAgICB9XHJcbiAgICBzZXQgYWN0dWFsV2lkdGgodmFsdWUpIHtcclxuICAgICAgICB0aGlzLl9hY3R1YWxXaWR0aCA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuc3R5bGUud2lkdGggPSB0aGlzLl9hY3R1YWxXaWR0aCArICdweCc7XHJcbiAgICB9XHJcbiAgICBnZXQgYWN0dWFsV2lkdGgoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FjdHVhbFdpZHRoO1xyXG4gICAgfVxyXG4gICAgc2V0IGFjdHVhbEhlaWdodCh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuX2FjdHVhbEhlaWdodCA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuc3R5bGUuaGVpZ2h0ID0gdGhpcy5fYWN0dWFsSGVpZ2h0ICsgJ3B4JztcclxuICAgIH1cclxuICAgIGdldCBhY3R1YWxIZWlnaHQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FjdHVhbEhlaWdodDtcclxuICAgIH1cclxuICAgIGludGVybmFsU2l6ZSh3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgICAgICAgbGV0IHdpZHRoQ2hhbmdlZCA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh3aWR0aCA8IHRoaXMubWluV2lkdGgpIHtcclxuICAgICAgICAgICAgdGhpcy5faW50ZXJuYWxXaWR0aCA9IHRoaXMubWluV2lkdGg7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0dWFsV2lkdGggPSB0aGlzLl9pbnRlcm5hbFdpZHRoO1xyXG4gICAgICAgICAgICB3aWR0aENoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh3aWR0aCA+IHRoaXMubWF4V2lkdGgpIHtcclxuICAgICAgICAgICAgdGhpcy5faW50ZXJuYWxXaWR0aCA9IHRoaXMubWF4V2lkdGg7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0dWFsV2lkdGggPSB0aGlzLl9pbnRlcm5hbFdpZHRoO1xyXG4gICAgICAgICAgICB3aWR0aENoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLl9pbnRlcm5hbFdpZHRoICE9PSB3aWR0aCkge1xyXG4gICAgICAgICAgICB0aGlzLl9pbnRlcm5hbFdpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0dWFsV2lkdGggPSB0aGlzLl9pbnRlcm5hbFdpZHRoO1xyXG4gICAgICAgICAgICB3aWR0aENoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaGVpZ2h0Q2hhbmdlZCA9IGZhbHNlO1xyXG4gICAgICAgIGlmIChoZWlnaHQgPCB0aGlzLm1pbkhlaWdodCkge1xyXG4gICAgICAgICAgICB0aGlzLl9pbnRlcm5hbEhlaWdodCA9IHRoaXMubWluSGVpZ2h0O1xyXG4gICAgICAgICAgICB0aGlzLmFjdHVhbEhlaWdodCA9IHRoaXMuX2ludGVybmFsSGVpZ2h0O1xyXG4gICAgICAgICAgICBoZWlnaHRDaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoaGVpZ2h0ID4gdGhpcy5tYXhIZWlnaHQpIHtcclxuICAgICAgICAgICAgdGhpcy5faW50ZXJuYWxIZWlnaHQgPSB0aGlzLm1heEhlaWdodDtcclxuICAgICAgICAgICAgdGhpcy5hY3R1YWxIZWlnaHQgPSB0aGlzLl9pbnRlcm5hbEhlaWdodDtcclxuICAgICAgICAgICAgaGVpZ2h0Q2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX2ludGVybmFsSGVpZ2h0ICE9PSBoZWlnaHQpIHtcclxuICAgICAgICAgICAgdGhpcy5faW50ZXJuYWxIZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0dWFsSGVpZ2h0ID0gdGhpcy5faW50ZXJuYWxIZWlnaHQ7XHJcbiAgICAgICAgICAgIGhlaWdodENoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAod2lkdGhDaGFuZ2VkIHx8IGhlaWdodENoYW5nZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5ub3RpZnkoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzZXQgaW50ZXJuYWxXaWR0aCh2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pbnRlcm5hbFdpZHRoID09PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2YWx1ZSA8IHRoaXMubWluV2lkdGgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2ludGVybmFsV2lkdGggIT09IHRoaXMubWluV2lkdGgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2ludGVybmFsV2lkdGggPSB0aGlzLm1pbldpZHRoO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hY3R1YWxXaWR0aCA9IHRoaXMuX2ludGVybmFsV2lkdGg7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZhbHVlID4gdGhpcy5tYXhXaWR0aCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faW50ZXJuYWxXaWR0aCAhPT0gdGhpcy5tYXhXaWR0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW50ZXJuYWxXaWR0aCA9IHRoaXMubWF4V2lkdGg7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFjdHVhbFdpZHRoID0gdGhpcy5faW50ZXJuYWxXaWR0aDtcclxuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9pbnRlcm5hbFdpZHRoID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5hY3R1YWxXaWR0aCA9IHRoaXMuX2ludGVybmFsV2lkdGg7XHJcbiAgICAgICAgdGhpcy5ub3RpZnkoKTtcclxuICAgIH1cclxuICAgIGdldCBpbnRlcm5hbFdpZHRoKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pbnRlcm5hbFdpZHRoO1xyXG4gICAgfVxyXG4gICAgc2V0IGludGVybmFsSGVpZ2h0KHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2ludGVybmFsSGVpZ2h0ID09PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2YWx1ZSA8IHRoaXMubWluSGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pbnRlcm5hbEhlaWdodCAhPT0gdGhpcy5taW5IZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2ludGVybmFsSGVpZ2h0ID0gdGhpcy5taW5IZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFjdHVhbEhlaWdodCA9IHRoaXMuX2ludGVybmFsSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2YWx1ZSA+IHRoaXMubWF4SGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pbnRlcm5hbEhlaWdodCAhPT0gdGhpcy5tYXhIZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2ludGVybmFsSGVpZ2h0ID0gdGhpcy5tYXhIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFjdHVhbEhlaWdodCA9IHRoaXMuX2ludGVybmFsSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2ludGVybmFsSGVpZ2h0ID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5hY3R1YWxIZWlnaHQgPSB0aGlzLl9pbnRlcm5hbEhlaWdodDtcclxuICAgICAgICB0aGlzLm5vdGlmeSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0IGludGVybmFsSGVpZ2h0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pbnRlcm5hbEhlaWdodDtcclxuICAgIH1cclxuICAgIGludmFsaWRhdGVJbnRlcm5hbFNpemUoKSB7XHJcbiAgICAgICAgaWYgKCFpc05hTih0aGlzLndpZHRoKSAmJiAhaXNOYU4odGhpcy5oZWlnaHQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzTmFOKHRoaXMud2lkdGgpICYmIGlzTmFOKHRoaXMuaGVpZ2h0KSkge1xyXG4gICAgICAgICAgICBpZiAoaXNOYU4odGhpcy5wZXJjZW50V2lkdGgpICYmIGlzTmFOKHRoaXMucGVyY2VudEhlaWdodCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlSW50ZXJuYWxTaXplKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGlzTmFOKHRoaXMucGVyY2VudFdpZHRoKSAmJiAhaXNOYU4odGhpcy5wZXJjZW50SGVpZ2h0KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVJbnRlcm5hbFdpZHRoKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFpc05hTih0aGlzLnBlcmNlbnRXaWR0aCkgJiYgaXNOYU4odGhpcy5wZXJjZW50SGVpZ2h0KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVJbnRlcm5hbEhlaWdodCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlSW50ZXJuYWxTaXplKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzTmFOKHRoaXMud2lkdGgpICYmICFpc05hTih0aGlzLmhlaWdodCkpIHtcclxuICAgICAgICAgICAgaWYgKGlzTmFOKHRoaXMucGVyY2VudFdpZHRoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVJbnRlcm5hbFdpZHRoKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFpc05hTih0aGlzLndpZHRoKSAmJiBpc05hTih0aGlzLmhlaWdodCkpIHtcclxuICAgICAgICAgICAgaWYgKGlzTmFOKHRoaXMucGVyY2VudEhlaWdodCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlSW50ZXJuYWxIZWlnaHQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHVwZGF0ZUludGVybmFsU2l6ZSgpIHtcclxuICAgICAgICAvLyBvdmVycmlkZVxyXG4gICAgfVxyXG4gICAgdXBkYXRlSW50ZXJuYWxXaWR0aCgpIHtcclxuICAgICAgICAvLyBvdmVycmlkZVxyXG4gICAgfVxyXG4gICAgdXBkYXRlSW50ZXJuYWxIZWlnaHQoKSB7XHJcbiAgICAgICAgLy8gb3ZlcnJpZGVcclxuICAgIH1cclxuICAgIG5vdGlmeSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuY29ubmVjdGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kaXNwYXRjaCgnaW52YWxpZGF0ZScsIHRoaXMsIHRydWUpO1xyXG4gICAgfVxyXG59XHJcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnc2l6ZS1lbGVtZW50JywgU2l6ZUVsZW1lbnQpO1xuXG5jbGFzcyBMaW5lYXJHcmFkaWVudCBleHRlbmRzIEV2ZW50RGlzcGF0Y2hlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihkZWdyZWVzID0gMCwgY29sb3JzID0gW10pIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuY29sb3JzID0gW107XHJcbiAgICAgICAgdGhpcy5fZGVncmVlcyA9IDA7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gJ0xpbmVhckdyYWRpZW50JztcclxuICAgICAgICB0aGlzLmNvbG9yQ2hhbmdlZCA9IHRoaXMuY29sb3JDaGFuZ2VkLmJpbmQodGhpcyk7XHJcbiAgICAgICAgaWYgKHRoaXMuX2RlZ3JlZXMgIT09IGRlZ3JlZXMpIHtcclxuICAgICAgICAgICAgaWYgKGlzTmFOKGRlZ3JlZXMpIHx8IGRlZ3JlZXMgPCAwIHx8IGRlZ3JlZXMgPiAzNjApIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9kZWdyZWVzICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGVncmVlcyA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWdyZWVzID0gZGVncmVlcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGNvbnN0IGNvbG9yIG9mIGNvbG9ycykge1xyXG4gICAgICAgICAgICB0aGlzLmNvbG9ycy5wdXNoKGNvbG9yKTtcclxuICAgICAgICAgICAgY29sb3IuYWRkRXZlbnRMaXN0ZW5lcihDb2xvci5DSEFOR0VELCB0aGlzLmNvbG9yQ2hhbmdlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29sb3JDaGFuZ2VkKGUpIHtcclxuICAgICAgICB0aGlzLmRpc3BhdGNoKExpbmVhckdyYWRpZW50LkNPTE9SX0NIQU5HRUQsIGUuZGV0YWlsKTtcclxuICAgIH1cclxuICAgIGFkZENvbG9yKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5jb2xvcnMucHVzaCh2YWx1ZSk7XHJcbiAgICAgICAgdmFsdWUuYWRkRXZlbnRMaXN0ZW5lcihDb2xvci5DSEFOR0VELCB0aGlzLmNvbG9yQ2hhbmdlZCk7XHJcbiAgICAgICAgdGhpcy5kaXNwYXRjaChMaW5lYXJHcmFkaWVudC5DT0xPUl9BRERFRCwgdmFsdWUpO1xyXG4gICAgfVxyXG4gICAgYWRkQ29sb3JzKHZhbHVlKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBjb2xvciBvZiB2YWx1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbG9ycy5wdXNoKGNvbG9yKTtcclxuICAgICAgICAgICAgY29sb3IuYWRkRXZlbnRMaXN0ZW5lcihDb2xvci5DSEFOR0VELCB0aGlzLmNvbG9yQ2hhbmdlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2goTGluZWFyR3JhZGllbnQuQ09MT1JTX0FEREVELCB2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2V0IGRlZ3JlZXModmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fZGVncmVlcyA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlIDwgMCB8fCB2YWx1ZSA+PSAzNjApIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2RlZ3JlZXMgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2RlZ3JlZXMgPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaChMaW5lYXJHcmFkaWVudC5ERUdSRUVTX0NIQU5HRUQsIDApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2RlZ3JlZXMgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLmRpc3BhdGNoKExpbmVhckdyYWRpZW50LkRFR1JFRVNfQ0hBTkdFRCwgdGhpcy5fZGVncmVlcyk7XHJcbiAgICB9XHJcbiAgICBnZXQgZGVncmVlcygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZGVncmVlcztcclxuICAgIH1cclxuICAgIHRvU3RyaW5nKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbG9ycy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgbGluZWFyR3JhZGllbnQgPSAnbGluZWFyLWdyYWRpZW50KCcgKyB0aGlzLmRlZ3JlZXMgKyAnZGVnLCAnO1xyXG4gICAgICAgIGZvciAoY29uc3QgY29sb3Igb2YgdGhpcy5jb2xvcnMpIHtcclxuICAgICAgICAgICAgbGluZWFyR3JhZGllbnQgKz0gY29sb3IudG9TdHJpbmcoKSArICcsICc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBsaW5lYXJHcmFkaWVudC5zdWJzdHIoMCwgbGluZWFyR3JhZGllbnQubGVuZ3RoIC0gMikgKyAnKSc7XHJcbiAgICB9XHJcbn1cclxuTGluZWFyR3JhZGllbnQuQ09MT1JfQ0hBTkdFRCA9ICdMaW5lYXJHcmFkaWVudC5DT0xPUl9DSEFOR0VEJztcclxuTGluZWFyR3JhZGllbnQuQ09MT1JfQURERUQgPSAnTGluZWFyR3JhZGllbnQuQ09MT1JfQURERUQnO1xyXG5MaW5lYXJHcmFkaWVudC5DT0xPUlNfQURERUQgPSAnTGluZWFyR3JhZGllbnQuQ09MT1JTX0FEREVEJztcclxuTGluZWFyR3JhZGllbnQuREVHUkVFU19DSEFOR0VEID0gJ0xpbmVhckdyYWRpZW50LkRFR1JFRVNfQ0hBTkdFRCc7XG5cbmNsYXNzIEJveFNoYWRvd0ZpbHRlciBleHRlbmRzIEV2ZW50RGlzcGF0Y2hlciB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4ID0gMCwgeSA9IDQsIGJsdXIgPSA4LCBzcHJlYWQgPSAwLCBjb2xvciA9IG5ldyBDb2xvcigwLCAwLCAwLCAwLjMpLCBpbnNldCA9IGZhbHNlKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLl94ID0gMDtcclxuICAgICAgICB0aGlzLl95ID0gNDtcclxuICAgICAgICB0aGlzLl9ibHVyID0gODtcclxuICAgICAgICB0aGlzLl9zcHJlYWQgPSAwO1xyXG4gICAgICAgIHRoaXMuX2luc2V0ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gJ0JveFNoYWRvd0ZpbHRlcic7XHJcbiAgICAgICAgdGhpcy5jb2xvckNoYW5nZWQgPSB0aGlzLmNvbG9yQ2hhbmdlZC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIGlmICghaXNOYU4oeCkpIHtcclxuICAgICAgICAgICAgdGhpcy5feCA9IHg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghaXNOYU4oeSkpIHtcclxuICAgICAgICAgICAgdGhpcy5feSA9IHk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghaXNOYU4oYmx1cikgJiYgYmx1ciA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5fYmx1ciA9IGJsdXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghaXNOYU4oc3ByZWFkKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9zcHJlYWQgPSBzcHJlYWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2NvbG9yID0gY29sb3I7XHJcbiAgICAgICAgdGhpcy5fY29sb3IuYWRkRXZlbnRMaXN0ZW5lcignaW52YWxpZGF0ZScsIHRoaXMuY29sb3JDaGFuZ2VkKTtcclxuICAgICAgICB0aGlzLl9pbnNldCA9IGluc2V0O1xyXG4gICAgfVxyXG4gICAgY29sb3JDaGFuZ2VkKCkge1xyXG4gICAgICAgIHRoaXMubm90aWZ5KCk7XHJcbiAgICB9XHJcbiAgICBzZXQgeCh2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl94ID09PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc05hTih2YWx1ZSkpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3ggIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ggPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl94ID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5ub3RpZnkoKTtcclxuICAgIH1cclxuICAgIGdldCB4KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl94O1xyXG4gICAgfVxyXG4gICAgc2V0IHkodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5feSA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4odmFsdWUpKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl95ICE9PSA0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl95ID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5feSA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMubm90aWZ5KCk7XHJcbiAgICB9XHJcbiAgICBnZXQgeSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5feTtcclxuICAgIH1cclxuICAgIHNldCBibHVyKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2JsdXIgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzTmFOKHZhbHVlKSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fYmx1ciAhPT0gOCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYmx1ciA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2JsdXIgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLm5vdGlmeSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0IGJsdXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2JsdXI7XHJcbiAgICB9XHJcbiAgICBzZXQgc3ByZWFkKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3NwcmVhZCA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4odmFsdWUpKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9zcHJlYWQgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NwcmVhZCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3NwcmVhZCA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMubm90aWZ5KCk7XHJcbiAgICB9XHJcbiAgICBnZXQgc3ByZWFkKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zcHJlYWQ7XHJcbiAgICB9XHJcbiAgICBzZXQgY29sb3IodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fY29sb3IgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fY29sb3IucmVtb3ZlRXZlbnRMaXN0ZW5lcignaW52YWxpZGF0ZScsIHRoaXMuY29sb3JDaGFuZ2VkKTtcclxuICAgICAgICB0aGlzLl9jb2xvciA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuX2NvbG9yLmFkZEV2ZW50TGlzdGVuZXIoJ2ludmFsaWRhdGUnLCB0aGlzLmNvbG9yQ2hhbmdlZCk7XHJcbiAgICAgICAgdGhpcy5ub3RpZnkoKTtcclxuICAgIH1cclxuICAgIGdldCBjb2xvcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY29sb3I7XHJcbiAgICB9XHJcbiAgICBzZXQgaW5zZXQodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5faW5zZXQgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faW5zZXQgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLm5vdGlmeSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0IGluc2V0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pbnNldDtcclxuICAgIH1cclxuICAgIHRvU3RyaW5nKCkge1xyXG4gICAgICAgIGxldCBzaGFkb3cgPSAnJztcclxuICAgICAgICBpZiAodGhpcy5pbnNldCkge1xyXG4gICAgICAgICAgICBzaGFkb3cgKz0gJ2luc2V0ICc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzaGFkb3cgKyB0aGlzLnggKyAncHggJyArIHRoaXMueSArICdweCAnICsgdGhpcy5ibHVyICsgJ3B4ICcgKyB0aGlzLnNwcmVhZCArICdweCAnICsgdGhpcy5jb2xvci50b1N0cmluZygpO1xyXG4gICAgfVxyXG4gICAgbm90aWZ5KCkge1xyXG4gICAgICAgIHRoaXMuZGlzcGF0Y2goJ2ludmFsaWRhdGUnKTtcclxuICAgIH1cclxufVxuXG5jbGFzcyBEaXNwbGF5RWxlbWVudCBleHRlbmRzIFNpemVFbGVtZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5maWx0ZXJzID0gW107XHJcbiAgICAgICAgdGhpcy5fYmFja2dyb3VuZENvbG9yID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9jb3JuZXJTaXplID0gMDtcclxuICAgICAgICB0aGlzLl9jbGlwID0gJ3Zpc2libGUnO1xyXG4gICAgICAgIHRoaXMuX2NsaXBYID0gJ3Zpc2libGUnO1xyXG4gICAgICAgIHRoaXMuX2NsaXBZID0gJ3Zpc2libGUnO1xyXG4gICAgICAgIHRoaXMuX2VuYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubmFtZSA9ICdEaXNwbGF5RWxlbWVudCc7XHJcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ29sb3JDaGFuZ2VkID0gdGhpcy5iYWNrZ3JvdW5kQ29sb3JDaGFuZ2VkLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5maWx0ZXJzQ2hhbmdlZCA9IHRoaXMuZmlsdGVyc0NoYW5nZWQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLnN0eWxlLmJvcmRlciA9IFwibm9uZVwiIC8qIE5PTkUgKi87XHJcbiAgICAgICAgdGhpcy5zdHlsZS5vdXRsaW5lID0gXCJub25lXCIgLyogTk9ORSAqLztcclxuICAgICAgICB0aGlzLnN0eWxlLmJveFNpemluZyA9IFwiYm9yZGVyLWJveFwiIC8qIEJPUkRFUl9CT1ggKi87XHJcbiAgICB9XHJcbiAgICBhZGRGaWx0ZXIodmFsdWUpIHtcclxuICAgICAgICB0aGlzLmZpbHRlcnMucHVzaCh2YWx1ZSk7XHJcbiAgICAgICAgdmFsdWUuYWRkRXZlbnRMaXN0ZW5lcignaW52YWxpZGF0ZScsIHRoaXMuZmlsdGVyc0NoYW5nZWQpO1xyXG4gICAgICAgIHRoaXMuZmlsdGVyc0NoYW5nZWQoKTtcclxuICAgIH1cclxuICAgIGZpbHRlcnNDaGFuZ2VkKCkge1xyXG4gICAgICAgIGxldCBmaWx0ZXJTdHJpbmcgPSAnJztcclxuICAgICAgICBsZXQgYm94U2hhZG93U3RyaW5nID0gJyc7XHJcbiAgICAgICAgaWYgKHRoaXMuZmlsdGVycy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgdGhpcy5zdHlsZS5maWx0ZXIgPSBmaWx0ZXJTdHJpbmc7XHJcbiAgICAgICAgICAgIHRoaXMuc3R5bGUuYm94U2hhZG93ID0gYm94U2hhZG93U3RyaW5nO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAoY29uc3QgZmlsdGVyIG9mIHRoaXMuZmlsdGVycykge1xyXG4gICAgICAgICAgICBpZiAoZmlsdGVyIGluc3RhbmNlb2YgQm94U2hhZG93RmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3dTdHJpbmcgKz0gZmlsdGVyLnRvU3RyaW5nKCkgKyAnLCAnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZmlsdGVyU3RyaW5nICs9IGZpbHRlci50b1N0cmluZygpICsgJyAnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc3R5bGUuZmlsdGVyID0gZmlsdGVyU3RyaW5nLnN1YnN0cigwLCBmaWx0ZXJTdHJpbmcubGVuZ3RoIC0gMik7XHJcbiAgICAgICAgdGhpcy5zdHlsZS5ib3hTaGFkb3cgPSBib3hTaGFkb3dTdHJpbmcuc3Vic3RyKDAsIGJveFNoYWRvd1N0cmluZy5sZW5ndGggLSAyKTtcclxuICAgIH1cclxuICAgIGJhY2tncm91bmRDb2xvckNoYW5nZWQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYmFja2dyb3VuZENvbG9yKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJhY2tncm91bmRDb2xvciBpbnN0YW5jZW9mIENvbG9yKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0eWxlLmJhY2tncm91bmQgPSAnJztcclxuICAgICAgICAgICAgICAgIHRoaXMuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gdGhpcy5iYWNrZ3JvdW5kQ29sb3IudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5iYWNrZ3JvdW5kQ29sb3IgaW5zdGFuY2VvZiBMaW5lYXJHcmFkaWVudCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnJztcclxuICAgICAgICAgICAgICAgIHRoaXMuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuYmFja2dyb3VuZENvbG9yLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnJztcclxuICAgICAgICB0aGlzLnN0eWxlLmJhY2tncm91bmQgPSAnJztcclxuICAgIH1cclxuICAgIHNldCBiYWNrZ3JvdW5kQ29sb3IodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fYmFja2dyb3VuZENvbG9yID09PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9iYWNrZ3JvdW5kQ29sb3IgaW5zdGFuY2VvZiBDb2xvcikge1xyXG4gICAgICAgICAgICB0aGlzLl9iYWNrZ3JvdW5kQ29sb3IucmVtb3ZlRXZlbnRMaXN0ZW5lcihDb2xvci5DSEFOR0VELCB0aGlzLmJhY2tncm91bmRDb2xvckNoYW5nZWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLl9iYWNrZ3JvdW5kQ29sb3IgaW5zdGFuY2VvZiBMaW5lYXJHcmFkaWVudCkge1xyXG4gICAgICAgICAgICB0aGlzLl9iYWNrZ3JvdW5kQ29sb3IucmVtb3ZlRXZlbnRMaXN0ZW5lcihMaW5lYXJHcmFkaWVudC5DT0xPUl9BRERFRCwgdGhpcy5iYWNrZ3JvdW5kQ29sb3JDaGFuZ2VkKTtcclxuICAgICAgICAgICAgdGhpcy5fYmFja2dyb3VuZENvbG9yLnJlbW92ZUV2ZW50TGlzdGVuZXIoTGluZWFyR3JhZGllbnQuQ09MT1JTX0FEREVELCB0aGlzLmJhY2tncm91bmRDb2xvckNoYW5nZWQpO1xyXG4gICAgICAgICAgICB0aGlzLl9iYWNrZ3JvdW5kQ29sb3IucmVtb3ZlRXZlbnRMaXN0ZW5lcihMaW5lYXJHcmFkaWVudC5DT0xPUl9DSEFOR0VELCB0aGlzLmJhY2tncm91bmRDb2xvckNoYW5nZWQpO1xyXG4gICAgICAgICAgICB0aGlzLl9iYWNrZ3JvdW5kQ29sb3IucmVtb3ZlRXZlbnRMaXN0ZW5lcihMaW5lYXJHcmFkaWVudC5ERUdSRUVTX0NIQU5HRUQsIHRoaXMuYmFja2dyb3VuZENvbG9yQ2hhbmdlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2JhY2tncm91bmRDb2xvciA9IHZhbHVlO1xyXG4gICAgICAgIGlmICh0aGlzLl9iYWNrZ3JvdW5kQ29sb3IgaW5zdGFuY2VvZiBDb2xvcikge1xyXG4gICAgICAgICAgICB0aGlzLl9iYWNrZ3JvdW5kQ29sb3IuYWRkRXZlbnRMaXN0ZW5lcihDb2xvci5DSEFOR0VELCB0aGlzLmJhY2tncm91bmRDb2xvckNoYW5nZWQpO1xyXG4gICAgICAgICAgICB0aGlzLnN0eWxlLmJhY2tncm91bmQgPSAnJztcclxuICAgICAgICAgICAgdGhpcy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSB0aGlzLl9iYWNrZ3JvdW5kQ29sb3IudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fYmFja2dyb3VuZENvbG9yIGluc3RhbmNlb2YgTGluZWFyR3JhZGllbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5fYmFja2dyb3VuZENvbG9yLmFkZEV2ZW50TGlzdGVuZXIoTGluZWFyR3JhZGllbnQuQ09MT1JfQURERUQsIHRoaXMuYmFja2dyb3VuZENvbG9yQ2hhbmdlZCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2JhY2tncm91bmRDb2xvci5hZGRFdmVudExpc3RlbmVyKExpbmVhckdyYWRpZW50LkNPTE9SU19BRERFRCwgdGhpcy5iYWNrZ3JvdW5kQ29sb3JDaGFuZ2VkKTtcclxuICAgICAgICAgICAgdGhpcy5fYmFja2dyb3VuZENvbG9yLmFkZEV2ZW50TGlzdGVuZXIoTGluZWFyR3JhZGllbnQuQ09MT1JfQ0hBTkdFRCwgdGhpcy5iYWNrZ3JvdW5kQ29sb3JDaGFuZ2VkKTtcclxuICAgICAgICAgICAgdGhpcy5fYmFja2dyb3VuZENvbG9yLmFkZEV2ZW50TGlzdGVuZXIoTGluZWFyR3JhZGllbnQuREVHUkVFU19DSEFOR0VELCB0aGlzLmJhY2tncm91bmRDb2xvckNoYW5nZWQpO1xyXG4gICAgICAgICAgICB0aGlzLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcnO1xyXG4gICAgICAgICAgICB0aGlzLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLl9iYWNrZ3JvdW5kQ29sb3IudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcnO1xyXG4gICAgICAgIHRoaXMuc3R5bGUuYmFja2dyb3VuZCA9ICcnO1xyXG4gICAgfVxyXG4gICAgZ2V0IGJhY2tncm91bmRDb2xvcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYmFja2dyb3VuZENvbG9yO1xyXG4gICAgfVxyXG4gICAgc2V0IGNvcm5lclNpemUodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fY29ybmVyU2l6ZSA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlIDwgMCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fY29ybmVyU2l6ZSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY29ybmVyU2l6ZSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0eWxlLmJvcmRlclJhZGl1cyA9ICcwJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2Nvcm5lclNpemUgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLnN0eWxlLmJvcmRlclJhZGl1cyA9IHRoaXMuX2Nvcm5lclNpemUgKyBcInB4XCIgLyogUFggKi87XHJcbiAgICB9XHJcbiAgICBnZXQgY29ybmVyU2l6ZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY29ybmVyU2l6ZTtcclxuICAgIH1cclxuICAgIHNldCBjbGlwKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2NsaXAgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fY2xpcCA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuc3R5bGUub3ZlcmZsb3cgPSB0aGlzLl9jbGlwO1xyXG4gICAgfVxyXG4gICAgZ2V0IGNsaXAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NsaXA7XHJcbiAgICB9XHJcbiAgICBzZXQgY2xpcFgodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fY2xpcFggPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fY2xpcFggPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLnN0eWxlLm92ZXJmbG93WCA9IHRoaXMuX2NsaXBYO1xyXG4gICAgfVxyXG4gICAgZ2V0IGNsaXBYKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jbGlwWDtcclxuICAgIH1cclxuICAgIHNldCBjbGlwWSh2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9jbGlwWSA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9jbGlwWSA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuc3R5bGUub3ZlcmZsb3dZID0gdGhpcy5fY2xpcFk7XHJcbiAgICB9XHJcbiAgICBnZXQgY2xpcFkoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NsaXBZO1xyXG4gICAgfVxyXG4gICAgc2V0IGVuYWJsZWQodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fZW5hYmxlZCA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9lbmFibGVkID0gdmFsdWU7XHJcbiAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3R5bGUucG9pbnRlckV2ZW50cyA9ICcnO1xyXG4gICAgICAgICAgICB0aGlzLnN0eWxlLnVzZXJTZWxlY3QgPSAnYXV0byc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIHRoaXMuc3R5bGUudXNlclNlbGVjdCA9ICdub25lJztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnZXQgZW5hYmxlZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZW5hYmxlZDtcclxuICAgIH1cclxufVxyXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2Rpc3BsYXktZWxlbWVudCcsIERpc3BsYXlFbGVtZW50KTtcblxuY2xhc3MgRGlzcGxheUNvbnRhaW5lciBleHRlbmRzIERpc3BsYXlFbGVtZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX3BhZGRpbmcgPSAwO1xyXG4gICAgICAgIHRoaXMuX3BhZGRpbmdUb3AgPSAwO1xyXG4gICAgICAgIHRoaXMuX3BhZGRpbmdSaWdodCA9IDA7XHJcbiAgICAgICAgdGhpcy5fcGFkZGluZ0JvdHRvbSA9IDA7XHJcbiAgICAgICAgdGhpcy5fcGFkZGluZ0xlZnQgPSAwO1xyXG4gICAgICAgIHRoaXMuX3BhZGRpbmdYID0gMDtcclxuICAgICAgICB0aGlzLl9wYWRkaW5nWSA9IDA7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gJ0Rpc3BsYXlDb250YWluZXInO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignaW52YWxpZGF0ZScsIHRoaXMuY2hpbGRJbnZhbGlkKTtcclxuICAgIH1cclxuICAgIHZhbGlkYXRlKCkge1xyXG4gICAgICAgIHN1cGVyLnZhbGlkYXRlKCk7XHJcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlSW50ZXJuYWxTaXplKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVDaGlsZHJlblNpemVzKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVMYXlvdXQoKTtcclxuICAgIH1cclxuICAgIHVwZGF0ZUNoaWxkcmVuU2l6ZXMoKSB7XHJcbiAgICAgICAgdGhpcy5sYXlvdXQudXBkYXRlQ2hpbGRyZW5TaXplcyh0aGlzLCB0aGlzLmVsZW1lbnRzKTtcclxuICAgIH1cclxuICAgIHVwZGF0ZUxheW91dCgpIHtcclxuICAgICAgICB0aGlzLmxheW91dC51cGRhdGVMYXlvdXQodGhpcywgdGhpcy5lbGVtZW50cyk7XHJcbiAgICB9XHJcbiAgICBjaGlsZEludmFsaWQoZSkge1xyXG4gICAgICAgIGlmIChlLnRhcmdldCA9PT0gdGhpcykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICB9XHJcbiAgICBhZGRFbGVtZW50KGVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnRzLnB1c2goZWxlbWVudCk7XHJcbiAgICAgICAgdGhpcy5hcHBlbmRDaGlsZChlbGVtZW50KTtcclxuICAgICAgICB0aGlzLmludmFsaWRhdGUoKTtcclxuICAgIH1cclxuICAgIGFkZEVsZW1lbnRzKGVsZW1lbnRzKSB7XHJcbiAgICAgICAgY29uc3QgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcclxuICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50cy5wdXNoKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICBmcmFnLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmFwcGVuZENoaWxkKGZyYWcpO1xyXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgfVxyXG4gICAgcmVtb3ZlRWxlbWVudChlbGVtZW50KSB7XHJcbiAgICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLmVsZW1lbnRzLmluZGV4T2YoZWxlbWVudCk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50cy5zcGxpY2Uoc3RhcnQsIDEpO1xyXG4gICAgICAgIHRoaXMucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XHJcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICB9XHJcbiAgICByZW1vdmVFbGVtZW50cygpIHtcclxuICAgICAgICBpZiAodGhpcy5lbGVtZW50cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHdoaWxlICh0aGlzLmVsZW1lbnRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmVsZW1lbnRzLnNwbGljZSgwLCAxKVswXTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgdXBkYXRlSW50ZXJuYWxTaXplKCkge1xyXG4gICAgICAgIGNvbnN0IHNpemUgPSB0aGlzLmxheW91dC5nZXRJbnRlcm5hbFNpemUodGhpcywgdGhpcy5lbGVtZW50cyk7XHJcbiAgICAgICAgdGhpcy5pbnRlcm5hbFNpemUoc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlSW50ZXJuYWxXaWR0aCgpIHtcclxuICAgICAgICB0aGlzLmludGVybmFsV2lkdGggPSB0aGlzLmxheW91dC5nZXRJbnRlcm5hbFdpZHRoKHRoaXMsIHRoaXMuZWxlbWVudHMpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlSW50ZXJuYWxIZWlnaHQoKSB7XHJcbiAgICAgICAgdGhpcy5pbnRlcm5hbEhlaWdodCA9IHRoaXMubGF5b3V0LmdldEludGVybmFsSGVpZ2h0KHRoaXMsIHRoaXMuZWxlbWVudHMpO1xyXG4gICAgfVxyXG4gICAgc2V0IGxheW91dCh2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9sYXlvdXQgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2xheW91dCkge1xyXG4gICAgICAgICAgICB0aGlzLl9sYXlvdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignaW52YWxpZGF0ZScsIHRoaXMuaW52YWxpZGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2xheW91dCA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuX2xheW91dC5hZGRFdmVudExpc3RlbmVyKCdpbnZhbGlkYXRlJywgdGhpcy5pbnZhbGlkYXRlKTtcclxuICAgICAgICB0aGlzLmludmFsaWRhdGUoKTtcclxuICAgIH1cclxuICAgIGdldCBsYXlvdXQoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9sYXlvdXQpIHtcclxuICAgICAgICAgICAgdGhpcy5fbGF5b3V0ID0gbmV3IEFic29sdXRlTGF5b3V0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2xheW91dC5hZGRFdmVudExpc3RlbmVyKCdpbnZhbGlkYXRlJywgdGhpcy5pbnZhbGlkYXRlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xheW91dDtcclxuICAgIH1cclxuICAgIHNldCBwYWRkaW5nKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA8IDApIHtcclxuICAgICAgICAgICAgdGhpcy5fcGFkZGluZyA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuX3BhZGRpbmdMZWZ0ID0gMDtcclxuICAgICAgICAgICAgdGhpcy5fcGFkZGluZ1RvcCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuX3BhZGRpbmdSaWdodCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuX3BhZGRpbmdCb3R0b20gPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmludmFsaWRhdGUoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9wYWRkaW5nID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5fcGFkZGluZ1RvcCA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuX3BhZGRpbmdSaWdodCA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuX3BhZGRpbmdCb3R0b20gPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLl9wYWRkaW5nTGVmdCA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0IHBhZGRpbmcoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhZGRpbmc7XHJcbiAgICB9XHJcbiAgICBzZXQgcGFkZGluZ1RvcCh2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9wYWRkaW5nVG9wID09PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPCAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9wYWRkaW5nVG9wICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wYWRkaW5nVG9wID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcGFkZGluZ1RvcCA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0IHBhZGRpbmdUb3AoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhZGRpbmdUb3A7XHJcbiAgICB9XHJcbiAgICBzZXQgcGFkZGluZ1JpZ2h0KHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA8IDApIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3BhZGRpbmdSaWdodCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcGFkZGluZ1JpZ2h0ID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcGFkZGluZ1JpZ2h0ID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICB9XHJcbiAgICBnZXQgcGFkZGluZ1JpZ2h0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYWRkaW5nUmlnaHQ7XHJcbiAgICB9XHJcbiAgICBzZXQgcGFkZGluZ0JvdHRvbSh2YWx1ZSkge1xyXG4gICAgICAgIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPCAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9wYWRkaW5nQm90dG9tICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wYWRkaW5nQm90dG9tID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcGFkZGluZ0JvdHRvbSA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0IHBhZGRpbmdCb3R0b20oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhZGRpbmdCb3R0b207XHJcbiAgICB9XHJcbiAgICBzZXQgcGFkZGluZ0xlZnQodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fcGFkZGluZ0xlZnQgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA8IDApIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3BhZGRpbmdMZWZ0ICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wYWRkaW5nTGVmdCA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmludmFsaWRhdGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3BhZGRpbmdMZWZ0ID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICB9XHJcbiAgICBnZXQgcGFkZGluZ0xlZnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhZGRpbmdMZWZ0O1xyXG4gICAgfVxyXG4gICAgc2V0IHBhZGRpbmdYKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3BhZGRpbmdYID09PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPCAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9wYWRkaW5nWCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcGFkZGluZ1ggPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcGFkZGluZ0xlZnQgPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcGFkZGluZ1JpZ2h0ID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcGFkZGluZ1ggPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLl9wYWRkaW5nTGVmdCA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuX3BhZGRpbmdSaWdodCA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0IHBhZGRpbmdYKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYWRkaW5nWDtcclxuICAgIH1cclxuICAgIHNldCBwYWRkaW5nWSh2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9wYWRkaW5nWSA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlIDwgMCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fcGFkZGluZ1kgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3BhZGRpbmdZID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3BhZGRpbmdUb3AgPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcGFkZGluZ0JvdHRvbSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmludmFsaWRhdGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3BhZGRpbmdZID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5fcGFkZGluZ1RvcCA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuX3BhZGRpbmdCb3R0b20gPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLmludmFsaWRhdGUoKTtcclxuICAgIH1cclxuICAgIGdldCBwYWRkaW5nWSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcGFkZGluZ1k7XHJcbiAgICB9XHJcbn1cclxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdkaXNwbGF5LWNvbnRhaW5lcicsIERpc3BsYXlDb250YWluZXIpO1xuXG5jbGFzcyBUZXh0UmVuZGVyZXIgZXh0ZW5kcyBEaXNwbGF5RWxlbWVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuX3RleHQgPSAnJztcclxuICAgICAgICB0aGlzLl90ZXh0Q29sb3IgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2ZvbnRGYW1pbHkgPSAnJztcclxuICAgICAgICB0aGlzLl9mb250U2l6ZSA9IE5hTjtcclxuICAgICAgICB0aGlzLl9mb250V2VpZ2h0ID0gNDAwO1xyXG4gICAgICAgIHRoaXMuX2xldHRlclNwYWNpbmcgPSAwLjA7XHJcbiAgICAgICAgdGhpcy5fbGluZUhlaWdodCA9IE5hTjtcclxuICAgICAgICB0aGlzLl90ZXh0QWxpZ24gPSAnbGVmdCc7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gJ1RleHRSZW5kZXJlcic7XHJcbiAgICAgICAgdGhpcy5mb250RmFtaWx5ID0gJ0FyaWFsJztcclxuICAgICAgICB0aGlzLmZvbnRTaXplID0gMTY7XHJcbiAgICAgICAgdGhpcy5saW5lSGVpZ2h0ID0gMS4yO1xyXG4gICAgfVxyXG4gICAgc2V0IHRleHQodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fdGV4dCA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl90ZXh0ID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5pbm5lclRleHQgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIGdldCB0ZXh0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl90ZXh0O1xyXG4gICAgfVxyXG4gICAgc2V0IHRleHRDb2xvcih2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl90ZXh0Q29sb3IgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdGV4dENvbG9yID0gdmFsdWU7XHJcbiAgICAgICAgaWYgKHRoaXMuX3RleHRDb2xvcikge1xyXG4gICAgICAgICAgICB0aGlzLnN0eWxlLmNvbG9yID0gdGhpcy5fdGV4dENvbG9yLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnN0eWxlLmNvbG9yID0gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0IHRleHRDb2xvcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdGV4dENvbG9yO1xyXG4gICAgfVxyXG4gICAgc2V0IGZvbnRGYW1pbHkodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fZm9udEZhbWlseSA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9mb250RmFtaWx5ID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5zdHlsZS5mb250RmFtaWx5ID0gdGhpcy5fZm9udEZhbWlseTtcclxuICAgIH1cclxuICAgIGdldCBmb250RmFtaWx5KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9mb250RmFtaWx5O1xyXG4gICAgfVxyXG4gICAgc2V0IGZvbnRTaXplKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2ZvbnRTaXplID09PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPCAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9mb250U2l6ZSAhPT0gMTYpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2ZvbnRTaXplID0gMTY7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0eWxlLmZvbnRTaXplID0gdGhpcy5fZm9udFNpemUgKyBcInB4XCIgLyogUFggKi87XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9mb250U2l6ZSA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuc3R5bGUuZm9udFNpemUgPSB0aGlzLl9mb250U2l6ZSArIFwicHhcIiAvKiBQWCAqLztcclxuICAgIH1cclxuICAgIGdldCBmb250U2l6ZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZm9udFNpemU7XHJcbiAgICB9XHJcbiAgICBzZXQgZm9udFdlaWdodCh2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9mb250V2VpZ2h0ID09PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2ZvbnRXZWlnaHQgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLnN0eWxlLmZvbnRXZWlnaHQgPSB0aGlzLl9mb250V2VpZ2h0LnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcbiAgICBnZXQgZm9udFdlaWdodCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZm9udFdlaWdodDtcclxuICAgIH1cclxuICAgIHNldCBsZXR0ZXJTcGFjaW5nKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2xldHRlclNwYWNpbmcgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzTmFOKHZhbHVlKSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fbGV0dGVyU3BhY2luZyAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbGV0dGVyU3BhY2luZyA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0eWxlLmxldHRlclNwYWNpbmcgPSB0aGlzLl9sZXR0ZXJTcGFjaW5nICsgXCJweFwiIC8qIFBYICovO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbGV0dGVyU3BhY2luZyA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuc3R5bGUubGV0dGVyU3BhY2luZyA9IHRoaXMuX2xldHRlclNwYWNpbmcgKyBcInB4XCIgLyogUFggKi87XHJcbiAgICB9XHJcbiAgICBnZXQgbGV0dGVyU3BhY2luZygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbGV0dGVyU3BhY2luZztcclxuICAgIH1cclxuICAgIHNldCBsaW5lSGVpZ2h0KHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2xpbmVIZWlnaHQgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA8IDApIHtcclxuICAgICAgICAgICAgdGhpcy5fbGluZUhlaWdodCA9IDEuMjtcclxuICAgICAgICAgICAgdGhpcy5zdHlsZS5saW5lSGVpZ2h0ID0gdGhpcy5fbGluZUhlaWdodC50b1N0cmluZygpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2xpbmVIZWlnaHQgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLnN0eWxlLmxpbmVIZWlnaHQgPSB0aGlzLl9saW5lSGVpZ2h0LnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcbiAgICBnZXQgbGluZUhlaWdodCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbGluZUhlaWdodDtcclxuICAgIH1cclxuICAgIHNldCB0ZXh0QWxpZ24odmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fdGV4dEFsaWduID09PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3RleHRBbGlnbiA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuc3R5bGUudGV4dEFsaWduID0gdGhpcy5fdGV4dEFsaWduO1xyXG4gICAgfVxyXG4gICAgZ2V0IHRleHRBbGlnbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdGV4dEFsaWduO1xyXG4gICAgfVxyXG59XHJcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgndGV4dC1yZW5kZXJlcicsIFRleHRSZW5kZXJlcik7XG5cbmNsYXNzIEJhc2VUZXh0IGV4dGVuZHMgRGlzcGxheUVsZW1lbnQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSAnQmFzZVRleHQnO1xyXG4gICAgICAgIHRoaXMuYXBwZW5kQ2hpbGQodGhpcy50ZXh0UmVuZGVyZXIpO1xyXG4gICAgfVxyXG4gICAgZ2V0IHRleHRSZW5kZXJlcigpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX3RleHRSZW5kZXJlcikge1xyXG4gICAgICAgICAgICB0aGlzLl90ZXh0UmVuZGVyZXIgPSBuZXcgVGV4dFJlbmRlcmVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl90ZXh0UmVuZGVyZXI7XHJcbiAgICB9XHJcbiAgICBzZXQgdGV4dCh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMudGV4dFJlbmRlcmVyLnRleHQgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLmludmFsaWRhdGUoKTtcclxuICAgIH1cclxuICAgIGdldCB0ZXh0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRleHRSZW5kZXJlci50ZXh0O1xyXG4gICAgfVxyXG4gICAgc2V0IGZvbnRXZWlnaHQodmFsdWUpIHtcclxuICAgICAgICB0aGlzLnRleHRSZW5kZXJlci5mb250V2VpZ2h0ID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICB9XHJcbiAgICBnZXQgZm9udFdlaWdodCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50ZXh0UmVuZGVyZXIuZm9udFdlaWdodDtcclxuICAgIH1cclxuICAgIHNldCB0eXBlRmFjZSh2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl90eXBlRmFjZSA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl90eXBlRmFjZSA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMudGV4dFJlbmRlcmVyLmZvbnRGYW1pbHkgPSB0aGlzLl90eXBlRmFjZS5mb250RmFtaWx5O1xyXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0IHR5cGVGYWNlKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fdHlwZUZhY2UpIHtcclxuICAgICAgICAgICAgdGhpcy5fdHlwZUZhY2UgPSBuZXcgVHlwZUZhY2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3R5cGVGYWNlO1xyXG4gICAgfVxyXG4gICAgc2V0IGZvbnRTaXplKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy50ZXh0UmVuZGVyZXIuZm9udFNpemUgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLmludmFsaWRhdGUoKTtcclxuICAgIH1cclxuICAgIGdldCBmb250U2l6ZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50ZXh0UmVuZGVyZXIuZm9udFNpemU7XHJcbiAgICB9XHJcbiAgICBzZXQgdGV4dENvbG9yKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy50ZXh0UmVuZGVyZXIudGV4dENvbG9yID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBnZXQgdGV4dENvbG9yKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRleHRSZW5kZXJlci50ZXh0Q29sb3I7XHJcbiAgICB9XHJcbiAgICBzZXQgbGV0dGVyU3BhY2luZyh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMudGV4dFJlbmRlcmVyLmxldHRlclNwYWNpbmcgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLmludmFsaWRhdGUoKTtcclxuICAgIH1cclxuICAgIGdldCBsZXR0ZXJTcGFjaW5nKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRleHRSZW5kZXJlci5sZXR0ZXJTcGFjaW5nO1xyXG4gICAgfVxyXG4gICAgc2V0IGxpbmVIZWlnaHQodmFsdWUpIHtcclxuICAgICAgICB0aGlzLnRleHRSZW5kZXJlci5saW5lSGVpZ2h0ID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICB9XHJcbiAgICBnZXQgbGluZUhlaWdodCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50ZXh0UmVuZGVyZXIubGluZUhlaWdodDtcclxuICAgIH1cclxuICAgIHNldCB0ZXh0QWxpZ24odmFsdWUpIHtcclxuICAgICAgICB0aGlzLnRleHRSZW5kZXJlci50ZXh0QWxpZ24gPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIGdldCB0ZXh0QWxpZ24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dFJlbmRlcmVyLnRleHRBbGlnbjtcclxuICAgIH1cclxuICAgIHJlc2V0VGV4dFJlbmRlcmVyU3R5bGVzKCkge1xyXG4gICAgICAgIHRoaXMudGV4dFJlbmRlcmVyLnN0eWxlLndpZHRoID0gJyc7XHJcbiAgICAgICAgdGhpcy50ZXh0UmVuZGVyZXIuc3R5bGUuaGVpZ2h0ID0gJyc7XHJcbiAgICB9XHJcbiAgICBnZXQgYWN0dWFsRm9udFNpemUoKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguY2VpbCh0aGlzLmZvbnRTaXplICogdGhpcy50eXBlRmFjZS5jYXBIZWlnaHQpO1xyXG4gICAgfVxyXG4gICAgZ2V0IHRvcFBhZGRpbmcoKSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmZvbnRTaXplICogdGhpcy5saW5lSGVpZ2h0IC0gdGhpcy5hY3R1YWxGb250U2l6ZSkgKiAwLjU7XHJcbiAgICB9XHJcbiAgICBnZXQgYWN0dWFsUmVuZGVyZXJXaWR0aCgpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKHRoaXMudGV4dFJlbmRlcmVyLmNsaWVudFdpZHRoIC0gdGhpcy50eXBlRmFjZS5vZmZzZXRYICogMiAqIHRoaXMuZm9udFNpemUgLSB0aGlzLmxldHRlclNwYWNpbmcpO1xyXG4gICAgfVxyXG4gICAgZ2V0IGFjdHVhbFJlbmRlcmVySGVpZ2h0KCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLmNlaWwodGhpcy50ZXh0UmVuZGVyZXIuY2xpZW50SGVpZ2h0IC0gdGhpcy50b3BQYWRkaW5nICogMik7XHJcbiAgICB9XHJcbiAgICB1cGRhdGVUZXh0UmVuZGVyZXJQb3NpdGlvbigpIHtcclxuICAgICAgICB0aGlzLnRleHRSZW5kZXJlci54ID0gLXRoaXMudHlwZUZhY2Uub2Zmc2V0WCAqIHRoaXMuZm9udFNpemU7XHJcbiAgICAgICAgdGhpcy50ZXh0UmVuZGVyZXIueSA9IC10aGlzLnRvcFBhZGRpbmcgKyB0aGlzLnR5cGVGYWNlLm9mZnNldFkgKiB0aGlzLmZvbnRTaXplO1xyXG4gICAgfVxyXG59XHJcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYmFzZS10ZXh0JywgQmFzZVRleHQpO1xuXG5jbGFzcyBMYWJlbEVsZW1lbnQgZXh0ZW5kcyBCYXNlVGV4dCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubmFtZSA9ICdMYWJlbEVsZW1lbnQnO1xyXG4gICAgICAgIHRoaXMubGluZUhlaWdodCA9IDI7XHJcbiAgICAgICAgdGhpcy50ZXh0UmVuZGVyZXIuc3R5bGUud2hpdGVTcGFjZSA9ICdub3dyYXAnO1xyXG4gICAgICAgIHRoaXMudGV4dFJlbmRlcmVyLnN0eWxlLnRleHRPdmVyZmxvdyA9ICdlbGxpcHNpcyc7XHJcbiAgICAgICAgdGhpcy50ZXh0UmVuZGVyZXIuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcclxuICAgIH1cclxuICAgIHZhbGlkYXRlKCkge1xyXG4gICAgICAgIHN1cGVyLnZhbGlkYXRlKCk7XHJcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlSW50ZXJuYWxTaXplKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVUZXh0UmVuZGVyZXJXaWR0aCgpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVGV4dFJlbmRlcmVyUG9zaXRpb24oKTtcclxuICAgIH1cclxuICAgIHVwZGF0ZUludGVybmFsU2l6ZSgpIHtcclxuICAgICAgICB0aGlzLnJlc2V0VGV4dFJlbmRlcmVyU3R5bGVzKCk7XHJcbiAgICAgICAgdGhpcy5pbnRlcm5hbFNpemUodGhpcy5hY3R1YWxSZW5kZXJlcldpZHRoLCB0aGlzLmFjdHVhbEZvbnRTaXplKTtcclxuICAgIH1cclxuICAgIHVwZGF0ZUludGVybmFsV2lkdGgoKSB7XHJcbiAgICAgICAgdGhpcy5yZXNldFRleHRSZW5kZXJlclN0eWxlcygpO1xyXG4gICAgICAgIHRoaXMuaW50ZXJuYWxXaWR0aCA9IHRoaXMuYWN0dWFsUmVuZGVyZXJXaWR0aDtcclxuICAgIH1cclxuICAgIHVwZGF0ZUludGVybmFsSGVpZ2h0KCkge1xyXG4gICAgICAgIHRoaXMucmVzZXRUZXh0UmVuZGVyZXJTdHlsZXMoKTtcclxuICAgICAgICB0aGlzLmludGVybmFsSGVpZ2h0ID0gdGhpcy5hY3R1YWxGb250U2l6ZTtcclxuICAgIH1cclxuICAgIHVwZGF0ZVRleHRSZW5kZXJlcldpZHRoKCkge1xyXG4gICAgICAgIHRoaXMudGV4dFJlbmRlcmVyLndpZHRoID0gTWF0aC5jZWlsKHRoaXMubWVhc3VyZWRXaWR0aCArIE1hdGguY2VpbCh0aGlzLnR5cGVGYWNlLm9mZnNldFggKiAyICogdGhpcy5mb250U2l6ZSAqIDIpICsgdGhpcy5sZXR0ZXJTcGFjaW5nICogMik7XHJcbiAgICB9XHJcbn1cclxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdsYWJlbC1lbGVtZW50JywgTGFiZWxFbGVtZW50KTtcblxuY2xhc3MgQmFkZ2UgZXh0ZW5kcyBEaXNwbGF5Q29udGFpbmVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gJ0JhZGdlRWxlbWVudCc7XHJcbiAgICAgICAgdGhpcy50eXBlRmFjZSA9IHRoaXMudHlwb2dyYXBoeS5zZWNvbmRhcnk7XHJcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ29sb3IgPSB0aGlzLmNvbG9ycy5zdWNjZXNzLmMyMDA7XHJcbiAgICAgICAgdGhpcy50ZXh0Q29sb3IgPSB0aGlzLnRoZW1lLmNvbG9ycy5zdWNjZXNzLmM3MDA7XHJcbiAgICAgICAgdGhpcy5mb250U2l6ZSA9IDEwO1xyXG4gICAgICAgIHRoaXMuZm9udFdlaWdodCA9IDcwMDtcclxuICAgICAgICB0aGlzLnBhZGRpbmdYID0gODtcclxuICAgICAgICB0aGlzLnBhZGRpbmdZID0gNDtcclxuICAgICAgICB0aGlzLmNvcm5lclNpemUgPSA4O1xyXG4gICAgICAgIHRoaXMuYWRkRWxlbWVudCh0aGlzLmxhYmVsRWxlbWVudCk7XHJcbiAgICB9XHJcbiAgICBnZXQgbGFiZWxFbGVtZW50KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fbGFiZWxFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xhYmVsRWxlbWVudCA9IG5ldyBMYWJlbEVsZW1lbnQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xhYmVsRWxlbWVudDtcclxuICAgIH1cclxuICAgIHNldCB0ZXh0KHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5sYWJlbEVsZW1lbnQudGV4dCA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgZ2V0IHRleHQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGFiZWxFbGVtZW50LnRleHQ7XHJcbiAgICB9XHJcbiAgICBzZXQgdGV4dENvbG9yKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5sYWJlbEVsZW1lbnQudGV4dENvbG9yID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBnZXQgdGV4dENvbG9yKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxhYmVsRWxlbWVudC50ZXh0Q29sb3I7XHJcbiAgICB9XHJcbiAgICBzZXQgZm9udFdlaWdodCh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMubGFiZWxFbGVtZW50LmZvbnRXZWlnaHQgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIGdldCBmb250V2VpZ2h0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxhYmVsRWxlbWVudC5mb250V2VpZ2h0O1xyXG4gICAgfVxyXG4gICAgc2V0IGZvbnRTaXplKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5sYWJlbEVsZW1lbnQuZm9udFNpemUgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIGdldCBmb250U2l6ZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5sYWJlbEVsZW1lbnQuZm9udFNpemU7XHJcbiAgICB9XHJcbiAgICBzZXQgdHlwZUZhY2UodmFsdWUpIHtcclxuICAgICAgICB0aGlzLmxhYmVsRWxlbWVudC50eXBlRmFjZSA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgZ2V0IHR5cGVGYWNlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxhYmVsRWxlbWVudC50eXBlRmFjZTtcclxuICAgIH1cclxufVxyXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2JhZGdlLWVsZW1lbnQnLCBCYWRnZSk7XG5cbmNsYXNzIEJ1dHRvbiBleHRlbmRzIERpc3BsYXlDb250YWluZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSAnQnV0dG9uJztcclxuICAgICAgICB0aGlzLnR5cGVGYWNlID0gdGhpcy50eXBvZ3JhcGh5LnNlY29uZGFyeTtcclxuICAgICAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IHRoaXMuY29sb3JzLnNlY29uZGFyeS5jNTAwO1xyXG4gICAgICAgIHRoaXMudGV4dENvbG9yID0gdGhpcy5jb2xvcnMuc2Vjb25kYXJ5LmMxMDA7XHJcbiAgICAgICAgdGhpcy5wYWRkaW5nTGVmdCA9IHRoaXMucGFkZGluZ1JpZ2h0ID0gMTY7XHJcbiAgICAgICAgdGhpcy5wYWRkaW5nVG9wID0gdGhpcy5wYWRkaW5nQm90dG9tID0gMTAuNTtcclxuICAgICAgICB0aGlzLmNvcm5lclNpemUgPSA0O1xyXG4gICAgICAgIHRoaXMubGFiZWwgPSAnQnV0dG9uJztcclxuICAgICAgICB0aGlzLmFkZEVsZW1lbnQodGhpcy5sYWJlbEVsZW1lbnQpO1xyXG4gICAgfVxyXG4gICAgZ2V0IGxhYmVsRWxlbWVudCgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2xhYmVsRWxlbWVudCkge1xyXG4gICAgICAgICAgICB0aGlzLl9sYWJlbEVsZW1lbnQgPSBuZXcgTGFiZWxFbGVtZW50KCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2xhYmVsRWxlbWVudC5mb250U2l6ZSA9IDE0O1xyXG4gICAgICAgICAgICB0aGlzLl9sYWJlbEVsZW1lbnQuZm9udFdlaWdodCA9IDUwMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xhYmVsRWxlbWVudDtcclxuICAgIH1cclxuICAgIHNldCBsZXR0ZXJTcGFjaW5nKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5sYWJlbEVsZW1lbnQubGV0dGVyU3BhY2luZyA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgZ2V0IGxldHRlclNwYWNpbmcoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGFiZWxFbGVtZW50LmxldHRlclNwYWNpbmc7XHJcbiAgICB9XHJcbiAgICBzZXQgZm9udFNpemUodmFsdWUpIHtcclxuICAgICAgICB0aGlzLmxhYmVsRWxlbWVudC5mb250U2l6ZSA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgZ2V0IGZvbnRTaXplKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxhYmVsRWxlbWVudC5mb250U2l6ZTtcclxuICAgIH1cclxuICAgIHNldCBmb250V2VpZ2h0KHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5sYWJlbEVsZW1lbnQuZm9udFdlaWdodCA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgZ2V0IGZvbnRXZWlnaHQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGFiZWxFbGVtZW50LmZvbnRXZWlnaHQ7XHJcbiAgICB9XHJcbiAgICBzZXQgdGV4dENvbG9yKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5sYWJlbEVsZW1lbnQudGV4dENvbG9yID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBnZXQgdGV4dENvbG9yKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxhYmVsRWxlbWVudC50ZXh0Q29sb3I7XHJcbiAgICB9XHJcbiAgICBzZXQgdHlwZUZhY2UodmFsdWUpIHtcclxuICAgICAgICB0aGlzLmxhYmVsRWxlbWVudC50eXBlRmFjZSA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgZ2V0IHR5cGVGYWNlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxhYmVsRWxlbWVudC50eXBlRmFjZTtcclxuICAgIH1cclxuICAgIHNldCBsYWJlbCh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMubGFiZWxFbGVtZW50LnRleHQgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIGdldCBsYWJlbCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5sYWJlbEVsZW1lbnQudGV4dDtcclxuICAgIH1cclxufVxyXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2J1dHRvbi1lbGVtZW50JywgQnV0dG9uKTtcblxuY2xhc3MgUG9pbnQge1xyXG4gICAgY29uc3RydWN0b3IoeCA9IDAsIHkgPSAwKSB7XHJcbiAgICAgICAgdGhpcy5feCA9IDA7XHJcbiAgICAgICAgdGhpcy5feSA9IDA7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgfVxyXG4gICAgc2V0IHgodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5feCA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4odmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ggPSAwO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3ggPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIGdldCB4KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl94O1xyXG4gICAgfVxyXG4gICAgc2V0IHkodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5feSA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4odmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3kgPSAwO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3kgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIGdldCB5KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl95O1xyXG4gICAgfVxyXG59XG5cbmNsYXNzIFN0YXRlIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUpIHtcclxuICAgICAgICB0aGlzLmV2ZW50ID0gbnVsbDtcclxuICAgICAgICB0aGlzLmVudHJ5ID0gbnVsbDtcclxuICAgICAgICB0aGlzLm9uID0gbnVsbDtcclxuICAgICAgICB0aGlzLmV4aXQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0cyA9IG5ldyBNYXAoKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgfVxyXG4gICAgYWRkVHJhbnNpdGlvbih0eXBlLCB0YXJnZXQpIHtcclxuICAgICAgICB0aGlzLnRhcmdldHMuc2V0KHR5cGUsIHRhcmdldCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBnZXRTdGF0ZSh0eXBlKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0cy5nZXQodHlwZSkgfHwgdGhpcztcclxuICAgIH1cclxufVxuXG5jbGFzcyBNYWNoaW5lIHtcclxuICAgIGNvbnN0cnVjdG9yKGhvc3QpIHtcclxuICAgICAgICB0aGlzLmluaXRpYWwgPSBuZXcgU3RhdGUoJ2luaXRpYWwnKTtcclxuICAgICAgICB0aGlzLmhvc3QgPSBob3N0O1xyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IHRoaXMuaW5pdGlhbDtcclxuICAgICAgICB0aGlzLnNlbmQgPSB0aGlzLnNlbmQuYmluZCh0aGlzKTtcclxuICAgIH1cclxuICAgIHNlbmQoZSkge1xyXG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5jdXJyZW50LmdldFN0YXRlKGUudHlwZSk7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudCAhPT0gc3RhdGUpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudC5leGl0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnQuZXhpdChlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBzdGF0ZTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudC5lbnRyeSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50LmVudHJ5KGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnQub24pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudC5vbihlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxuXG5jbGFzcyBUb3VjaE1hY2hpbmUgZXh0ZW5kcyBNYWNoaW5lIHtcclxuICAgIGNvbnN0cnVjdG9yKGhvc3QpIHtcclxuICAgICAgICBzdXBlcihob3N0KTtcclxuICAgICAgICB0aGlzLmluaXRpYWwuYWRkVHJhbnNpdGlvbignbW91c2VvdmVyJywgdGhpcy5ob3Zlcik7XHJcbiAgICAgICAgdGhpcy5pbml0aWFsLmFkZFRyYW5zaXRpb24oJ3RvdWNoc3RhcnQnLCB0aGlzLnByZXNzZWQpO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbC5lbnRyeSA9IHRoaXMuaW5pdGlhbEVudHJ5LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5pbml0aWFsLm9uID0gdGhpcy5ob3N0LmluaXRpYWwuYmluZCh0aGlzLmhvc3QpO1xyXG4gICAgICAgIHRoaXMuaG9zdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCB0aGlzLnNlbmQpO1xyXG4gICAgICAgIHRoaXMuaG9zdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLnNlbmQpO1xyXG4gICAgICAgIHRoaXMuaG9zdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5zZW5kKTtcclxuICAgICAgICB0aGlzLmhvc3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMuc2VuZCk7XHJcbiAgICAgICAgdGhpcy5ob3N0LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLnNlbmQpO1xyXG4gICAgICAgIHRoaXMuaG9zdC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuc2VuZCk7XHJcbiAgICAgICAgdGhpcy5ob3N0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5ob3N0LnRyaWdnZXJlZCk7XHJcbiAgICB9XHJcbiAgICBpbml0aWFsRW50cnkoZSkge1xyXG4gICAgICAgIGlmICghd2luZG93LlRvdWNoRXZlbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIFRvdWNoRXZlbnQpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBpZiAoZS5jaGFuZ2VkVG91Y2hlcyAmJiBlLmNoYW5nZWRUb3VjaGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRvdWNoID0gZS5jaGFuZ2VkVG91Y2hlc1swXTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHB4ID0gdG91Y2gucGFnZVg7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBweSA9IHRvdWNoLnBhZ2VZO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVjdCA9IHRoaXMuaG9zdC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICAgICAgICAgIGlmIChweCA+IHJlY3QueCAmJiBweCA8IHJlY3QueCArIHJlY3Qud2lkdGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHkgPiByZWN0LnkgJiYgcHkgPCByZWN0LnkgKyByZWN0LmhlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhvc3QudHJpZ2dlcmVkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0IGhvdmVyKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5faG92ZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5faG92ZXIgPSBuZXcgU3RhdGUoJ2hvdmVyJyk7XHJcbiAgICAgICAgICAgIHRoaXMuX2hvdmVyLmFkZFRyYW5zaXRpb24oJ21vdXNlbGVhdmUnLCB0aGlzLmluaXRpYWwpO1xyXG4gICAgICAgICAgICB0aGlzLl9ob3Zlci5hZGRUcmFuc2l0aW9uKCdtb3VzZWRvd24nLCB0aGlzLnByZXNzZWQpO1xyXG4gICAgICAgICAgICB0aGlzLl9ob3Zlci5vbiA9IHRoaXMuaG9zdC5ob3Zlci5iaW5kKHRoaXMuaG9zdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9ob3ZlcjtcclxuICAgIH1cclxuICAgIGdldCBwcmVzc2VkKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fcHJlc3NlZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVzc2VkID0gbmV3IFN0YXRlKCdwcmVzc2VkJyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByZXNzZWQuYWRkVHJhbnNpdGlvbignbW91c2VsZWF2ZScsIHRoaXMuaW5pdGlhbCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByZXNzZWQuYWRkVHJhbnNpdGlvbignbW91c2V1cCcsIHRoaXMuaG92ZXIpO1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVzc2VkLmFkZFRyYW5zaXRpb24oJ3RvdWNoZW5kJywgdGhpcy5pbml0aWFsKTtcclxuICAgICAgICAgICAgdGhpcy5fcHJlc3NlZC5vbiA9IHRoaXMub25QcmVzc2VkLmJpbmQodGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9wcmVzc2VkO1xyXG4gICAgfVxyXG4gICAgb25QcmVzc2VkKGUpIHtcclxuICAgICAgICB0aGlzLmhvc3QucHJlc3NlZCh0aGlzLmdldFRvdWNoUG9pbnQoZSkpO1xyXG4gICAgfVxyXG4gICAgZ2V0VG91Y2hQb2ludChlKSB7XHJcbiAgICAgICAgaWYgKCF3aW5kb3cuVG91Y2hFdmVudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFBvaW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChlIGluc3RhbmNlb2YgVG91Y2hFdmVudCkge1xyXG4gICAgICAgICAgICBpZiAoZS5jaGFuZ2VkVG91Y2hlcyAmJiBlLmNoYW5nZWRUb3VjaGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRvdWNoID0gZS5jaGFuZ2VkVG91Y2hlc1swXTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlY3QgPSB0aGlzLmhvc3QuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFBvaW50KHRvdWNoLnBhZ2VYIC0gcmVjdC54LCB0b3VjaC5wYWdlWSAtIHJlY3QueSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBNb3VzZUV2ZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUG9pbnQoZS5vZmZzZXRYLCBlLm9mZnNldFkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFBvaW50KCk7XHJcbiAgICB9XHJcbn1cblxuY2xhc3MgSXRlbVJlbmRlcmVyIGV4dGVuZHMgRGlzcGxheUNvbnRhaW5lciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubWFjaGluZSA9IG5ldyBUb3VjaE1hY2hpbmUodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fZGF0YSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm5hbWUgPSAnTGlzdEl0ZW1SZW5kZXJlcic7XHJcbiAgICB9XHJcbiAgICBpbml0aWFsKCkge1xyXG4gICAgICAgIC8vIG92ZXJyaWRlXHJcbiAgICB9XHJcbiAgICBob3ZlcigpIHtcclxuICAgICAgICAvLyBvdmVycmlkZVxyXG4gICAgfVxyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXHJcbiAgICBwcmVzc2VkKHBvaW50KSB7XHJcbiAgICAgICAgLy8gb3ZlcnJpZGVcclxuICAgIH1cclxuICAgIHRyaWdnZXJlZCgpIHtcclxuICAgICAgICB0aGlzLmRpc3BhdGNoKCdpdGVtUmVuZGVyZXJUcmlnZ2VyZWQnLCB0aGlzLmRhdGEsIHRydWUpO1xyXG4gICAgfVxyXG4gICAgZGF0YUNoYW5nZWQoKSB7XHJcbiAgICAgICAgLy8gb3ZlcnJpZGVcclxuICAgIH1cclxuICAgIHNlbGVjdGVkQ2hhbmdlZCgpIHtcclxuICAgICAgICAvLyBvdmVycmlkZVxyXG4gICAgfVxyXG4gICAgc2V0IGRhdGEodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fZGF0YSA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9kYXRhID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5kYXRhQ2hhbmdlZCgpO1xyXG4gICAgfVxyXG4gICAgZ2V0IGRhdGEoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGE7XHJcbiAgICB9XHJcbiAgICBzZXQgc2VsZWN0ZWQodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fc2VsZWN0ZWQgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fc2VsZWN0ZWQgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkQ2hhbmdlZCgpO1xyXG4gICAgfVxyXG4gICAgZ2V0IHNlbGVjdGVkKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZWxlY3RlZDtcclxuICAgIH1cclxufVxyXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2l0ZW0tcmVuZGVyZXInLCBJdGVtUmVuZGVyZXIpO1xuXG5jbGFzcyBTY3JvbGxDb250YWluZXIgZXh0ZW5kcyBEaXNwbGF5RWxlbWVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuX3Njcm9sbEVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9ob3Jpem9udGFsU2Nyb2xsRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX3ZlcnRpY2FsU2Nyb2xsRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubmFtZSA9ICdTY3JvbGxDb250YWluZXInO1xyXG4gICAgICAgIHRoaXMudmVydGljYWxTY3JvbGxFbmFibGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmNsaXAgPSAnaGlkZGVuJztcclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2ludmFsaWRhdGUnLCB0aGlzLmNoaWxkSW52YWxpZCk7XHJcbiAgICAgICAgdGhpcy5hcHBlbmRDaGlsZCh0aGlzLm91dGVyRWxlbWVudCk7XHJcbiAgICB9XHJcbiAgICBjaGlsZEludmFsaWQoZSkge1xyXG4gICAgICAgIGlmIChlLnRhcmdldCA9PT0gdGhpcykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICB9XHJcbiAgICB2YWxpZGF0ZSgpIHtcclxuICAgICAgICBzdXBlci52YWxpZGF0ZSgpO1xyXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZUludGVybmFsU2l6ZSgpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlQ2hpbGRyZW5TaXplcygpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlQ2hpbGRyZW5TaXplcygpIHtcclxuICAgICAgICB0aGlzLm91dGVyRWxlbWVudC5zaXplKHRoaXMubWVhc3VyZWRXaWR0aCArIHRoaXMuc2Nyb2xsQmFyV2lkdGgsIHRoaXMubWVhc3VyZWRIZWlnaHQgKyB0aGlzLnNjcm9sbEJhckhlaWdodCk7XHJcbiAgICAgICAgaWYgKCF0aGlzLmhvcml6b250YWxTY3JvbGxFbmFibGVkICYmICF0aGlzLnZlcnRpY2FsU2Nyb2xsRW5hYmxlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzQ29udGFpbmVyLnNpemUodGhpcy5tZWFzdXJlZFdpZHRoLCB0aGlzLm1lYXN1cmVkSGVpZ2h0KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuaG9yaXpvbnRhbFNjcm9sbEVuYWJsZWQgJiYgdGhpcy52ZXJ0aWNhbFNjcm9sbEVuYWJsZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50c0NvbnRhaW5lci53aWR0aCA9IHRoaXMubWVhc3VyZWRXaWR0aDtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5ob3Jpem9udGFsU2Nyb2xsRW5hYmxlZCAmJiAhdGhpcy52ZXJ0aWNhbFNjcm9sbEVuYWJsZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50c0NvbnRhaW5lci5oZWlnaHQgPSB0aGlzLm1lYXN1cmVkSGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldCBzY3JvbGxCYXJXaWR0aCgpIHtcclxuICAgICAgICBjb25zdCB3aWR0aCA9IHRoaXMub3V0ZXJFbGVtZW50Lm9mZnNldFdpZHRoIC0gdGhpcy5vdXRlckVsZW1lbnQuY2xpZW50V2lkdGg7XHJcbiAgICAgICAgLy8gSnVzdCB0byBiZSBzdXJlLCB3ZSBjaGVjayBpZiBjbGllbnRXaWR0aCBpcyBhYm92ZSAxNywgbG9vayBiZWxvdyBmb3IgSUUxMSBidWdcclxuICAgICAgICBpZiAod2lkdGggPiAxNykge1xyXG4gICAgICAgICAgICByZXR1cm4gMTc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB3aWR0aDtcclxuICAgIH1cclxuICAgIGdldCBzY3JvbGxCYXJIZWlnaHQoKSB7XHJcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5vdXRlckVsZW1lbnQub2Zmc2V0SGVpZ2h0IC0gdGhpcy5vdXRlckVsZW1lbnQuY2xpZW50SGVpZ2h0O1xyXG4gICAgICAgIC8vIElFMTEgaGFzIGEgYnVnIHRoYXQgd2lsbCByZXR1cm4gYSB3cm9uZyBjbGllbnRIZWlnaHQsIHNvIHdlIGNoZWNrIGlmIGl0JzwgYWJvdmUgMTcgaGVyZVxyXG4gICAgICAgIGlmIChoZWlnaHQgPiAxNykge1xyXG4gICAgICAgICAgICByZXR1cm4gMTc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBoZWlnaHQ7XHJcbiAgICB9XHJcbiAgICB1cGRhdGVJbnRlcm5hbFNpemUoKSB7XHJcbiAgICAgICAgdGhpcy5pbnRlcm5hbFNpemUodGhpcy5lbGVtZW50c0NvbnRhaW5lci5tZWFzdXJlZFdpZHRoLCB0aGlzLmVsZW1lbnRzQ29udGFpbmVyLm1lYXN1cmVkSGVpZ2h0KTtcclxuICAgIH1cclxuICAgIHVwZGF0ZUludGVybmFsV2lkdGgoKSB7XHJcbiAgICAgICAgdGhpcy5pbnRlcm5hbFdpZHRoID0gdGhpcy5lbGVtZW50c0NvbnRhaW5lci5tZWFzdXJlZFdpZHRoO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlSW50ZXJuYWxIZWlnaHQoKSB7XHJcbiAgICAgICAgdGhpcy5pbnRlcm5hbEhlaWdodCA9IHRoaXMuZWxlbWVudHNDb250YWluZXIubWVhc3VyZWRIZWlnaHQ7XHJcbiAgICB9XHJcbiAgICBnZXQgb3V0ZXJFbGVtZW50KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fb3V0ZXJFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX291dGVyRWxlbWVudCA9IG5ldyBEaXNwbGF5RWxlbWVudCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9vdXRlckVsZW1lbnQuY2xpcCA9ICdzY3JvbGwnO1xyXG4gICAgICAgICAgICB0aGlzLl9vdXRlckVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50c0NvbnRhaW5lcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9vdXRlckVsZW1lbnQ7XHJcbiAgICB9XHJcbiAgICBnZXQgZWxlbWVudHNDb250YWluZXIoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9lbGVtZW50c0NvbnRhaW5lcikge1xyXG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50c0NvbnRhaW5lciA9IG5ldyBEaXNwbGF5Q29udGFpbmVyKCk7XHJcbiAgICAgICAgICAgIC8vIHRoaXMgd2lsbCBib29zdCBzY3JvbGwgcGVyZm9ybWFuY2UsIG5vIHJlcGFpbnRzXHJcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRzQ29udGFpbmVyLnN0eWxlLndpbGxDaGFuZ2UgPSAndHJhbnNmb3JtJztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRzQ29udGFpbmVyO1xyXG4gICAgfVxyXG4gICAgYWRkRWxlbWVudChlbGVtZW50KSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50c0NvbnRhaW5lci5hZGRFbGVtZW50KGVsZW1lbnQpO1xyXG4gICAgfVxyXG4gICAgYWRkRWxlbWVudHMoZWxlbWVudHMpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnRzQ29udGFpbmVyLmFkZEVsZW1lbnRzKGVsZW1lbnRzKTtcclxuICAgIH1cclxuICAgIHJlbW92ZUVsZW1lbnQoZWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudHNDb250YWluZXIucmVtb3ZlRWxlbWVudChlbGVtZW50KTtcclxuICAgIH1cclxuICAgIHJlbW92ZUVsZW1lbnRzKCkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudHNDb250YWluZXIucmVtb3ZlRWxlbWVudHMoKTtcclxuICAgIH1cclxuICAgIHNldCBzY3JvbGxFbmFibGVkKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3Njcm9sbEVuYWJsZWQgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fc2Nyb2xsRW5hYmxlZCA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuX2hvcml6b250YWxTY3JvbGxFbmFibGVkID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5fdmVydGljYWxTY3JvbGxFbmFibGVkID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5vdXRlckVsZW1lbnQuY2xpcCA9IHRoaXMuc2Nyb2xsRW5hYmxlZCA/ICdzY3JvbGwnIDogJ2hpZGRlbic7XHJcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICB9XHJcbiAgICBnZXQgc2Nyb2xsRW5hYmxlZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2Nyb2xsRW5hYmxlZDtcclxuICAgIH1cclxuICAgIHNldCBob3Jpem9udGFsU2Nyb2xsRW5hYmxlZCh2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9ob3Jpem9udGFsU2Nyb2xsRW5hYmxlZCA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9ob3Jpem9udGFsU2Nyb2xsRW5hYmxlZCA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuX3Njcm9sbEVuYWJsZWQgPSB2YWx1ZSAmJiB0aGlzLnZlcnRpY2FsU2Nyb2xsRW5hYmxlZDtcclxuICAgICAgICB0aGlzLm91dGVyRWxlbWVudC5jbGlwWCA9IHRoaXMuaG9yaXpvbnRhbFNjcm9sbEVuYWJsZWQgPyAnc2Nyb2xsJyA6ICdoaWRkZW4nO1xyXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0IGhvcml6b250YWxTY3JvbGxFbmFibGVkKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9ob3Jpem9udGFsU2Nyb2xsRW5hYmxlZDtcclxuICAgIH1cclxuICAgIHNldCB2ZXJ0aWNhbFNjcm9sbEVuYWJsZWQodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fdmVydGljYWxTY3JvbGxFbmFibGVkID09PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3ZlcnRpY2FsU2Nyb2xsRW5hYmxlZCA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuX3Njcm9sbEVuYWJsZWQgPSB2YWx1ZSAmJiB0aGlzLl9ob3Jpem9udGFsU2Nyb2xsRW5hYmxlZDtcclxuICAgICAgICB0aGlzLm91dGVyRWxlbWVudC5jbGlwWSA9IHRoaXMudmVydGljYWxTY3JvbGxFbmFibGVkID8gJ3Njcm9sbCcgOiAnaGlkZGVuJztcclxuICAgICAgICB0aGlzLmludmFsaWRhdGUoKTtcclxuICAgIH1cclxuICAgIGdldCB2ZXJ0aWNhbFNjcm9sbEVuYWJsZWQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZlcnRpY2FsU2Nyb2xsRW5hYmxlZDtcclxuICAgIH1cclxuICAgIHNldCBsYXlvdXQodmFsdWUpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnRzQ29udGFpbmVyLmxheW91dCA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgZ2V0IGxheW91dCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c0NvbnRhaW5lci5sYXlvdXQ7XHJcbiAgICB9XHJcbiAgICBzZXQgcGFkZGluZyh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudHNDb250YWluZXIucGFkZGluZyA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgZ2V0IHBhZGRpbmcoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHNDb250YWluZXIucGFkZGluZztcclxuICAgIH1cclxuICAgIHNldCBwYWRkaW5nTGVmdCh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudHNDb250YWluZXIucGFkZGluZ0xlZnQgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIGdldCBwYWRkaW5nTGVmdCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c0NvbnRhaW5lci5wYWRkaW5nTGVmdDtcclxuICAgIH1cclxuICAgIHNldCBwYWRkaW5nVG9wKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50c0NvbnRhaW5lci5wYWRkaW5nVG9wID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBnZXQgcGFkZGluZ1RvcCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c0NvbnRhaW5lci5wYWRkaW5nVG9wO1xyXG4gICAgfVxyXG4gICAgc2V0IHBhZGRpbmdSaWdodCh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudHNDb250YWluZXIucGFkZGluZ1JpZ2h0ID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBnZXQgcGFkZGluZ1JpZ2h0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzQ29udGFpbmVyLnBhZGRpbmdSaWdodDtcclxuICAgIH1cclxuICAgIHNldCBwYWRkaW5nQm90dG9tKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50c0NvbnRhaW5lci5wYWRkaW5nQm90dG9tID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBnZXQgcGFkZGluZ0JvdHRvbSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c0NvbnRhaW5lci5wYWRkaW5nQm90dG9tO1xyXG4gICAgfVxyXG4gICAgc2V0IHBhZGRpbmdYKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50c0NvbnRhaW5lci5wYWRkaW5nWCA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgZ2V0IHBhZGRpbmdYKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzQ29udGFpbmVyLnBhZGRpbmdYO1xyXG4gICAgfVxyXG4gICAgc2V0IHBhZGRpbmdZKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50c0NvbnRhaW5lci5wYWRkaW5nWSA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgZ2V0IHBhZGRpbmdZKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzQ29udGFpbmVyLnBhZGRpbmdZO1xyXG4gICAgfVxyXG59XHJcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnc2Nyb2xsLWNvbnRhaW5lcicsIFNjcm9sbENvbnRhaW5lcik7XG5cbmNsYXNzIExpc3QgZXh0ZW5kcyBTY3JvbGxDb250YWluZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLmxpc3RJdGVtUmVuZGVyZXJMb29rdXAgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgdGhpcy5fZGF0YVByb3ZpZGVyID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9zZWxlY3RlZEl0ZW1SZW5kZXJlciA9IHVuZGVmaW5lZDtcclxuICAgICAgICB0aGlzLl9zZWxlY3RlZEluZGV4ID0gTmFOO1xyXG4gICAgICAgIHRoaXMubmFtZSA9ICdMaXN0JztcclxuICAgICAgICB0aGlzLml0ZW1BZGRlZCA9IHRoaXMuaXRlbUFkZGVkLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5pdGVtc0FkZGVkID0gdGhpcy5pdGVtc0FkZGVkLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5pdGVtUmVtb3ZlZCA9IHRoaXMuaXRlbVJlbW92ZWQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLnJlc2V0ID0gdGhpcy5yZXNldC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignaXRlbVJlbmRlcmVyVHJpZ2dlcmVkJywgdGhpcy5pdGVtUmVuZGVyVHJpZ2dlcmVkKTtcclxuICAgIH1cclxuICAgIGl0ZW1SZW5kZXJUcmlnZ2VyZWQoZSkge1xyXG4gICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuZGF0YVByb3ZpZGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IHRoaXMuZGF0YVByb3ZpZGVyLmdldEl0ZW1JbmRleChlLmRldGFpbCk7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2goJ3NlbGVjdGVkSXRlbUNoYW5nZWQnLCBlLmRldGFpbCk7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2goJ3NlbGVjdGVkSW5kZXhDaGFuZ2VkJywgdGhpcy5zZWxlY3RlZEluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhZGRJdGVtUmVuZGVyZXJzKGl0ZW1zKSB7XHJcbiAgICAgICAgY29uc3QgbGlzdEl0ZW1SZW5kZXJlcnMgPSBbXTtcclxuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcclxuICAgICAgICAgICAgY29uc3QgbGlzdEl0ZW1SZW5kZXJlciA9IG5ldyB0aGlzLkl0ZW1SZW5kZXJlckNsYXNzKCk7XHJcbiAgICAgICAgICAgIGxpc3RJdGVtUmVuZGVyZXIuZGF0YSA9IGl0ZW07XHJcbiAgICAgICAgICAgIHRoaXMubGlzdEl0ZW1SZW5kZXJlckxvb2t1cC5zZXQoaXRlbSwgbGlzdEl0ZW1SZW5kZXJlcik7XHJcbiAgICAgICAgICAgIGxpc3RJdGVtUmVuZGVyZXJzLnB1c2gobGlzdEl0ZW1SZW5kZXJlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYWRkRWxlbWVudHMobGlzdEl0ZW1SZW5kZXJlcnMpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlU2VsZWN0ZWRJdGVtUmVuZGVyZXIoKTtcclxuICAgIH1cclxuICAgIGl0ZW1BZGRlZChlKSB7XHJcbiAgICAgICAgY29uc3QgaXRlbVJlbmRlcmVyID0gbmV3IHRoaXMuSXRlbVJlbmRlcmVyQ2xhc3MoKTtcclxuICAgICAgICBpdGVtUmVuZGVyZXIuZGF0YSA9IGUuZGV0YWlsO1xyXG4gICAgICAgIHRoaXMubGlzdEl0ZW1SZW5kZXJlckxvb2t1cC5zZXQoZS5kZXRhaWwsIGl0ZW1SZW5kZXJlcik7XHJcbiAgICAgICAgdGhpcy5hZGRFbGVtZW50KGl0ZW1SZW5kZXJlcik7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTZWxlY3RlZEl0ZW1SZW5kZXJlcigpO1xyXG4gICAgfVxyXG4gICAgaXRlbXNBZGRlZChlKSB7XHJcbiAgICAgICAgdGhpcy5hZGRJdGVtUmVuZGVyZXJzKGUuZGV0YWlsKTtcclxuICAgIH1cclxuICAgIGl0ZW1SZW1vdmVkKGUpIHtcclxuICAgICAgICBjb25zdCBpdGVtUmVuZGVyZXIgPSB0aGlzLmxpc3RJdGVtUmVuZGVyZXJMb29rdXAuZ2V0KGUuZGV0YWlsKTtcclxuICAgICAgICBpZiAoaXRlbVJlbmRlcmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRWxlbWVudChpdGVtUmVuZGVyZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVwZGF0ZVNlbGVjdGVkSXRlbVJlbmRlcmVyKCk7XHJcbiAgICB9XHJcbiAgICByZXNldCgpIHtcclxuICAgICAgICB0aGlzLnJlbW92ZUVsZW1lbnRzKCk7XHJcbiAgICAgICAgdGhpcy5saXN0SXRlbVJlbmRlcmVyTG9va3VwLmNsZWFyKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuZGF0YVByb3ZpZGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkSXRlbVJlbmRlcmVycyh0aGlzLmRhdGFQcm92aWRlci5zb3VyY2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHVwZGF0ZVNlbGVjdGVkSXRlbVJlbmRlcmVyKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkSXRlbSkge1xyXG4gICAgICAgICAgICBjb25zdCBpdGVtUmVuZGVyZXIgPSB0aGlzLmxpc3RJdGVtUmVuZGVyZXJMb29rdXAuZ2V0KHRoaXMuc2VsZWN0ZWRJdGVtKTtcclxuICAgICAgICAgICAgaWYgKGl0ZW1SZW5kZXJlcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1SZW5kZXJlciA9IGl0ZW1SZW5kZXJlcjtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbVJlbmRlcmVyID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtUmVuZGVyZXIgPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgICBzZXQgSXRlbVJlbmRlcmVyQ2xhc3ModmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fSXRlbVJlbmRlcmVyQ2xhc3MgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fSXRlbVJlbmRlcmVyQ2xhc3MgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICB9XHJcbiAgICBnZXQgSXRlbVJlbmRlcmVyQ2xhc3MoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9JdGVtUmVuZGVyZXJDbGFzcykge1xyXG4gICAgICAgICAgICB0aGlzLl9JdGVtUmVuZGVyZXJDbGFzcyA9IEl0ZW1SZW5kZXJlcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX0l0ZW1SZW5kZXJlckNsYXNzO1xyXG4gICAgfVxyXG4gICAgc2V0IGRhdGFQcm92aWRlcih2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9kYXRhUHJvdmlkZXIgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2RhdGFQcm92aWRlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9kYXRhUHJvdmlkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignaXRlbUFkZGVkJywgdGhpcy5pdGVtQWRkZWQpO1xyXG4gICAgICAgICAgICB0aGlzLl9kYXRhUHJvdmlkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignaXRlbXNBZGRlZCcsIHRoaXMuaXRlbXNBZGRlZCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2RhdGFQcm92aWRlci5yZW1vdmVFdmVudExpc3RlbmVyKCdpdGVtUmVtb3ZlZCcsIHRoaXMuaXRlbVJlbW92ZWQpO1xyXG4gICAgICAgICAgICB0aGlzLl9kYXRhUHJvdmlkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzZXQnLCB0aGlzLnJlc2V0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZGF0YVByb3ZpZGVyID0gdmFsdWU7XHJcbiAgICAgICAgaWYgKHRoaXMuX2RhdGFQcm92aWRlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9kYXRhUHJvdmlkZXIuYWRkRXZlbnRMaXN0ZW5lcignaXRlbUFkZGVkJywgdGhpcy5pdGVtQWRkZWQpO1xyXG4gICAgICAgICAgICB0aGlzLl9kYXRhUHJvdmlkZXIuYWRkRXZlbnRMaXN0ZW5lcignaXRlbXNBZGRlZCcsIHRoaXMuaXRlbXNBZGRlZCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2RhdGFQcm92aWRlci5hZGRFdmVudExpc3RlbmVyKCdpdGVtUmVtb3ZlZCcsIHRoaXMuaXRlbVJlbW92ZWQpO1xyXG4gICAgICAgICAgICB0aGlzLl9kYXRhUHJvdmlkZXIuYWRkRXZlbnRMaXN0ZW5lcigncmVzZXQnLCB0aGlzLnJlc2V0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgfVxyXG4gICAgZ2V0IGRhdGFQcm92aWRlcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZGF0YVByb3ZpZGVyO1xyXG4gICAgfVxyXG4gICAgZ2V0IHNlbGVjdGVkSXRlbSgpIHtcclxuICAgICAgICBpZiAodGhpcy5kYXRhUHJvdmlkZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVByb3ZpZGVyLmdldEl0ZW1BdCh0aGlzLnNlbGVjdGVkSW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIHNldCBzZWxlY3RlZEl0ZW1SZW5kZXJlcih2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9zZWxlY3RlZEl0ZW1SZW5kZXJlciA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fc2VsZWN0ZWRJdGVtUmVuZGVyZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2VsZWN0ZWRJdGVtUmVuZGVyZXIuc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fc2VsZWN0ZWRJdGVtUmVuZGVyZXIgPSB2YWx1ZTtcclxuICAgICAgICBpZiAodGhpcy5fc2VsZWN0ZWRJdGVtUmVuZGVyZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2VsZWN0ZWRJdGVtUmVuZGVyZXIuc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldCBzZWxlY3RlZEl0ZW1SZW5kZXJlcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWRJdGVtUmVuZGVyZXI7XHJcbiAgICB9XHJcbiAgICBzZXQgc2VsZWN0ZWRJbmRleCh2YWx1ZSkge1xyXG4gICAgICAgIGlmIChpc05hTih0aGlzLl9zZWxlY3RlZEluZGV4KSAmJiBpc05hTih2YWx1ZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fc2VsZWN0ZWRJbmRleCA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9zZWxlY3RlZEluZGV4ID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTZWxlY3RlZEl0ZW1SZW5kZXJlcigpO1xyXG4gICAgfVxyXG4gICAgZ2V0IHNlbGVjdGVkSW5kZXgoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkSW5kZXg7XHJcbiAgICB9XHJcbn1cclxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdsaXN0LWVsZW1lbnQnLCBMaXN0KTtcblxuY2xhc3MgSG9yaXpvbnRhbExheW91dCBleHRlbmRzIEV2ZW50RGlzcGF0Y2hlciB7XHJcbiAgICBjb25zdHJ1Y3Rvcihob3Jpem9udGFsR2FwID0gMCwgaG9yaXpvbnRhbEFsaWduID0gJ2xlZnQnLCB2ZXJ0aWNhbEFsaWduID0gJ3RvcCcpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuX2hvcml6b250YWxHYXAgPSAwO1xyXG4gICAgICAgIHRoaXMuX2hvcml6b250YWxBbGlnbiA9ICdsZWZ0JztcclxuICAgICAgICB0aGlzLl92ZXJ0aWNhbEFsaWduID0gJ3RvcCc7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gJ0hvcml6b250YWxMYXlvdXQnO1xyXG4gICAgICAgIHRoaXMuaG9yaXpvbnRhbEdhcCA9IGhvcml6b250YWxHYXA7XHJcbiAgICAgICAgdGhpcy5ob3Jpem9udGFsQWxpZ24gPSBob3Jpem9udGFsQWxpZ247XHJcbiAgICAgICAgdGhpcy52ZXJ0aWNhbEFsaWduID0gdmVydGljYWxBbGlnbjtcclxuICAgIH1cclxuICAgIHVwZGF0ZUNoaWxkcmVuU2l6ZXMoY29udGFpbmVyLCBlbGVtZW50cykge1xyXG4gICAgICAgIGxldCB3aWR0aFN1bSA9IDA7XHJcbiAgICAgICAgbGV0IHBlcmNlbnRXaWR0aFN1bSA9IDA7XHJcbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XHJcbiAgICAgICAgICAgIGlmIChpc05hTihlbGVtZW50LnBlcmNlbnRXaWR0aCkpIHtcclxuICAgICAgICAgICAgICAgIHdpZHRoU3VtICs9IGVsZW1lbnQubWVhc3VyZWRXaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlcmNlbnRXaWR0aFN1bSArPSBlbGVtZW50LnBlcmNlbnRXaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBhY3R1YWxXaWR0aCA9IGNvbnRhaW5lci5tZWFzdXJlZFdpZHRoIC0gY29udGFpbmVyLnBhZGRpbmdMZWZ0IC0gY29udGFpbmVyLnBhZGRpbmdSaWdodDtcclxuICAgICAgICBjb25zdCBhY3R1YWxIZWlnaHQgPSBjb250YWluZXIubWVhc3VyZWRIZWlnaHQgLSBjb250YWluZXIucGFkZGluZ1RvcCAtIGNvbnRhaW5lci5wYWRkaW5nQm90dG9tO1xyXG4gICAgICAgIGNvbnN0IGhvcml6b250YWxHYXBTdW1XaWR0aCA9IHRoaXMuaG9yaXpvbnRhbEdhcCAqIChlbGVtZW50cy5sZW5ndGggLSAxKTtcclxuICAgICAgICBjb25zdCBhY3R1YWxXaWR0aExlZnRGb3JQZXJjZW50V2lkdGggPSBhY3R1YWxXaWR0aCAtIHdpZHRoU3VtIC0gaG9yaXpvbnRhbEdhcFN1bVdpZHRoO1xyXG4gICAgICAgIGxldCBwaXhlbFBlcmNlbnRSYXRpbztcclxuICAgICAgICBpZiAocGVyY2VudFdpZHRoU3VtID4gMTAwKSB7XHJcbiAgICAgICAgICAgIHBpeGVsUGVyY2VudFJhdGlvID0gYWN0dWFsV2lkdGhMZWZ0Rm9yUGVyY2VudFdpZHRoIC8gcGVyY2VudFdpZHRoU3VtO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcGl4ZWxQZXJjZW50UmF0aW8gPSBhY3R1YWxXaWR0aExlZnRGb3JQZXJjZW50V2lkdGggLyAxMDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnZlcnRpY2FsQWxpZ24gIT09ICdmaWxsJykge1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcclxuICAgICAgICAgICAgICAgIGlmICghaXNOYU4oZWxlbWVudC5wZXJjZW50V2lkdGgpICYmICFpc05hTihlbGVtZW50LnBlcmNlbnRIZWlnaHQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zaXplKHBpeGVsUGVyY2VudFJhdGlvICogZWxlbWVudC5wZXJjZW50V2lkdGgsIGFjdHVhbEhlaWdodCAqIGVsZW1lbnQucGVyY2VudEhlaWdodCAvIDEwMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmICghaXNOYU4oZWxlbWVudC5wZXJjZW50V2lkdGgpICYmIGlzTmFOKGVsZW1lbnQucGVyY2VudEhlaWdodCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LndpZHRoID0gcGl4ZWxQZXJjZW50UmF0aW8gKiBlbGVtZW50LnBlcmNlbnRXaWR0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzTmFOKGVsZW1lbnQucGVyY2VudFdpZHRoKSAmJiAhaXNOYU4oZWxlbWVudC5wZXJjZW50SGVpZ2h0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaGVpZ2h0ID0gYWN0dWFsSGVpZ2h0ICogZWxlbWVudC5wZXJjZW50SGVpZ2h0IC8gMTAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XHJcbiAgICAgICAgICAgIGlmICghaXNOYU4oZWxlbWVudC5wZXJjZW50V2lkdGgpKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNpemUocGl4ZWxQZXJjZW50UmF0aW8gKiBlbGVtZW50LnBlcmNlbnRXaWR0aCwgYWN0dWFsSGVpZ2h0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaGVpZ2h0ID0gYWN0dWFsSGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgdXBkYXRlTGF5b3V0KGNvbnRhaW5lciwgZWxlbWVudHMpIHtcclxuICAgICAgICBpZiAodGhpcy52ZXJ0aWNhbEFsaWduID09PSAndG9wJykge1xyXG4gICAgICAgICAgICB0aGlzLmxheW91dEVsZW1lbnRzVG9wKGNvbnRhaW5lciwgZWxlbWVudHMpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnZlcnRpY2FsQWxpZ24gPT09ICdib3R0b20nKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGF5b3V0RWxlbWVudHNCb3R0b20oY29udGFpbmVyLCBlbGVtZW50cyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5sYXlvdXRFbGVtZW50c01pZGRsZShjb250YWluZXIsIGVsZW1lbnRzKTtcclxuICAgIH1cclxuICAgIGdldEhvcml6b250YWxYU3RhcnRWYWx1ZShjb250YWluZXIsIGVsZW1lbnRzKSB7XHJcbiAgICAgICAgbGV0IHggPSBjb250YWluZXIucGFkZGluZ0xlZnQ7XHJcbiAgICAgICAgaWYgKHRoaXMuaG9yaXpvbnRhbEFsaWduID09PSAnY2VudGVyJyB8fCB0aGlzLmhvcml6b250YWxBbGlnbiA9PT0gJ3JpZ2h0Jykge1xyXG4gICAgICAgICAgICBjb25zdCBhY3R1YWxXaWR0aCA9IGNvbnRhaW5lci5tZWFzdXJlZFdpZHRoIC0gY29udGFpbmVyLnBhZGRpbmdMZWZ0IC0gY29udGFpbmVyLnBhZGRpbmdSaWdodDtcclxuICAgICAgICAgICAgbGV0IGVsZW1lbnRzV2lkdGhTdW0gPSAwO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnRzV2lkdGhTdW0gKz0gZWxlbWVudC5tZWFzdXJlZFdpZHRoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGhvcml6b250YWxHYXBTdW1XaWR0aCA9IHRoaXMuaG9yaXpvbnRhbEdhcCAqIChlbGVtZW50cy5sZW5ndGggLSAxKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaG9yaXpvbnRhbEFsaWduID09PSAnY2VudGVyJykge1xyXG4gICAgICAgICAgICAgICAgeCArPSAoYWN0dWFsV2lkdGggLSBlbGVtZW50c1dpZHRoU3VtIC0gaG9yaXpvbnRhbEdhcFN1bVdpZHRoKSAqIDAuNTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHggKz0gKGFjdHVhbFdpZHRoIC0gZWxlbWVudHNXaWR0aFN1bSAtIGhvcml6b250YWxHYXBTdW1XaWR0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9XHJcbiAgICBsYXlvdXRFbGVtZW50c1RvcChjb250YWluZXIsIGVsZW1lbnRzKSB7XHJcbiAgICAgICAgbGV0IHggPSB0aGlzLmdldEhvcml6b250YWxYU3RhcnRWYWx1ZShjb250YWluZXIsIGVsZW1lbnRzKTtcclxuICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5tb3ZlKHgsIGNvbnRhaW5lci5wYWRkaW5nVG9wKTtcclxuICAgICAgICAgICAgeCArPSBlbGVtZW50Lm1lYXN1cmVkV2lkdGggKyB0aGlzLmhvcml6b250YWxHYXA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgbGF5b3V0RWxlbWVudHNNaWRkbGUoY29udGFpbmVyLCBlbGVtZW50cykge1xyXG4gICAgICAgIGxldCB4ID0gdGhpcy5nZXRIb3Jpem9udGFsWFN0YXJ0VmFsdWUoY29udGFpbmVyLCBlbGVtZW50cyk7XHJcbiAgICAgICAgbGV0IHkgPSAwO1xyXG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cykge1xyXG4gICAgICAgICAgICB5ID0gY29udGFpbmVyLm1lYXN1cmVkSGVpZ2h0ICogMC41IC0gZWxlbWVudC5tZWFzdXJlZEhlaWdodCAqIDAuNTtcclxuICAgICAgICAgICAgZWxlbWVudC5tb3ZlKHgsIHkpO1xyXG4gICAgICAgICAgICB4ICs9IGVsZW1lbnQubWVhc3VyZWRXaWR0aCArIHRoaXMuaG9yaXpvbnRhbEdhcDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBsYXlvdXRFbGVtZW50c0JvdHRvbShjb250YWluZXIsIGVsZW1lbnRzKSB7XHJcbiAgICAgICAgbGV0IHggPSB0aGlzLmdldEhvcml6b250YWxYU3RhcnRWYWx1ZShjb250YWluZXIsIGVsZW1lbnRzKTtcclxuICAgICAgICBsZXQgeSA9IDA7XHJcbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XHJcbiAgICAgICAgICAgIHkgPSBjb250YWluZXIubWVhc3VyZWRIZWlnaHQgLSBjb250YWluZXIucGFkZGluZ0JvdHRvbSAtIGVsZW1lbnQubWVhc3VyZWRIZWlnaHQ7XHJcbiAgICAgICAgICAgIGVsZW1lbnQubW92ZSh4LCB5KTtcclxuICAgICAgICAgICAgeCArPSBlbGVtZW50Lm1lYXN1cmVkV2lkdGggKyB0aGlzLmhvcml6b250YWxHYXA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0SW50ZXJuYWxTaXplKGNvbnRhaW5lciwgZWxlbWVudHMpIHtcclxuICAgICAgICBsZXQgd2lkdGggPSAwO1xyXG4gICAgICAgIGxldCBoZWlnaHQgPSAwO1xyXG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cykge1xyXG4gICAgICAgICAgICBpZiAoaGVpZ2h0IDwgZWxlbWVudC5tZWFzdXJlZEhlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gZWxlbWVudC5tZWFzdXJlZEhlaWdodDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB3aWR0aCArPSBlbGVtZW50Lm1lYXN1cmVkV2lkdGggKyB0aGlzLmhvcml6b250YWxHYXA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpZHRoID0gY29udGFpbmVyLnBhZGRpbmdMZWZ0ICsgd2lkdGggLSB0aGlzLmhvcml6b250YWxHYXAgKyBjb250YWluZXIucGFkZGluZ1JpZ2h0O1xyXG4gICAgICAgIGhlaWdodCA9IGNvbnRhaW5lci5wYWRkaW5nVG9wICsgaGVpZ2h0ICsgY29udGFpbmVyLnBhZGRpbmdCb3R0b207XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTaXplKHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgfVxyXG4gICAgZ2V0SW50ZXJuYWxXaWR0aChjb250YWluZXIsIGVsZW1lbnRzKSB7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gMDtcclxuICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcclxuICAgICAgICAgICAgd2lkdGggKz0gZWxlbWVudC5tZWFzdXJlZFdpZHRoICsgdGhpcy5ob3Jpem9udGFsR2FwO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY29udGFpbmVyLnBhZGRpbmdMZWZ0ICsgd2lkdGggLSB0aGlzLmhvcml6b250YWxHYXAgKyBjb250YWluZXIucGFkZGluZ1JpZ2h0O1xyXG4gICAgfVxyXG4gICAgZ2V0SW50ZXJuYWxIZWlnaHQoY29udGFpbmVyLCBlbGVtZW50cykge1xyXG4gICAgICAgIGxldCBoZWlnaHQgPSAwO1xyXG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cykge1xyXG4gICAgICAgICAgICBpZiAoaGVpZ2h0IDwgZWxlbWVudC5tZWFzdXJlZEhlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gZWxlbWVudC5tZWFzdXJlZEhlaWdodDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY29udGFpbmVyLnBhZGRpbmdUb3AgKyBoZWlnaHQgKyBjb250YWluZXIucGFkZGluZ0JvdHRvbTtcclxuICAgIH1cclxuICAgIHNldCBob3Jpem9udGFsR2FwKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2hvcml6b250YWxHYXAgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA8IDApIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2hvcml6b250YWxHYXAgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hvcml6b250YWxHYXAgPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9ob3Jpem9udGFsR2FwID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5ub3RpZnkoKTtcclxuICAgIH1cclxuICAgIGdldCBob3Jpem9udGFsR2FwKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9ob3Jpem9udGFsR2FwO1xyXG4gICAgfVxyXG4gICAgc2V0IGhvcml6b250YWxBbGlnbih2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9ob3Jpem9udGFsQWxpZ24gPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faG9yaXpvbnRhbEFsaWduID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5ub3RpZnkoKTtcclxuICAgIH1cclxuICAgIGdldCBob3Jpem9udGFsQWxpZ24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hvcml6b250YWxBbGlnbjtcclxuICAgIH1cclxuICAgIHNldCB2ZXJ0aWNhbEFsaWduKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3ZlcnRpY2FsQWxpZ24gPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdmVydGljYWxBbGlnbiA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMubm90aWZ5KCk7XHJcbiAgICB9XHJcbiAgICBnZXQgdmVydGljYWxBbGlnbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdmVydGljYWxBbGlnbjtcclxuICAgIH1cclxuICAgIG5vdGlmeSgpIHtcclxuICAgICAgICB0aGlzLmRpc3BhdGNoKCdpbnZhbGlkYXRlJyk7XHJcbiAgICB9XHJcbn1cblxuY2xhc3MgVmVydGljYWxMYXlvdXQgZXh0ZW5kcyBFdmVudERpc3BhdGNoZXIge1xyXG4gICAgY29uc3RydWN0b3IodmVydGljYWxHYXAgPSAwLCBob3Jpem9udGFsQWxpZ24gPSAnbGVmdCcsIHZlcnRpY2FsQWxpZ24gPSAndG9wJykge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5faG9yaXpvbnRhbEFsaWduID0gJ2xlZnQnO1xyXG4gICAgICAgIHRoaXMuX3ZlcnRpY2FsQWxpZ24gPSAndG9wJztcclxuICAgICAgICB0aGlzLl92ZXJ0aWNhbEdhcCA9IDA7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gJ1ZlcnRpY2FsTGF5b3V0JztcclxuICAgICAgICB0aGlzLnZlcnRpY2FsR2FwID0gdmVydGljYWxHYXA7XHJcbiAgICAgICAgdGhpcy5ob3Jpem9udGFsQWxpZ24gPSBob3Jpem9udGFsQWxpZ247XHJcbiAgICAgICAgdGhpcy52ZXJ0aWNhbEFsaWduID0gdmVydGljYWxBbGlnbjtcclxuICAgIH1cclxuICAgIHVwZGF0ZUNoaWxkcmVuU2l6ZXMoY29udGFpbmVyLCBlbGVtZW50cykge1xyXG4gICAgICAgIGxldCBoZWlnaHRTdW0gPSAwO1xyXG4gICAgICAgIGxldCBwZXJjZW50SGVpZ2h0U3VtID0gMDtcclxuICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcclxuICAgICAgICAgICAgaWYgKCFpc05hTihlbGVtZW50LnBlcmNlbnRIZWlnaHQpKSB7XHJcbiAgICAgICAgICAgICAgICBwZXJjZW50SGVpZ2h0U3VtICs9IGVsZW1lbnQucGVyY2VudEhlaWdodDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGhlaWdodFN1bSArPSBlbGVtZW50Lm1lYXN1cmVkSGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGFjdHVhbFdpZHRoID0gY29udGFpbmVyLm1lYXN1cmVkV2lkdGggLSBjb250YWluZXIucGFkZGluZ0xlZnQgLSBjb250YWluZXIucGFkZGluZ1JpZ2h0O1xyXG4gICAgICAgIGNvbnN0IGFjdHVhbEhlaWdodCA9IGNvbnRhaW5lci5tZWFzdXJlZEhlaWdodCAtIGNvbnRhaW5lci5wYWRkaW5nVG9wIC0gY29udGFpbmVyLnBhZGRpbmdCb3R0b207XHJcbiAgICAgICAgY29uc3QgdmVydGljYWxHYXBTdW1IZWlnaHQgPSB0aGlzLnZlcnRpY2FsR2FwICogKGVsZW1lbnRzLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgIGNvbnN0IGFjdHVhbEhlaWdodExlZnRGb3JQZXJjZW50SGVpZ2h0ID0gYWN0dWFsSGVpZ2h0IC0gaGVpZ2h0U3VtIC0gdmVydGljYWxHYXBTdW1IZWlnaHQ7XHJcbiAgICAgICAgbGV0IHBpeGVsUGVyY2VudFJhdGlvO1xyXG4gICAgICAgIGlmIChwZXJjZW50SGVpZ2h0U3VtID4gMTAwKSB7XHJcbiAgICAgICAgICAgIHBpeGVsUGVyY2VudFJhdGlvID0gYWN0dWFsSGVpZ2h0TGVmdEZvclBlcmNlbnRIZWlnaHQgLyBwZXJjZW50SGVpZ2h0U3VtO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcGl4ZWxQZXJjZW50UmF0aW8gPSBhY3R1YWxIZWlnaHRMZWZ0Rm9yUGVyY2VudEhlaWdodCAvIDEwMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuaG9yaXpvbnRhbEFsaWduICE9PSAnZmlsbCcpIHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWlzTmFOKGVsZW1lbnQucGVyY2VudFdpZHRoKSAmJiAhaXNOYU4oZWxlbWVudC5wZXJjZW50SGVpZ2h0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2l6ZShhY3R1YWxXaWR0aCAqIGVsZW1lbnQucGVyY2VudFdpZHRoIC8gMTAwLCBwaXhlbFBlcmNlbnRSYXRpbyAqIGVsZW1lbnQucGVyY2VudEhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmICghaXNOYU4oZWxlbWVudC5wZXJjZW50V2lkdGgpICYmIGlzTmFOKGVsZW1lbnQucGVyY2VudEhlaWdodCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LndpZHRoID0gYWN0dWFsV2lkdGggKiBlbGVtZW50LnBlcmNlbnRXaWR0aCAvIDEwMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzTmFOKGVsZW1lbnQucGVyY2VudFdpZHRoKSAmJiAhaXNOYU4oZWxlbWVudC5wZXJjZW50SGVpZ2h0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaGVpZ2h0ID0gcGl4ZWxQZXJjZW50UmF0aW8gKiBlbGVtZW50LnBlcmNlbnRIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcclxuICAgICAgICAgICAgaWYgKCFpc05hTihlbGVtZW50LnBlcmNlbnRIZWlnaHQpKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNpemUoYWN0dWFsV2lkdGgsIHBpeGVsUGVyY2VudFJhdGlvICogZWxlbWVudC5wZXJjZW50SGVpZ2h0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQud2lkdGggPSBhY3R1YWxXaWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHVwZGF0ZUxheW91dChjb250YWluZXIsIGVsZW1lbnRzKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaG9yaXpvbnRhbEFsaWduID09PSAnbGVmdCcpIHtcclxuICAgICAgICAgICAgdGhpcy5sYXlvdXRFbGVtZW50c0xlZnQoY29udGFpbmVyLCBlbGVtZW50cyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuaG9yaXpvbnRhbEFsaWduID09PSAncmlnaHQnKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGF5b3V0RWxlbWVudHNSaWdodChjb250YWluZXIsIGVsZW1lbnRzKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmxheW91dEVsZW1lbnRzQ2VudGVyKGNvbnRhaW5lciwgZWxlbWVudHMpO1xyXG4gICAgfVxyXG4gICAgZ2V0VmVydGljYWxZU3RhcnRWYWx1ZShjb250YWluZXIsIGVsZW1lbnRzKSB7XHJcbiAgICAgICAgbGV0IHkgPSBjb250YWluZXIucGFkZGluZ1RvcDtcclxuICAgICAgICBpZiAodGhpcy52ZXJ0aWNhbEFsaWduID09PSAnbWlkZGxlJyB8fCB0aGlzLnZlcnRpY2FsQWxpZ24gPT09ICdib3R0b20nKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFjdHVhbEhlaWdodCA9IGNvbnRhaW5lci5tZWFzdXJlZEhlaWdodCAtIGNvbnRhaW5lci5wYWRkaW5nVG9wIC0gY29udGFpbmVyLnBhZGRpbmdCb3R0b207XHJcbiAgICAgICAgICAgIGxldCBlbGVtZW50c0hlaWdodFN1bSA9IDA7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cykge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudHNIZWlnaHRTdW0gKz0gZWxlbWVudC5tZWFzdXJlZEhlaWdodDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCB2ZXJ0aWNhbEdhcFN1bUhlaWdodCA9IHRoaXMudmVydGljYWxHYXAgKiAoZWxlbWVudHMubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnZlcnRpY2FsQWxpZ24gPT09ICdtaWRkbGUnKSB7XHJcbiAgICAgICAgICAgICAgICB5ICs9IChhY3R1YWxIZWlnaHQgLSBlbGVtZW50c0hlaWdodFN1bSAtIHZlcnRpY2FsR2FwU3VtSGVpZ2h0KSAqIDAuNTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHkgKz0gKGFjdHVhbEhlaWdodCAtIGVsZW1lbnRzSGVpZ2h0U3VtIC0gdmVydGljYWxHYXBTdW1IZWlnaHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgfVxyXG4gICAgbGF5b3V0RWxlbWVudHNMZWZ0KGNvbnRhaW5lciwgZWxlbWVudHMpIHtcclxuICAgICAgICBsZXQgeSA9IHRoaXMuZ2V0VmVydGljYWxZU3RhcnRWYWx1ZShjb250YWluZXIsIGVsZW1lbnRzKTtcclxuICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5tb3ZlKGNvbnRhaW5lci5wYWRkaW5nTGVmdCwgeSk7XHJcbiAgICAgICAgICAgIHkgKz0gZWxlbWVudC5tZWFzdXJlZEhlaWdodCArIHRoaXMudmVydGljYWxHYXA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgbGF5b3V0RWxlbWVudHNDZW50ZXIoY29udGFpbmVyLCBlbGVtZW50cykge1xyXG4gICAgICAgIGxldCB4ID0gMDtcclxuICAgICAgICBsZXQgeSA9IHRoaXMuZ2V0VmVydGljYWxZU3RhcnRWYWx1ZShjb250YWluZXIsIGVsZW1lbnRzKTtcclxuICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcclxuICAgICAgICAgICAgeCA9IGNvbnRhaW5lci5tZWFzdXJlZFdpZHRoICogMC41IC0gZWxlbWVudC5tZWFzdXJlZFdpZHRoICogMC41O1xyXG4gICAgICAgICAgICBlbGVtZW50Lm1vdmUoeCwgeSk7XHJcbiAgICAgICAgICAgIHkgKz0gZWxlbWVudC5tZWFzdXJlZEhlaWdodCArIHRoaXMudmVydGljYWxHYXA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgbGF5b3V0RWxlbWVudHNSaWdodChjb250YWluZXIsIGVsZW1lbnRzKSB7XHJcbiAgICAgICAgbGV0IHggPSAwO1xyXG4gICAgICAgIGxldCB5ID0gdGhpcy5nZXRWZXJ0aWNhbFlTdGFydFZhbHVlKGNvbnRhaW5lciwgZWxlbWVudHMpO1xyXG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cykge1xyXG4gICAgICAgICAgICB4ID0gY29udGFpbmVyLm1lYXN1cmVkV2lkdGggLSBjb250YWluZXIucGFkZGluZ1JpZ2h0IC0gZWxlbWVudC5tZWFzdXJlZFdpZHRoO1xyXG4gICAgICAgICAgICBlbGVtZW50Lm1vdmUoeCwgeSk7XHJcbiAgICAgICAgICAgIHkgKz0gZWxlbWVudC5tZWFzdXJlZEhlaWdodCArIHRoaXMudmVydGljYWxHYXA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0SW50ZXJuYWxTaXplKGNvbnRhaW5lciwgZWxlbWVudHMpIHtcclxuICAgICAgICBsZXQgd2lkdGggPSAwO1xyXG4gICAgICAgIGxldCBoZWlnaHQgPSAwO1xyXG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cykge1xyXG4gICAgICAgICAgICBpZiAod2lkdGggPCBlbGVtZW50Lm1lYXN1cmVkV2lkdGgpIHtcclxuICAgICAgICAgICAgICAgIHdpZHRoID0gZWxlbWVudC5tZWFzdXJlZEhlaWdodDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBoZWlnaHQgKz0gZWxlbWVudC5tZWFzdXJlZEhlaWdodCArIHRoaXMudmVydGljYWxHYXA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpZHRoID0gY29udGFpbmVyLnBhZGRpbmdMZWZ0ICsgd2lkdGggKyBjb250YWluZXIucGFkZGluZ1JpZ2h0O1xyXG4gICAgICAgIGhlaWdodCA9IGNvbnRhaW5lci5wYWRkaW5nVG9wICsgaGVpZ2h0IC0gdGhpcy52ZXJ0aWNhbEdhcCArIGNvbnRhaW5lci5wYWRkaW5nQm90dG9tO1xyXG4gICAgICAgIHJldHVybiBuZXcgU2l6ZSh3aWR0aCwgaGVpZ2h0KTtcclxuICAgIH1cclxuICAgIGdldEludGVybmFsV2lkdGgoY29udGFpbmVyLCBlbGVtZW50cykge1xyXG4gICAgICAgIGxldCB3aWR0aCA9IDA7XHJcbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XHJcbiAgICAgICAgICAgIGlmICh3aWR0aCA8IGVsZW1lbnQubWVhc3VyZWRXaWR0aCkge1xyXG4gICAgICAgICAgICAgICAgd2lkdGggPSBlbGVtZW50Lm1lYXN1cmVkSGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjb250YWluZXIucGFkZGluZ0xlZnQgKyB3aWR0aCArIGNvbnRhaW5lci5wYWRkaW5nUmlnaHQ7XHJcbiAgICB9XHJcbiAgICBnZXRJbnRlcm5hbEhlaWdodChjb250YWluZXIsIGVsZW1lbnRzKSB7XHJcbiAgICAgICAgbGV0IGhlaWdodCA9IDA7XHJcbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XHJcbiAgICAgICAgICAgIGhlaWdodCArPSBlbGVtZW50Lm1lYXN1cmVkSGVpZ2h0ICsgdGhpcy52ZXJ0aWNhbEdhcDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNvbnRhaW5lci5wYWRkaW5nVG9wICsgaGVpZ2h0IC0gdGhpcy52ZXJ0aWNhbEdhcCArIGNvbnRhaW5lci5wYWRkaW5nQm90dG9tO1xyXG4gICAgfVxyXG4gICAgc2V0IGhvcml6b250YWxBbGlnbih2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9ob3Jpem9udGFsQWxpZ24gPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faG9yaXpvbnRhbEFsaWduID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5ub3RpZnkoKTtcclxuICAgIH1cclxuICAgIGdldCBob3Jpem9udGFsQWxpZ24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hvcml6b250YWxBbGlnbjtcclxuICAgIH1cclxuICAgIHNldCB2ZXJ0aWNhbEFsaWduKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3ZlcnRpY2FsQWxpZ24gPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdmVydGljYWxBbGlnbiA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMubm90aWZ5KCk7XHJcbiAgICB9XHJcbiAgICBnZXQgdmVydGljYWxBbGlnbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdmVydGljYWxBbGlnbjtcclxuICAgIH1cclxuICAgIHNldCB2ZXJ0aWNhbEdhcCh2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl92ZXJ0aWNhbEdhcCA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlIDwgMCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fdmVydGljYWxHYXAgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZlcnRpY2FsR2FwID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdmVydGljYWxHYXAgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLm5vdGlmeSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0IHZlcnRpY2FsR2FwKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl92ZXJ0aWNhbEdhcDtcclxuICAgIH1cclxuICAgIG5vdGlmeSgpIHtcclxuICAgICAgICB0aGlzLmRpc3BhdGNoKCdpbnZhbGlkYXRlJyk7XHJcbiAgICB9XHJcbn1cblxuY2xhc3MgVGV4dEVsZW1lbnQgZXh0ZW5kcyBCYXNlVGV4dCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubmFtZSA9ICdUZXh0RWxlbWVudCc7XHJcbiAgICAgICAgdGhpcy5saW5lSGVpZ2h0ID0gMS4yO1xyXG4gICAgfVxyXG4gICAgdmFsaWRhdGUoKSB7XHJcbiAgICAgICAgc3VwZXIudmFsaWRhdGUoKTtcclxuICAgICAgICB0aGlzLmludmFsaWRhdGVJbnRlcm5hbFNpemUoKTtcclxuICAgICAgICB0aGlzLnRleHRSZW5kZXJlci53aWR0aCA9IHRoaXMubWVhc3VyZWRXaWR0aDtcclxuICAgICAgICB0aGlzLnVwZGF0ZVRleHRSZW5kZXJlclBvc2l0aW9uKCk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGVJbnRlcm5hbFNpemUoKSB7XHJcbiAgICAgICAgdGhpcy5yZXNldFRleHRSZW5kZXJlclN0eWxlcygpO1xyXG4gICAgICAgIHRoaXMuaW50ZXJuYWxTaXplKHRoaXMuYWN0dWFsUmVuZGVyZXJXaWR0aCwgdGhpcy5hY3R1YWxSZW5kZXJlckhlaWdodCk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGVJbnRlcm5hbFdpZHRoKCkge1xyXG4gICAgICAgIHRoaXMucmVzZXRUZXh0UmVuZGVyZXJTdHlsZXMoKTtcclxuICAgICAgICB0aGlzLmludGVybmFsV2lkdGggPSB0aGlzLmFjdHVhbFJlbmRlcmVyV2lkdGg7XHJcbiAgICB9XHJcbiAgICB1cGRhdGVJbnRlcm5hbEhlaWdodCgpIHtcclxuICAgICAgICB0aGlzLnJlc2V0VGV4dFJlbmRlcmVyU3R5bGVzKCk7XHJcbiAgICAgICAgdGhpcy5pbnRlcm5hbEhlaWdodCA9IHRoaXMuYWN0dWFsUmVuZGVyZXJIZWlnaHQ7XHJcbiAgICB9XHJcbn1cclxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCd0ZXh0LWVsZW1lbnQnLCBUZXh0RWxlbWVudCk7XG5cbmNsYXNzIE1vZGFsIGV4dGVuZHMgRGlzcGxheUNvbnRhaW5lciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubmFtZSA9ICdNb2RhbCc7XHJcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ29sb3IgPSB0aGlzLmNvbG9ycy5uZXV0cmFsLmMwO1xyXG4gICAgICAgIHRoaXMubWluV2lkdGggPSAzMDA7XHJcbiAgICAgICAgdGhpcy5wZXJjZW50V2lkdGggPSA1MDtcclxuICAgICAgICB0aGlzLmFkZEZpbHRlcihuZXcgQm94U2hhZG93RmlsdGVyKDAsIDQsIDYsIC0xLCBuZXcgQ29sb3IoMCwgMCwgMCwgMC4xKSkpO1xyXG4gICAgICAgIHRoaXMuYWRkRmlsdGVyKG5ldyBCb3hTaGFkb3dGaWx0ZXIoMCwgMiwgNCwgLTEsIG5ldyBDb2xvcigwLCAwLCAwLCAwLjA2KSkpO1xyXG4gICAgICAgIHRoaXMuY29ybmVyU2l6ZSA9IDg7XHJcbiAgICAgICAgdGhpcy5sYXlvdXQgPSBuZXcgVmVydGljYWxMYXlvdXQoMCwgJ2ZpbGwnKTtcclxuICAgICAgICB0aGlzLmFkZEVsZW1lbnQodGhpcy5ib2R5KTtcclxuICAgICAgICB0aGlzLmFkZEVsZW1lbnQodGhpcy5ib3R0b21CYXIpO1xyXG4gICAgfVxyXG4gICAgZ2V0IGJvZHkoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9ib2R5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2JvZHkgPSBuZXcgRGlzcGxheUNvbnRhaW5lcigpO1xyXG4gICAgICAgICAgICB0aGlzLl9ib2R5LnBhZGRpbmcgPSAyNDtcclxuICAgICAgICAgICAgdGhpcy5fYm9keS5sYXlvdXQgPSBuZXcgVmVydGljYWxMYXlvdXQoMjQsICdmaWxsJyk7XHJcbiAgICAgICAgICAgIHRoaXMuX2JvZHkuYWRkRWxlbWVudHMoW3RoaXMuaGVhZGVyLCB0aGlzLnRleHRFbGVtZW50XSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9ib2R5O1xyXG4gICAgfVxyXG4gICAgZ2V0IGhlYWRlcigpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2hlYWRlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXIgPSBuZXcgRGlzcGxheUNvbnRhaW5lcigpO1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXIubGF5b3V0ID0gbmV3IEhvcml6b250YWxMYXlvdXQoKTtcclxuICAgICAgICAgICAgdGhpcy5faGVhZGVyLmFkZEVsZW1lbnRzKFt0aGlzLnRpdGxlTGFiZWwsIHRoaXMuYmFkZ2VdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hlYWRlcjtcclxuICAgIH1cclxuICAgIGdldCB0aXRsZUxhYmVsKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fdGl0bGVMYWJlbCkge1xyXG4gICAgICAgICAgICB0aGlzLl90aXRsZUxhYmVsID0gbmV3IExhYmVsRWxlbWVudCgpO1xyXG4gICAgICAgICAgICB0aGlzLl90aXRsZUxhYmVsLnBlcmNlbnRXaWR0aCA9IDEwMDtcclxuICAgICAgICAgICAgdGhpcy5fdGl0bGVMYWJlbC50ZXh0ID0gJ0xvcmVtIElwc3VtJztcclxuICAgICAgICAgICAgdGhpcy5fdGl0bGVMYWJlbC50eXBlRmFjZSA9IHRoaXMudHlwb2dyYXBoeS5wcmltYXJ5O1xyXG4gICAgICAgICAgICB0aGlzLl90aXRsZUxhYmVsLmZvbnRTaXplID0gMzI7XHJcbiAgICAgICAgICAgIHRoaXMuX3RpdGxlTGFiZWwuZm9udFdlaWdodCA9IDcwMDtcclxuICAgICAgICAgICAgdGhpcy5fdGl0bGVMYWJlbC50ZXh0Q29sb3IgPSB0aGlzLmNvbG9ycy5uZXV0cmFsLmM3MDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl90aXRsZUxhYmVsO1xyXG4gICAgfVxyXG4gICAgZ2V0IGJhZGdlKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fYmFkZ2UpIHtcclxuICAgICAgICAgICAgdGhpcy5fYmFkZ2UgPSBuZXcgQmFkZ2UoKTtcclxuICAgICAgICAgICAgdGhpcy5fYmFkZ2UudGV4dCA9ICcxLjI1NCw0Myc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9iYWRnZTtcclxuICAgIH1cclxuICAgIGdldCB0ZXh0RWxlbWVudCgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX3RleHRFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RleHRFbGVtZW50ID0gbmV3IFRleHRFbGVtZW50KCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3RleHRFbGVtZW50LnR5cGVGYWNlID0gdGhpcy50eXBvZ3JhcGh5LnNlY29uZGFyeTtcclxuICAgICAgICAgICAgdGhpcy5fdGV4dEVsZW1lbnQudGV4dENvbG9yID0gdGhpcy5jb2xvcnMubmV1dHJhbC5jNTAwO1xyXG4gICAgICAgICAgICB0aGlzLl90ZXh0RWxlbWVudC5mb250V2VpZ2h0ID0gNTAwO1xyXG4gICAgICAgICAgICB0aGlzLl90ZXh0RWxlbWVudC50ZXh0ID0gJ0xvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCBjb25zZWN0ZXR1ciBhZGlwaXNjaW5nIGVsaXQsIHNlZCBkbyBlaXVzbW9kIHRlbXBvciBpbmNpZGlkdW50IHV0IGxhYm9yZSBldCBkb2xvcmUgbWFnbmEgYWxpcXVhLiBVdCBlbmltIGFkIG1pbmltIHZlbmlhbSwgcXVpcyBub3N0cnVkIGV4ZXJjaXRhdGlvbiB1bGxhbWNvIGxhYm9yaXMgbmlzaSB1dCBhbGlxdWlwIGV4IGVhIGNvbW1vZG8gY29uc2VxdWF0LiAnO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fdGV4dEVsZW1lbnQ7XHJcbiAgICB9XHJcbiAgICBnZXQgYm90dG9tQmFyKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fYm90dG9tQmFyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2JvdHRvbUJhciA9IG5ldyBEaXNwbGF5Q29udGFpbmVyKCk7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuX2JvdHRvbUJhci5oZWlnaHQgPSA1NjtcclxuICAgICAgICAgICAgdGhpcy5fYm90dG9tQmFyLnBhZGRpbmdUb3AgPSB0aGlzLl9ib3R0b21CYXIucGFkZGluZ0JvdHRvbSA9IDg7XHJcbiAgICAgICAgICAgIHRoaXMuX2JvdHRvbUJhci5wYWRkaW5nUmlnaHQgPSA4O1xyXG4gICAgICAgICAgICB0aGlzLl9ib3R0b21CYXIuYmFja2dyb3VuZENvbG9yID0gdGhpcy5jb2xvcnMubmV1dHJhbC5jMTAwO1xyXG4gICAgICAgICAgICB0aGlzLl9ib3R0b21CYXIubGF5b3V0ID0gbmV3IEhvcml6b250YWxMYXlvdXQoOCwgJ3JpZ2h0Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuX2JvdHRvbUJhci5hZGRFbGVtZW50cyhbdGhpcy5jYW5jZWxCdXR0b24sIHRoaXMub2tCdXR0b25dKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2JvdHRvbUJhcjtcclxuICAgIH1cclxuICAgIGdldCBjYW5jZWxCdXR0b24oKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jYW5jZWxCdXR0b24pIHtcclxuICAgICAgICAgICAgdGhpcy5fY2FuY2VsQnV0dG9uID0gbmV3IEJ1dHRvbigpO1xyXG4gICAgICAgICAgICB0aGlzLl9jYW5jZWxCdXR0b24ubGFiZWwgPSAnQ2FuY2VsJztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhbmNlbEJ1dHRvbjtcclxuICAgIH1cclxuICAgIGdldCBva0J1dHRvbigpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX29rQnV0dG9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX29rQnV0dG9uID0gbmV3IEJ1dHRvbigpO1xyXG4gICAgICAgICAgICB0aGlzLl9va0J1dHRvbi5sYWJlbCA9ICdDb250aW51ZSc7XHJcbiAgICAgICAgICAgIHRoaXMuX29rQnV0dG9uLmJhY2tncm91bmRDb2xvciA9IHRoaXMuY29sb3JzLnN1Y2Nlc3MuYzUwMDtcclxuICAgICAgICAgICAgdGhpcy5fb2tCdXR0b24udGV4dENvbG9yID0gdGhpcy5jb2xvcnMuc3VjY2Vzcy5jNTA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9va0J1dHRvbjtcclxuICAgIH1cclxufVxyXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ21vZGFsLWVsZW1lbnQnLCBNb2RhbCk7XG5cbmNsYXNzIEFwcGxpY2F0aW9uRWxlbWVudCBleHRlbmRzIERpc3BsYXlDb250YWluZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSAnQXBwbGljYXRpb25FbGVtZW50JztcclxuICAgICAgICB0aGlzLnN0eWxlLm92ZXJmbG93ID0gXCJoaWRkZW5cIiAvKiBISURERU4gKi87XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5zZXRQcm9wZXJ0eSgncG9zaXRpb24nLCAnYWJzb2x1dGUnKTtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLnNldFByb3BlcnR5KCctd2Via2l0LW92ZXJmbG93LXNjcm9sbGluZycsICd0b3VjaCcpO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuc2V0UHJvcGVydHkoJy13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcicsICd0cmFuc3BhcmVudCcpO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuc2V0UHJvcGVydHkoJy1tb3otdGFwLWhpZ2hsaWdodC1jb2xvcicsICd0cmFuc3BhcmVudCcpO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuc2V0UHJvcGVydHkoJ21hcmdpbicsICcwJyk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMucmVzaXplLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMucmVzaXplKCk7XHJcbiAgICB9XHJcbiAgICByZXNpemUoKSB7XHJcbiAgICAgICAgdGhpcy5zaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gICAgfVxyXG59XHJcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYXBwbGljYXRpb24tZWxlbWVudCcsIEFwcGxpY2F0aW9uRWxlbWVudCk7XG5cbmNsYXNzIEFycmF5Q29sbGVjdGlvbiBleHRlbmRzIEV2ZW50RGlzcGF0Y2hlciB7XHJcbiAgICBjb25zdHJ1Y3Rvcihzb3VyY2UgPSBudWxsKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSAnQXJyYXlMaXN0JztcclxuICAgICAgICBpZiAoc291cmNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9zb3VyY2UgPSBbXTtcclxuICAgIH1cclxuICAgIGFkZEl0ZW0oaXRlbSkge1xyXG4gICAgICAgIHRoaXMuc291cmNlLnB1c2goaXRlbSk7XHJcbiAgICAgICAgdGhpcy5kaXNwYXRjaCgnaXRlbUFkZGVkJywgaXRlbSk7XHJcbiAgICB9XHJcbiAgICBhZGRJdGVtcyhpdGVtcykge1xyXG4gICAgICAgIHRoaXMuX3NvdXJjZSA9IHRoaXMuc291cmNlLmNvbmNhdChpdGVtcyk7XHJcbiAgICAgICAgdGhpcy5kaXNwYXRjaCgnaXRlbXNBZGRlZCcsIGl0ZW1zKTtcclxuICAgIH1cclxuICAgIGdldEl0ZW1JbmRleChpdGVtKSB7XHJcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLnNvdXJjZS5pbmRleE9mKGl0ZW0pO1xyXG4gICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE5hTjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGluZGV4O1xyXG4gICAgfVxyXG4gICAgZ2V0SXRlbUF0KGluZGV4KSB7XHJcbiAgICAgICAgaWYgKGlzTmFOKGluZGV4KSB8fCBpbmRleCA8IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbmRleCA8IHRoaXMuc291cmNlLmxlbmd0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zb3VyY2VbaW5kZXhdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIHJlbW92ZUl0ZW0oaXRlbSkge1xyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5zb3VyY2UuaW5kZXhPZihpdGVtKTtcclxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLnNvdXJjZS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoKCdpdGVtUmVtb3ZlZCcsIGl0ZW0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJlbW92ZUl0ZW1BdChpbmRleCkge1xyXG4gICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLmdldEl0ZW1BdChpbmRleCk7XHJcbiAgICAgICAgaWYgKGl0ZW0pIHtcclxuICAgICAgICAgICAgdGhpcy5zb3VyY2Uuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaCgnaXRlbVJlbW92ZWQnLCBpdGVtKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZW1vdmVBbGwoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnNvdXJjZS5sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdyZXNldCcpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnZXQgbGVuZ3RoKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNvdXJjZS5sZW5ndGg7XHJcbiAgICB9XHJcbiAgICBnZXQgc291cmNlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zb3VyY2U7XHJcbiAgICB9XHJcbn1cblxuY2xhc3MgVHlwZVNjYWxlIHtcclxuICAgIGNvbnN0cnVjdG9yKHR5cGVGYWNlLCBmb250V2VpZ2h0LCBmb250U2l6ZSwgbGV0dGVyU3BhY2luZykge1xyXG4gICAgICAgIHRoaXMuX2ZvbnRXZWlnaHQgPSA0MDA7XHJcbiAgICAgICAgdGhpcy5fZm9udFNpemUgPSAxNjtcclxuICAgICAgICB0aGlzLl9sZXR0ZXJTcGFjaW5nID0gMDtcclxuICAgICAgICB0aGlzLnR5cGVGYWNlID0gdHlwZUZhY2U7XHJcbiAgICAgICAgdGhpcy5mb250V2VpZ2h0ID0gZm9udFdlaWdodDtcclxuICAgICAgICB0aGlzLmZvbnRTaXplID0gZm9udFNpemU7XHJcbiAgICAgICAgdGhpcy5sZXR0ZXJTcGFjaW5nID0gbGV0dGVyU3BhY2luZztcclxuICAgIH1cclxuICAgIHNldCB0eXBlRmFjZSh2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl90eXBlRmFjZSA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl90eXBlRmFjZSA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgZ2V0IHR5cGVGYWNlKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fdHlwZUZhY2UpIHtcclxuICAgICAgICAgICAgdGhpcy5fdHlwZUZhY2UgPSBuZXcgVHlwZUZhY2UoJ0FyaWFsJywgMC43MTUsIDAuMTEsIDAuMDE1KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3R5cGVGYWNlO1xyXG4gICAgfVxyXG4gICAgc2V0IGZvbnRXZWlnaHQodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fZm9udFdlaWdodCA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9mb250V2VpZ2h0ID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBnZXQgZm9udFdlaWdodCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZm9udFdlaWdodDtcclxuICAgIH1cclxuICAgIHNldCBmb250U2l6ZSh2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9mb250U2l6ZSA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4odmFsdWUpKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9mb250U2l6ZSAhPT0gMTYpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2ZvbnRTaXplID0gMTY7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9mb250U2l6ZSA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgZ2V0IGZvbnRTaXplKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9mb250U2l6ZTtcclxuICAgIH1cclxuICAgIHNldCBsZXR0ZXJTcGFjaW5nKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2xldHRlclNwYWNpbmcgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzTmFOKHZhbHVlKSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fbGV0dGVyU3BhY2luZyAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbGV0dGVyU3BhY2luZyA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9sZXR0ZXJTcGFjaW5nID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBnZXQgbGV0dGVyU3BhY2luZygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbGV0dGVyU3BhY2luZztcclxuICAgIH1cclxuICAgIHRvU3RyaW5nKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnR5cGVGYWNlLmZvbnRGYW1pbHkgKyAnICcgKyB0aGlzLmZvbnRTaXplICsgJ3B4ICcgKyB0aGlzLmZvbnRXZWlnaHQgKyAnICcgKyB0aGlzLmxldHRlclNwYWNpbmcgKyAncHgnO1xyXG4gICAgfVxyXG59XG5cbmNsYXNzIEJsdXJGaWx0ZXIgZXh0ZW5kcyBFdmVudERpc3BhdGNoZXIge1xyXG4gICAgY29uc3RydWN0b3IoYmx1cikge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5fYmx1ciA9IDA7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gJ0JsdXJGaWx0ZXInO1xyXG4gICAgICAgIGlmICghaXNOYU4oYmx1cikgJiYgYmx1ciA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5fYmx1ciA9IGJsdXI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2V0IGJsdXIodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fYmx1ciA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlIDwgMCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fYmx1ciAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYmx1ciA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fYmx1ciA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMubm90aWZ5KCk7XHJcbiAgICB9XHJcbiAgICBnZXQgYmx1cigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYmx1cjtcclxuICAgIH1cclxuICAgIHRvU3RyaW5nKCkge1xyXG4gICAgICAgIHJldHVybiAnYmx1cignICsgdGhpcy5ibHVyICsgJ3B4KSc7XHJcbiAgICB9XHJcbiAgICBub3RpZnkoKSB7XHJcbiAgICAgICAgdGhpcy5kaXNwYXRjaCgnaW52YWxpZGF0ZScpO1xyXG4gICAgfVxyXG59XG5cbmNsYXNzIFNoYWRvd0ZpbHRlciBleHRlbmRzIEV2ZW50RGlzcGF0Y2hlciB7XHJcbiAgICBjb25zdHJ1Y3Rvcih4ID0gMCwgeSA9IDQsIGJsdXIgPSA4LCBjb2xvciA9IG5ldyBDb2xvcigwLCAwLCAwLCAwLjYpKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLl94ID0gMDtcclxuICAgICAgICB0aGlzLl95ID0gNDtcclxuICAgICAgICB0aGlzLl9ibHVyID0gODtcclxuICAgICAgICB0aGlzLm5hbWUgPSAnU2hhZG93RmlsdGVyJztcclxuICAgICAgICB0aGlzLmNvbG9yQ2hhbmdlZCA9IHRoaXMuY29sb3JDaGFuZ2VkLmJpbmQodGhpcyk7XHJcbiAgICAgICAgaWYgKCFpc05hTih4KSkge1xyXG4gICAgICAgICAgICB0aGlzLl94ID0geDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFpc05hTih5KSkge1xyXG4gICAgICAgICAgICB0aGlzLl95ID0geTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFpc05hTihibHVyKSAmJiBibHVyID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLl9ibHVyID0gYmx1cjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fY29sb3IgPSBjb2xvcjtcclxuICAgICAgICB0aGlzLl9jb2xvci5hZGRFdmVudExpc3RlbmVyKCdpbnZhbGlkYXRlJywgdGhpcy5jb2xvckNoYW5nZWQpO1xyXG4gICAgfVxyXG4gICAgc2V0IHgodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5feCA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4odmFsdWUpKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl94ICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl94ID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5feCA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMubm90aWZ5KCk7XHJcbiAgICB9XHJcbiAgICBnZXQgeCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5feDtcclxuICAgIH1cclxuICAgIHNldCB5KHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3kgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzTmFOKHZhbHVlKSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5feSAhPT0gNCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5feSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3kgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLm5vdGlmeSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0IHkoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3k7XHJcbiAgICB9XHJcbiAgICBzZXQgYmx1cih2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9ibHVyID09PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc05hTih2YWx1ZSkpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2JsdXIgIT09IDgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2JsdXIgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9ibHVyID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5ub3RpZnkoKTtcclxuICAgIH1cclxuICAgIGdldCBibHVyKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9ibHVyO1xyXG4gICAgfVxyXG4gICAgc2V0IGNvbG9yKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2NvbG9yID09PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2NvbG9yLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ludmFsaWRhdGUnLCB0aGlzLmNvbG9yQ2hhbmdlZCk7XHJcbiAgICAgICAgdGhpcy5fY29sb3IgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLl9jb2xvci5hZGRFdmVudExpc3RlbmVyKCdpbnZhbGlkYXRlJywgdGhpcy5jb2xvckNoYW5nZWQpO1xyXG4gICAgICAgIHRoaXMubm90aWZ5KCk7XHJcbiAgICB9XHJcbiAgICBnZXQgY29sb3IoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbG9yO1xyXG4gICAgfVxyXG4gICAgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgcmV0dXJuICdkcm9wLXNoYWRvdygnICsgdGhpcy54ICsgJ3B4ICcgKyB0aGlzLnkgKyAncHggJyArIHRoaXMuYmx1ciArICdweCAnICsgdGhpcy5jb2xvci50b1N0cmluZygpICsgJyknO1xyXG4gICAgfVxyXG4gICAgY29sb3JDaGFuZ2VkKCkge1xyXG4gICAgICAgIHRoaXMubm90aWZ5KCk7XHJcbiAgICB9XHJcbiAgICBub3RpZnkoKSB7XHJcbiAgICAgICAgdGhpcy5kaXNwYXRjaCgnaW52YWxpZGF0ZScpO1xyXG4gICAgfVxyXG59XG5cbmNsYXNzIFN2Z0VsZW1lbnQgZXh0ZW5kcyBTaXplRWxlbWVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuX3ZpZXdCb3ggPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2VuYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubmFtZSA9ICdTdmdFbGVtZW50JztcclxuICAgICAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmFwcGVuZENoaWxkKHRoaXMuc3ZnKTtcclxuICAgIH1cclxuICAgIHZhbGlkYXRlKCkge1xyXG4gICAgICAgIHN1cGVyLnZhbGlkYXRlKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTdmdBdHRyaWJ1dGVzKCk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGVTdmdBdHRyaWJ1dGVzKCkge1xyXG4gICAgICAgIHRoaXMuc3ZnLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCB0aGlzLm1lYXN1cmVkV2lkdGgudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgdGhpcy5zdmcuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCB0aGlzLm1lYXN1cmVkSGVpZ2h0LnRvU3RyaW5nKCkpO1xyXG4gICAgfVxyXG4gICAgYWRkRmlsdGVyKHZhbHVlKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5uYW1lLCB2YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBnZXQgc3ZnKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fc3ZnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3N2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCAnc3ZnJyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3N2Zy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcbiAgICAgICAgICAgIHRoaXMuX3N2Zy5zdHlsZS5vdmVyZmxvdyA9ICd2aXNpYmxlJztcclxuICAgICAgICAgICAgdGhpcy5fc3ZnLmFwcGVuZENoaWxkKHRoaXMuZGVmcyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3N2Zy5hcHBlbmRDaGlsZCh0aGlzLmdyb3VwKTtcclxuICAgICAgICAgICAgdGhpcy5fc3ZnLnNldEF0dHJpYnV0ZSgncHJlc2VydmVBc3BlY3RSYXRpbycsICdub25lJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9zdmc7XHJcbiAgICB9XHJcbiAgICBnZXQgZGVmcygpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2RlZnMpIHtcclxuICAgICAgICAgICAgdGhpcy5fZGVmcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCAnZGVmcycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fZGVmcztcclxuICAgIH1cclxuICAgIGdldCBncm91cCgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2dyb3VwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2dyb3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsICdnJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9ncm91cDtcclxuICAgIH1cclxuICAgIHNldCB2aWV3Qm94KHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3ZpZXdCb3ggPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdmlld0JveCA9IHZhbHVlO1xyXG4gICAgICAgIGlmICh0aGlzLl92aWV3Qm94KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGJveCA9IHRoaXMuX3ZpZXdCb3g7XHJcbiAgICAgICAgICAgIHRoaXMuc3ZnLnNldEF0dHJpYnV0ZSgndmlld0JveCcsIGJveC54ICsgJyAnICsgYm94LnkgKyAnICcgKyBib3gud2lkdGggKyAnICcgKyBib3guaGVpZ2h0KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnN2Zy5yZW1vdmVBdHRyaWJ1dGUoJ3ZpZXdCb3gnKTtcclxuICAgIH1cclxuICAgIGdldCB2aWV3Qm94KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl92aWV3Qm94O1xyXG4gICAgfVxyXG4gICAgc2V0IGVuYWJsZWQodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fZW5hYmxlZCA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9lbmFibGVkID0gdmFsdWU7XHJcbiAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3R5bGUucG9pbnRlckV2ZW50cyA9ICcnO1xyXG4gICAgICAgICAgICB0aGlzLnN0eWxlLnVzZXJTZWxlY3QgPSAnYXV0byc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIHRoaXMuc3R5bGUudXNlclNlbGVjdCA9ICdub25lJztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnZXQgZW5hYmxlZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZW5hYmxlZDtcclxuICAgIH1cclxufVxyXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ3N2Zy1lbGVtZW50JywgU3ZnRWxlbWVudCk7XG5cbmNsYXNzIFBhdGhFbGVtZW50IGV4dGVuZHMgU3ZnRWxlbWVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMuX3BhdGhEYXRhID0gJyc7XHJcbiAgICAgICAgdGhpcy5zdHJva2VMaW5lYXJHcmFkaWVudElkID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygpO1xyXG4gICAgICAgIHRoaXMuZmlsbExpbmVhckdyYWRpZW50SWQgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgdGhpcy5fc3Ryb2tlQ29sb3IgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2ZpbGxDb2xvciA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5zdHJva2VDb2xvclN0b3BNYXBwaW5nID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHRoaXMuZmlsbENvbG9yU3RvcE1hcHBpbmcgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgdGhpcy5fc3Ryb2tlV2lkdGggPSAwO1xyXG4gICAgICAgIHRoaXMubmFtZSA9ICdQYXRoRWxlbWVudCc7XHJcbiAgICAgICAgdGhpcy5zdHJva2VDb2xvckNoYW5nZWQgPSB0aGlzLnN0cm9rZUNvbG9yQ2hhbmdlZC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuZmlsbENvbG9yQ2hhbmdlZCA9IHRoaXMuZmlsbENvbG9yQ2hhbmdlZC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuc3Ryb2tlTGluZWFyR3JhZGllbnRDb2xvckFkZGVkID0gdGhpcy5zdHJva2VMaW5lYXJHcmFkaWVudENvbG9yQWRkZWQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLnN0cm9rZUxpbmVhckdyYWRpZW50Q29sb3JzQWRkZWQgPSB0aGlzLnN0cm9rZUxpbmVhckdyYWRpZW50Q29sb3JzQWRkZWQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLnN0cm9rZUxpbmVhckdyYWRpZW50Q29sb3JDaGFuZ2VkID0gdGhpcy5zdHJva2VMaW5lYXJHcmFkaWVudENvbG9yQ2hhbmdlZC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuc3Ryb2tlTGluZWFyR3JhZGllbnREZWdyZWVzQ2hhbmdlZCA9IHRoaXMuc3Ryb2tlTGluZWFyR3JhZGllbnREZWdyZWVzQ2hhbmdlZC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuZmlsbExpbmVhckdyYWRpZW50Q29sb3JBZGRlZCA9IHRoaXMuZmlsbExpbmVhckdyYWRpZW50Q29sb3JBZGRlZC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuZmlsbExpbmVhckdyYWRpZW50Q29sb3JzQWRkZWQgPSB0aGlzLmZpbGxMaW5lYXJHcmFkaWVudENvbG9yc0FkZGVkLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5maWxsTGluZWFyR3JhZGllbnRDb2xvckNoYW5nZWQgPSB0aGlzLmZpbGxMaW5lYXJHcmFkaWVudENvbG9yQ2hhbmdlZC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuZmlsbExpbmVhckdyYWRpZW50RGVncmVlc0NoYW5nZWQgPSB0aGlzLmZpbGxMaW5lYXJHcmFkaWVudERlZ3JlZXNDaGFuZ2VkLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5hcHBlbmRDaGlsZCh0aGlzLnBhdGgpO1xyXG4gICAgfVxyXG4gICAgdmFsaWRhdGUoKSB7XHJcbiAgICAgICAgc3VwZXIudmFsaWRhdGUoKTtcclxuICAgICAgICBpZiAodGhpcy5maWxsQ29sb3IgaW5zdGFuY2VvZiBMaW5lYXJHcmFkaWVudCkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUxpbmVhckdyYWRpZW50Um90YXRpb24odGhpcy5maWxsTGluZWFyR3JhZGllbnQsIHRoaXMuZmlsbENvbG9yLmRlZ3JlZXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5zdHJva2VDb2xvciBpbnN0YW5jZW9mIExpbmVhckdyYWRpZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlTGluZWFyR3JhZGllbnRSb3RhdGlvbih0aGlzLnN0cm9rZUxpbmVhckdyYWRpZW50LCB0aGlzLnN0cm9rZUNvbG9yLmRlZ3JlZXMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHNldCBwYXRoRGF0YSh2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9wYXRoRGF0YSA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9wYXRoRGF0YSA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMucGF0aC5zZXRBdHRyaWJ1dGUoXCJkXCIgLyogRCAqLywgdmFsdWUpO1xyXG4gICAgfVxyXG4gICAgZ2V0IHBhdGhEYXRhKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYXRoRGF0YTtcclxuICAgIH1cclxuICAgIGdldCBwYXRoKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fcGF0aCkge1xyXG4gICAgICAgICAgICB0aGlzLl9wYXRoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiAvKiBTVkdfTlMgKi8sIFwicGF0aFwiIC8qIFBBVEggKi8pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fcGF0aDtcclxuICAgIH1cclxuICAgIGdldCBzdHJva2VMaW5lYXJHcmFkaWVudCgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX3N0cm9rZUxpbmVhckdyYWRpZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3N0cm9rZUxpbmVhckdyYWRpZW50ID0gdGhpcy5nZXRMaW5lYXJHcmFkaWVudCh0aGlzLnN0cm9rZUxpbmVhckdyYWRpZW50SWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fc3Ryb2tlTGluZWFyR3JhZGllbnQ7XHJcbiAgICB9XHJcbiAgICBnZXQgZmlsbExpbmVhckdyYWRpZW50KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fZmlsbExpbmVhckdyYWRpZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpbGxMaW5lYXJHcmFkaWVudCA9IHRoaXMuZ2V0TGluZWFyR3JhZGllbnQodGhpcy5maWxsTGluZWFyR3JhZGllbnRJZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9maWxsTGluZWFyR3JhZGllbnQ7XHJcbiAgICB9XHJcbiAgICBnZXRMaW5lYXJHcmFkaWVudChpZCkge1xyXG4gICAgICAgIGNvbnN0IGxpbmVhckdyYWRpZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiAvKiBTVkdfTlMgKi8sIFwibGluZWFyR3JhZGllbnRcIiAvKiBMSU5FQVJfR1JBRElFTlQgKi8pO1xyXG4gICAgICAgIGxpbmVhckdyYWRpZW50LnNldEF0dHJpYnV0ZShcImlkXCIgLyogSUQgKi8sIGlkKTtcclxuICAgICAgICBsaW5lYXJHcmFkaWVudC5zZXRBdHRyaWJ1dGUoXCJncmFkaWVudFVuaXRzXCIgLyogR1JBRElFTlRfVU5JVFMgKi8sIFwidXNlclNwYWNlT25Vc2VcIiAvKiBVU0VSX1NQQUNFX09OX1VTRSAqLyk7XHJcbiAgICAgICAgcmV0dXJuIGxpbmVhckdyYWRpZW50O1xyXG4gICAgfVxyXG4gICAgcmVzZXRMaW5lYXJHcmFkaWVudChsaW5lYXJHcmFkaWVudCkge1xyXG4gICAgICAgIHdoaWxlIChsaW5lYXJHcmFkaWVudC5maXJzdENoaWxkKSB7XHJcbiAgICAgICAgICAgIGxpbmVhckdyYWRpZW50LnJlbW92ZUNoaWxkKGxpbmVhckdyYWRpZW50LmZpcnN0Q2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsaW5lYXJHcmFkaWVudC5yZW1vdmVBdHRyaWJ1dGUoXCJncmFkaWVudFRyYW5zZm9ybVwiIC8qIEdSQURJRU5UX1RSQU5TRk9STSAqLyk7XHJcbiAgICB9XHJcbiAgICBzdHJva2VDb2xvckNoYW5nZWQoZSkge1xyXG4gICAgICAgIHRoaXMucGF0aC5zZXRBdHRyaWJ1dGUoXCJzdHJva2VcIiAvKiBTVFJPS0UgKi8sIGUuZGV0YWlsLnRvU3RyaW5nKCkpO1xyXG4gICAgfVxyXG4gICAgZmlsbENvbG9yQ2hhbmdlZChlKSB7XHJcbiAgICAgICAgdGhpcy5wYXRoLnNldEF0dHJpYnV0ZShcImZpbGxcIiAvKiBGSUxMICovLCBlLmRldGFpbC50b1N0cmluZygpKTtcclxuICAgIH1cclxuICAgIHN0cm9rZUxpbmVhckdyYWRpZW50Q29sb3JDaGFuZ2VkKGUpIHtcclxuICAgICAgICBjb25zdCBjb2xvciA9IGUuZGV0YWlsO1xyXG4gICAgICAgIGNvbnN0IHN0b3BzID0gdGhpcy5zdHJva2VDb2xvclN0b3BNYXBwaW5nLmdldChjb2xvcik7XHJcbiAgICAgICAgaWYgKHN0b3BzKSB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc3RvcCBvZiBzdG9wcykge1xyXG4gICAgICAgICAgICAgICAgc3RvcC5zZXRBdHRyaWJ1dGUoXCJzdG9wLWNvbG9yXCIgLyogU1RPUF9DT0xPUiAqLywgY29sb3IudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmaWxsTGluZWFyR3JhZGllbnRDb2xvckNoYW5nZWQoZSkge1xyXG4gICAgICAgIGNvbnN0IGNvbG9yID0gZS5kZXRhaWw7XHJcbiAgICAgICAgY29uc3Qgc3RvcHMgPSB0aGlzLmZpbGxDb2xvclN0b3BNYXBwaW5nLmdldChjb2xvcik7XHJcbiAgICAgICAgaWYgKHN0b3BzKSB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc3RvcCBvZiBzdG9wcykge1xyXG4gICAgICAgICAgICAgICAgc3RvcC5zZXRBdHRyaWJ1dGUoXCJzdG9wLWNvbG9yXCIgLyogU1RPUF9DT0xPUiAqLywgY29sb3IudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmaWxsTGluZWFyR3JhZGllbnRDb2xvckFkZGVkKGUpIHtcclxuICAgICAgICB0aGlzLmFkZFN0b3BDb2xvclRvRmlsbExpbmVhckdyYWRpZW50KGUuZGV0YWlsKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZUxpbmVhckdyYWRpZW50U3RvcE9mZnNldHModGhpcy5maWxsTGluZWFyR3JhZGllbnQpO1xyXG4gICAgfVxyXG4gICAgc3Ryb2tlTGluZWFyR3JhZGllbnRDb2xvckFkZGVkKGUpIHtcclxuICAgICAgICB0aGlzLmFkZFN0b3BDb2xvclRvU3Ryb2tlTGluZWFyR3JhZGllbnQoZS5kZXRhaWwpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlTGluZWFyR3JhZGllbnRTdG9wT2Zmc2V0cyh0aGlzLnN0cm9rZUxpbmVhckdyYWRpZW50KTtcclxuICAgIH1cclxuICAgIGZpbGxMaW5lYXJHcmFkaWVudENvbG9yc0FkZGVkKGUpIHtcclxuICAgICAgICB0aGlzLmFkZFN0b3BDb2xvcnNUb0ZpbGxMaW5lYXJHcmFkaWVudChlLmRldGFpbCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVMaW5lYXJHcmFkaWVudFN0b3BPZmZzZXRzKHRoaXMuZmlsbExpbmVhckdyYWRpZW50KTtcclxuICAgIH1cclxuICAgIHN0cm9rZUxpbmVhckdyYWRpZW50Q29sb3JzQWRkZWQoZSkge1xyXG4gICAgICAgIHRoaXMuYWRkU3RvcENvbG9yc1RvU3Ryb2tlTGluZWFyR3JhZGllbnQoZS5kZXRhaWwpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlTGluZWFyR3JhZGllbnRTdG9wT2Zmc2V0cyh0aGlzLnN0cm9rZUxpbmVhckdyYWRpZW50KTtcclxuICAgIH1cclxuICAgIGZpbGxMaW5lYXJHcmFkaWVudERlZ3JlZXNDaGFuZ2VkKGUpIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZUxpbmVhckdyYWRpZW50Um90YXRpb24odGhpcy5maWxsTGluZWFyR3JhZGllbnQsIGUuZGV0YWlsKTtcclxuICAgIH1cclxuICAgIHN0cm9rZUxpbmVhckdyYWRpZW50RGVncmVlc0NoYW5nZWQoZSkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlTGluZWFyR3JhZGllbnRSb3RhdGlvbih0aGlzLnN0cm9rZUxpbmVhckdyYWRpZW50LCBlLmRldGFpbCk7XHJcbiAgICB9XHJcbiAgICBzZXQgc3Ryb2tlQ29sb3IodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fc3Ryb2tlQ29sb3IgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX3N0cm9rZUNvbG9yIGluc3RhbmNlb2YgQ29sb3IpIHtcclxuICAgICAgICAgICAgdGhpcy5fc3Ryb2tlQ29sb3IucmVtb3ZlRXZlbnRMaXN0ZW5lcihDb2xvci5DSEFOR0VELCB0aGlzLnN0cm9rZUNvbG9yQ2hhbmdlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX3N0cm9rZUNvbG9yIGluc3RhbmNlb2YgTGluZWFyR3JhZGllbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5kZWZzLnJlbW92ZUNoaWxkKHRoaXMuc3Ryb2tlTGluZWFyR3JhZGllbnQpO1xyXG4gICAgICAgICAgICB0aGlzLnJlc2V0TGluZWFyR3JhZGllbnQodGhpcy5zdHJva2VMaW5lYXJHcmFkaWVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuc3Ryb2tlQ29sb3JTdG9wTWFwcGluZy5jbGVhcigpO1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZVN0cm9rZUxpbmVhckdyYWRpZW50TGlzdGVuZXJzKHRoaXMuX3N0cm9rZUNvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fc3Ryb2tlQ29sb3IgPSB2YWx1ZTtcclxuICAgICAgICBpZiAodGhpcy5fc3Ryb2tlQ29sb3IgaW5zdGFuY2VvZiBDb2xvcikge1xyXG4gICAgICAgICAgICB0aGlzLl9zdHJva2VDb2xvci5hZGRFdmVudExpc3RlbmVyKENvbG9yLkNIQU5HRUQsIHRoaXMuc3Ryb2tlQ29sb3JDaGFuZ2VkKTtcclxuICAgICAgICAgICAgdGhpcy5wYXRoLnNldEF0dHJpYnV0ZShcInN0cm9rZVwiIC8qIFNUUk9LRSAqLywgdGhpcy5fc3Ryb2tlQ29sb3IudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX3N0cm9rZUNvbG9yIGluc3RhbmNlb2YgTGluZWFyR3JhZGllbnQpIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVMaW5lYXJHcmFkaWVudFJvdGF0aW9uKHRoaXMuc3Ryb2tlTGluZWFyR3JhZGllbnQsIHRoaXMuX3N0cm9rZUNvbG9yLmRlZ3JlZXMpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fc3Ryb2tlQ29sb3IuY29sb3JzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRTdG9wQ29sb3JzVG9TdHJva2VMaW5lYXJHcmFkaWVudCh0aGlzLl9zdHJva2VDb2xvci5jb2xvcnMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVMaW5lYXJHcmFkaWVudFN0b3BPZmZzZXRzKHRoaXMuc3Ryb2tlTGluZWFyR3JhZGllbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZGVmcy5hcHBlbmRDaGlsZCh0aGlzLnN0cm9rZUxpbmVhckdyYWRpZW50KTtcclxuICAgICAgICAgICAgdGhpcy5hZGRTdHJva2VMaW5lYXJHcmFkaWVudExpc3RlbmVycyh0aGlzLl9zdHJva2VDb2xvcik7XHJcbiAgICAgICAgICAgIHRoaXMucGF0aC5zZXRBdHRyaWJ1dGUoXCJzdHJva2VcIiAvKiBTVFJPS0UgKi8sIFwidXJsXCIgLyogVVJMICovICsgXCIoJyNcIiArIHRoaXMuc3Ryb2tlTGluZWFyR3JhZGllbnRJZCArIFwiJylcIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wYXRoLnJlbW92ZUF0dHJpYnV0ZShcInN0cm9rZVwiIC8qIFNUUk9LRSAqLyk7XHJcbiAgICB9XHJcbiAgICBnZXQgc3Ryb2tlQ29sb3IoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0cm9rZUNvbG9yO1xyXG4gICAgfVxyXG4gICAgc2V0IGZpbGxDb2xvcih2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9maWxsQ29sb3IgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2ZpbGxDb2xvciBpbnN0YW5jZW9mIENvbG9yKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpbGxDb2xvci5yZW1vdmVFdmVudExpc3RlbmVyKENvbG9yLkNIQU5HRUQsIHRoaXMuZmlsbENvbG9yQ2hhbmdlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX2ZpbGxDb2xvciBpbnN0YW5jZW9mIExpbmVhckdyYWRpZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVmcy5yZW1vdmVDaGlsZCh0aGlzLmZpbGxMaW5lYXJHcmFkaWVudCk7XHJcbiAgICAgICAgICAgIHRoaXMucmVzZXRMaW5lYXJHcmFkaWVudCh0aGlzLmZpbGxMaW5lYXJHcmFkaWVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuZmlsbENvbG9yU3RvcE1hcHBpbmcuY2xlYXIoKTtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVGaWxsTGluZWFyR3JhZGllbnRMaXN0ZW5lcnModGhpcy5fZmlsbENvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZmlsbENvbG9yID0gdmFsdWU7XHJcbiAgICAgICAgaWYgKHRoaXMuX2ZpbGxDb2xvciBpbnN0YW5jZW9mIENvbG9yKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpbGxDb2xvci5hZGRFdmVudExpc3RlbmVyKENvbG9yLkNIQU5HRUQsIHRoaXMuZmlsbENvbG9yQ2hhbmdlZCk7XHJcbiAgICAgICAgICAgIHRoaXMucGF0aC5zZXRBdHRyaWJ1dGUoXCJmaWxsXCIgLyogRklMTCAqLywgdGhpcy5fZmlsbENvbG9yLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9maWxsQ29sb3IgaW5zdGFuY2VvZiBMaW5lYXJHcmFkaWVudCkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUxpbmVhckdyYWRpZW50Um90YXRpb24odGhpcy5maWxsTGluZWFyR3JhZGllbnQsIHRoaXMuX2ZpbGxDb2xvci5kZWdyZWVzKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2ZpbGxDb2xvci5jb2xvcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFN0b3BDb2xvcnNUb0ZpbGxMaW5lYXJHcmFkaWVudCh0aGlzLl9maWxsQ29sb3IuY29sb3JzKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlTGluZWFyR3JhZGllbnRTdG9wT2Zmc2V0cyh0aGlzLmZpbGxMaW5lYXJHcmFkaWVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5kZWZzLmFwcGVuZENoaWxkKHRoaXMuZmlsbExpbmVhckdyYWRpZW50KTtcclxuICAgICAgICAgICAgdGhpcy5hZGRGaWxsTGluZWFyR3JhZGllbnRMaXN0ZW5lcnModGhpcy5fZmlsbENvbG9yKTtcclxuICAgICAgICAgICAgdGhpcy5wYXRoLnNldEF0dHJpYnV0ZShcImZpbGxcIiAvKiBGSUxMICovLCBcInVybFwiIC8qIFVSTCAqLyArIFwiKCcjXCIgKyB0aGlzLmZpbGxMaW5lYXJHcmFkaWVudElkICsgXCInKVwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBhdGgucmVtb3ZlQXR0cmlidXRlKFwiZmlsbFwiIC8qIEZJTEwgKi8pO1xyXG4gICAgfVxyXG4gICAgZ2V0IGZpbGxDb2xvcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZmlsbENvbG9yO1xyXG4gICAgfVxyXG4gICAgcmVtb3ZlU3Ryb2tlTGluZWFyR3JhZGllbnRMaXN0ZW5lcnMobGluZWFyR3JhZGllbnQpIHtcclxuICAgICAgICBsaW5lYXJHcmFkaWVudC5yZW1vdmVFdmVudExpc3RlbmVyKExpbmVhckdyYWRpZW50LkNPTE9SX0FEREVELCB0aGlzLnN0cm9rZUxpbmVhckdyYWRpZW50Q29sb3JBZGRlZCk7XHJcbiAgICAgICAgbGluZWFyR3JhZGllbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihMaW5lYXJHcmFkaWVudC5DT0xPUlNfQURERUQsIHRoaXMuc3Ryb2tlTGluZWFyR3JhZGllbnRDb2xvcnNBZGRlZCk7XHJcbiAgICAgICAgbGluZWFyR3JhZGllbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihMaW5lYXJHcmFkaWVudC5DT0xPUl9DSEFOR0VELCB0aGlzLnN0cm9rZUxpbmVhckdyYWRpZW50Q29sb3JDaGFuZ2VkKTtcclxuICAgICAgICBsaW5lYXJHcmFkaWVudC5yZW1vdmVFdmVudExpc3RlbmVyKExpbmVhckdyYWRpZW50LkRFR1JFRVNfQ0hBTkdFRCwgdGhpcy5zdHJva2VMaW5lYXJHcmFkaWVudERlZ3JlZXNDaGFuZ2VkKTtcclxuICAgIH1cclxuICAgIGFkZFN0cm9rZUxpbmVhckdyYWRpZW50TGlzdGVuZXJzKGxpbmVhckdyYWRpZW50KSB7XHJcbiAgICAgICAgbGluZWFyR3JhZGllbnQuYWRkRXZlbnRMaXN0ZW5lcihMaW5lYXJHcmFkaWVudC5DT0xPUl9BRERFRCwgdGhpcy5zdHJva2VMaW5lYXJHcmFkaWVudENvbG9yQWRkZWQpO1xyXG4gICAgICAgIGxpbmVhckdyYWRpZW50LmFkZEV2ZW50TGlzdGVuZXIoTGluZWFyR3JhZGllbnQuQ09MT1JTX0FEREVELCB0aGlzLnN0cm9rZUxpbmVhckdyYWRpZW50Q29sb3JzQWRkZWQpO1xyXG4gICAgICAgIGxpbmVhckdyYWRpZW50LmFkZEV2ZW50TGlzdGVuZXIoTGluZWFyR3JhZGllbnQuQ09MT1JfQ0hBTkdFRCwgdGhpcy5zdHJva2VMaW5lYXJHcmFkaWVudENvbG9yQ2hhbmdlZCk7XHJcbiAgICAgICAgbGluZWFyR3JhZGllbnQuYWRkRXZlbnRMaXN0ZW5lcihMaW5lYXJHcmFkaWVudC5ERUdSRUVTX0NIQU5HRUQsIHRoaXMuc3Ryb2tlTGluZWFyR3JhZGllbnREZWdyZWVzQ2hhbmdlZCk7XHJcbiAgICB9XHJcbiAgICByZW1vdmVGaWxsTGluZWFyR3JhZGllbnRMaXN0ZW5lcnMobGluZWFyR3JhZGllbnQpIHtcclxuICAgICAgICBsaW5lYXJHcmFkaWVudC5yZW1vdmVFdmVudExpc3RlbmVyKExpbmVhckdyYWRpZW50LkNPTE9SX0FEREVELCB0aGlzLmZpbGxMaW5lYXJHcmFkaWVudENvbG9yQWRkZWQpO1xyXG4gICAgICAgIGxpbmVhckdyYWRpZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoTGluZWFyR3JhZGllbnQuQ09MT1JTX0FEREVELCB0aGlzLmZpbGxMaW5lYXJHcmFkaWVudENvbG9yc0FkZGVkKTtcclxuICAgICAgICBsaW5lYXJHcmFkaWVudC5yZW1vdmVFdmVudExpc3RlbmVyKExpbmVhckdyYWRpZW50LkNPTE9SX0NIQU5HRUQsIHRoaXMuZmlsbExpbmVhckdyYWRpZW50Q29sb3JDaGFuZ2VkKTtcclxuICAgICAgICBsaW5lYXJHcmFkaWVudC5yZW1vdmVFdmVudExpc3RlbmVyKExpbmVhckdyYWRpZW50LkRFR1JFRVNfQ0hBTkdFRCwgdGhpcy5maWxsTGluZWFyR3JhZGllbnREZWdyZWVzQ2hhbmdlZCk7XHJcbiAgICB9XHJcbiAgICBhZGRGaWxsTGluZWFyR3JhZGllbnRMaXN0ZW5lcnMobGluZWFyR3JhZGllbnQpIHtcclxuICAgICAgICBsaW5lYXJHcmFkaWVudC5hZGRFdmVudExpc3RlbmVyKExpbmVhckdyYWRpZW50LkNPTE9SX0FEREVELCB0aGlzLmZpbGxMaW5lYXJHcmFkaWVudENvbG9yQWRkZWQpO1xyXG4gICAgICAgIGxpbmVhckdyYWRpZW50LmFkZEV2ZW50TGlzdGVuZXIoTGluZWFyR3JhZGllbnQuQ09MT1JTX0FEREVELCB0aGlzLmZpbGxMaW5lYXJHcmFkaWVudENvbG9yc0FkZGVkKTtcclxuICAgICAgICBsaW5lYXJHcmFkaWVudC5hZGRFdmVudExpc3RlbmVyKExpbmVhckdyYWRpZW50LkNPTE9SX0NIQU5HRUQsIHRoaXMuZmlsbExpbmVhckdyYWRpZW50Q29sb3JDaGFuZ2VkKTtcclxuICAgICAgICBsaW5lYXJHcmFkaWVudC5hZGRFdmVudExpc3RlbmVyKExpbmVhckdyYWRpZW50LkRFR1JFRVNfQ0hBTkdFRCwgdGhpcy5maWxsTGluZWFyR3JhZGllbnREZWdyZWVzQ2hhbmdlZCk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGVMaW5lYXJHcmFkaWVudFJvdGF0aW9uKGxpbmVhckdyYWRpZW50RWxlbWVudCwgZGVncmVlcykge1xyXG4gICAgICAgIGxldCB0cmFuc2Zvcm0gPSBcInJvdGF0ZVwiIC8qIFJPVEFURSAqLyArICcoJyArIGRlZ3JlZXMgKyAnICc7XHJcbiAgICAgICAgaWYgKHRoaXMudmlld0JveCkge1xyXG4gICAgICAgICAgICB0cmFuc2Zvcm0gKz0gdGhpcy52aWV3Qm94LndpZHRoICogMC41ICsgJyAnICsgdGhpcy52aWV3Qm94LmhlaWdodCAqIDAuNSArICcpJztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRyYW5zZm9ybSArPSB0aGlzLm1lYXN1cmVkV2lkdGggKiAwLjUgKyAnICcgKyB0aGlzLm1lYXN1cmVkSGVpZ2h0ICogMC41ICsgJyknO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsaW5lYXJHcmFkaWVudEVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZ3JhZGllbnRUcmFuc2Zvcm1cIiAvKiBHUkFESUVOVF9UUkFOU0ZPUk0gKi8sIHRyYW5zZm9ybSk7XHJcbiAgICB9XHJcbiAgICBhZGRTdG9wQ29sb3JzVG9TdHJva2VMaW5lYXJHcmFkaWVudChjb2xvcnMpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IGNvbG9yIG9mIGNvbG9ycykge1xyXG4gICAgICAgICAgICB0aGlzLmFkZFN0b3BDb2xvclRvU3Ryb2tlTGluZWFyR3JhZGllbnQoY29sb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFkZFN0b3BDb2xvclRvU3Ryb2tlTGluZWFyR3JhZGllbnQoY29sb3IpIHtcclxuICAgICAgICBjb25zdCBzdG9wID0gdGhpcy5nZXRTdG9wRnJvbUNvbG9yKGNvbG9yKTtcclxuICAgICAgICBsZXQgc3RvcHMgPSB0aGlzLnN0cm9rZUNvbG9yU3RvcE1hcHBpbmcuZ2V0KGNvbG9yKTtcclxuICAgICAgICBpZiAoIXN0b3BzKSB7XHJcbiAgICAgICAgICAgIHN0b3BzID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0b3BzLnB1c2goc3RvcCk7XHJcbiAgICAgICAgdGhpcy5zdHJva2VDb2xvclN0b3BNYXBwaW5nLnNldChjb2xvciwgc3RvcHMpO1xyXG4gICAgICAgIHRoaXMuc3Ryb2tlTGluZWFyR3JhZGllbnQuYXBwZW5kQ2hpbGQoc3RvcCk7XHJcbiAgICB9XHJcbiAgICBhZGRTdG9wQ29sb3JzVG9GaWxsTGluZWFyR3JhZGllbnQoY29sb3JzKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBjb2xvciBvZiBjb2xvcnMpIHtcclxuICAgICAgICAgICAgdGhpcy5hZGRTdG9wQ29sb3JUb0ZpbGxMaW5lYXJHcmFkaWVudChjb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgYWRkU3RvcENvbG9yVG9GaWxsTGluZWFyR3JhZGllbnQoY29sb3IpIHtcclxuICAgICAgICBjb25zdCBzdG9wID0gdGhpcy5nZXRTdG9wRnJvbUNvbG9yKGNvbG9yKTtcclxuICAgICAgICBsZXQgc3RvcHMgPSB0aGlzLmZpbGxDb2xvclN0b3BNYXBwaW5nLmdldChjb2xvcik7XHJcbiAgICAgICAgaWYgKCFzdG9wcykge1xyXG4gICAgICAgICAgICBzdG9wcyA9IFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzdG9wcy5wdXNoKHN0b3ApO1xyXG4gICAgICAgIHRoaXMuZmlsbENvbG9yU3RvcE1hcHBpbmcuc2V0KGNvbG9yLCBzdG9wcyk7XHJcbiAgICAgICAgdGhpcy5maWxsTGluZWFyR3JhZGllbnQuYXBwZW5kQ2hpbGQoc3RvcCk7XHJcbiAgICB9XHJcbiAgICBnZXRTdG9wRnJvbUNvbG9yKGNvbG9yKSB7XHJcbiAgICAgICAgY29uc3Qgc3RvcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgLyogU1ZHX05TICovLCBcInN0b3BcIiAvKiBTVE9QICovKTtcclxuICAgICAgICBzdG9wLnNldEF0dHJpYnV0ZShcInN0b3AtY29sb3JcIiAvKiBTVE9QX0NPTE9SICovLCBjb2xvci50b1N0cmluZygpKTtcclxuICAgICAgICByZXR1cm4gc3RvcDtcclxuICAgIH1cclxuICAgIHVwZGF0ZUxpbmVhckdyYWRpZW50U3RvcE9mZnNldHMobGluZWFyR3JhZGllbnRFbGVtZW50KSB7XHJcbiAgICAgICAgaWYgKGxpbmVhckdyYWRpZW50RWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gMC4wO1xyXG4gICAgICAgICAgICBjb25zdCBvZmZzZXRTdGVwID0gMSAvIChsaW5lYXJHcmFkaWVudEVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGggLSAxKTtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBsaW5lYXJHcmFkaWVudEVsZW1lbnQuY2hpbGROb2Rlcykge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RvcCA9IGNoaWxkO1xyXG4gICAgICAgICAgICAgICAgc3RvcC5zZXRBdHRyaWJ1dGUoXCJvZmZzZXRcIiAvKiBPRkZTRVQgKi8sIG9mZnNldCArICcnKTtcclxuICAgICAgICAgICAgICAgIG9mZnNldCA9IG9mZnNldCArIG9mZnNldFN0ZXA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzZXQgc3Ryb2tlV2lkdGgodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5fc3Ryb2tlV2lkdGggPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA8IDApIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3N0cm9rZVdpZHRoICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zdHJva2VXaWR0aCA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhdGgucmVtb3ZlQXR0cmlidXRlKFwic3Ryb2tlLXdpZHRoXCIgLyogU1RST0tFX1dJRFRIICovKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3N0cm9rZVdpZHRoID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5wYXRoLnNldEF0dHJpYnV0ZShcInN0cm9rZS13aWR0aFwiIC8qIFNUUk9LRV9XSURUSCAqLywgdGhpcy5fc3Ryb2tlV2lkdGgudG9TdHJpbmcoKSk7XHJcbiAgICB9XHJcbiAgICBnZXQgc3Ryb2tlV2lkdGgoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0cm9rZVdpZHRoO1xyXG4gICAgfVxyXG59XHJcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgncGF0aC1lbGVtZW50JywgUGF0aEVsZW1lbnQpO1xuXG5jbGFzcyBTdXJmYWNlRWxlbWVudCBleHRlbmRzIFBhdGhFbGVtZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5fY29ybmVyU2l6ZSA9IDA7XHJcbiAgICAgICAgdGhpcy5fY29ybmVyVHlwZSA9ICdyb3VuZCc7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gJ1N1cmZhY2VFbGVtZW50JztcclxuICAgICAgICB0aGlzLmdyb3VwLmFwcGVuZENoaWxkKHRoaXMucGF0aCk7XHJcbiAgICB9XHJcbiAgICB2YWxpZGF0ZSgpIHtcclxuICAgICAgICBzdXBlci52YWxpZGF0ZSgpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlUGF0aERhdGEoKTtcclxuICAgIH1cclxuICAgIHVwZGF0ZVBhdGhEYXRhKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNvcm5lclR5cGUgPT09ICdyb3VuZCcpIHtcclxuICAgICAgICAgICAgdGhpcy5wYXRoLnNldEF0dHJpYnV0ZSgnZCcsIHRoaXMuZ2V0Um91bmREYXRhKCkpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucGF0aC5zZXRBdHRyaWJ1dGUoJ2QnLCB0aGlzLmdldEN1dERhdGEoKSk7XHJcbiAgICB9XHJcbiAgICBzZXQgY29ybmVyU2l6ZSh2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9jb3JuZXJTaXplID09PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPCAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2Nvcm5lclNpemUgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmludmFsaWRhdGUoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9jb3JuZXJTaXplID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICB9XHJcbiAgICBnZXQgY29ybmVyU2l6ZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY29ybmVyU2l6ZTtcclxuICAgIH1cclxuICAgIHNldCBjb3JuZXJUeXBlKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2Nvcm5lclR5cGUgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fY29ybmVyVHlwZSA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgfVxyXG4gICAgZ2V0IGNvcm5lclR5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Nvcm5lclR5cGU7XHJcbiAgICB9XHJcbiAgICBnZXRDdXREYXRhKCkge1xyXG4gICAgICAgIGNvbnN0IHRsYyA9IHRoaXMuY29ybmVyU2l6ZTtcclxuICAgICAgICBjb25zdCB0cmMgPSB0bGM7XHJcbiAgICAgICAgY29uc3QgYnJjID0gdGxjO1xyXG4gICAgICAgIGNvbnN0IGJsYyA9IHRsYztcclxuICAgICAgICBjb25zdCB3ID0gdGhpcy5tZWFzdXJlZFdpZHRoO1xyXG4gICAgICAgIGNvbnN0IGggPSB0aGlzLm1lYXN1cmVkSGVpZ2h0O1xyXG4gICAgICAgIGxldCBkID0gJyc7XHJcbiAgICAgICAgZCArPSAnTSAnICsgdGxjICsgJyAwICc7XHJcbiAgICAgICAgZCArPSAnTCAnICsgKHcgLSB0cmMpICsgJyAwICc7XHJcbiAgICAgICAgZCArPSAnTCAnICsgdyArICcgJyArIHRyYztcclxuICAgICAgICBkICs9ICdMICcgKyB3ICsgJyAnICsgKGggLSBicmMpO1xyXG4gICAgICAgIGQgKz0gJ0wgJyArICh3IC0gYnJjKSArICcgJyArIGg7XHJcbiAgICAgICAgZCArPSAnTCAnICsgYmxjICsgJyAnICsgaDtcclxuICAgICAgICBkICs9ICdMIDAgJyArIChoIC0gYmxjKTtcclxuICAgICAgICBkICs9ICdMIDAgJyArIHRsYztcclxuICAgICAgICBkICs9ICdaJztcclxuICAgICAgICByZXR1cm4gZDtcclxuICAgIH1cclxuICAgIGdldFJvdW5kRGF0YSgpIHtcclxuICAgICAgICBjb25zdCB0bGMgPSB0aGlzLmNvcm5lclNpemU7XHJcbiAgICAgICAgY29uc3QgdHJjID0gdGxjO1xyXG4gICAgICAgIGNvbnN0IGJyYyA9IHRsYztcclxuICAgICAgICBjb25zdCBibGMgPSB0bGM7XHJcbiAgICAgICAgY29uc3QgdyA9IHRoaXMubWVhc3VyZWRXaWR0aDtcclxuICAgICAgICBjb25zdCBoID0gdGhpcy5tZWFzdXJlZEhlaWdodDtcclxuICAgICAgICBsZXQgZCA9ICcnO1xyXG4gICAgICAgIC8vIG1vdiB0b3AgbGVmdCBhcmMgc3RhcnRcclxuICAgICAgICBkICs9ICdNIDAgJyArIHRsYyArICcgJztcclxuICAgICAgICAvLyB0bGMgYXJjXHJcbiAgICAgICAgZCArPSAnQSAnICsgdGxjICsgJyAnICsgdGxjICsgJyAwIDAgMSAnICsgdGxjICsgJyAwICc7XHJcbiAgICAgICAgLy8gbGluZSB0byB0b3BSaWdodENvcm5lclxyXG4gICAgICAgIGQgKz0gJ0wgJyArICh3IC0gdHJjKSArICcgMCAnO1xyXG4gICAgICAgIC8vIHRyYyBhcmNcclxuICAgICAgICBkICs9ICdBICcgKyB0cmMgKyAnICcgKyB0cmMgKyAnIDEgMCAxICcgKyB3ICsgJyAnICsgdHJjICsgJyAnO1xyXG4gICAgICAgIC8vIGxpbmUgdG8gYm90dG9tUmlnaHRDb3JuZXJcclxuICAgICAgICBkICs9ICdMICcgKyB3ICsgJyAnICsgKGggLSBicmMpICsgJyAnO1xyXG4gICAgICAgIC8vIGJyYyBhcmNcclxuICAgICAgICBkICs9ICdBICcgKyBicmMgKyAnICcgKyBicmMgKyAnIDEgMCAxICcgKyAodyAtIGJyYykgKyAnICcgKyBoICsgJyAnO1xyXG4gICAgICAgIC8vIGxpbmUgdG8gYm90dG9tTGVmdENvcm5lclxyXG4gICAgICAgIGQgKz0gJ0wgJyArIGJsYyArICcgJyArIGggKyAnICc7XHJcbiAgICAgICAgLy8gYmxjIGFyY1xyXG4gICAgICAgIGQgKz0gJ0EgJyArIGJsYyArICcgJyArIGJsYyArICcgMCAwIDEgJyArICcwICcgKyAoaCAtIGJsYykgKyAnICc7XHJcbiAgICAgICAgLy8gY2xvc2UgcGF0aFxyXG4gICAgICAgIGQgKz0gJ1onO1xyXG4gICAgICAgIHJldHVybiBkO1xyXG4gICAgfVxyXG59XHJcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnc3VyZmFjZS1lbGVtZW50JywgU3VyZmFjZUVsZW1lbnQpO1xuXG5jbGFzcyBSZWN0YW5nbGUge1xyXG4gICAgY29uc3RydWN0b3IoeCA9IDAsIHkgPSAwLCB3aWR0aCA9IDAsIGhlaWdodCA9IDApIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSAnJztcclxuICAgICAgICB0aGlzLl94ID0gMDtcclxuICAgICAgICB0aGlzLl95ID0gMDtcclxuICAgICAgICB0aGlzLl93aWR0aCA9IDA7XHJcbiAgICAgICAgdGhpcy5faGVpZ2h0ID0gMDtcclxuICAgICAgICB0aGlzLm5hbWUgPSAnUmVjdGFuZ2xlJztcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgfVxyXG4gICAgc2V0IHgodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5feCA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4odmFsdWUpKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl94ICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl94ID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3ggPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIGdldCB4KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl94O1xyXG4gICAgfVxyXG4gICAgc2V0IHkodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5feSA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4odmFsdWUpKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl95ICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl95ID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3kgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIGdldCB5KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl95O1xyXG4gICAgfVxyXG4gICAgc2V0IHdpZHRoKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3dpZHRoID09PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPCAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl93aWR0aCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fd2lkdGggPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fd2lkdGggPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIGdldCB3aWR0aCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fd2lkdGg7XHJcbiAgICB9XHJcbiAgICBzZXQgaGVpZ2h0KHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2hlaWdodCA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlIDwgMCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faGVpZ2h0ICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oZWlnaHQgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faGVpZ2h0ID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBnZXQgaGVpZ2h0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9oZWlnaHQ7XHJcbiAgICB9XHJcbn1cblxuY2xhc3MgQm90dG9tTmF2aWdhdGlvbkl0ZW1SZW5kZXJlciBleHRlbmRzIEl0ZW1SZW5kZXJlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubmFtZSA9ICdCb3R0b21OYXZpZ2F0aW9uSXRlbVJlbmRlcmVyJztcclxuICAgICAgICB0aGlzLmhlaWdodCA9IDU2O1xyXG4gICAgICAgIHRoaXMucGVyY2VudFdpZHRoID0gMTAwO1xyXG4gICAgICAgIHRoaXMucGFkZGluZ1kgPSA2O1xyXG4gICAgICAgIHRoaXMubGF5b3V0ID0gbmV3IFZlcnRpY2FsTGF5b3V0KDQsICdjZW50ZXInKTtcclxuICAgICAgICB0aGlzLmFkZEVsZW1lbnQodGhpcy5wYXRoRWxlbWVudCk7XHJcbiAgICAgICAgdGhpcy5hZGRFbGVtZW50KHRoaXMubGFiZWxFbGVtZW50KTtcclxuICAgIH1cclxuICAgIGRhdGFDaGFuZ2VkKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy5sYWJlbEVsZW1lbnQudGV4dCA9IHRoaXMuZGF0YS50ZXh0O1xyXG4gICAgICAgICAgICB0aGlzLnBhdGhFbGVtZW50LnBhdGhEYXRhID0gdGhpcy5kYXRhLmljb247XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaW5pdGlhbCgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ29sb3IgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ29sb3IgPSB0aGlzLmNvbG9ycy5wcmltYXJ5LmM4MDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaG92ZXIoKSB7XHJcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ29sb3IgPSB0aGlzLmNvbG9ycy5wcmltYXJ5LmM5MDA7XHJcbiAgICB9XHJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcclxuICAgIHByZXNzZWQocG9pbnQpIHtcclxuICAgICAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IHRoaXMuY29sb3JzLnByaW1hcnkuYzgwMDtcclxuICAgIH1cclxuICAgIHNlbGVjdGVkQ2hhbmdlZCgpIHtcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IHRoaXMuY29sb3JzLnByaW1hcnkuYzgwMDtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBnZXQgcGF0aEVsZW1lbnQoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9wYXRoRWxlbWVudCkge1xyXG4gICAgICAgICAgICB0aGlzLl9wYXRoRWxlbWVudCA9IG5ldyBQYXRoRWxlbWVudCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9wYXRoRWxlbWVudC5zaXplKDI0LCAyNCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3BhdGhFbGVtZW50LnN0cm9rZVdpZHRoID0gMjtcclxuICAgICAgICAgICAgdGhpcy5fcGF0aEVsZW1lbnQuc3Ryb2tlQ29sb3IgPSB0aGlzLmNvbG9ycy5wcmltYXJ5LmMzMDA7XHJcbiAgICAgICAgICAgIHRoaXMuX3BhdGhFbGVtZW50LmZpbGxDb2xvciA9IG5ldyBDb2xvcigwLCAwLCAwLCAwLjApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fcGF0aEVsZW1lbnQ7XHJcbiAgICB9XHJcbiAgICBnZXQgbGFiZWxFbGVtZW50KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fbGFiZWxFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xhYmVsRWxlbWVudCA9IG5ldyBMYWJlbEVsZW1lbnQoKTtcclxuICAgICAgICAgICAgdGhpcy5fbGFiZWxFbGVtZW50LmVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5fbGFiZWxFbGVtZW50LnR5cGVGYWNlID0gdGhpcy50eXBvZ3JhcGh5LnNlY29uZGFyeTtcclxuICAgICAgICAgICAgdGhpcy5fbGFiZWxFbGVtZW50LmZvbnRTaXplID0gMTQ7XHJcbiAgICAgICAgICAgIHRoaXMuX2xhYmVsRWxlbWVudC5mb250V2VpZ2h0ID0gNTAwO1xyXG4gICAgICAgICAgICB0aGlzLl9sYWJlbEVsZW1lbnQudGV4dENvbG9yID0gdGhpcy5jb2xvcnMucHJpbWFyeS5jMzAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fbGFiZWxFbGVtZW50O1xyXG4gICAgfVxyXG59XHJcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnYm90dG9tLW5hdmlnYXRpb24taXRlbS1yZW5kZXJlcicsIEJvdHRvbU5hdmlnYXRpb25JdGVtUmVuZGVyZXIpO1xuXG5jbGFzcyBOYXZpZ2F0aW9uSXRlbVJlbmRlcmVyIGV4dGVuZHMgSXRlbVJlbmRlcmVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gJ05hdmlnYXRpb25JdGVtUmVuZGVyZXInO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gNDA7XHJcbiAgICAgICAgdGhpcy5wYWRkaW5nWCA9IDg7XHJcbiAgICAgICAgdGhpcy5jb3JuZXJTaXplID0gNDtcclxuICAgICAgICB0aGlzLnBlcmNlbnRXaWR0aCA9IDEwMDtcclxuICAgICAgICB0aGlzLmxheW91dCA9IG5ldyBIb3Jpem9udGFsTGF5b3V0KDE2LCAnbGVmdCcsICdtaWRkbGUnKTtcclxuICAgICAgICB0aGlzLmFkZEVsZW1lbnQodGhpcy5wYXRoRWxlbWVudCk7XHJcbiAgICAgICAgdGhpcy5hZGRFbGVtZW50KHRoaXMubGFiZWxFbGVtZW50KTtcclxuICAgIH1cclxuICAgIGluaXRpYWwoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYmFja2dyb3VuZENvbG9yID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuYmFja2dyb3VuZENvbG9yID0gdGhpcy5jb2xvcnMucHJpbWFyeS5jODAwO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGhvdmVyKCkge1xyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZENvbG9yID0gdGhpcy5jb2xvcnMucHJpbWFyeS5jOTAwO1xyXG4gICAgfVxyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXHJcbiAgICBwcmVzc2VkKHBvaW50KSB7XHJcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ29sb3IgPSB0aGlzLmNvbG9ycy5wcmltYXJ5LmM4MDA7XHJcbiAgICB9XHJcbiAgICBzZWxlY3RlZENoYW5nZWQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ29sb3IgPSB0aGlzLmNvbG9ycy5wcmltYXJ5LmM4MDA7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ29sb3IgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgZGF0YUNoYW5nZWQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLmxhYmVsRWxlbWVudC50ZXh0ID0gdGhpcy5kYXRhLnRleHQ7XHJcbiAgICAgICAgICAgIHRoaXMucGF0aEVsZW1lbnQucGF0aERhdGEgPSB0aGlzLmRhdGEuaWNvbjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnZXQgcGF0aEVsZW1lbnQoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9wYXRoRWxlbWVudCkge1xyXG4gICAgICAgICAgICB0aGlzLl9wYXRoRWxlbWVudCA9IG5ldyBQYXRoRWxlbWVudCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9wYXRoRWxlbWVudC5zaXplKDI0LCAyNCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3BhdGhFbGVtZW50LnN0cm9rZVdpZHRoID0gMjtcclxuICAgICAgICAgICAgdGhpcy5fcGF0aEVsZW1lbnQuc3Ryb2tlQ29sb3IgPSB0aGlzLmNvbG9ycy5wcmltYXJ5LmMzMDA7XHJcbiAgICAgICAgICAgIHRoaXMuX3BhdGhFbGVtZW50LmZpbGxDb2xvciA9IG5ldyBDb2xvcigwLCAwLCAwLCAwLjApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fcGF0aEVsZW1lbnQ7XHJcbiAgICB9XHJcbiAgICBnZXQgbGFiZWxFbGVtZW50KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fbGFiZWxFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xhYmVsRWxlbWVudCA9IG5ldyBMYWJlbEVsZW1lbnQoKTtcclxuICAgICAgICAgICAgdGhpcy5fbGFiZWxFbGVtZW50LmVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5fbGFiZWxFbGVtZW50LnR5cGVGYWNlID0gdGhpcy50eXBvZ3JhcGh5LnNlY29uZGFyeTtcclxuICAgICAgICAgICAgdGhpcy5fbGFiZWxFbGVtZW50LmZvbnRTaXplID0gMTQ7XHJcbiAgICAgICAgICAgIHRoaXMuX2xhYmVsRWxlbWVudC5mb250V2VpZ2h0ID0gNTAwO1xyXG4gICAgICAgICAgICB0aGlzLl9sYWJlbEVsZW1lbnQucGVyY2VudFdpZHRoID0gMTAwO1xyXG4gICAgICAgICAgICB0aGlzLl9sYWJlbEVsZW1lbnQudGV4dENvbG9yID0gdGhpcy5jb2xvcnMucHJpbWFyeS5jMzAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fbGFiZWxFbGVtZW50O1xyXG4gICAgfVxyXG59XHJcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmF2aWdhdGlvbi1pdGVtLXJlbmRlcmVyJywgTmF2aWdhdGlvbkl0ZW1SZW5kZXJlcik7XG5cbmNsYXNzIE5hdmlnYXRpb25JdGVtIHtcclxuICAgIGNvbnN0cnVjdG9yKHRleHQsIGljb24pIHtcclxuICAgICAgICB0aGlzLnRleHQgPSB0ZXh0O1xyXG4gICAgICAgIHRoaXMuaWNvbiA9IGljb247XHJcbiAgICB9XHJcbn1cblxuY2xhc3MgVW5hbWlEZXYgZXh0ZW5kcyBBcHBsaWNhdGlvbkVsZW1lbnQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSAnVW5hbWlEZXYnO1xyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZENvbG9yID0gbmV3IENvbG9yKDIxOCwgNjAsIDgpO1xyXG4gICAgICAgIC8vIHRoaXMuYmFja2dyb3VuZENvbG9yID0gdGhpcy5jb2xvcnMubmV1dHJhbC5jMTAwO1xyXG4gICAgICAgIC8vIHRoaXMudGhlbWUudHlwb2dyYXBoeS5wcmltYXJ5ID0gbmV3IFR5cGVGYWNlKCdCaXR0ZXInLCAwLjcxLCAwLjAzLCAwLjAyKTtcclxuICAgICAgICB0aGlzLnRoZW1lLnR5cG9ncmFwaHkucHJpbWFyeSA9IG5ldyBUeXBlRmFjZSgnRXVyb3N0aWxlIEV4dGVuZGVkJywgMC42OCwgMC4wOSwgMC4wMjUpO1xyXG4gICAgICAgIHRoaXMudGhlbWUudHlwb2dyYXBoeS5zZWNvbmRhcnkgPSBuZXcgVHlwZUZhY2UoJ0ludGVyJywgMC43MjcsIDAuMDksIDAuMCk7XHJcbiAgICAgICAgLy8gdGhpcy50aGVtZS50eXBvZ3JhcGh5LnNlY29uZGFyeSA9IG5ldyBUeXBlRmFjZSgnRXVyb3N0aWxlJywgMC42NywgMC4wNiwgMC4wMSk7XHJcbiAgICAgICAgdGhpcy5sYXlvdXQgPSBuZXcgVmVydGljYWxMYXlvdXQoMjAwLCAnY2VudGVyJywgJ21pZGRsZScpO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAvLyB0aGlzLmFkZEVsZW1lbnQodGhpcy5saXN0KTtcclxuICAgICAgICAgICAgdGhpcy5hZGRFbGVtZW50KHRoaXMuYm90dG9tTmF2aWdhdGlvbkxpc3QpO1xyXG4gICAgICAgICAgICAvLyB0aGlzLmFkZEVsZW1lbnQodGhpcy5sYWJlbEVsZW1lbnQpO1xyXG4gICAgICAgICAgICAvLyB0aGlzLmFkZEVsZW1lbnQodGhpcy5sYWJlbEVsZW1lbnQyKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIHRoaXMubGlzdC5kYXRhUHJvdmlkZXIgPSB0aGlzLm5hdmlnYXRpb25JdGVtcztcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RyaWdnZXJlZCcsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMubmFtZSwgZS50eXBlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHNlbGVjdGVkSXRlbUNoYW5nZWQoZSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCd1bmFtaScsIHRoaXMubmFtZSwgZS50eXBlLCBlLmRldGFpbCk7XHJcbiAgICB9XHJcbiAgICBzZWxlY3RlZEluZGV4Q2hhbmdlZChlKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ3VuYW1pJywgdGhpcy5uYW1lLCBlLnR5cGUsIGUuZGV0YWlsKTtcclxuICAgIH1cclxuICAgIGdldCBsYWJlbEVsZW1lbnQoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9sYWJlbEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5fbGFiZWxFbGVtZW50ID0gbmV3IExhYmVsRWxlbWVudCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9sYWJlbEVsZW1lbnQudGV4dCA9ICdUUk9OIDgwJztcclxuICAgICAgICAgICAgdGhpcy5fbGFiZWxFbGVtZW50LmZvbnRTaXplID0gNTA7XHJcbiAgICAgICAgICAgIHRoaXMuX2xhYmVsRWxlbWVudC5mb250V2VpZ2h0ID0gNDAwO1xyXG4gICAgICAgICAgICB0aGlzLl9sYWJlbEVsZW1lbnQubGV0dGVyU3BhY2luZyA9IDEwO1xyXG4gICAgICAgICAgICB0aGlzLl9sYWJlbEVsZW1lbnQudGV4dENvbG9yID0gbmV3IENvbG9yKDE4LCAxMDAsIDQ2KTsgLy8gaHNsKDE4LDEwMCw0NilcclxuICAgICAgICAgICAgdGhpcy5fbGFiZWxFbGVtZW50LnR5cGVGYWNlID0gdGhpcy50aGVtZS50eXBvZ3JhcGh5LnByaW1hcnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9sYWJlbEVsZW1lbnQ7XHJcbiAgICB9XHJcbiAgICBnZXQgbGFiZWxFbGVtZW50MigpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2xhYmVsRWxlbWVudDIpIHtcclxuICAgICAgICAgICAgdGhpcy5fbGFiZWxFbGVtZW50MiA9IG5ldyBMYWJlbEVsZW1lbnQoKTtcclxuICAgICAgICAgICAgdGhpcy5fbGFiZWxFbGVtZW50Mi50ZXh0ID0gJ1RST04gODAnO1xyXG4gICAgICAgICAgICB0aGlzLl9sYWJlbEVsZW1lbnQyLmZvbnRTaXplID0gNTA7XHJcbiAgICAgICAgICAgIHRoaXMuX2xhYmVsRWxlbWVudDIuZm9udFdlaWdodCA9IDcwMDtcclxuICAgICAgICAgICAgdGhpcy5fbGFiZWxFbGVtZW50Mi5sZXR0ZXJTcGFjaW5nID0gMTA7XHJcbiAgICAgICAgICAgIHRoaXMuX2xhYmVsRWxlbWVudDIudGV4dENvbG9yID0gbmV3IENvbG9yKDAsIDEwMCwgMzgpOyAvLyBoc2woMCwxMDAsMzgpIHJlZCBuZXcgQ29sb3IoNTAsIDk4LCA1MSk7IC8vIHllbGxvdyBuZXcgQ29sb3IoMjA0LCA5NywgNDgpO2xpZ2h0IGJsdWVcclxuICAgICAgICAgICAgdGhpcy5fbGFiZWxFbGVtZW50Mi50eXBlRmFjZSA9IHRoaXMudGhlbWUudHlwb2dyYXBoeS5zZWNvbmRhcnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9sYWJlbEVsZW1lbnQyO1xyXG4gICAgfVxyXG4gICAgZ2V0IGJvdHRvbU5hdmlnYXRpb25MaXN0KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fYm90dG9tTmF2aWdhdGlvbkxpc3QpIHtcclxuICAgICAgICAgICAgdGhpcy5fYm90dG9tTmF2aWdhdGlvbkxpc3QgPSBuZXcgTGlzdCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9ib3R0b21OYXZpZ2F0aW9uTGlzdC5zZWxlY3RlZEluZGV4ID0gMDtcclxuICAgICAgICAgICAgdGhpcy5fYm90dG9tTmF2aWdhdGlvbkxpc3QuaGVpZ2h0ID0gNTY7XHJcbiAgICAgICAgICAgIHRoaXMuX2JvdHRvbU5hdmlnYXRpb25MaXN0LnBlcmNlbnRXaWR0aCA9IDEwMDtcclxuICAgICAgICAgICAgdGhpcy5fYm90dG9tTmF2aWdhdGlvbkxpc3QuYmFja2dyb3VuZENvbG9yID0gdGhpcy5jb2xvcnMucHJpbWFyeS5jNzAwO1xyXG4gICAgICAgICAgICB0aGlzLl9ib3R0b21OYXZpZ2F0aW9uTGlzdC5hZGRGaWx0ZXIobmV3IEJveFNoYWRvd0ZpbHRlcigwLCAtNCwgNiwgLTEsIG5ldyBDb2xvcigwLCAwLCAwLCAwLjEpKSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2JvdHRvbU5hdmlnYXRpb25MaXN0LmFkZEZpbHRlcihuZXcgQm94U2hhZG93RmlsdGVyKDAsIC0yLCA0LCAtMSwgbmV3IENvbG9yKDAsIDAsIDAsIDAuMDYpKSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2JvdHRvbU5hdmlnYXRpb25MaXN0LmRhdGFQcm92aWRlciA9IHRoaXMubmF2aWdhdGlvbkl0ZW1zO1xyXG4gICAgICAgICAgICB0aGlzLl9ib3R0b21OYXZpZ2F0aW9uTGlzdC5JdGVtUmVuZGVyZXJDbGFzcyA9IEJvdHRvbU5hdmlnYXRpb25JdGVtUmVuZGVyZXI7XHJcbiAgICAgICAgICAgIHRoaXMuX2JvdHRvbU5hdmlnYXRpb25MaXN0LmxheW91dCA9IG5ldyBIb3Jpem9udGFsTGF5b3V0KDAsICdjZW50ZXInLCAnbWlkZGxlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9ib3R0b21OYXZpZ2F0aW9uTGlzdDtcclxuICAgIH1cclxuICAgIGdldCBsaXN0KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fbGlzdCkge1xyXG4gICAgICAgICAgICB0aGlzLl9saXN0ID0gbmV3IExpc3QoKTtcclxuICAgICAgICAgICAgdGhpcy5fbGlzdC5iYWNrZ3JvdW5kQ29sb3IgPSB0aGlzLmNvbG9ycy5wcmltYXJ5LmM3MDA7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuX2xpc3QuY29ybmVyU2l6ZSA9IDQ7XHJcbiAgICAgICAgICAgIHRoaXMuX2xpc3Quc2VsZWN0ZWRJbmRleCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuX2xpc3QucGFkZGluZyA9IDg7XHJcbiAgICAgICAgICAgIHRoaXMuX2xpc3Qud2lkdGggPSAyMDA7XHJcbiAgICAgICAgICAgIHRoaXMuX2xpc3QucGVyY2VudEhlaWdodCA9IDEwMDtcclxuICAgICAgICAgICAgdGhpcy5fbGlzdC5JdGVtUmVuZGVyZXJDbGFzcyA9IE5hdmlnYXRpb25JdGVtUmVuZGVyZXI7XHJcbiAgICAgICAgICAgIHRoaXMuX2xpc3QuZGF0YVByb3ZpZGVyID0gdGhpcy5uYXZpZ2F0aW9uSXRlbXM7XHJcbiAgICAgICAgICAgIHRoaXMuX2xpc3QubGF5b3V0ID0gbmV3IFZlcnRpY2FsTGF5b3V0KDgsICdmaWxsJyk7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuX2xpc3QuYWRkRmlsdGVyKG5ldyBCb3hTaGFkb3dGaWx0ZXIoMCwgNCwgNiwgLTEsIG5ldyBDb2xvcigwLCAwLCAwLCAwLjEpKSk7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuX2xpc3QuYWRkRmlsdGVyKG5ldyBCb3hTaGFkb3dGaWx0ZXIoMCwgMiwgNCwgLTEsIG5ldyBDb2xvcigwLCAwLCAwLCAwLjA2KSkpO1xyXG4gICAgICAgICAgICB0aGlzLl9saXN0Lmhvcml6b250YWxTY3JvbGxFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX2xpc3QudmVydGljYWxTY3JvbGxFbmFibGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5fbGlzdC5hZGRFdmVudExpc3RlbmVyKCdzZWxlY3RlZEl0ZW1DaGFuZ2VkJywgdGhpcy5zZWxlY3RlZEl0ZW1DaGFuZ2VkLmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICB0aGlzLl9saXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3NlbGVjdGVkSW5kZXhDaGFuZ2VkJywgdGhpcy5zZWxlY3RlZEluZGV4Q2hhbmdlZC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xpc3Q7XHJcbiAgICB9XHJcbiAgICBnZXQgbmF2aWdhdGlvbkl0ZW1zKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fbmF2aWdhdGlvbkl0ZW1zKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX25hdmlnYXRpb25JdGVtcyA9IG5ldyBBcnJheUNvbGxlY3Rpb24oW1xyXG4gICAgICAgICAgICAgICAgbmV3IE5hdmlnYXRpb25JdGVtKCdIb21lJywgXCJNMyAxMmwyLTJtMCAwbDctNyA3IDdNNSAxMHYxMGExIDEgMCAwMDEgMWgzbTEwLTExbDIgMm0tMi0ydjEwYTEgMSAwIDAxLTEgMWgtM20tNiAwYTEgMSAwIDAwMS0xdi00YTEgMSAwIDAxMS0xaDJhMSAxIDAgMDExIDF2NGExIDEgMCAwMDEgMW0tNiAwaDZcIiAvKiBIT01FICovKSxcclxuICAgICAgICAgICAgICAgIG5ldyBOYXZpZ2F0aW9uSXRlbSgnQmxvZycsIFwiTTExIDVINmEyIDIgMCAwMC0yIDJ2MTFhMiAyIDAgMDAyIDJoMTFhMiAyIDAgMDAyLTJ2LTVtLTEuNDE0LTkuNDE0YTIgMiAwIDExMi44MjggMi44MjhMMTEuODI4IDE1SDl2LTIuODI4bDguNTg2LTguNTg2elwiIC8qIFBFTkNJTF9BTFQgKi8pLFxyXG4gICAgICAgICAgICAgICAgbmV3IE5hdmlnYXRpb25JdGVtKCdBYm91dCcsIFwiTTE2IDdhNCA0IDAgMTEtOCAwIDQgNCAwIDAxOCAwek0xMiAxNGE3IDcgMCAwMC03IDdoMTRhNyA3IDAgMDAtNy03elwiIC8qIFVTRVIgKi8pLFxyXG4gICAgICAgICAgICAgICAgbmV3IE5hdmlnYXRpb25JdGVtKCdXb3JrJywgXCJNOCA5bDMgMy0zIDNtNSAwaDNNNSAyMGgxNGEyIDIgMCAwMDItMlY2YTIgMiAwIDAwLTItMkg1YTIgMiAwIDAwLTIgMnYxMmEyIDIgMCAwMDIgMnpcIiAvKiBURVJNSU5BTCAqLyksXHJcbiAgICAgICAgICAgICAgICBuZXcgTmF2aWdhdGlvbkl0ZW0oJ0Rlc2lnbicsIFwiTTUgM3Y0TTMgNWg0TTYgMTd2NG0tMi0yaDRtNS0xNmwyLjI4NiA2Ljg1N0wyMSAxMmwtNS43MTQgMi4xNDNMMTMgMjFsLTIuMjg2LTYuODU3TDUgMTJsNS43MTQtMi4xNDNMMTMgM3pcIiAvKiBTUEFSS0xFUyAqLylcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9uYXZpZ2F0aW9uSXRlbXM7XHJcbiAgICB9XHJcbiAgICBnZXQgYnV0dG9uKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fYnV0dG9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2J1dHRvbiA9IG5ldyBCdXR0b24oKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2J1dHRvbjtcclxuICAgIH1cclxuICAgIGdldCBiYWRnZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2JhZGdlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2JhZGdlID0gbmV3IEJhZGdlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2JhZGdlLnRleHQgPSAnREVGQVVMVCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9iYWRnZTtcclxuICAgIH1cclxufVxyXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ3VuYW1pLWRldicsIFVuYW1pRGV2KTtcblxuZXhwb3J0IHsgQWJzb2x1dGVMYXlvdXQsIEFwcGxpY2F0aW9uRWxlbWVudCwgQXJyYXlDb2xsZWN0aW9uLCBCYWRnZSwgQmFzZUVsZW1lbnQsIEJhc2VUZXh0LCBCbHVyRmlsdGVyLCBCb3R0b21OYXZpZ2F0aW9uSXRlbVJlbmRlcmVyLCBCb3hTaGFkb3dGaWx0ZXIsIEJ1dHRvbiwgQ29sb3IsIENvbG9yU2NhbGUsIENvbG9ycywgRGVzaWduLCBEaXNwbGF5Q29udGFpbmVyLCBEaXNwbGF5RWxlbWVudCwgRXZlbnREaXNwYXRjaGVyLCBIb3Jpem9udGFsTGF5b3V0LCBJdGVtUmVuZGVyZXIsIExhYmVsRWxlbWVudCwgTGluZWFyR3JhZGllbnQsIExpc3QsIE1hY2hpbmUsIE1vZGFsLCBOYXZpZ2F0aW9uSXRlbSwgTmF2aWdhdGlvbkl0ZW1SZW5kZXJlciwgUGF0aEVsZW1lbnQsIFBvaW50LCBQb3NpdGlvbkVsZW1lbnQsIFJlY3RhbmdsZSwgU2Nyb2xsQ29udGFpbmVyLCBTaGFkb3dGaWx0ZXIsIFNpemUsIFNpemVFbGVtZW50LCBTdGF0ZSwgU3VyZmFjZUVsZW1lbnQsIFN2Z0VsZW1lbnQsIFRleHRFbGVtZW50LCBUZXh0UmVuZGVyZXIsIFRoZW1lLCBUb3VjaE1hY2hpbmUsIFR5cGVGYWNlLCBUeXBlU2NhbGUsIFR5cG9ncmFwaHksIFVuYW1pRGV2LCBWZXJ0aWNhbExheW91dCB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwXG4iLCJpbXBvcnQgeyBBcHBsaWNhdGlvbkVsZW1lbnQsIElMYWJlbEVsZW1lbnQsIExhYmVsRWxlbWVudCwgVHlwZUZhY2UsIFZlcnRpY2FsTGF5b3V0IH0gZnJvbSAndW5hbWknO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFydGluUm9zc2lsIGV4dGVuZHMgQXBwbGljYXRpb25FbGVtZW50IHtcclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubGF5b3V0ID0gbmV3IFZlcnRpY2FsTGF5b3V0KDAsICdjZW50ZXInLCAnbWlkZGxlJyk7XHJcbiAgICAgICAgdGhpcy50aGVtZS50eXBvZ3JhcGh5LnByaW1hcnkgPSBuZXcgVHlwZUZhY2UoJ0ludGVyJywgMC43MjcsIDAuMDksIDAuMCk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkRWxlbWVudCh0aGlzLmxhYmVsRWxlbWVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfbGFiZWxFbGVtZW50ITogSUxhYmVsRWxlbWVudDtcclxuXHJcbiAgICBwcml2YXRlIGdldCBsYWJlbEVsZW1lbnQoKTogSUxhYmVsRWxlbWVudCB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9sYWJlbEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5fbGFiZWxFbGVtZW50ID0gbmV3IExhYmVsRWxlbWVudCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9sYWJlbEVsZW1lbnQudGV4dCA9ICdNYXJ0aW4gUm9zc2lsJztcclxuICAgICAgICAgICAgdGhpcy5fbGFiZWxFbGVtZW50LmZvbnRTaXplID0gNTA7XHJcbiAgICAgICAgICAgIHRoaXMuX2xhYmVsRWxlbWVudC5mb250V2VpZ2h0ID0gNzAwO1xyXG4gICAgICAgICAgICB0aGlzLl9sYWJlbEVsZW1lbnQubGV0dGVyU3BhY2luZyA9IDEwO1xyXG4gICAgICAgICAgICB0aGlzLl9sYWJlbEVsZW1lbnQudGV4dENvbG9yID0gdGhpcy5jb2xvcnMucHJpbWFyeS5jNTAwO1xyXG4gICAgICAgICAgICB0aGlzLl9sYWJlbEVsZW1lbnQudHlwZUZhY2UgPSB0aGlzLnRoZW1lLnR5cG9ncmFwaHkucHJpbWFyeTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xhYmVsRWxlbWVudDtcclxuICAgIH1cclxufVxyXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ21hcnRpbi1yb3NzaWwnLCBNYXJ0aW5Sb3NzaWwpO1xyXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFNLGVBQWUsQ0FBQztBQUN0QixJQUFJLFdBQVcsR0FBRztBQUNsQixRQUFRLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNuQyxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ3hCLEtBQUs7QUFDTCxJQUFJLGFBQWEsQ0FBQyxLQUFLLEVBQUU7QUFDekIsUUFBUSxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDN0QsUUFBUSxJQUFJLGFBQWEsS0FBSyxTQUFTLEVBQUU7QUFDekMsWUFBWSxLQUFLLE1BQU0sUUFBUSxJQUFJLGFBQWEsRUFBRTtBQUNsRCxnQkFBZ0IsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hDLGFBQWE7QUFDYixTQUFTO0FBQ1QsUUFBUSxPQUFPLElBQUksQ0FBQztBQUNwQixLQUFLO0FBQ0wsSUFBSSxRQUFR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LFlBQVksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN4RCxZQUFZLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDeEQsWUFBWSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3hELFlBQVksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN4RCxZQUFZLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDeEQsU0FBUztBQUNULFFBQVEsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQzdCLEtBQUs7QUFDTCxJQUFJLElBQUksU0FBUyxHQUFHO0FBQ3BCLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7QUFDOUIsWUFBWSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7QUFDL0MsWUFBWSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3pELFlBQVksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUMxRCxZQUFZLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDMUQsWUFBWSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzFELFlBQVksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUMxRCxZQUFZLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDMUQsWUFBWSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzFELFlBQVksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUMxRCxZQUFZLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDMUQsWUFBWSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzFELFNBQVM7QUFDVCxRQUFRLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztBQUMvQixLQUFLO0FBQ0wsSUFBSSxJQUFJLE9BQU8sR0FBRztBQUNsQixRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQzVCLFlBQVksSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO0FBQzdDLFlBQVksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN2RCxZQUFZLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDeEQsWUFBWSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3hELFlBQVksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN4RCxZQUFZLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDeEQsWUFBWSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3hELFlBQVksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN4RCxZQUFZLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDeEQsWUFBWSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3hELFlBQVksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN4RCxTQUFTO0FBQ1QsUUFBUSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDN0IsS0FBSztBQUNMLElBQUksSUFBSSxNQUFNLEdBQUc7QUFDakIsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUMzQixZQUFZLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztBQUM1QyxZQUFZLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDcEQsWUFBWSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3JELFlBQVksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNyRCxZQUFZLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDckQsWUFBWSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3JELFlBQVksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNyRCxZQUFZLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDckQsWUFBWSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3JELFlBQVksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFF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
