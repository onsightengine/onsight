// https://github.com/Cloud9c/taro/blob/main/src/components/Material.js

// MeshBasicMaterial        not affected by lights
// MeshLambertMaterial      non-physically based material for non-shiny surfaces, without specular highlights
// MeshPhongMaterial        non-physically based material for shiny surfaces with specular highlights
// MeshStandardMaterial     standard physically based material, using Metallic-Roughness workflow
// MeshPhysicalMaterial     extension of MeshStandardMaterial, providing even more advanced physically-based rendering

import * as THREE from 'three';
// import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { AssetManager } from '../../../app/AssetManager.js';
import { ComponentManager } from '../../../app/ComponentManager.js';
import { ObjectUtils } from '../../../utils/three/ObjectUtils.js';
import { SceneManager } from '../../../app/SceneManager.js';

const blendingModes = [ 'NoBlending', 'NormalBlending', 'AdditiveBlending', 'SubstractiveBlending', 'MultiplyBlending', 'CustomBlending' ];
const sides = [ 'FrontSide', 'BackSide', 'DoubleSide' ];
const depthPacking = [ 'BasicDepthPacking', 'RGBADepthPacking' ];

// const hdrEquirect = new RGBELoader().setPath('../engine/src/project/world3d/entity/textures/')
//  .load('royal_esplanade_1k.hdr', () => hdrEquirect.mapping = THREE.EquirectangularReflectionMapping);

class Material {

    init(data = {}) {
        // Params Object
        const parameters = {};

        // Passed in Material
        if (data.isMaterial) {
            const assetUUID = data.uuid;
            AssetManager.addAsset(data);

            // Build 'data'
            data = this.defaultData('style', 'asset');
            data.asset = assetUUID;

        // Need to Build Material from data
        } else {

            // Copy data to THREE material 'parameters'
            for (const key in data) {
                const value = data[key];
                parameters[key] = value;

                // Check if wants map (texture)
                let variable = Material.config.schema[key];
                if (Array.isArray(variable) && variable.length > 0) variable = variable[0];
                if (value && variable && variable.type === 'asset') {

                    // Make sure texture is in AssetManager
                    if (value.isTexture) {
                        AssetManager.addAsset(value);

                    // If no texture was provided, could be UUID
                    } else {

                        // Check AssetManager for Texture
                        const textureCheck = AssetManager.getAsset(value);
                        if (textureCheck && textureCheck.isTexture) {
                            parameters[key] = textureCheck;

                        // No such texture found, set to null
                        } else {
                            parameters[key] = null;
                        }

                    }

                }
            }

            // Remove data not used in THREE materials (to avoid console warnings)
            delete parameters['base'];
            delete parameters['style'];
            delete parameters['edgeSize'];
            delete parameters['gradientSize'];
            delete parameters['premultiplyAlpha'];
            delete parameters['useUv'];

            // Convert 'string' data to 'int'
            if (typeof parameters.blending === 'string') parameters.blending = blendingModes.indexOf(parameters.blending);
            if (typeof parameters.side === 'string') parameters.side = sides.indexOf(parameters.side);
            if (parameters.depthPacking === 'BasicDepthPacking') parameters.depthPacking = THREE.BasicDepthPacking;
            if (parameters.depthPacking === 'RGBADepthPacking') parameters.depthPacking = THREE.RGBADepthPacking;
        }

        // Generate Backend
        let material = undefined;
        switch (data.style) {

            case 'asset':
                const assetMaterial = AssetManager.getAsset(data.asset);
                if (assetMaterial && assetMaterial.isMaterial) {
                    material = assetMaterial.clone();
                }
                break;

            case 'basic': material = new THREE.MeshBasicMaterial(parameters); break;
            case 'depth': material = new THREE.MeshDepthMaterial(parameters); break;
            case 'lambert': material = new THREE.MeshLambertMaterial(parameters); break;
            case 'matcap': material = new THREE.MeshMatcapMaterial(parameters); break;
            case 'normal': material = new THREE.MeshNormalMaterial(parameters); break;
            case 'phong': material = new THREE.MeshPhongMaterial(parameters); break;
            case 'physical': material = new THREE.MeshPhysicalMaterial(parameters); break;
            case 'points': material = new THREE.PointsMaterial(parameters); break;
            case 'shader': material = new THREE.ShaderMaterial(parameters); break;
            case 'standard': material = new THREE.MeshStandardMaterial(parameters); break;

            default:
                console.error(`Material Component: Invalid style '${data.style}'`);
        }

        // Modifiy Material
        if (material && material.isMaterial) {
            //
            // EMPTY FOR NOW
            //
        } else {
            // console.log('Error with material!');
        }

        // Save Backend / Data
        this.backend = material;
        this.data = data;
    }

