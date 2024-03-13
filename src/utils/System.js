// ARRAYS
//  isIterable()            Checks if a javascript object is iterable
//  isObject()              Checks if a variable is an object (and not null / array / function)
//  swapArrayItems()        Swaps two items in an array
// FILE SYSTEM
//  save()                  Saves an URL object to the host system
// PLATFORM
//  detectOS()              Attempts to detect current operating system
//  fullscreen()            Go fullscreen on DOM 'element'
//  metaKeyOS()             Returns character string of shortcut key depending on OS
// SYSTEM
//  sleep()                 Pauses app for specified milliseconds
//  waitForObject()         Wait for getter to return an object that exists, then call a function

class System {

    /******************** ARRAYS ********************/

    /** Checks if a javascript object is iterable */
    static isIterable(obj) {
        return (obj && typeof obj[Symbol.iterator] === 'function');
    }

    /** Checks if a variable is an object (and not null / array / function) */
    static isObject(variable) {
        return (variable && typeof variable === 'object' && !Array.isArray(variable));
    }

    /** Swaps two items in an array */
    static swapArrayItems(array, a, b) {
        array[a] = array.splice(b, 1, array[a])[0];
        return array;
    }

    /******************** FILE SYSTEM ********************/

    static save(url, filename) {
        try {
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || 'data.json';
            link.click(); // link.dispatchEvent(new MouseEvent('click'));
            setTimeout(function() {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 0);
        } catch (error) {
            console.warn(error);
            return;
        }
    }

    static saveBuffer(buffer, filename, optionalType = { type: 'application/octet-stream' }) {
        const url = URL.createObjectURL(new Blob([ buffer ], { type: optionalType }));
        System.save(url, filename);
    }

    static saveImage(imageUrl, filename) {
        System.save(imageUrl, filename);
    }

    static saveString(text, filename) {
        const url = URL.createObjectURL(new Blob([ text ], { type: 'text/plain' }));
        System.save(url, filename);
    }

    /******************** PLATFORM ********************/

    /** Attempts to detect current operating system */
    static detectOS() {
        const systems = {
            Android:    [ 'android' ],
            iOS:        [ 'iphone', 'ipad', 'ipod', 'ios' ],
            Linux:      [ 'linux', 'x11', 'wayland' ],
            MacOS:      [ 'mac', 'darwin', 'osx', 'os x' ],
            Windows:    [ 'win' ],
        }

        const userAgent = window.navigator.userAgent;
        const userAgentData = window.navigator.userAgentData;
        const platform = ((userAgentData) ? userAgentData.platform : userAgent).toLowerCase();

        for (const key in systems) {
            for (const os of systems[key]) {
                if (platform.indexOf(os) !== -1) return key;
            }
        }

        return 'Unknown OS';
    }

    /** Go fullscreen on DOM 'element' */
    static fullscreen(element) {
        const isFullscreen =
            document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement;

        if (isFullscreen) {
            const el = document;
            const cancelMethod = el.cancelFullScreen || el.exitFullscreen || el.webkitCancelFullScreen || el.webkitExitFullscreen || el.mozCancelFullScreen;
            cancelMethod.call(el);
        } else {
            const el = element ?? document.body;
            const requestMethod = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen;
            requestMethod.call(el);
        }
    }

    /** Returns character string of shortcut key depending on OS */
    static metaKeyOS() {
        const system = System.detectOS();
        if (system === 'Mac') {
            return '⌘';
        } else {
            return '⌃'; /* 'Ctrl' */
        }
    }

    /******************** SYSTEM ********************/

    /** Pauses app for specified milliseconds */
    static sleep(ms) {
        const beginTime = Date.now();
        let endTime = beginTime;
        while (endTime - beginTime < ms) {
            endTime = Date.now();
        }
    }

    /** Wait for 'getter' to return an object that exists, then call a function */
    static waitForObject(
        operationName = '',
        getter,
        callback,
        checkFrequencyMs = 100,
        timeoutMs = -1,
        alertMs = 5000,
    ) {
        let startTimeMs = Date.now();
        let alertTimeMs = Date.now();

        function loopSearch() {
            if (timeoutMs > 0 && (Date.now() - startTimeMs > timeoutMs)) {
                console.info(`Operation: ${operationName} timed out`);
                return;
            }
            if ((alertMs > 0) && Date.now() - alertTimeMs > alertMs) {
                console.info(`Still waiting on operation: ${operationName}`);
                alertTimeMs = Date.now();
            }

            if (!getter || typeof getter !== 'function' || getter()) {
                if (callback && typeof callback === 'function') callback();
                return;
            } else {
                setTimeout(loopSearch, checkFrequencyMs);
            }
        }

        loopSearch();
    }

}

export { System };
