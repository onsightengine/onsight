import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RenderUtils } from '../utils/three/RenderUtils.js';
import { Script } from './assets/Script.js';
import { Strings } from '../utils/Strings.js';

const _assets = {};
const _textureCache = {};
const _textureLoader = new THREE.TextureLoader();

class AssetManager {

    /******************** MANAGER */

    static clear() {
        // Assets
        for (let uuid in _assets) {
            const asset = _assets[uuid];

            // Don't clear prefabs for now
            if (!asset.isEntity) {
                AssetManager.removeAsset(_assets[uuid], true);
            }
        }
    }

    /******************** ASSETS */

    static checkType(asset) {
        if (!asset) return undefined;
        if (asset.isBufferGeometry) return 'geometry';
        if (asset.type === 'Shape') return 'shape';
        if (asset.isMaterial) return 'material';
        if (asset.isScript) return 'script';
        if (asset.isTexture) return 'texture';
        if (asset.isEntity || asset.isPrefab) return 'prefab';
        return 'asset';
    }

    static addAsset(assetOrArray) {
        if (!assetOrArray) return;
        const assetArray = (Array.isArray(assetOrArray)) ? assetOrArray : [ assetOrArray ];
        for (let i = 0; i < assetArray.length; i++) {
            let asset = assetArray[i];

            // Ensure asset has a name
            if (!asset.name || asset.name === '') asset.name = asset.constructor.name;

            // Force 'BufferGeometry' type (strip ExtrudeGeometry, TextGeometry, etc...)
            if (asset.isBufferGeometry && asset.constructor.name !== 'BufferGeometry') {
                // // DEBUG: Show fancy geometry type
                // console.log(`Trimming ${asset.constructor.name}`);

                // Covert to BufferGeometry
                const bufferGeometry = mergeGeometries([ asset ]);
                bufferGeometry.name = asset.name;
                bufferGeometry.uuid = asset.uuid;
                if (typeof asset.dispose === 'function') asset.dispose();
                asset = bufferGeometry;
            }

            // Add Asset
            _assets[asset.uuid] = asset;
        }
    }

    static getAsset(uuid) {
        if (uuid && uuid.uuid) uuid = uuid.uuid;
        return _assets[uuid];
    }

    /** Retrieve a collection of Asset sub types by Category */
    static getLibrary(type, category) {
        const library = [];
        for (const [uuid, asset] of Object.entries(_assets)) {
            if (AssetManager.checkType(asset) === type) {
                if (!category) {
                    library.push(asset);
                } else if (asset.category && asset.category === category) {
                    library.push(asset);
                }
            }
        }
        return library;
    }

    static removeAsset(assetOrArray, dispose = true) {
        if (!assetOrArray) return;
        const assetArray = (Array.isArray(assetOrArray)) ? assetOrArray : [ assetOrArray ];
        for (let i = 0; i < assetArray.length; i++) {
            const asset = assetArray[i];
            // Remove if present
            if (_assets[asset.uuid]) {
                // Remove textures from cache
                if (asset.isTexture) {
                    for (let url in _textureCache) {
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

    /******************** JSON */

    static fromJSON(json) {

        // Clear Assets
        AssetManager.clear()

        // Add to Assets
        function addLibraryToAssets(library) {
            for (const [uuid, asset] of Object.entries(library)) {
                AssetManager.addAsset(asset);
            }
        }

        // Load Scripts
        const scripts = {};
        if (json.scripts) {
            for (let i = 0; i < json.scripts.length; i++) {
                const script = new Script().fromJSON(json.scripts[i]);
                scripts[script.uuid] = script;
            }
            addLibraryToAssets(scripts);
        }

        // Load Assets
		const objectLoader = new THREE.ObjectLoader();
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

        // Prefabs
        //
        // TODO!!!
        //

        // Scripts
        const scripts = AssetManager.getLibrary('script');
        for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            if (!script.uuid) continue;
            if (meta.scripts[script.uuid]) continue;
            meta.scripts[script.uuid] = script.toJSON();
        }

        // Geometries
        const geometries = AssetManager.getLibrary('geometry');
        for (let i = 0; i < geometries.length; i++) {
            const geometry = geometries[i];
            if (!geometry.uuid) continue;
            if (meta.geometries[geometry.uuid]) continue;
            meta.geometries[geometry.uuid] = geometry.toJSON(meta);

            // // Shapes
            // if (geometry.parameters && geometry.parameters.shapes) {
            //     const shapes = geometry.parameters.shapes;
            //     if (Array.isArray(shapes) !== true) shapes = [ shapes ];
            //     for (let i = 0, l = shapes.length; i < l; i++) {
            //         const shape = shapes[i];
            //         if (!meta.shapes[shape.uuid]) meta.shapes[shape.uuid] = shape.toJSON(meta);
            //     }
            // }
        }

        // Materials
        const materials = AssetManager.getLibrary('material');
        for (let i = 0; i < materials.length; i++) {
            const material = materials[i];
            if (!material.uuid) continue;
            if (meta.materials[material.uuid]) continue;
            meta.materials[material.uuid] = material.toJSON(stopRoot);
        }

        // Shapes
        const shapes = AssetManager.getLibrary('shape');
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            if (!shape.uuid) continue;
            if (meta.shapes[shape.uuid]) continue;
            meta.shapes[shape.uuid] = shape.toJSON(stopRoot);
        }

        // Textures
        const textures = AssetManager.getLibrary('texture');
        for (let i = 0; i < textures.length; i++) {
            const texture = textures[i];
            if (!texture.uuid) continue;
            if (meta.textures[texture.uuid]) continue
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