    dispose() {

    }

    attach() {
        refreshMesh(this);
    }

    detach() {
        refreshMesh(this);
    }

}

Material.config = {
    schema: {

        style: [
            { type: 'select', default: 'standard', promode: true, select: [ 'asset', 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'points', 'shader', 'standard' ] },
            { type: 'select', default: 'standard', select: [ 'asset', 'basic', 'points', 'standard' ] },
        ],

        // DIVIDER
        styleDivider: { type: 'divider' },

        asset: { type: 'asset', class: 'material', if: { style: [ 'asset' ] } },

        color: { type: 'color', if: { style: [ 'basic', 'lambert', 'matcap', 'phong', 'physical', 'points', 'standard' ] } },
        emissive: { type: 'color', default: 0x000000, promode: true, if: { style: [ 'lambert', 'phong', 'physical', 'standard' ] } },
        emissiveIntensity: { type: 'slider', default: 1, min: 0, max: 2, promode: true, if: { style: [ 'lambert', 'phong', 'physical', 'standard' ] } },

        opacity: { type: 'slider', default: 1.0, min: 0.0, max: 1.0, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'points', 'standard' ] } },

        depthTest: { type: 'boolean', default: true, promode: true, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'standard' ] } },
        depthWrite: { type: 'boolean', default: true, promode: true, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'standard' ] } },
        flatShading: { type: 'boolean', default: false, if: { style: [ 'phong', 'physical', 'standard', 'normal', 'matcap' ] } },
        premultiplyAlpha: { type: 'boolean', default: true, promode: true, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'points', 'standard' ] } },
        wireframe: { type: 'boolean', default: false, if: { style: [ 'basic', 'depth', 'lambert', 'normal', 'phong', 'physical', 'standard' ] } },
        vertexColors: { type: 'boolean', default: false, promode: true, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'standard' ] } },

        size: { type: 'slider', default: 0.05, min: 0, max: 1, if: { style: [ 'points' ] } },
        sizeAttenuation: { type: 'boolean', default: true, if: { style: [ 'points' ] } },
        useUv: { type: 'boolean', default: false, if: { style: [ 'points' ] } },

        metalness: { type: 'slider', default: 0.1, min: 0.0, max: 1.0, if: { style: [ 'physical', 'standard' ] } },
        roughness: { type: 'slider', default: 1.0, min: 0.0, max: 1.0, if: { style: [ 'physical', 'standard' ] } },

        specular: { type: 'color', default: 0x111111, if: { style: [ 'phong' ] } },
        shininess: { type: 'number', default: 30, if: { style: [ 'phong' ] } },

        clearcoat: { type: 'slider', default: 0.0, min: 0.0, max: 1.0, if: { style: [ 'physical' ] } },
        clearcoatRoughness: { type: 'slider', default: 0.0, min: 0.0, max: 1.0, if: { style: [ 'physical' ] } },
        ior: { type: 'slider', default: 1.5, min: 1.0, max: 2.0, if: { style: [ 'physical' ] } },
        sheen: { type: 'slider', default: 0.0, min: 0.0, max: 1.0, if: { style: [ 'physical' ] } },
        sheenRoughness: { type: 'slider', default: 0.0, min: 0.0, max: 1.0, if: { style: [ 'physical' ] } },
        sheenColor: { type: 'color', if: { style: [ 'physical' ] } },
        specularColor: { type: 'color', promode: true, if: { style: [ 'physical' ] } },
        specularIntensity: { type: 'slider', default: 1, min: 0, max: 2, promode: true, if: { style: [ 'physical' ] } },
        thickness: { type: 'slider', default: 0.0, min: 0.0, max: 5.0, if: { style: [ 'physical' ] } },
        transmission: { type: 'slider', default: 0.0, min: 0.0, max: 1.0, if: { style: [ 'physical' ] } },

        depthPacking: { type: 'select', default: 'BasicDepthPacking', select: depthPacking, if: { style: [ 'depth' ] } },

        // Standard Maps
        map: [
            { type: 'asset', class: 'texture', alias: 'texture', if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'phong', 'points', 'physical', 'standard' ] } },
        ],

        matcap: { type: 'asset', class: 'texture', if: { style: [ 'matcap' ] } },

        // Surface Maps (see: https://market.pmnd.rs/material/stylized-crystal)
        alphaMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'phong', 'physical', 'points', 'standard' ] } },
        bumpMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'matcap', 'normal', 'phong', 'physical', 'standard' ] } },
        bumpScale: { type: 'slider', default: 1, min: 0, max: 2, promode: true, if: { style: [ 'matcap', 'normal', 'phong', 'physical', 'standard' ] } },
        clearcoatNormalMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'physical' ] } },
        clearcoatNormalScale: { type: 'vector2', default: [ 1, 1 ], promode: true, if: { style: [ 'physical' ] } },
        displacementMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'depth', 'matcap', 'normal', 'phong', 'physical', 'standard' ] } },
        displacementScale: { type: 'slider', default: 1, min: 0, max: 2, promode: true, if: { style: [ 'depth', 'matcap', 'normal', 'phong', 'physical', 'standard' ] } },
        emissiveMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'lambert', 'phong', 'physical', 'standard' ] } },
        metalnessMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'physical', 'standard' ] } },
        roughnessMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'physical', 'standard' ] } },
        specularMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'basic', 'lambert', 'phong' ] } },
        thicknessMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'physical' ] } },
        transmissionMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'physical' ] } },

        // Light Maps
        aoMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'basic', 'lambert', 'phong', 'physical', 'standard' ] } },
        // aoMapIntensity: { type: 'slider', promode: true, default: 1, min: 0, max: 100, if: { style: [ 'basic', 'lambert', 'phong', 'physical', 'standard' ] } },
        envMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'basic', 'lambert', 'phong', 'physical', 'standard' ] } },
        // envMapIntensity: { type: 'slider', default: 1, min: 0, max: 2, promode: true, if: { style: [ 'physical', 'standard' ] } },
        lightMap: { type: 'asset', class: 'texture', promode: true, if: { style: [ 'basic', 'lambert', 'phong', 'physical', 'standard' ] } },
        // lightMapIntensity: { type: 'number', default: 1, if: { style: [ 'basic', 'lambert', 'phong', 'physical', 'standard' ] } },
        normalMap: { type: 'asset', class: 'texture', if: { style: [ 'matcap', 'normal', 'phong', 'physical', 'standard' ] } },
        // normalScale: { type: 'vector2', default: [ 1, 1 ], promode: true, if: { style: [ 'matcap', 'normal', 'phong', 'physical', 'standard' ] } },

        // Front / Back / Double
        side: { type: 'select', default: 'FrontSide', select: sides, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'standard' ] } },

        // // The following Material parameters are handled internally
        // transparent: { type: 'boolean', promode: true, default: true },
        // blending: { type: 'select', default: 'NormalBlending', select: blendingModes, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'standard' ] } },
        // alphaTest: { type: 'number', default: 0.05, min: 0, max: 1, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'standard' ] } },
    },
    icon: ``,
    color: 'rgb(165, 243, 0)',
    multiple: false,
    dependencies: [ 'geometry' ],
    group: [ 'Entity3D' ],
};

