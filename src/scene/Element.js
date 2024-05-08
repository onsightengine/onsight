/**
 * Base Class of the Suey (Salinity Gui) Library
 */
class Element {

    /**
     * Creates an instance of Element.
     * @param {HTMLElement} domElement - The DOM element to wrap.
     * @memberof Element
     * @constructor
     */
    constructor(domElement) {
        if (domElement == null) {
            console.trace('Element.constructor: No HTMLElement provided!');
            domElement = document.createElement('div');
        }

        // Prototype
        this.isElement = true;

        // Properties
        let dom = domElement;                           // 'HTMLElement'
        let suey = this;                                // dom.suey

        this.parent = undefined;                        // Parent 'Element'
        this.children = [];                             // Holds 'Element' children (.add / .remove / .clearContents)
        this.contents = function() { return suey; };    // Inner 'Element' to be filled with other 'Element's

        // Property Definitions
        Object.defineProperties(this, {
            dom: {
                get: function() { return dom; },
                set: function(value) { dom = value; },
            },
            id: {
                configurable: true,
                get: function() { return dom.id; },
                set: function(value) { dom.id = value; },
            },
            name: {
                get: function() { return dom.name ?? '???'; },
                set: function(value) { dom.name = String(value); } ,
            },
        });

        Object.defineProperties(dom, {
            suey: {
                get: function() { return suey; },
            },
        });
    }

    /**
     * Sets the ID of the Element.
     * @param {string} id - The ID to set.
     * @returns {Element} The Element instance.
     * @memberof Element
     */
    setID(id) {
        this.id = id;
        return this;
    }

    /******************** CHILDREN */

    /**
     * Adds any number of 'Element' or 'HTMLElement' as children to the contents() of the Element.
     * @param {...(Element|HTMLElement)} elements - The elements to add.
     * @returns {Element} The Element instance.
     * @memberof Element
     */
    add(...elements) {
        for (const element of elements) {
            addToParent(this.contents(), element);
        }
        return this;
    }

    /**
     * Adds any number of 'Element' or 'HTMLElement' as children directly to the Element.
     * @param {...(Element|HTMLElement)} elements - The elements to add.
     * @returns {Element} The Element instance.
     * @memberof Element
     */
    addToSelf(...elements) {
        for (const element of elements) {
            addToParent(this, element);
        }
        return this;
    }

    /**
     * Removes all children 'Element' or 'HTMLElement' from the contents() of the Element.
     * @returns {Element} The Element instance.
     * @memberof Element
     */
    clearContents() {
        destroyChildren(this.contents(), false /* destroySelf */);
        return this;
    }

    /**
     * Removes all children DOM elements from this element.
     * @returns {Element} The Element instance.
     * @memberof Element
     */
    destroy() {
        destroyChildren(this, true /* destroySelf */);
        return this;
    }

    /**
     * Removes any number of 'Element' or 'HTMLElement' from the Element without destroying them.
     * @param {Element|HTMLElement} element - The element to detach.
     * @returns {Element|HTMLElement} The detached element.
     * @memberof Element
     */
    detach(...elements) {
        const removedElements = [];
        // Attempt to remove element from contents(), then try to remove from self.children
        for (const element of elements) {
            let removed = removeFromParent(this.contents(), element, false /* destroy? */);
            if (!removed) removed = removeFromParent(this, element, false /* destroy? */);
            if (!removed) { /* Could not find or remove */ }
            removedElements.push(removed);
        }
        if (removedElements.length === 0) return undefined;
        if (removedElements.length === 1) return removedElements[0];
        return removedElements;
    }

    /**
     * Removes any number of 'Element' or 'HTMLElement' from the contents() or children of the Element.
     * @param {...(Element|HTMLElement)} elements - The elements to remove.
     * @returns {Element|HTMLElement|Array<Element|HTMLElement>} The removed element(s).
     * @memberof Element
     */
    remove(...elements) {
        const removedElements = [];
        // Attempt to remove element from contents(), then try to remove from self.children
        for (const element of elements) {
            let removed = removeFromParent(this.contents(), element, true /* destroy? */);
            if (!removed) removed = removeFromParent(this, element, true /* destroy? */);
            if (!removed) { /* Could not find or remove */ }
            removedElements.push(removed);
        }
        if (removedElements.length === 0) return undefined;
        if (removedElements.length === 1) return removedElements[0];
        return removedElements;
    }

