import { Object2D } from '../Object2D.js';
import { Vector2 } from '../../math/Vector2.js';

/**
 * DOM object transformed using CSS3D to be included in the scene.
 * DomElement's always stay on top or bellow (depending on the DOM parent placement) of everything else.
 * It is not possible to layer these object with regular canvas objects.
 * By default mouse events are not supported for these objects (it does not implement pointer collision checking).
 * Use the DOM events for interaction with these types of objects.
 */
class DomElement extends Object2D {

	constructor(element) {
		super();
		this.type = 'DomElement';

		/** Parent element that contains this HTML Element, if not set auto set to the parent of the canvas. */
		this.parentElement = null;

		/**
		 * HTMLElement contained by this object.
		 * By default it has the pointerEvents style set to none.
		 * In order to use any DOM event with this object first you have to set the dom.style.pointerEvents to 'auto'.
		 */
		this.dom = element ?? document.createElement('div');
		this.dom.style.transformStyle = 'preserve-3d';
		this.dom.style.position = 'absolute';
		this.dom.style.top = '0px';
		this.dom.style.bottom = '0px';
		this.dom.style.transformOrigin = '0px 0px';
		this.dom.style.overflow = 'auto';
		this.dom.style.pointerEvents = 'none';
		this.dom.style.background = 'purple';
		this.dom.style.zIndex = '1';

		/** Size in world coordinates. */
		this.size = new Vector2(100, 100);
	}

    computeBoundingBox() {
		this.boundingBox.min.set(0, 0);
        this.boundingBox.max.copy(this.size);
		return this.boundingBox;
    }

    isInside(point) {
        return this.boundingBox.containsPoint(point);
    }

	/** Automatically attach the DOM object to the DOM tree. */
	onAdd() {
		if (this.parentElement) this.parentElement.appendChild(this.dom);
	}

	/** Automatically remove the DOM object from the DOM tree. */
	onRemove() {
		if (this.parentElement) this.parentElement.removeChild(this.dom);
	}

	transform(renderer) {
		// Verify attached to DOM
		if (this.parentElement == null) {
			this.parentElement = renderer.dom.parentElement;
			this.parentElement.appendChild(this.dom);
		}

		// CSS Transform
		if (this.ignoreViewport) {
			this.dom.style.transform = this.globalMatrix.cssTransform();
		} else {
			const projection = renderer.camera.matrix.clone();
			projection.multiply(this.globalMatrix);
			this.dom.style.transform = projection.cssTransform();
		}

		// Set Size
		this.dom.style.width = `${this.size.x}px`;
		this.dom.style.height = `${this.size.y}px`;

		// Set Visibility
		this.dom.style.display = this.visible ? 'absolute' : 'none';
	}

    onUpdate(renderer) {
        if (this.boundingBox.max.x !== parseFloat(this.dom.style.width) ||
	    	this.boundingBox.max.y !== parseFloat(this.dom.style.height)) {
            this.computeBoundingBox();
        }
    }

}

export { DomElement };