ComponentManager.register('material', Material);

/******************** INTERNAL ********************/

function extendMaterial(material, data = { style: 'basic', premultiplyAlpha: true }) {
    if (!material || !material.isMaterial) return;

    const wantsOpaque = (data && data.opacity === 1.0 && data.map === undefined);

    // Standard Values
    material.transparent = !wantsOpaque;                // Opaque? Auto adjust 'transparent' (speeds rendering)
    material.alphaTest = 0.01;                          // Save time rendering transparent pixels
    material.polygonOffset = true;                      // Helps Z-Fighting
    material.polygonOffsetFactor = 1;                   // Positive value pushes polygon further away

    // On Before Compile
    material.onBeforeCompile = function(shader) {
        // Premuliply / Premultiplied Alphas Shader Fix, replaces code from:
        // https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderChunk/premultiplied_alpha_fragment.glsl.js
        //
        // Replaces     "gl_FragColor.rgb *= gl_FragColor.a;"
        // With         "gl_FragColor.rgba *= gl_FragColor.a;"
        //
        if (data.premultiplyAlpha && shader.fragmentShader) {
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <premultiplied_alpha_fragment>',
                'gl_FragColor.rgba *= gl_FragColor.a;'
            );
        }
    };

    // Premuliply / Premultiplied Alphas Blend Equations
    if (data.premultiplyAlpha) {
        material.blending = THREE.CustomBlending;
        material.blendEquation = THREE.AddEquation;
        material.blendSrc = THREE.OneFactor;
        material.blendDst = THREE.OneMinusSrcAlphaFactor;
        material.blendEquationAlpha = THREE.AddEquation;
        material.blendSrcAlpha = THREE.OneFactor;
        material.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
    }

    // Needs Update
    material.needsUpdate = true;
    return material;
}

