import { ComponentManager } from '../../ComponentManager.js';

import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';

class Post {

    init(data) {
        // Generate Backend
        let pass = undefined;

        switch (data.style) {

            case 'bloom':
                break;

            case 'grayscale':
                break;

            case 'pixel':
                const options = {
                    pixelSize: data.pixelSize || 6,
                    normalEdgeStrength: data.normalEdge || 0.1,
                    depthEdgeStrength: data.depthEdge || 0.1,
                };
                pass = new RenderPixelatedPass(options.pixelSize, null /* scene */, null /* camera */, options);
                pass.basePixelSize = options.pixelSize;
                break;

            default:
                console.error(`Post Component: Invalid style '${data.style}'`);

        }

        // Modify Camera
        if (pass) {

        } else {
            // console.log('Error with post pass!');
        }

        // Save Backend / Data
        this.backend = pass;
        this.data = data;
    }

    dispose() {

    }

    three() {
        return this.backend;
    }

}

Post.config = {
    schema: {

        style: [
            { type: 'select', default: 'pixel', select: [ 'bloom', 'grayscale', 'pixel' ] },
        ],

        pixelSize: { type: 'slider', default: 4, min: 1, max: 16, step: 1, precision: 0, if: { style: [ 'pixel' ] } },
        normalEdge: { type: 'slider', promode: true, default: 0.1, min: 0, max: 2, step: 0.1, precision: 2, if: { style: [ 'pixel' ] } },
        depthEdge: { type: 'slider', promode: true, default: 0.1, min: 0, max: 1, step: 0.1, precision: 2, if: { style: [ 'pixel' ] } },

    },
    icon: ``,
    color: 'rgb(64, 64, 64)',
    multiple: true,
    dependencies: [],
    group: [ 'World3D' ],
};

ComponentManager.register('post', Post);