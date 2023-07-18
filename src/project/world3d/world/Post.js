import { ComponentManager } from '../../ComponentManager.js';

class Post {

    init(data) {
        // Generate Backend
        let test = undefined;



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

}

Post.config = {
    schema: {

        style: [
            { type: 'select', default: 'pixel', select: [ 'bloom', 'grayscale', 'pixel' ] },
        ],

    },
    icon: ``,
    color: 'rgb(128, 128, 128)',
    multiple: true,
    dependencies: [],
    group: [ 'World3D' ],
};

ComponentManager.register('post', Post);