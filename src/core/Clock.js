class Clock {

    #running = false;
    #startTime = 0;
    #elapsedTime = 0;
    #lastChecked = 0;
    #deltaCount = 0;

    #frameTime = 0;
    #frameCount = 0;
    #lastFrameCount = null;

    constructor(autoStart = true, msRewind = 0) {
        if (autoStart) this.start();
        this.#startTime -= msRewind;
        this.#lastChecked -= msRewind;
    }

    start(reset = false) {
        if (reset) this.reset();
        this.#startTime = performance.now();
        this.#lastChecked = this.#startTime;
        this.#running = true;
    }

    stop() {
        this.getDeltaTime();
        this.#running = false;
    }

    toggle() {
        if (this.#running) this.stop();
        else this.start();
    }

    reset() {
        this.#startTime = performance.now();
        this.#lastChecked = this.#startTime;
        this.#elapsedTime = 0;
        this.#deltaCount = 0;
    }

    /** Total time elapsed between start() / reset() and last time getDeltaTime() was called */
    getElapsedTime() {
        return this.#elapsedTime;
    }

    /** Returns delta time (time since last getDeltaTime() call) (in seconds) */
    getDeltaTime() {
        if (!this.#running) {
            this.#lastFrameCount = null;
            return 0;
        }

        // Delta
        const newTime = performance.now();
        const dt = (newTime - this.#lastChecked) / 1000;
        this.#lastChecked = newTime;
        this.#elapsedTime += dt;
        this.#deltaCount++;

        // Framerate
        this.#frameTime += dt;
        this.#frameCount++;
        if (this.#frameTime > 1) {
            this.#lastFrameCount = this.#frameCount;
            this.#frameTime = 0;
            this.#frameCount = 0;
        }

        return dt;
    }

    /** Is Clock running? */
    isRunning() {
        return this.#running;
    }

    isStopped() {
        return !(this.#running);
    }

    /** Total number of times getDeltaTime() has been called since start() or reset() were called */
    count() {
        return this.#deltaCount;
    }

    /** Average delta time since start (in seconds) */
    averageDelta() {
        const frameRate = (this.#lastFrameCount !== null) ? (1 / this.#lastFrameCount) : (this.#frameTime / this.#frameCount);
        return Math.min(1, frameRate);
    }

    fps() {
        return (this.#lastFrameCount !== null) ? this.#lastFrameCount : (this.#frameCount / this.#frameTime);
    }

}

export { Clock };