    /**
     * Removes this element from it's parent, destroying it in the process
     */
    removeSelf() {
        this.destroy();
        const parent = this.parent ?? this.dom?.parentElement;
        removeFromParent(parent, this, false /* already destroyed above */);
        return this;
    }

    /******************** CLASS / ID / NAME */

    /**
     * Sets the CSS class of the Element.
     * @param {...string} className - The CSS class name(s).
     * @returns {Element} The Element instance.
     * @memberof Element
     */
    setClass(...classNames) {
        this.dom.className = '';
        return this.addClass(...classNames);
    }

    /**
     * Adds CSS classes to the Element.
     * @param {...string} classNames - The CSS class name(s) to add.
     * @returns {Element} The Element instance.
     * @memberof Element
     */
    addClass(...classNames) {
        for (const className of classNames) {
            if (className && typeof className === 'string' && className != '') {
                this.dom.classList.add(className);
            }
        }
        return this;
    }

    /**
     * Checks if the Element has a specific CSS class.
     * @param {string} className - The CSS class name to check.
     * @returns {boolean} True if the Element has the class, false otherwise.
     * @memberof Element
     */
    hasClass(className) {
        return this.dom.classList.contains(className);
    }

    /**
     * Checks if the Element has a CSS class that contains a specific substring.
     * @param {string} substring - The substring to search for in the CSS classes.
     * @returns {boolean} True if the Element has a class containing the substring, false otherwise.
     * @memberof Element
     */
    hasClassWithString(substring) {
        substring = String(substring).toLowerCase();
        const classArray = [ ...this.dom.classList ];
        for (let i = 0; i < classArray.length; i++) {
            const className = classArray[i];
            if (className.toLowerCase().includes(substring)) return true;
        }
        return false;
    }

    /**
     * Removes CSS classes from the Element.
     * @param {...string} classNames - The CSS class names to remove.
     * @returns {Element} The Element instance.
     * @memberof Element
     */
    removeClass(...classNames) {
        for (const className of classNames) {
            this.dom.classList.remove(className);
        }
        return this;
    }

    /**
     * If the Element has the CSS class name, it is removed, otherwise it is added.
     * @param {*} className - The CSS class name to toggle.
     */
    toggleClass(className) {
        if (className != null && typeof className === 'string' && className !== '') {
            if (this.hasClass(className)) this.removeClass(className);
            else this.addClass(className);
        }
        return this;
    }

    /**
     * Convenience function that ensures Element has class name if wants === true, or removes it if wants === false.
     * @param {*} className
     * @param {*} wants
     */
    wantsClass(className, wants = true) {
        if (className && className != '') {
            if (wants) this.addClass(className);
            else this.removeClass(className);
        }
        return this;
    }

    /******************** HTML */

    /**
     * Sets an attribute on the Element.
     * @param {string} attribute - Attribute key.
     * @param {string} value - The value of the attribute.
     * @memberof Element
     */
    setAttribute(attrib, value) {
        this.dom.setAttribute(attrib, value);
    }

    /**
     * Sets the disabled state of the Element.
     * @param {boolean} [value=true] - The disabled state.
     * @returns {Element} The Element instance.
     * @memberof Element
     */
    setDisabled(value = true) {
        if (value) this.addClass('suey-disabled');
        else this.removeClass('suey-disabled');
        this.dom.disabled = value;
        return this;
    }

    /**
     * Makes the Element selectable or unselectable.
     * @param {boolean} allowSelection - True to make the Element selectable, false to make it unselectable.
     * @returns {Element} The Element instance.
     * @memberof Element
     */
    selectable(allowSelection) {
        if (allowSelection) this.removeClass('suey-unselectable');
        else this.addClass('suey-unselectable');
        return this;
    }

    /**
     * Hides the Element.
     * @param {boolean} [dispatchEvent=true] - Whether to dispatch the 'hidden' event.
     * @memberof Element
     */
    hide(dispatchEvent = true) {
        if (this.isHidden()) return;
        if (dispatchEvent) this.dom.dispatchEvent(new Event('hidden'));
        this.addClass('suey-hidden');
        this.setStyle('display', 'none');
    }

