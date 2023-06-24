import { AssetManager } from '../../AssetManager.js';
import { ComponentManager } from '../../ComponentManager.js';

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

        // Save Data / Backend
        this.backend = undefined;
        this.data = data;
    }

    dispose() {

    }

    enable() {

    }

    disable() {

    }

}

Script.config = {
    schema: {

        script: { type: 'asset', class: 'script', rebuild: true },

        divider: { type: 'layout', format: 'divider' },

        variables: { type: 'object', default: {} },

    },
    icon: ``,
    color: '#090B11',
    width: '40%',
    multiple: true,
    dependencies: [],
};

ComponentManager.register('script', Script);
