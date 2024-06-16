import { Matrix2 } from '../../math/Matrix2.js';
import { Object2D } from '../Object2D.js';
import { Vector2 } from '../../math/Vector2.js';

const _projection = new Matrix2();

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

		this.size = new Vector2(100, 100);							// size in world coordinates
		this.parentElement = null;									// auto set to the parent of the canvas

		this.dom = element ?? document.createElement('div');
		this.dom.style.pointerEvents = 'none';						// default 'pointerEvents' style set to none!
		this.dom.style.transformStyle = 'preserve-3d';
		this.dom.style.position = 'absolute';
		this.dom.style.top = '0px';
		this.dom.style.left = '0px';
		this.dom.style.transformOrigin = '0px 0px';
		this.dom.style.overflow = 'none';
		this.dom.style.zIndex = '1';
	}

    computeBoundingBox() {
		this.boundingBox.min.set(0, -this.size.y);
        this.boundingBox.max.set(this.size.x, 0);
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

	onUpdate(renderer) {
		// Frustum Culling
		this.dom.style.display = this.inViewport ? '' : 'none';
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
			_projection.copy(renderer.resetTransform(false /* applyToContext */));
			_projection.multiply(this.globalMatrix);
			this.dom.style.transform = _projection.cssTransform();
		}

		// Set Size
		this.dom.style.width = `${this.size.x}px`;
		this.dom.style.height = `${this.size.y}px`;

		// Set Visibility
		this.dom.style.display = this.visible ? '' : 'none';
	}

	/******************** SETTINGS */

	setSize(width, height) {
		this.size.set(width, height);
		this.computeBoundingBox();
	}

}

export { DomElement };
