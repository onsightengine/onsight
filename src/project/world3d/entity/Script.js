import { AssetManager } from '../../../app/AssetManager.js';
import { ComponentManager } from '../../../app/ComponentManager.js';

class Script {

    init(data) {
        // Passed in Script
        if (data.isScript) {
            const assetUUID = data.uuid;
            AssetManager.addAsset(data);

            // Build 'data'
            data = this.defaultData();
            data.asset = assetUUID;
        }

        // Generate Backend
        const script = AssetManager.getAsset(data.asset);

        // Add Variables
        if (script && script.isScript) {

        }

        // Save Backend / Data
        this.backend = undefined;
        this.data = data;
    }

}

Script.config = {
    schema: {

        script: { type: 'asset', class: 'script', rebuild: true },

        divider: { type: 'divider' },

        variables: { type: 'object', default: {} },

    },
    icon: ``,
    color: '#090B11',
    width: '40%',
    multiple: true,
    dependencies: [],
    group: [ 'Entity3D' ],
};

ComponentManager.register('script', Script);
