/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Studios
// @source      https://github.com/scidian/onsight-engine
//
///////////////////////////////////////////////////////////////////////////////////*/

import * as THREE from 'three';

import { mergeBufferGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

import { Strings } from '../sys/Strings.js';

///// Local Variables

const _assets = {};
const _scripts = {};

const _textureCache = {};
const _textureLoader = new THREE.TextureLoader();

/////////////////////////////////////////////////////////////////////////////////////
/////	Asset Manager
/////////////////////////////////////////////////////////////////////////////////////

class AssetManager {

    static assetType(asset) {
        if (asset.isBufferGeometry) return 'geometry';
        if (asset.isMaterial) return 'material';
        if (asset.isTexture) return 'texture';
        return 'asset';
    }

    static getLibrary(type) {
        const library = [];
        for (const [uuid, asset] of Object.entries(_assets)) {
            if (AssetManager.assetType(asset) === type) library.push(asset);
        }
        return library;
    }

    //////////////////// Add / Get / Remove

    static addAsset(assetOrArray) {
        if (! assetOrArray) return;

        const assetArray = (Array.isArray(assetOrArray)) ? assetOrArray : [ assetOrArray ];
        for (let i = 0; i < assetArray.length; i++) {
            let asset = assetArray[i];

            // Process Geometry
            if (asset.isBufferGeometry) {
                // Ensure geometry has a name
                if (! asset.name || asset.name === '') asset.name = asset.constructor.name;

                // Force 'BufferGeometry' type (strip ExtrudeGeometry, TextGeometry, etc...)
                if (asset.constructor.name !== 'BufferGeometry') {
                    // // DEBUG: Show fancy geometry type
                    // console.log(`Trimming ${asset.constructor.name}`);

                    // Covert to BufferGeometry
                    const bufferGeometry = mergeBufferGeometries([ asset ]);
                    bufferGeometry.name = asset.name;
                    bufferGeometry.uuid = asset.uuid;
                    if (asset.dispose) asset.dispose();
                    asset = bufferGeometry;
                }
            }

            // Add Asset
            _assets[asset.uuid] = asset;
        }

        return assetOrArray;
    }

    static getAsset(uuid) {
        if (uuid && uuid.uuid) uuid = uuid.uuid;
        return _assets[uuid];
    }

    static removeAsset(assetOrArray, dispose = true) {
        if (! assetOrArray) return;

        const assetArray = (Array.isArray(assetOrArray)) ? assetOrArray : [ assetOrArray ];
        for (let i = 0; i < assetArray.length; i++) {
            const asset = assetArray[i];

            // Check if 'assets' has asset
            if (_assets[asset.uuid]) {
                // Remove textures from cache
                if (asset.isTexture) {
                    for (let url in _textureCache) {
                        if (_textureCache[url].uuid === asset.uuid) delete _textureCache[url];
                    }
                }

                // Dispose, Remove
                if (dispose && asset.dispose) asset.dispose();
                delete _assets[asset.uuid];
            }
        }
    }

    //////////////////// Texture Loader

    static loadTexture(url, onLoad = undefined) {
        if (! url || url === '') return null;

        // Check if trying to add an Image already in AssetManager
        const resolvedUrl = THREE.DefaultLoadingManager.resolveURL(url);
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

            // // DEBUG: Pixel Access
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

    //////////////////// JSON

    static clear() {
        for (let uuid in _assets) {
            AssetManager.removeAsset(_assets[uuid], true);
        }
    }

    static fromJSON(json) {

        // Clear Assets
        AssetManager.clear()

        // Add to Assets
        function addLibraryToAssets(library) {
            for (const [uuid, asset] of Object.entries(library)) {
                AssetManager.addAsset(asset);
            }
        }

        // Load Assets
		const objectLoader = new THREE.ObjectLoader();
		const animations = objectLoader.parseAnimations(json.animations);
		const shapes = objectLoader.parseShapes(json.shapes);
		const geometries = objectLoader.parseGeometries(json.geometries, shapes);
		const images = objectLoader.parseImages(json.images);
		const textures = objectLoader.parseTextures(json.textures, images);
		const materials = objectLoader.parseMaterials(json.materials, textures);

        addLibraryToAssets(animations);
        addLibraryToAssets(shapes);
        addLibraryToAssets(geometries);
        addLibraryToAssets(images);
        addLibraryToAssets(textures);
        addLibraryToAssets(materials);

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
        const geometries = AssetManager.getLibrary('geometry');
        for (let i = 0; i < geometries.length; i++) {
            const geometry = geometries[i];
            if (! meta.geometries[geometry.uuid]) meta.geometries[geometry.uuid] = geometry.toJSON(meta);

            // Shapes
            if (geometry.parameters && geometry.parameters.shapes) {
                const shapes = geometry.parameters.shapes;
                if (Array.isArray(shapes) !== true) shapes = [ shapes ];
                for (let i = 0, l = shapes.length; i < l; i++) {
                    const shape = shapes[i];
                    if (! meta.shapes[shape.uuid]) meta.shapes[shape.uuid] = shape.toJSON(meta);
                }
            }
        }

        // Materials
        const materials = AssetManager.getLibrary('material');
        for (let i = 0; i < materials.length; i++) {
            const material = materials[i];
            if (! meta.materials[material.uuid]) meta.materials[material.uuid] = material.toJSON(stopRoot);
        }

        // Textures
        const textures = AssetManager.getLibrary('texture');
        for (let i = 0; i < textures.length; i++) {
            const texture = textures[i];
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
