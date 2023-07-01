import { ComponentManager } from '../../ComponentManager.js';

const exampleSelect = [ 'Apple', 'Banana', 'Cherry', 'Zebra', 'Red' ];

class Test {

    init(data) {
        // Generate Backend
        let test = undefined;
        //
        // ...CODE TO GENERATE BACKEND OBJECT3D
        //

        // Save Backend / Data
        this.backend = test;
        this.data = data;
    }

    dispose() {

    }

    attach() {
        if (this.entity && this.backend) this.entity.add(this.backend);
    }

    detach() {
        if (this.entity && this.backend) this.entity.remove(this.backend);
    }

    three() {
        return this.backend;
    }

}

Test.config = {
    schema: {

        style: [
            { type: 'select', default: 'basic', select: [ 'asset', 'basic', 'array' ] },
        ],

        divider: { type: 'layout', format: 'divider' },

        asset: { type: 'asset', if: { style: [ 'asset' ] } },
        assetDivider: { type: 'layout', format: 'divider' },
        geometry: { type: 'asset', class: 'geometry', if: { style: [ 'asset' ] } },
        material: { type: 'asset', class: 'material', if: { style: [ 'asset' ] } },
        script: { type: 'asset', class: 'script', if: { style: [ 'asset' ] } },
        shape: { type: 'asset', class: 'shape', if: { style: [ 'asset' ] } },
        texture: { type: 'asset', class: 'texture', if: { style: [ 'asset' ] } },
        prefabDivider: { type: 'layout', format: 'divider' },
        prefab: { type: 'asset', class: 'prefab', if: { style: [ 'asset' ] } },

        select: { type: 'select', default: 'Zebra', select: exampleSelect, if: { style: [ 'basic' ] } },
        number: { type: 'number', default: 0.05, min: 0, max: 1, label: 'test', if: { style: [ 'basic' ] } },
        int: { type: 'int', default: 5, min: 3, max: 10, if: { style: [ 'basic' ] } },
        angle: { type: 'angle', default: 2 * Math.PI, min: 0, max: 360, if: { style: [ 'basic' ] } },
        variable: { type: 'variable', default: [ 0, 0 ], min: 0, max: 100, if: { style: [ 'basic' ] } },
        slider: { type: 'slider', default: 0, min: 0, max: 9, step: 1, precision: 0, if: { style: [ 'basic' ] } },
        boolean: { type: 'boolean', default: true, if: { style: [ 'basic' ] } },
        color: { type: 'color', default: 0xff0000, if: { style: [ 'basic' ] } },
        string: { type: 'string', if: { style: [ 'basic' ] } },
        multiline: { type: 'string', rows: 4, if: { style: [ 'basic' ] } },

        numberArray: { type: 'vector', size: 1, if: { style: [ 'array' ] } },
        vector2: { type: 'vector', size: 2, tint: true, label: [ 'x', 'y' ], if: { style: [ 'array' ] } },
        vector3: { type: 'vector', size: 3, tint: true, min: [ 1, 1, 1 ], max: [ 2, 2, 2 ], step: 0.1, precision: 2, if: { style: [ 'array' ] } },
        vector4: { type: 'vector', size: 4, tint: true, if: { style: [ 'array' ] } },

    },
    icon: ``,
    color: 'rgb(128, 128, 128)',
    dependencies: [],
};

ComponentManager.register('test', Test);
