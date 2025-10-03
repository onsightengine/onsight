import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

import { Camera3D } from '../project/world3d/Camera3D.js';
import { Entity3D } from '../project/world3d/Entity3D.js';
import { Light3D } from '../project/world3d/Light3D.js';
import { Stage3D } from '../project/world3d/Stage3D.js';
import { World3D } from '../project/world3d/World3D.js';

import { Palette } from '../assets/Palette.js';
import { Script } from '../assets/Script.js';
import { Strings } from '../utils/Strings.js';

const _assets = {};
const _textureCache = {};
const _textureLoader = new THREE.TextureLoader();

class AssetManager {

    /******************** MANAGER */

    static clear() {
        for (const uuid in _assets) {
            const asset = _assets[uuid];
            if (asset.isBuiltIn) continue; /* keep built-in assets */
            AssetManager.removeAsset(_assets[uuid], true);
        }
    }

    /******************** ASSETS */

    static checkType(asset) {
        if (!asset) return undefined;
        if (asset.isBufferGeometry) return 'geometry';
        if (asset.type === 'Shape') return 'shape';
        if (asset.isMaterial) return 'material';
        if (asset.isPalette) return 'palette';
        if (asset.isScript) return 'script';
        if (asset.isTexture) return 'texture';
        if (asset.isEntity) return 'prefab';
        return 'asset';
    }

    static addAsset(asset) {
        const assets = Array.isArray(asset) ? asset : [...arguments];
        let returnAsset = undefined;
        for (let i = 0; i < assets.length; i++) {
            let asset = assets[i];

            // Checks
            if (!asset || !asset.uuid) continue;
            const type = AssetManager.checkType(asset);
            if (type === undefined) continue;

            // Ensure asset has a Name
            if (!asset.name || asset.name === '') asset.name = asset.constructor.name;

            // Geometry: Force 'BufferGeometry' type (strip ExtrudeGeometry, TextGeometry, etc...)
            if (type === 'geometry' && asset.constructor.name !== 'BufferGeometry') {
                // // DEBUG: Show fancy geometry type
                // console.log(`Trimming ${asset.constructor.name}`);

                // Covert to BufferGeometry
                const bufferGeometry = mergeGeometries([ asset ]);
                bufferGeometry.name = asset.name;
                bufferGeometry.uuid = asset.uuid;
                if (typeof asset.dispose === 'function') asset.dispose();
                asset = bufferGeometry;
            }

            // Flag Entity Assets as 'Prefab'
            if (asset.isEntity) {
                asset.isPrefab = true;
            }

            // Types: [ Script, Prefab ]
            if (type === 'script' || type === 'prefab') {
                // Ensure asset has a category assigned
                if (!asset.category || asset.category === '') asset.category = 'unknown';
            }

            // Add Asset
            _assets[asset.uuid] = asset;
            if (returnAsset === undefined) returnAsset = asset;
        }
        return returnAsset;
    }

    static getAsset(uuid) {
        if (uuid && uuid.uuid) uuid = uuid.uuid;
        return _assets[uuid];
    }

    /** Retrieve a collection of Asset sub types by Category */
    static getLibrary(type, category) {
        const library = [];
        for (const [uuid, asset] of Object.entries(_assets)) {
            if (type && AssetManager.checkType(asset) !== type) continue;
            if (category == undefined || (asset.category && asset.category === category)) {
                library.push(asset);
            }
        }
        return library;
    }

    static removeAsset(asset, dispose = true) {
        const assets = Array.isArray(asset) ? asset : [ asset ];
        for (const asset of assets) {
            if (!asset || !asset.uuid) continue;

            // Remove if present
            if (_assets[asset.uuid]) {
                // Remove textures from cache
                if (asset.isTexture) {
                    for (const url in _textureCache) {
                        if (_textureCache[url].uuid === asset.uuid) delete _textureCache[url];
                    }
                }
                // Dispose, Remove
                if (dispose && typeof asset.dispose === 'function') asset.dispose();
                delete _assets[asset.uuid];
            }
        }
    }

    /******************** TEXTURE LOADER */

    static loadTexture(url, onLoad = undefined) {
        if (!url || url === '') return null;

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
            // newTexture.colorSpace = THREE.SRGBColorSpace;
            // newTexture.magFilter = THREE.NearestFilter;
            // newTexture.minFilter = THREE.NearestFilter;
            newTexture.premultiplyAlpha = true;
            newTexture.wrapS = THREE.RepeatWrapping;
            newTexture.wrapT = THREE.RepeatWrapping;

            // // Reduces bluriness of mipmaps
            // const maxAnisotropy = RenderUtils.offScreenRenderer().capabilities.getMaxAnisotropy(); /* Mac M1 === 16 */
            // newTexture.anisotropy = maxAnisotropy;
            // newTexture.mipmaps = [];
            // newTexture.generateMipmaps = true;

            // Needs Update
            newTexture.needsUpdate = true;

            // On Load Callback (editor expects texture has not been added yet!)
            if (onLoad && typeof onLoad === 'function') onLoad(newTexture);

            // Add to AssetManager on finished loading...
            AssetManager.addAsset(newTexture);

            // Signals (finished loading)
            if (window.signals && signals.assetChanged) signals.assetChanged.dispatch('texture', newTexture);
        }

