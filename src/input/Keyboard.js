import { Key } from './Key.js';

class Keyboard {

    constructor(element) {
        if (!element || !element.dom) {
            console.error(`Keyboard: No element was provided`);
            return;
        }
        const self = this;

        this._keys = {};
        this.keys = {};

        function updateKey(code, action) {
            if (!(code in self._keys)) {
                self._keys[code] = new Key();
                self.keys[code] = new Key();
            }
            self._keys[code].update(action);
        }

        element.on('keydown', (event) => { updateKey(event.code, Key.DOWN); });
        element.on('keyup', (event) => { updateKey(event.code, Key.UP); });
    }

    keyPressed(code) {
        return code in this.keys && this.keys[code].pressed;
    }

    keyJustPressed(code) {
        return code in this.keys && this.keys[code].justPressed;
    }

    keyJustReleased(code) {
        return code in this.keys && this.keys[code].justReleased;
    }

    update() {
        for (const code in this._keys) {
            if (this._keys[code].justPressed && this.keys[code].justPressed) {
                this._keys[code].justPressed = false;
            }
            if (this._keys[code].justReleased && this.keys[code].justReleased) {
                this._keys[code].justReleased = false;
            }
            this.keys[code].set(
                this._keys[code].justPressed,
                this._keys[code].pressed,
                this._keys[code].justReleased
            );
        }
    }

}

export { Keyboard };
