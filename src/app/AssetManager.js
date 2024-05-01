const _assets = {};

class AssetManager {

    /******************** ACCESS */

    static get(uuid) {
        if (uuid && uuid.uuid) uuid = uuid.uuid;
        return _assets[uuid];
    }

    /** Retrieve an array of Assets collected by 'type' and 'category'  */
    static library(type, category) {
        const library = [];
        if (type && typeof type === 'string') type = type.toLowerCase();
        if (category && typeof category === 'string') category = category.toLowerCase();
        for (const [ uuid, asset ] of Object.entries(_assets)) {
            if (type && typeof asset.type === 'string' && asset.type.toLowerCase() !== type) continue;
            if (category == undefined || (typeof asset.category === 'string' && asset.category.toLowerCase() === category)) {
                library.push(asset);
            }
        }
        return library;
    }

    /******************** ADD / REMOVE */

    static add(...assets) {
        if (assets.length > 0 && Array.isArray(assets[0])) assets = assets[0];
        let addedAsset = undefined;

        for (const asset of assets) {
            if (!asset || !asset.uuid) continue;

            // Ensure asset has a Name
            if (!asset.name || asset.name === '') asset.name = asset.constructor.name;

            // Add Asset
            _assets[asset.uuid] = asset;
            addedAsset = addedAsset ?? asset;
        }
        return addedAsset;
    }

    static clear() {
        for (const uuid in _assets) {
            const asset = _assets[uuid];
            if (asset.isBuiltIn) continue; /* keep built-in assets */
            AssetManager.remove(_assets[uuid], true);
        }
    }

    static remove(asset, dispose = true) {
        const assets = Array.isArray(asset) ? asset : [ asset ];
        for (const asset of assets) {
            if (!asset || !asset.uuid) continue;

            // Remove if present
            if (_assets[asset.uuid]) {
                // Dispose, Remove
                if (dispose && typeof asset.dispose === 'function') asset.dispose();
                delete _assets[asset.uuid];
            }
        }
    }

    /******************** JSON */

    static toJSON() {
        const data = {};

        // Save Assets
        for (const type of Object.keys(_types)) {
            const assets = AssetManager.library(type);
            if (assets.length > 0) {
                data[type] = [];
                for (const asset of assets) {
                    data[type].push(asset.toJSON());
                }
            }
        }

        return data;
    }

    static fromJSON(json, onLoad = () => {}) {
        // Clear Assets
        AssetManager.clear()

        // Load Assets
        for (const type of Object.keys(_types)) {
            if (!json[type]) continue;
            for (const assetData of json[type]) {
                const Constructor = AssetManager.type(type);
                if (Constructor) {
                    const asset = new Constructor().fromJSON(assetData);
                    AssetManager.add(asset);
                } else {
                    console.warn(`AssetManager.fromJSON(): Unknown asset type '${assetData.type}'`);
                }
            }
        }

        // Loaded
        if (typeof onLoad === 'function') onLoad();
    }

    /******************** TYPES */

    static register(type, AssetClass) {
        _types.set(type, AssetClass);
    }

    static type(type) {
        return _types.get(type);
    }

}

const _types = new Map();

export { AssetManager };