    /**
     * Displays the Element.
     * @param {boolean} [dispatchEvent=true] - Whether to dispatch the 'displayed' event.
     * @memberof Element
     */
    display(dispatchEvent = true) {
        if (this.isDisplayed() && this.hasClass('suey-hidden') === false) return;
        this.removeClass('suey-hidden');
        this.setStyle('display', '');
        if (dispatchEvent) this.dom.dispatchEvent(new Event('displayed'));
    }

    /**
     * Checks if the Element is displayed.
     * @returns {boolean} True if the Element is displayed, false otherwise.
     * @memberof Element
     */
    isDisplayed() {
        return getComputedStyle(this.dom).display != 'none';
    }

    /**
     * Checks if the Element is hidden.
     * @returns {boolean} True if the Element is hidden, false otherwise.
     * @memberof Element
     */
    isHidden() {
        return getComputedStyle(this.dom).display == 'none';
    }

    /**
     * Enables user focus on the Element.
     * - Turns on focusin / focusout events
     * - Keyboard 'keyup' event doesn't work without setting tabIndex >= 0
     * @memberof Element
     */
    allowFocus() {
        this.dom.tabIndex = 0; // this.dom.setAttribute('tabindex', '0');
    }

    /**
     * Element will receive mouse focus but not keyboard focus (needs >= 0 for keyboard focus).
     * NOTE: Element will be inaccessible to keyboard-only users, so it should be used with caution.
     * https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets#using_tabindex
     * @memberof Element
     */
    allowMouseFocus() {
        this.dom.tabIndex = -1; // this.dom.setAttribute('tabindex', '-1');
    }

    /**
     * Focuses the Element.
     * @memberof Element
     */
    focus() {
        this.dom.focus();
    }

    /**
     * Blurs the Element.
     * @memberof Element
     */
    blur() {
        this.dom.blur();
    }

    // // WARNING: Setting any of the following will delete children!
    // // SEE: https://kellegous.com/j/2013/02/27/innertext-vs-textcontent/
    // Order of content, from least to most:
    //      textContent:    All text contained by an element and all its children
    //      innerText:      All text contained by an element and all its children, affected by 'style'
    //      innerHtml:      All text (including html tags) that is contained by an element

    /**
     * Sets the text content of the Element.
     * @param {string} value - The text content to set.
     * @returns {Element} The Element instance.
     * @memberof Element
     */
    setTextContent(value) {
        if (value != undefined) this.contents().dom.textContent = value;
        return this;
    }

    /**
     * Gets the text content of the Element.
     * @returns {string} The text content of the Element.
     * @memberof Element
     */
    getTextContent() {
        return this.contents().dom.textContent;
    }

    /**
     * Sets the inner text of the Element.
     * @param {string} value - The inner text to set.
     * @returns {Element} The Element instance.
     * @memberof Element
     */
    setInnerText(value) {
        if (value != undefined) this.contents().dom.innerText = value;
        return this;
    }

    /**
     * Gets the inner text of the Element.
     * @returns {string} The inner text of the Element.
     * @memberof Element
     */
    getInnerText() {
        return this.contents().dom.innerText;
    }

    /**
     * Sets the inner HTML of the Element.
     * @param {string} value - The inner HTML to set.
     * @returns {Element} The Element instance.
     * @memberof Element
     */
    setInnerHtml(value) {
        if (value === undefined || value === null) value = '';
        // NOTE: Attempt to sanitize html
        // https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML#
        // https://github.com/WICG/sanitizer-api
        if (typeof this.contents().dom.setHTML === 'function') {
            this.contents().dom.setHTML(value);
        } else {
            this.contents().dom.innerHTML = value;
        }
        return this;
    }

    /**
     * Gets the inner HTML of the Element.
     * @returns {string} The inner HTML of the Element.
     * @memberof Element
     */
    getInnerHtml() {
        return this.contents().dom.innerHTML;
    }

    /******************** CSS */

    // CSS Properties, see: http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSS2Properties

    /**
     * Sets CSS styles on the Element.
     * @param {...(string|number)} styles - The CSS styles to set, as key-value pairs.
     * @returns {Element} The Element instance.
     * @memberof Element
     */
    setStyle(/* style, value, style, value, etc. */) {
        for (let i = 0, l = arguments.length; i < l; i += 2) {
            const style = arguments[i];
            const value = arguments[i + 1];
            this.dom.style[style] = value;
        }
        return this;
    }