function refreshMesh(component) {
    // Remove current Mesh
    if (component.entity && component.mesh) {
        component.entity.remove(component.mesh);
        ObjectUtils.clearObject(component.mesh);
        component.mesh = undefined;
    }
    if (!component.attached) return;

    // Get material and geometry (if present)
    if (!component.backend || !component.backend.isMaterial) return;
    const material = component.backend.clone();
    extendMaterial(material, component.toJSON());

    const geometryComponent = component.entity.getComponent('geometry');
    if (!geometryComponent) return;
    if (!geometryComponent.attached) return;
    const geometry = geometryComponent.backend;
    if (!geometry) return;

    // Create mesh
    if (component.data && component.data.style === 'points') {
        const pointGeometry = geometry.clone();
        if (!component.data.useUv) pointGeometry.deleteAttribute('uv');
        component.mesh = new THREE.Points(pointGeometry, material);
        pointGeometry.dispose();
    } else {
        // Create Mesh
        component.mesh = new THREE.Mesh(geometry, material);
        component.mesh.castShadow = component.entity.castShadow;
        component.mesh.receiveShadow = component.entity.receiveShadow;
    }
    component.mesh.name = `Backend Object3D for ${component.entity.name}`;

    // Glass
    const isGlass = component.backend.isMeshPhysicalMaterial === true && component.backend.transmission > 0;
    if (isGlass) component.backend.envMap = hdrEquirect;

    // Show invisible objects as wireframe in editor
    if (component.backend.opacity < 0.05) {
        if (!SceneManager.app || !SceneManager.app.isPlaying) {
            material.map = null;
            material.opacity = 0.25;
            material.wireframe = true;
            component.mesh.castShadow = false;
        }
    }

    // NOTE: Adding mesh into Project as Object3D only (mesh will not be exported, shown in Outliner, etc.)
    if (component.entity && component.mesh) component.entity.add(component.mesh);
}
