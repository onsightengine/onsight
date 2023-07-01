const _timer = (performance == null || typeof performance === 'undefined') ? Date : performance;

class Clock {

	#running = false;
	#startTime = 0;
	#elapsedTime = 0;
	#lastChecked = 0;
	#deltaCount = 0;

	#frameTime = 0;
	#frameCount = 0;
	#lastFrameCount = 0;

	constructor(autoStart = true, msRewind = 0) {
		if (autoStart) this.start();
		this.#startTime -= msRewind;
		this.#lastChecked -= msRewind;
	}

	start() {
		this.#startTime = _timer.now();
		this.#lastChecked = this.#startTime;
		this.#running = true;
	}

	stop() {
		this.getDeltaTime();
		this.#running = false;
	}

	reset() {
		this.#startTime = _timer.now();
		this.#lastChecked = this.#startTime;
		this.#elapsedTime = 0;
		this.#deltaCount = 0;
	}

	/** Total time elapsed between start() / reset() and last time getDeltaTime() was called */
	getElapsedTime() {
		return this.#elapsedTime;
	}

	/** Returns delta time (time since last getDeltaTime() call) */
	getDeltaTime() {
		if (!this.#running) {
			this.#lastFrameCount = 0;
			return 0;
		}

		// Delta
        const newTime = _timer.now();
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

	/** Is clock running? */
	isRunning() {
		return this.#running;
	}

	/** Total number of times getDeltaTime() has been called since start() or reset() were called */
	count() {
		return this.#deltaCount;
	}

	/** Average delta time since start (in ms) */
	averageDelta() {
		const frameRate = 1 / this.#lastFrameCount;
		return Math.min(1, frameRate);
	}

	fps() {
		return this.#lastFrameCount;
	}

}

export { Clock };
