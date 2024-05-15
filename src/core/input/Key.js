class Key {

    static DOWN = -1;
    static UP = 1;
    static RESET = 0;

    constructor() {
        this.pressed = false;
        this.justPressed = false;
        this.justReleased = false;
    }

    update(action) {
        this.justPressed = false;
        this.justReleased = false;
        if (action === Key.DOWN) {
            if (this.pressed === false) this.justPressed = true;
            this.pressed = true;
        } else if(action === Key.UP) {
            if (this.pressed) this.justReleased = true;
            this.pressed = false;
        } else if(action === Key.RESET) {
            this.justReleased = false;
            this.justPressed = false;
        }
    }

    set(justPressed, pressed, justReleased) {
        this.justPressed = justPressed;
        this.pressed = pressed;
        this.justReleased = justReleased;
    }

    reset() {
        this.justPressed = false;
        this.pressed = false;
        this.justReleased = false;
    }

}

export {Key};
