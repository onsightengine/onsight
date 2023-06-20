import { ComponentManager } from '../../ComponentManager.js';

const exampleSelect = [ 'Apple', 'Banana', 'Cherry', 'Zebra', 'Red' ];

class Test {

    init(data) {
        // Clear Backend
        //
        // ...this.dispose() automatically called from ComponentManager
        //

        // Generate Backend
        let test = undefined;
        //
        // ...CODE TO GENERATE BACKEND OBJECT3D
        //

        // Save Data / Backend
        this.backend = test;
        this.data = data;
    }

    dispose() {

    }

    enable() {
        if (this.entity && this.backend) this.entity.add(this.backend);
    }

    disable() {
        if (this.entity && this.backend) this.entity.remove(this.backend);
    }

}

Test.config = {
    schema: {

        style: [
            { type: 'select', default: 'example', select: [ 'asset', 'example' ] },
        ],

        assetDivider: { type: 'layout', format: 'divider' , if: { style: [ 'asset' ] } },
        asset: { type: 'asset', if: { style: [ 'asset' ] } },
        geometry: { type: 'asset', class: 'geometry', if: { style: [ 'asset' ] } },
        material: { type: 'asset', class: 'material', if: { style: [ 'asset' ] } },
        script: { type: 'asset', class: 'script', if: { style: [ 'asset' ] } },
        shape: { type: 'asset', class: 'shape', if: { style: [ 'asset' ] } },
        texture: { type: 'asset', class: 'texture', if: { style: [ 'asset' ] } },

        prefabDivider: { type: 'layout', format: 'divider', if: { style: [ 'asset' ] } },
        prefab: { type: 'prefab', if: { style: [ 'asset' ] } },

        dataDivider: { type: 'layout', format: 'divider', if: { style: [ 'example' ] } },
        select: { type: 'select', default: 'Zebra', select: exampleSelect, if: { style: [ 'example' ] } },
        number: { type: 'number', default: 0.05, min: 0, max: 1, if: { style: [ 'example' ] } },
        int: { type: 'int', default: 5, min: 3, max: 10, if: { style: [ 'example' ] } },
        angle: { type: 'angle', default: 2 * Math.PI, min: 0, max: 360, if: { style: [ 'example' ] } },

        variable: { type: 'variable', default: [ 0, 0 ], min: 0, max: 100, if: { style: [ 'example' ] } },

        slider: { type: 'slider', default: 0, min: 0, max: 9, step: 1, precision: 0, if: { style: [ 'example' ] } },
        boolean: { type: 'boolean', default: true, if: { style: [ 'example' ] } },
        color: { type: 'color', default: 0xff0000, if: { style: [ 'example' ] } },

    },
    icon: ``,
    color: 'rgb(128, 128, 128)',
    dependencies: [],
};

ComponentManager.register('test', Test);
