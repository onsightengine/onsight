/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Studios
// @source      https://github.com/onsightengine
//
///////////////////////////////////////////////////////////////////////////////////*/
//
//  Array Functions
//      arrayFromArguments      Converts argument list to Array
//      isIterable              Checks if a javascript object is iterable
//      isObject                Checks if a variable is an object (and not null / array / function)
//
//  File System Functions
//      save                    Saves an URL object to the host system
//
//  OS Functions
//      detectOS                Attempts to detect current operating system
//      fullscreen              Go fullscreen on DOM 'element'
//      metaKeyOS               Returns character string of shortcut key depending on OS
//
//  System Functions
//      sleep                   Pauses app for specified milliseconds
//      waitForObject           Wait for getter to return an object that exists, then call a function
//
//  ------------------------------------------------------
//
//  Unicode Symbols
//      Alt (Option)    ⌥ OR ⎇     Apple       
//      Ctrl (Control)  ⌃
//      Cmd (Command)   ⌘
//      Shift           ⇧           Space      ' '  &nbsp;
//      Caps Lock       ⇪           Degrees     °   &deg;
//      Fn                          Search      ⌕
//      Escape          ⎋           Target      ⌖
//      Delete          ⌦           Touch       ⍝
//      Backspace       ⌫
//      Enter           ↵
//
/////////////////////////////////////////////////////////////////////////////////////

class System {

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Array Functions
    ///////////////

    /** Returns argument list as array, or if array was passed as argument, returns array */
    static arrayFromArguments() {
        if (arguments.length === 1 && Array.isArray(arguments[0])) {
            return arguments[0];
        } else {
		    return Array.from(arguments);
        }
    }

    /** Checks if a javascript object is iterable */
    static isIterable(obj) {
        if (obj == null) return false;
        return typeof obj[Symbol.iterator] === 'function';
    }

    /** Checks if a variable is an object (and not null / array / function) */
    static isObject(variable) {
        return (typeof variable === 'object' && ! Array.isArray(variable) && variable !== null);
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////   File System
    ///////////////

    static save(url, filename) {
        try {
            const link = document.createElement('a');
            document.body.appendChild(link);                    // Firefox requires link to be in body
            link.href = url;
            link.download = filename || 'data.json';
            link.click(); // link.dispatchEvent(new MouseEvent('click'));
            setTimeout(function() {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 0);
        } catch (e) {
            console.warn(e);
            return;
        }
    }

    static saveBuffer(buffer, filename, optionalType = { type: 'application/octet-stream' }) {
        let url = URL.createObjectURL(new Blob([ buffer ], { type: optionalType }));
        System.save(url, filename);
    }

    static saveImage(imageUrl, filename) {
        System.save(imageUrl, filename);
    }

    static saveString(text, filename) {
        let url = URL.createObjectURL(new Blob([ text ], { type: 'text/plain' }));
        System.save(url, filename);
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////   OS (Operating System)
    ///////////////

    /** Attempts to detect current operating system */
    static detectOS() {
        let systems = {
            Android:    [ 'android' ],
            iOS:        [ 'iphone', 'ipad', 'ipod', 'ios' ],
            Linux:      [ 'linux', 'x11', 'wayland' ],
            Mac:        [ 'mac', 'darwin', 'osx', 'os x' ],
            Win:        [ 'win' ],
        }

        let userAgent = window.navigator.userAgent;                 // String
        let userAgentData = window.navigator.userAgentData;         // Object, not implemented in Safari (3/11/22)

        let platform = (userAgentData) ? userAgentData.platform : userAgent;
        platform = platform.toLowerCase();

        for (let key in systems) {
            for (let os of systems[key]) {
                if (platform.indexOf(os) !== -1) return key;
            }
        }

        return 'Unknown OS';
    }

    /** Go fullscreen on DOM 'element' */
    static fullscreen(element) {
        let isFullscreen =
            document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement;

        if (isFullscreen) {
            let el = document;
            let cancelMethod = el.cancelFullScreen || el.exitFullscreen || el.webkitCancelFullScreen || el.webkitExitFullscreen || el.mozCancelFullScreen;
            cancelMethod.call(el);
        } else {
            let el = element ?? document.body;
            let requestMethod = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen;
            requestMethod.call(el);
        }
    }

    /** Returns character string of shortcut key depending on OS */
    static metaKeyOS() {
        let system = System.detectOS();
        if (system === 'Mac') {
            return '⌘';
        } else {
            return '⌃'; /* 'Ctrl' */
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////   System
    ///////////////

    /** Pauses app for specified milliseconds */
    static sleep(ms) {
        const beginTime = Date.now();
        let endTime = beginTime;
        while (endTime - beginTime < ms) {
            endTime = Date.now();
        }
    }

    /** Wait for 'getter' to return an object that exists, then call a function */
    static waitForObject(operationName, getter, callback, checkFrequencyMs = 1000, timeoutMs = false, alertMs = 5000) {
        let startTimeMs = Date.now();
        let alertTimeMs = Date.now();
        (function loopSearch() {
            if (alertMs && Date.now() - alertTimeMs > alertMs) {
                console.info(`Still waiting on operation: ${operationName}`);
                alertTimeMs = Date.now();
            }

            if (getter() !== undefined && getter() !== null) {
                callback();
                return;
            } else {
                setTimeout(function() {
                    if (timeoutMs && Date.now() - startTimeMs > timeoutMs) return;
                    loopSearch();
                }, checkFrequencyMs);
            }
        })();
    }

}

export { System };