    /**
     * Sets CSS styles on the contents() of the Element.
     * @param {...(string|number)} styles - The CSS styles to set, as key-value pairs.
     * @returns {Element} The Element instance.
     * @memberof Element
     */
    setContentsStyle(/* style, value, style, value, etc. */) {
        for (let i = 0, l = arguments.length; i < l; i += 2) {
            const style = arguments[i];
            const value = arguments[i + 1];
            this.contents().dom.style[style] = value;
        }
        return this;
    }

    /**
     * To be implemented in child classes.
     */
    setColor() {
        console.error(`${this.constructor.name}.setColor(): Method must be reimplemented from Element`);
        return this;
    }

    /******************** DOM */

    /**
     * Gets the left position of the Element.
     * @returns {number} The left position of the Element.
     * @memberof Element
     */
    getLeft() {
        return this.dom.getBoundingClientRect().left;
    }

    /**
     * Gets the top position of the Element.
     * @returns {number} The top position of the Element.
     * @memberof Element
     */
    getTop() {
        // return this.dom.top;
        return this.dom.getBoundingClientRect().top;
    }

    /**
     * Gets the width of the Element.
     * @returns {number} The width of the Element.
     * @memberof Element
     */
    getWidth() {
        // return this.dom.clientWidth;         // <-- does not include margin / border
        return this.dom.getBoundingClientRect().width;
    }

    /**
     * Gets the height of the Element.
     * @returns {number} The height of the Element.
     * @memberof Element
     */
    getHeight() {
        // return this.dom.clientHeight;        // <-- does not include margin / border
        return this.dom.getBoundingClientRect().height;
    }

    /**
     * Gets the position of the Element relative to its closest positioned ancestor.
     * @returns {{left: number, top: number}} The relative position of the Element.
     * @memberof Element
     */
    getRelativePosition() {
        const rect = this.dom.getBoundingClientRect();
        let offsetParent = this.dom.offsetParent;
        while (offsetParent && getComputedStyle(offsetParent).position === 'static') {
            offsetParent = offsetParent.offsetParent;
        }

        if (!offsetParent) {
            return { left: rect.left, top: rect.top };
        }

        const parentRect = offsetParent.getBoundingClientRect();
        const relativeLeft = rect.left - parentRect.left;
        const relativeTop = rect.top - parentRect.top;
        return { left: relativeLeft, top: relativeTop };
    }

    /******************** TRAVERSE */

    /**
     * Applies a callback function to all Element children, recursively.
     * @param {function} callback - The callback function to apply.
     * @param {boolean} [applyToSelf=true] - Whether to apply the callback to the Element itself.
     * @memberof Element
     */
    traverse(callback, applyToSelf = true) {
        if (applyToSelf) callback(this);
        if (this.children) {
            for (const child of this.children) {
                child.traverse(callback, true);
            }
        }
    }

    /**
     * Applies a callback function to all Element parents, recursively.
     * @param {function} callback - The callback function to apply.
     * @param {boolean} [applyToSelf=true] - Whether to apply the callback to the Element itself.
     * @memberof Element
     */
    traverseAncestors(callback, applyToSelf = true) {
        if (applyToSelf) callback(this);
        if (this.parent) this.parent.traverseAncestors(callback, true);
    }

    /******************** EVENTS */

    // 'keyup', 'keydown'
    // 'pointerdown', 'pointermove', 'pointerup'
    // 'pointerenter', 'pointerleave', 'pointerout', 'pointerover', 'pointercancel'
    //
    // 'dragstart', 'dragend'
    // 'dragenter', 'dragover', 'dragleave'
    // 'drop'
    //
    // 'select'         Fires when some text has been selected
    // 'click'          Fires on pointer (mouse) click, touch gesture, 'Space' or 'Enter' pressed while focused
    // 'dblclick'       Fires after two 'click' events (after two pairs of 'mousedown' and 'mouseup' events)
    //
    // 'blur'           Fires when element has lost focus (does not bubble, 'focusout' follows and does bubble)
    // 'focus'          Fires when element has received focus (does not bubble, 'focusin' follows and does bubble)
    //
    // 'input'          Fires constantly as <input> <select> <textarea> value's are being changed.
    // 'change'         Fires when <input> <select> <textarea> value's are done being modified.
    // 'wheel'          Fires when the user rotates a wheel button on a pointing device
    //
    // 'contextmenu'    Fires when user attempts to open context menu (typically right clicking mouse)
    //
    // 'displayed'      Element style 'display' is restored
    // 'hidden'         Element style 'display' set to 'none'
    //
    // 'destroy'        Element is being destroyed and prepped for garbage collection

