/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Easy to use 2D / 3D JavaScript game engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2023 Stephens Nunnally and Scidian Studios
// @source      https://github.com/onsightengine
//
///////////////////////////////////////////////////////////////////////////////////*/
//
//  Additional Source(s)
//      MIT     https://github.com/Cloud9c/taro/blob/main/src/components/Material.js
//
/////////////////////////////////////////////////////////////////////////////////////
//
// Three.js materials, in order of quality
//      MeshBasicMaterial,          // not affected by lights
//      MeshLambertMaterial,        // non-physically based material for non-shiny surfaces, without specular highlights
//      MeshPhongMaterial,          // non-physically based material for shiny surfaces with specular highlights
//      MeshStandardMaterial,       // standard physically based material, using Metallic-Roughness workflow
//      MeshPhysicalMaterial,       // extension of MeshStandardMaterial, providing even more advanced physically-based rendering
//
/////////////////////////////////////////////////////////////////////////////////////

import * as THREE from 'three';
// import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

import { AssetManager } from '../../AssetManager.js';
import { ComponentManager } from '../../ComponentManager.js';

import { GeometryUtils } from '../../../three/GeometryUtils.js';
import { ObjectUtils } from '../../../three/ObjectUtils.js';
import { System } from '../../../utils/System.js';

const blendingModes = [ 'NoBlending', 'NormalBlending', 'AdditiveBlending', 'SubstractiveBlending', 'MultiplyBlending', 'CustomBlending' ];
const sides = [ 'FrontSide', 'BackSide', 'DoubleSide' ];
const depthPacking = [ 'BasicDepthPacking', 'RGBADepthPacking' ];

// const hdrEquirect = new RGBELoader().setPath('../engine/src/project/scene3d/components/textures/')
//  .load('royal_esplanade_1k.hdr', () => hdrEquirect.mapping = THREE.EquirectangularReflectionMapping);

class Material {

    init(data) {

        // Copy / Clear Backend
        this.dispose();

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
                let checkType = Material.config.schema[key];
                if (System.isIterable(checkType) && checkType.length > 0) checkType = checkType[0];
                if (value && checkType && checkType.type === 'map') {

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

            // Remove data not used in THREE materials
            delete parameters['base'];
            delete parameters['style'];
            delete parameters['edgeSize'];
            delete parameters['gradientSize'];
            delete parameters['premultiplyAlpha'];

            // Convert 'string' data to 'int'
            if (typeof parameters.blending === 'string') parameters.blending = blendingModes.indexOf(parameters.blending);
            if (typeof parameters.side === 'string') parameters.side = sides.indexOf(parameters.side);
            if (parameters.depthPacking === 'BasicDepthPacking') parameters.depthPacking = THREE.BasicDepthPacking;
            if (parameters.depthPacking === 'RGBADepthPacking') parameters.depthPacking = THREE.RGBADepthPacking;
        }

        ///// Generate Backend

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
            case 'toon':
                material = new THREE.MeshToonMaterial(parameters);
                data.gradientSize = Math.min(Math.max(data.gradientSize, 1), 16);
                const format = (getRenderer().capabilities.isWebGL2) ? THREE.RedFormat : THREE.LuminanceFormat;
                const colors = new Uint8Array(data.gradientSize + 2);
                for (let c = 0; c <= colors.length; c++) colors[c] = (c / colors.length) * 256;
                material.gradientMap = new THREE.DataTexture(colors, colors.length, 1, format);
                material.gradientMap.needsUpdate = true;
                break;
            default:
                console.error(`Material: Invalid material type '${data.style}'`);
        }

        ///// Modifiy Material

        if (material && material.isMaterial) {

            // NOTHING

        } else {
            console.log('Error with material!');
        }

        ///// Save Data / Backend

