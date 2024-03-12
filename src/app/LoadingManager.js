// https://github.com/mrdoob/three.js/blob/dev/src/loaders/LoadingManager.js

class LoadingManager {

	constructor(onLoad, onProgress, onError) {
		const self = this;

		let isLoading = false;
		let itemsLoaded = 0;
		let itemsTotal = 0;
		let urlModifier = undefined;
		const handlers = [];

		this.onStart = undefined;
		this.onLoad = onLoad;
		this.onProgress = onProgress;
		this.onError = onError;

		this.itemStart = function(url) {
			itemsTotal++;
			if (!isLoading) {
				if (typeof self.onStart === 'function') self.onStart(url, itemsLoaded, itemsTotal);
			}
			isLoading = true;
		};

		this.itemEnd = function(url) {
			itemsLoaded++;
			if (typeof self.onProgress === 'function') self.onProgress(url, itemsLoaded, itemsTotal);
			if (itemsLoaded === itemsTotal) {
				isLoading = false;
				if (typeof self.onLoad === 'function') self.onLoad();
			}
		};

		this.itemError = function (url) {
			if (typeof self.onError === 'function') self.onError(url);
		};

		this.resolveURL = function (url) {
			if (urlModifier) return urlModifier(url);
			return url;
		};

		this.setURLModifier = function (transform) {
			urlModifier = transform;
			return this;
		};

		this.addHandler = function (regex, loader) {
			handlers.push(regex, loader);
			return this;
		};

		this.removeHandler = function (regex) {
			const index = handlers.indexOf(regex);
			if (index !== -1) handlers.splice(index, 2);
			return this;
		};

		this.getHandler = function (file) {
			for (let i = 0, l = handlers.length; i < l; i += 2) {
				const regex = handlers[i];
				const loader = handlers[i + 1];
				if (regex.global) regex.lastIndex = 0;
				if (regex.test(file)) return loader;
			}
			return null;
		};

	}

}

const DefaultLoadingManager = new LoadingManager();

export { DefaultLoadingManager, LoadingManager };