    /**
     * Attaches an event listener to the Element.
     * @param {string} event - The event type string.
     * @param {function} callback - The callback function to execute when the event is triggered.
     * @param {Object} options Event listener options. (https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
     * @returns {Element} The Element instance.
     * @memberof Element
     */
    on(event, callback, options = {}) {
        if (typeof options !== 'object') options = {};
        if (typeof callback !== 'function') {
            console.warn(`Element.on(): No callback function provided for '${event}'`);
        } else {
            const eventName = event.toLowerCase();
            const eventHandler = callback.bind(this);
            const dom = this.dom;
            if (options.once || eventName === 'destroy') {
                options.once = true;
                dom.addEventListener(eventName, eventHandler, options);
            } else {
                dom.addEventListener(eventName, eventHandler, options);
                dom.addEventListener('destroy', () => dom.removeEventListener(eventName, eventHandler, options), { once: true });
            }
        }
        return this;
    }

} // end Element

export { Element };

/******************** INTERNAL ********************/

function addToParent(parent, element) {
    if (!parent || !element) return;

    // Check if Element has Parent
    if (element.isElement) {
        // Element is already a child of Parent?
        if (parent.isElement && element.parent === parent) return;
        // Detach from current Parent
        if (element.parent && element.parent.isElement) {
            removeFromParent(element.parent, element, false);
        }
    }

    // Add to HTMLElement
    const parentDom = parent.isElement ? parent.dom : parent;
    const elementDom = element.isElement ? element.dom : element;
    try { if (parentDom) parentDom.appendChild(elementDom); }
    catch (error) { /* FAILED TO ADD */ }

    // Add to Suey Element
    if (element.isElement) {
        // Add to child array if not already there
        let hasIt = false;
        for (const child of parent.children) {
            if (child.dom.isSameNode(element.dom)) { hasIt = true; break; }
        }
        if (!hasIt) parent.children.push(element);
        // Set element parent
        element.parent = parent;
    }

    // Parent Event
    if (elementDom instanceof HTMLElement) {
        elementDom.dispatchEvent(new Event('parent-changed'));
    }
}

/**
 * Destroys and removes all children with optional 'destroy' event on self
 */
function destroyChildren(element, destroySelf = true) {
    if (!element) return;

    // Find HTMLElement
    const dom = element.isElement ? element.dom : element;
    if (!(dom instanceof HTMLElement)) return;

    // Destroy Event
    if (destroySelf) {
        if (!dom.wasDestroyed) {
            dom.dispatchEvent(new Event('destroy'));
            dom.wasDestroyed = true;
        }
    }

    // Remove Children
    for (let i = dom.children.length - 1; i >= 0; i--) {
        const child = dom.children[i];
        destroyChildren(child, true /* destroySelf */);
        try { dom.removeChild(child); } catch (error) { /* FAILED TO REMOVE */ }
    }
    if (dom.suey && dom.suey.isElement) dom.suey.children.length = 0;
}

/**
 * Removes an element from a parent, returns element that was removed
 */
function removeFromParent(parent, element, destroy = true) {
    if (!parent || !element) return undefined;

    // Destroy on Removal?
    if (destroy) destroyChildren(element, true /* destroySelf */);

    // Remove from Suey Element
    if (element.isElement && parent.isElement) {
        for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            if (child.dom.isSameNode(element.dom)) {
                parent.children.splice(i, 1);
                element.parent = undefined;
            }
        }
    }

    // Remove from HTMLElement
    try {
        if (parent.isElement) parent = parent.dom;
        if (parent instanceof HTMLElement) {
            const removed = parent.removeChild(element.isElement ? element.dom : element);
            return (removed && removed.suey) ? removed.suey : removed;
        }
    } catch (error) { /* FAILED TO REMOVE */ }
}