        this.backend = material;
        this.data = data;
        this.style = data.style;
    }

    dispose() {
        const material = this.backend;
        if (material && material.isMaterial) {
            material.dispose();
        }
        this.backend = undefined;
    }

    enable() {
        this.refreshMesh();
    }

    disable() {
        this.refreshMesh();
    }

    refreshMesh() {
        // Remove current Mesh
        if (this.entity && this.mesh) {
            this.entity.remove(this.mesh);
            ObjectUtils.clearObject(this.mesh);
            this.mesh = undefined;
        }
        if (this.enabled !== true) return;

        // Get material and geometry (if present)
        if (! this.backend || ! this.backend.isMaterial) return;
        const material = this.backend.clone();
        extendMaterial(material, this.toJSON());

        const geometryComponent = this.entity.getComponent('geometry');
        if (! geometryComponent) return;
        if (! geometryComponent.enabled) return;
        const geometry = geometryComponent.backend;
        if (! geometry) return;

        // Create mesh
        if (this.style === 'points') {
            this.mesh = new THREE.Points(geometry, material);
        } else {
            // Create Mesh
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.castShadow = this.entity.castShadow;
            this.mesh.receiveShadow = this.entity.receiveShadow;
        }
        this.mesh.name = `Backend Object3D for ${this.entity.name}`;

        // Glass
        const isGlass = this.backend.isMeshPhysicalMaterial === true && this.backend.transmission > 0;
        if (isGlass) this.backend.envMap = hdrEquirect;

        // Show invisible objects as wireframe
        if (this.backend.opacity < 0.05) {
            if (window.activeCamera && window.editor && window.editor.viewport) {
                if (activeCamera.uuid === editor.viewport.camera.uuid) {
                    material.map = null;
                    material.opacity = 0.25;
                    material.wireframe = true;
                    this.mesh.castShadow = false;
                }
            }
        }

        ///// NOTE: Adding backend mesh into Project as Object3D only.
        //          Mesh will not be exported, shown in Outliner, etc.
        if (this.entity && this.mesh) this.entity.add(this.mesh);
    }

    toJSON() {
        const data = this.defaultData('style', this.style);

        // Copy Existing 'data' Properties
        for (let key in data) {
            if (this.data[key] !== undefined) {

                // Save 'map' types (textures) as uuid only
                if (this.data[key] && this.data[key].isTexture) {
                    data[key] = this.data[key].uuid;

                // All other data
                } else {
                    data[key] = this.data[key];
                }

            }
        }

        return data;
    }

}

//////////////////// Extend Material