        function onTextureLoadError() {
            if (_textureCache[resolvedUrl] && _textureCache[resolvedUrl].isTexture) {
                _textureCache[resolvedUrl].dispose();
            }
            delete _textureCache[resolvedUrl];
        }

        return texture;
    }

    /******************** JSON */

    static fromJSON(json, onLoad = () => {}) {

        // Clear Assets
        AssetManager.clear()

        // Add to Assets
        function addLibraryToAssets(library) {
            for (const [uuid, asset] of Object.entries(library)) {
                AssetManager.addAsset(asset);
            }
        }

        /***** ONSIGHT *****/

        // Load Palettes
        const palettes = {};
        if (json.palettes) {
            for (const paletteData of json.palettes) {
                const palette = new Palette().fromJSON(paletteData);
                palettes[palette.uuid] = palette;
            }
            addLibraryToAssets(palettes);
        }

        // Load Prefabs
        const prefabs = {};
        if (json.prefabs) {
            for (const prefabData of json.prefabs) {
                const prefab = new (eval(prefabData.object.type))();
                prefab.fromJSON(prefabData);
                prefabs[prefab.uuid] = prefab;
            }
            addLibraryToAssets(prefabs);
        }

        // Load Scripts
        const scripts = {};
        if (json.scripts) {
            for (const scriptData of json.scripts) {
                const script = new Script().fromJSON(scriptData);
                scripts[script.uuid] = script;
            }
            addLibraryToAssets(scripts);
        }

        /***** THREE *****/

        // Load Assets
        const manager = new THREE.LoadingManager(onLoad);
        const objectLoader = new THREE.ObjectLoader(manager);
        const animations = objectLoader.parseAnimations(json.animations);
        const shapes = objectLoader.parseShapes(json.shapes);
        const geometries = objectLoader.parseGeometries(json.geometries, {});
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

        if (!meta) meta = {};
        if (!meta.palettes) meta.palettes = {};
        if (!meta.prefabs) meta.prefabs = {};
        if (!meta.scripts) meta.scripts = {};
        if (!meta.shapes) meta.shapes = {};
        if (!meta.geometries) meta.geometries = {};
        if (!meta.images) meta.images = {};
        if (!meta.textures) meta.textures = {};
        if (!meta.materials) meta.materials = {};
        if (!meta.animations) meta.animations = {};
        if (!meta.skeletons) meta.skeletons = {};

        const stopRoot = {
            images: {},
            textures: {},
            materials: {},
        };

        /***** ONSIGHT *****/

        // Save Palettes
        const palettes = AssetManager.getLibrary('palette');
        for (const palette of palettes) {
            if (!palette.uuid || meta.palettes[palette.uuid]) continue;
            meta.palettes[palette.uuid] = palette.toJSON();
        }

        // Save Prefabs
        const prefabs = AssetManager.getLibrary('prefab');
        for (const prefab of prefabs) {
            if (!prefab.uuid || meta.prefabs[prefab.uuid]) continue;
            if (prefab.isBuiltIn) continue;
            meta.prefabs[prefab.uuid] = prefab.toJSON();
        }

        // Save Scripts
        const scripts = AssetManager.getLibrary('script');
        for (const script of scripts) {
            if (!script.uuid || meta.scripts[script.uuid]) continue;
            meta.scripts[script.uuid] = script.toJSON();
        }

        /***** THREE *****/

        // Save Geometries
        const geometries = AssetManager.getLibrary('geometry');
        for (const geometry of geometries) {
            if (!geometry.uuid || meta.geometries[geometry.uuid]) continue;
            meta.geometries[geometry.uuid] = geometry.toJSON(meta);

            // // Save Shapes
            // if (geometry.parameters && geometry.parameters.shapes) {
            //     const shapes = geometry.parameters.shapes;
            //     if (Array.isArray(shapes) !== true) shapes = [ shapes ];
            //     for (let i = 0, l = shapes.length; i < l; i++) {
            //         const shape = shapes[i];
            //         if (!meta.shapes[shape.uuid]) meta.shapes[shape.uuid] = shape.toJSON(meta);
            //     }
            // }
        }

        // Save Materials
        const materials = AssetManager.getLibrary('material');
        for (const material of materials) {
            if (!material.uuid || meta.materials[material.uuid]) continue;
            meta.materials[material.uuid] = material.toJSON(stopRoot);
        }

        // Save Shapes
        const shapes = AssetManager.getLibrary('shape');
        for (const shape of shapes) {
            if (!shape.uuid || meta.shapes[shape.uuid]) continue;
            meta.shapes[shape.uuid] = shape.toJSON(stopRoot);
        }

        // Save Textures
        const textures = AssetManager.getLibrary('texture');
        for (const texture of textures) {
            if (!texture.uuid || meta.textures[texture.uuid]) continue
            meta.textures[texture.uuid] = texture.toJSON(meta);
        }

        // Add 'meta' caches to 'json' as arrays
        for (const library in meta) {
            const valueArray = [];
            for (const key in meta[library]) {
                const data = meta[library][key];
                delete data.metadata;
                valueArray.push(data);
            }
            json[library] = valueArray;
        }

        return json;
    }

}

export { AssetManager };
