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
            data.script = assetUUID;
        }

        // Generate Backend
        const script = AssetManager.getAsset(data.script);

        // Add Variables
        if (script && script.isScript) {
            if (!data.variables) data.variables = {};

            // Find Script & Variables
            let variables = {};
            if (script.source) {
                try {
                    const body = `${script.source}\nreturn variables;`;
                    variables = (new Function('' /* parameters */, body /* source */))();
                } catch (error) { /* error */ }
            }

            // Ensure Values
            for (const key in variables) {
                const variable = variables[key];
                if (variable.type) {
                    // Persistent data when component changes
                    if (key in data.variables) variable.value = data.variables[key].value;

                    // Try to set initial value
                    if (variable.value === undefined) variable.value = variable.default;
                    if (variable.value === undefined) variable.value = ComponentManager.defaultValue(variable.type);
                } else {
                    variable.value = null;
                }
            }
            data.variables = structuredClone(variables);
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