function extendMaterial(material, data = { style: 'basic', premultiplyAlpha: true }) {
    if (! material || ! material.isMaterial) return;

    let wantsOpaque = (data && data.opacity === 1.0 && data.map === undefined);

    // Standard Values
    material.transparent = ! wantsOpaque;               // Opaque? Auto adjust 'transparent' (speeds rendering)
    material.alphaTest = 0.01;                          // Save time rendering transparent pixels
    material.polygonOffset = true;                      // Helps Z-Fighting
    material.polygonOffsetFactor = 1;                   // Positive value pushes polygon further away

    // On Before Compile
    material.onBeforeCompile = function(shader) {

        // Toon Bit Depth / Rounding Improvements
        if (data.style === 'toon') {
            shader.uniforms = THREE.UniformsUtils.merge([
                shader.uniforms, {
                    uBitDepth: { value: data.gradientSize ?? 4},
                    uEdgeSize: { value: data.edgeSize ?? 6 },
                    uTextureWidth: { value: 100.0 },
                    uTextureHeight: { value: 100.0 },
                },
            ]);

            if (material.map && material.map.isTexture) {
                shader.uniforms.uTextureWidth.value = material.map.image.width;
                shader.uniforms.uTextureHeight.value = material.map.image.height;
            }

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <common>',
                [ 	'#include <common>',
                    '',
                    'uniform float uBitDepth;',
                    'uniform float uEdgeSize;',
                    'uniform float uTextureWidth;',
                    'uniform float uTextureHeight;',
                    '',
                    // ---------- Adding Below ----------
                    // Convert red/green/blue to hue/saturation/vibrance
                    'vec3 rgbToHsv(vec3 c) {',
                    '   vec4  K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);',
                    '   vec4  p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));',
                    '   vec4  q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));',
                    '   float d = q.x - min(q.w, q.y);',
                    '   float e = 1.0e-10;',
                    '   return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);',
                    '}',
                    // Convert hue/saturation/vibrance to red/green/blue'
                    'vec3 hsvToRgb(vec3 c) {',
                    '   vec4  K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);',
                    '   vec3  p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);',
                    '   return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);',
                    '}',
                    '',
                    // Averaged pixel intensity from 3 color channels
                    'float avgIntensity(vec4 pix) {',
                    '   return (pix.r + pix.g + pix.b) / 3.0;',
                    '}',
                ].join('\n')
            );

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <color_fragment>',
                [	'#include <color_fragment>',
                    // ---------- Adding Below ----------
                    // Cartoon RgbToHsv
                    'vec3 original_color = diffuseColor.rgb;',
                    'vec3 v_hsv = rgbToHsv(original_color.rgb);',
                    'float amt = 1.0 / (uBitDepth + 8.0);',
                    'float hueIncrease = 1.05;',
                    'float satIncrease = 1.10;',
                    'float vibIncrease = 1.75;',
                    'v_hsv.x = clamp(amt * (floor(v_hsv.x / amt) * hueIncrease), 0.0, 1.0);',
                    'v_hsv.y = clamp(amt * (floor(v_hsv.y / amt) * satIncrease), 0.0, 1.0);',
                    'v_hsv.z = clamp(amt * (floor(v_hsv.z / amt) * vibIncrease), 0.0, 1.0);',

                    // Check for Edge
                    '#ifdef USE_MAP',
                    '   vec2 coords = vUv;',
                    '   float dxtex = 1.0 / uTextureWidth;',
                    '   float dytex = 1.0 / uTextureHeight;',
                    '   float edge_thres  = 0.15;',
                    '   float edge_thres2 = uEdgeSize;',
                    '   float pix[9];',
                    '   int   k = -1;',
                    '   float delta;',
                        // Read neighboring pixel intensities
                    '   for (int i = -1; i < 2; i++) {',
                    '       for (int j = -1; j < 2; j++) {',
                    '           k++;',
                    '           vec2 sampleCoords = vec2(coords.x + (float(i) * dxtex), coords.y + (float(j) * dytex));',
                    '           vec4 texSample = texture2D(map, sampleCoords);',
                    '           pix[k] = avgIntensity(texSample);',
                    '       }',
                    '   }',
                        // Average color differences around neighboring pixels
                    '   delta = (abs(pix[1] - pix[7]) + abs(pix[5] - pix[3]) + abs(pix[0] - pix[8]) + abs(pix[2] - pix[6]) ) / 4.0;',
                    '   float edg = clamp(edge_thres2 * delta, 0.0, 1.0);',
                    '   vec3 v_rgb = (edg >= edge_thres) ? vec3(0.0) : hsvToRgb(v_hsv.xyz);',
                    '#else',
                    '   vec3 v_rgb = hsvToRgb(v_hsv.xyz);',
                    '#endif',

                    // Hsv Color
                    'diffuseColor.rgb = vec3(v_rgb.x, v_rgb.y, v_rgb.z);',

                    // Bit Depth
                    'float bit_depth = uBitDepth;',
                    'float bitR = floor(diffuseColor.r * bit_depth);',
                    'float bitG = floor(diffuseColor.g * bit_depth);',
                    'float bitB = floor(diffuseColor.b * bit_depth);',
                    'diffuseColor.rgb = vec3(bitR, bitG, bitB) / bit_depth;',
                ].join('\n')
            );
        }

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

//////////////////// Schema

