import { Key } from './Key.js';

class Keyboard {

    constructor(element) {
        if (!element || !element.isElement) {
            console.error(`Keyboard: No Suey Element was provided`);
            return;
        }

        const self = this;
        this._keys = {};
        this.keys = {};

        function updateKey(keyCode, action) {
            if (!(keyCode in self._keys)) {
            self._keys[keyCode] = new Key();
            self.keys[keyCode] = new Key();
            }
            self._keys[keyCode].update(action);
        }

        element.on('keydown', (event) => { updateKey(event.keyCode, Key.DOWN); });
        element.on('keyup', (event) => { updateKey(event.keyCode, Key.UP); });
    }

    keyPressed(keyCode) {
        return keyCode in this.keys && this.keys[keyCode].pressed;
    }

    keyJustPressed(keyCode) {
        return keyCode in this.keys && this.keys[keyCode].justPressed;
    }

    keyJustReleased(keyCode) {
        return keyCode in this.keys && this.keys[keyCode].justReleased;
    }

    update() {
        for (const keyCode in this._keys) {
            if (this._keys[keyCode].justPressed && this.keys[keyCode].justPressed) {
                this._keys[keyCode].justPressed = false;
            }
            if (this._keys[keyCode].justReleased && this.keys[keyCode].justReleased) {
                this._keys[keyCode].justReleased = false;
            }
            this.keys[keyCode].set(
                this._keys[keyCode].justPressed,
                this._keys[keyCode].pressed,
                this._keys[keyCode].justReleased
            );
        }
    }

}

export { Keyboard };
