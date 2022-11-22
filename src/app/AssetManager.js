/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
// @source      https://github.com/onsightengine/onsight
//
///////////////////////////////////////////////////////////////////////////////////*/

import * as THREE from 'three';

import { mergeBufferGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

import { Maths } from '../core/Maths.js';
import { Strings } from '../core/Strings.js';
import { System } from '../core/System.js';

/////////////////////////////////////////////////////////////////////////////////////
/////	Assets
/////////////////////////////////////////////////////////////////////////////////////

// Assets, Scripts
let scripts = {};

// Assets, Geometry
let shapes = {};
let geometries = {};

// Assets, Material
let images = {};
let textures = {};
let materials = {};

// Assets, Other
let animations = {};
let skeletons = {};

/////////////////////////////////////////////////////////////////////////////////////
/////	Asset Manager
/////////////////////////////////////////////////////////////////////////////////////

const _textureCache = {};
const _textureLoader = new THREE.TextureLoader();

class AssetManager {

    static getLibrary(type) {
        switch (type) {
            case 'script': return scripts;
            case 'shape': return shapes;
            case 'geometry': return geometries;
            case 'image': return images;
            case 'texture': return textures;
            case 'material': return materials;
            case 'animation': return animations;
            case 'skeleton': return skeletons;
        }
        console.warn(`AssetManager.getLibrary: Unknown asset ${type} type`);
        return null;
    }

    //////////////////// Generic

    static addAsset(type, asset) {
        switch (type) {
            case 'geometry': return AssetManager.addGeometry(asset);
            case 'material': return AssetManager.addMaterial(asset);
            case 'texture': return AssetManager.addTexture(asset);
            default: console.warn(`AssetManager.addAsset: Type ${type} not implemented`);
        }
    }

    static getAsset(type, uuid) {
        switch (type) {
            case 'geometry': return AssetManager.getGeometry(uuid);
            case 'material': return AssetManager.getMaterial(uuid);
            case 'texture': return AssetManager.getTexture(uuid);
            default: console.warn(`AssetManager.getAsset: Type ${type} not implemented`);
        }
    }

    static removeAsset(type, asset, dispose = true) {
        switch (type) {
            case 'geometry': return AssetManager.removeGeometry(asset, dispose);
            case 'material': return AssetManager.removeMaterial(asset, dispose);
            case 'texture': return AssetManager.removeTexture(asset, dispose);
            default: console.warn(`AssetManager.removeAsset: Type ${type} not implemented`);
        }
    }

    //////////////////// Geometry

    static addGeometry(geometry) {
		if (geometry && geometry.isBufferGeometry) {
            // Ensure geometry has a name
            if (! geometry.name || geometry.name === '') {
                geometry.name = geometry.constructor.name;
            }

            // Force 'BufferGeometry' type (strip ExtrudeGeometry, TextGeometry, etc...)
            const bufferGeometry = mergeBufferGeometries([ geometry ]);
            bufferGeometry.name = geometry.name;
            bufferGeometry.uuid = geometry.uuid;
            geometry.dispose();
            geometry = bufferGeometry;

            // Add to 'geometries'
            geometries[geometry.uuid] = geometry;
        }
		return geometry;
	}

	static getGeometry(uuid) {
        if (uuid && uuid.isBufferGeometry) uuid = uuid.uuid;
		return geometries[uuid];
	}

	static removeGeometry(geometry, dispose = true) {
		if (geometries[geometry.uuid]) {
			if (dispose) geometries[geometry.uuid].dispose();
			delete geometries[geometry.uuid];
		}
	}

    //////////////////// Material

	static addMaterial(material) {
		if (material && material.isMaterial) {
		    let materialArray = (Array.isArray(material)) ? material : [ material ];
            for (let i = 0; i < materialArray.length; i++) {
                materials[material.uuid] = materialArray[i];
            }
        }
		return material;
	}

	static getMaterial(uuid) {
        if (uuid && uuid.isMaterial) uuid = uuid.uuid;
		return materials[uuid];
	}

	static removeMaterial(material, dispose = true) {
		if (materials[material.uuid]) {
			if (dispose) materials[material.uuid].dispose();
			delete materials[material.uuid];
		}
	}

    //////////////////// Texture

    static loadTexture(url, onLoad = undefined) {
        if (! url || url === '') return null;

        // Check if trying to add an Image already in AssetManager
        let resolvedUrl = THREE.DefaultLoadingManager.resolveURL(url);
        if (_textureCache[resolvedUrl]) {
            console.log(`AssetManager.loadTexture: Duplicate image!`);
            return _textureCache[resolvedUrl];
        }

        // Load Texture
		const texture = _textureLoader.load(url, onTextureLoaded, onTextureLoadError);
        _textureCache[resolvedUrl] = texture;

        function onTextureLoaded(newTexture) {
            // Name from source filename
            newTexture.name = Strings.nameFromUrl(newTexture.image.src);

            // !!!!! DEBUG: Pixel Access
            // const canvas = document.createElement('canvas');
            // canvas.width = newTexture.image.width;
            // canvas.height = newTexture.image.height;
            // const context = canvas.getContext('2d');
            // context.drawImage(newTexture.image, 0, 0);
            // const data = context.getImageData(0, 0, canvas.width, canvas.height);
            // console.info(data);

            // // Texture Properties
            // newTexture.encoding = THREE.sRGBEncoding;
            // newTexture.magFilter = THREE.NearestFilter;
            // newTexture.minFilter = THREE.NearestFilter;
            newTexture.premultiplyAlpha = true;
            newTexture.wrapS = THREE.RepeatWrapping;
            newTexture.wrapT = THREE.RepeatWrapping;

            // System.waitForObject('AssetManager.loadTexture: Waiting on renderer', () => return window.getRenderer, () => {
            //     // Reduces bluriness of mipmaps
            //     const maxAnisotropy = window.getRenderer().capabilities.getMaxAnisotropy(); /* Mac M1 === 16 */
            //     newTexture.anisotropy = maxAnisotropy;
            //     newTexture.mipmaps = [];
            //     newTexture.generateMipmaps = true;
            // });

            // On Load Callback
            if (onLoad && typeof onLoad === 'function') onLoad(newTexture);
        }

        function onTextureLoadError() {
            if (_textureCache[resolvedUrl] && _textureCache[resolvedUrl].isTexture) {
                _textureCache[resolvedUrl].dispose();
            }
            delete _textureCache[resolvedUrl];
        }

		return texture;
    }

	static addTexture(texture) {
        if (texture && texture.isTexture) {
            textures[texture.uuid] = texture;
        }
		return texture;
	}

	static getTexture(uuid) {
        if (uuid && uuid.isTexture) uuid = uuid.uuid;
		return textures[uuid];
	}

	static removeTexture(texture, dispose = true) {
		if (textures[texture.uuid]) {
            for (let url in _textureCache) {
                if (_textureCache[url] && _textureCache[url].isTexture && _textureCache[url].uuid === texture.uuid) {
                    delete _textureCache[url];
                }
            }
			if (dispose) textures[texture.uuid].dispose();
			delete textures[texture.uuid];
		}
	}

    //////////////////// JSON

    static clear() {

        function clearLibrary(library) {
            for (let uuid in library) {
                const element = library[uuid];
                if (element && element.dispose && typeof element.dispose === 'function') element.dispose();
                delete library[uuid];
            }
        }

        clearLibrary(materials);
        clearLibrary(textures);
        clearLibrary(images);
        clearLibrary(geometries);
        clearLibrary(shapes);
        clearLibrary(animations);

    }

    static fromJSON(json) {

        // Clear Assets
        AssetManager.clear()

        // Load Assets
		const objectLoader = new THREE.ObjectLoader();
		animations = objectLoader.parseAnimations(json.animations);
		shapes = objectLoader.parseShapes(json.shapes);
		geometries = objectLoader.parseGeometries(json.geometries, shapes);
		images = objectLoader.parseImages(json.images);
		textures = objectLoader.parseTextures(json.textures, images);
		materials = objectLoader.parseMaterials(json.materials, textures);

    }

    static toJSON(meta) {

        const json = {};

        if (! meta) meta = {};
        if (! meta.shapes) meta.shapes = {};
        if (! meta.geometries) meta.geometries = {};
        if (! meta.images) meta.images = {};
        if (! meta.textures) meta.textures = {};
        if (! meta.materials) meta.materials = {};
        if (! meta.animations) meta.animations = {};
        if (! meta.skeletons) meta.skeletons = {};

        const stopRoot = {
            images: {},
            textures: {},
            materials: {},
        };

        // Geometries
        for (let uuid in geometries) {
            const geometry = geometries[uuid];
            if (! meta.geometries[geometry.uuid]) meta.geometries[geometry.uuid] = geometry.toJSON(meta);

            // Shapes
            if (geometry.parameters && geometry.parameters.shapes) {
                let shapes = geometry.parameters.shapes;
                if (Array.isArray(shapes) !== true) shapes = [ shapes ];
                for (let i = 0, l = shapes.length; i < l; i++) {
                    const shape = shapes[i];
                    if (! meta.shapes[shape.uuid]) meta.shapes[shape.uuid] = shape.toJSON(meta);
                }
            }
        }

        // Materials
        for (let uuid in materials) {
            const material = materials[uuid];
            if (! meta.materials[material.uuid]) meta.materials[material.uuid] = material.toJSON(stopRoot);
        }

        // Textures
        for (let uuid in textures) {
            const texture = textures[uuid];
            if (! meta.textures[texture.uuid]) meta.textures[texture.uuid] = texture.toJSON(meta);
        }

        // Add 'meta' caches to 'json' as arrays
        for (const library in meta) {
            const valueArray = [];
            for (const key in meta[library]) {
                const data = meta[library][key];
                delete data.metadata;
                valueArray.push(data);
            }
            if (valueArray.length > 0) json[library] = valueArray;
        }

        return json;
    }

}

// Exports

export { AssetManager };