Material.config = {
    schema: {

        style: [
            { type: 'select', default: 'standard', promode: true, select: [ 'asset', 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'points', 'shader', 'standard', 'toon' ] },
            { type: 'select', default: 'standard', select: [ 'basic', 'points', 'standard', 'toon' ] },
        ],

        ///// DIVIDER
        styleDivider: { type: 'divider' },
        /////

        asset: { type: 'asset', class: 'Material', if: { style: [ 'asset' ] } },

        color: { type: 'color', if: { style: [ 'basic', 'lambert', 'matcap', 'phong', 'physical', 'points', 'standard', 'toon' ] } },
        emissive: { type: 'color', default: 0x000000, promode: true, if: { style: [ 'lambert', 'phong', 'physical', 'standard', 'toon' ] } },
        emissiveIntensity: { type: 'slider', default: 1, min: 0, max: 2, promode: true, if: { style: [ 'lambert', 'phong', 'physical', 'standard', 'toon' ] } },

        opacity: { type: 'slider', default: 1.0, min: 0.0, max: 1.0, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'points', 'standard', 'toon' ] } },

        depthTest: { type: 'boolean', default: true, promode: true, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
        depthWrite: { type: 'boolean', default: true, promode: true, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
        flatShading: { type: 'boolean', default: false, if: { style: [ 'phong', 'physical', 'standard', 'normal', 'matcap' ] } },
        premultiplyAlpha: { type: 'boolean', default: true, promode: true, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'points', 'standard', 'toon' ] } },
        wireframe: { type: 'boolean', default: false, if: { style: [ 'basic', 'depth', 'lambert', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
        vertexColors: { type: 'boolean', default: false, promode: true, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },

        size: { type: 'slider', default: 0.05, min: 0, max: 1, if: { style: [ 'points' ] } },
        sizeAttenuation: { type: 'boolean', default: true, if: { style: [ 'points' ] } },

        edgeSize: { type: 'slider', default: 6, min: 0, max: 10, step: 1, precision: 0, if: { style: [ 'toon' ] } },
        gradientSize: { type: 'slider', default: 4, min: 1, max: 16, step: 1, precision: 0, if: { style: [ 'toon' ] } },
        // gradientMap: { type: 'map', if: { style: [ 'toon' ] } },

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

        ///// Standard Maps
        map: [
            { type: 'map', if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'phong', 'points', 'physical', 'standard', 'toon' ] } },
        ],

        matcap: { type: 'map', if: { style: [ 'matcap' ] } },

        ///// Surface Maps (see: https://market.pmnd.rs/material/stylized-crystal)
        alphaMap: { type: 'map', promode: true, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'phong', 'physical', 'points', 'standard', 'toon' ] } },
        bumpMap: { type: 'map', promode: true, if: { style: [ 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
        bumpScale: { type: 'slider', default: 1, min: 0, max: 2, promode: true, if: { style: [ 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
        clearcoatNormalMap: { type: 'map', promode: true, if: { style: [ 'physical' ] } },
        clearcoatNormalScale: { type: 'vector2', default: [ 1, 1 ], promode: true, if: { style: [ 'physical' ] } },
        displacementMap: { type: 'map', promode: true, if: { style: [ 'depth', 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
        displacementScale: { type: 'slider', default: 1, min: 0, max: 2, promode: true, if: { style: [ 'depth', 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
        emissiveMap: { type: 'map', promode: true, if: { style: [ 'lambert', 'phong', 'physical', 'standard', 'toon' ] } },
        metalnessMap: { type: 'map', promode: true, if: { style: [ 'physical', 'standard' ] } },
        roughnessMap: { type: 'map', promode: true, if: { style: [ 'physical', 'standard' ] } },
        specularMap: { type: 'map', promode: true, if: { style: [ 'basic', 'lambert', 'phong' ] } },
        thicknessMap: { type: 'map', promode: true, if: { style: [ 'physical' ] } },
        transmissionMap: { type: 'map', promode: true, if: { style: [ 'physical' ] } },

        ///// Light Maps
        aoMap: { type: 'map', promode: true, if: { style: [ 'basic', 'lambert', 'phong', 'physical', 'standard', 'toon' ] } },
        // aoMapIntensity: { type: 'slider', promode: true, default: 1, min: 0, max: 100, if: { style: [ 'basic', 'lambert', 'phong', 'physical', 'standard', 'toon' ] } },
        envMap: { type: 'map', promode: true, if: { style: [ 'basic', 'lambert', 'phong', 'physical', 'standard' ] } },
        // envMapIntensity: { type: 'slider', default: 1, min: 0, max: 2, promode: true, if: { style: [ 'physical', 'standard' ] } },
        lightMap: { type: 'map', promode: true, if: { style: [ 'basic', 'lambert', 'phong', 'physical', 'standard', 'toon' ] } },
        // lightMapIntensity: { type: 'number', default: 1, if: { style: [ 'basic', 'lambert', 'phong', 'physical', 'standard', 'toon' ] } },
        normalMap: { type: 'map', if: { style: [ 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
        // normalScale: { type: 'vector2', default: [ 1, 1 ], promode: true, if: { style: [ 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },

        ///// Front / Back / Double
        side: { type: 'select', default: 'FrontSide', select: sides, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },

        ////////// The following Material parameters are handled internally
        // transparent: { type: 'boolean', promode: true, default: true },
        // blending: { type: 'select', default: 'NormalBlending', select: blendingModes, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
        // alphaTest: { type: 'number', default: 0.05, min: 0, max: 1, if: { style: [ 'basic', 'depth', 'lambert', 'matcap', 'normal', 'phong', 'physical', 'standard', 'toon' ] } },
    },
    icon: ``,
    color: 'rgb(165, 243, 0)',
    dependencies: [ 'geometry' ],
};

ComponentManager.register('material', Material);
