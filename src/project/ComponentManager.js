/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Software
// @source      https://github.com/onsightengine/onsight
//
///////////////////////////////////////////////////////////////////////////////////*/
//
//              Component Property Types
//              ------------------------
//
//  Type            Description                     Default             Options (Default)
//  ----            -----------                     -------             -----------------
//
//  ///// DATA TYPES /////
//
//  select          Dropdown                        null
//  number          Number Box                      0                   min (-inf), max (inf), step (1), unit (''), precision (3)
//  int             Whole Number                    0                   min (-inf), max (inf), step (1), unit ('')
//  angle           Degrees, converted to Radians   0                   min (-inf), max (inf), step (10), unit ('°'), precision (3)
//  slider          Number Slider                   0                   min (-inf), max (inf), step ('any'), precision (2)
//
//  boolean         Option / Checkbox               false
//  color           Color Selector                  0xffffff
//
//  asset           Asset (asset.uuid)              null
//  map             Texture Map (texture.uuid)      null
//
//  ///// FORMATTING /////
//
//  divider         Inserts horizontal rule
//
//  ///// TO IMPLEMENT /////
//
//  !! scroller     Number Scroller Box             0
//  !! variable     Number with +/- Number          [ 0, 0 ]
//
//  !! array        Array                           []
//  !! vector2      2 Numbers w/ Options            [ 0, 0 ]
//  !! vector3      3 Numbers w/ Options            [ 0, 0, 0 ]
//  !! vector4      4 Numbers w/ Options            [ 0, 0, 0, 0 ]
//
//  !! string       String, Single, Multiline       ''
//  !! shape        Vector Path (THREE.Shape)       null
//
//  !! script       Script                          ''
//
//  !! === Not Implemented Yet
//
/////////////////////////////////////////////////////////////////////////////////////
//
//  ADD-ON OPTIONS
//  --------------
//  alias           Override a variable name to have custom string shown in Inspector
//  promode         Only Show when 'promode' is enabled
//  hide            Hides in Editor if any of the conditions are met
//
//  SPECIAL STEP VALUES (Number / Int / Angle / Slider)
//  -------------------
//  'any'           Applies to Slider only. Totally smooth, slider can be any value
//  'grid'          Align step to current editor 'grid' setting
//
/////////////////////////////////////////////////////////////////////////////////////

import * as THREE from 'three';

import { Maths } from '../core/Maths.js';
import { Strings } from '../core/Strings.js';
import { System } from '../core/System.js';

/////////////////////////////////////////////////////////////////////////////////////
/////   Component Manager
/////////////////////////////////////////////////////////////////////////////////////

const _registered = {};

class ComponentManager {

    /** Returns class definition of a registered type */
    static registered(type = '') {
        const ComponentClass = _registered[type];
        if (! ComponentClass) console.warn(`ComponentManager.registered: Component '${type}' not registered'`);
        return ComponentClass;
    }

    /** Returns an array of all types registered with Component Manager */
    static registeredTypes() {
        return Object.keys(_registered);
    }

    /** Registers a component type with the internal Component Manager () */
    static register(type = '', ComponentClass) {

        // Check for Component Type
        type = type.toLowerCase();
        if (_registered[type]) return console.warn(`ComponentManager.register: Component '${type}' already registered`);
        if (! System.isObject(ComponentClass.config)) ComponentClass.config = {};
        if (! System.isObject(ComponentClass.config.schema)) ComponentClass.config.schema = {};

        // Ensure Default Values for Properties
        const schema = ComponentClass.config.schema;
        for (const key in schema) {
            const prop = Array.isArray(schema[key]) ? schema[key] : [ schema[key] ];
            for (let i = 0, l = prop.length; i < l; i++) {
                let property = prop[i];
                if (property.type === undefined) {
                    console.warn(`ComponentManager.register(): All schema properties require a 'type' value`);
                } else if (property.type === 'divider') {
                    //
                    // NOTHING: Type is for formatting only!
                    //
                } else if (property.default === undefined) {
                    switch (property.type) {
                        case 'select':      property.default = null;            break;
                        case 'number':      property.default = 0;               break;
                        case 'int':         property.default = 0;               break;
                        case 'angle':       property.default = 0;               break;
                        case 'slider':      property.default = 0;               break;
                        case 'boolean':     property.default = false;           break;
                        case 'color':       property.default = 0xffffff;        break;
                        case 'asset':       property.default = null;            break;
                        case 'map':         property.default = null;            break;
                        // ------ !!!!! TODO: Below Needs Incorporate Inspector ------
                        case 'scroller':    property.default = 0;               break;
                        case 'variable':    property.default = [ 0, 0 ];        break;
                        case 'array':       property.default = [];              break;
                        case 'vector2':     property.default = [ 0, 0 ];        break;
                        case 'vector3':     property.default = [ 0, 0, 0 ];     break;
                        case 'vector4':     property.default = [ 0, 0, 0, 0 ];  break;
                        case 'string':      property.default = '';              break;
                        case 'shape':       property.default = null;            break;
                        case 'script':      property.default = '';              break;
                        default:
                            console.warn(`ComponentManager.register(): Unknown property type: '${property.type}'`);
                    }
                } else if (property.proMode !== undefined) {
                    property.promode = property.proMode;
                }
            }
        }

        // Add Constructor (sets type)
        class Component extends ComponentClass {
            constructor() {
                super();

                // Prototype
                this.isComponent = true;

                // Properties
                this.enabled = true;
                this.tag = '';
                this.type = type;

                // Owner
                this.entity = null;
            }

            init(data) {
                super.init(data);
            }

            dispose() {
                super.dispose();
            }

            disable() {
                this.enabled = false;
                super.disable();
            }

            enable() {
                this.enabled = true;
                super.enable();
            }

            // Returns stored default schema (saved when Component was registered). Pass in starting data by key, value pair
            defaultData(/* key, value, key, value, etc. */) {
                const data = {};

                // Set Schema Defaults (keep new data)
                for (let i = 0, l = arguments.length; i < l; i += 2) {
                    data[arguments[i]] = arguments[i+1];
                }
                ComponentManager.sanitizeData(this.type, data);

                // Base Properties
                data.base = {
                    enabled: 	this.enabled,
                    tag:		this.tag,
                    type:		this.type,
                };
                return data;
            }
        }

        // Register Component
        _registered[type] = Component;
    }

    static processIf() {

    }

    static sanitizeData(type, data) {

        const ComponentClass = ComponentManager.registered(type);
        const schema = (ComponentClass && ComponentClass.config) ? ComponentClass.config.schema : {};

        ///// PARSE KEYS
        for (let schemaKey in schema) {

            // Get Value as Array (which is a list of properties with different 'if' conditions)
            let itemArray = schema[schemaKey];
            if (System.isIterable(itemArray) !== true) itemArray = [ schema[schemaKey] ];

            // Process each item in property array, check if that we satisfy 'if' condition
            let itemToInclude = undefined;
            for (let i = 0; i < itemArray.length; i++) {
                let item = itemArray[i];

                ///// FORMATTING ONLY
                if (item.type === 'divider') continue;

                ///// PROCESS 'IF'
                if (item.if !== undefined) {
                    let allConditions = true;

                    for (let ifKey in item.if) {
                        let ifArray = Array.isArray(item.if[ifKey]) ? item.if[ifKey] : [];
                        let eachCondition = false;
                        for (let j = 0; j < ifArray.length; j++) {
                            if (data[ifKey] === ifArray[j]) {
                                eachCondition = true;
                                break;
                            }
                        }
                        if (eachCondition !== true) {
                            allConditions = false;
                            break;
                        }
                    }

                    if (allConditions !== true) {
                        // DO NOT INCLUDE
                        continue;
                    }
                }

                itemToInclude = item;
                break;
            }

            // Make sure we have the property
            if (itemToInclude !== undefined) {
                if (data[schemaKey] === undefined) {
                    data[schemaKey] = itemToInclude.default;
                }

                if (Maths.isNumber(data[schemaKey])) {
                    let min = itemToInclude['min'] ?? -Infinity;
                    let max = itemToInclude['max'] ??  Infinity;
                    if (data[schemaKey] < min) data[schemaKey] = min;
                    if (data[schemaKey] > max) data[schemaKey] = max;
                }

            // Make sure we don't have the property
            } else {
                delete data[schemaKey];
            }

        } // end for

    } // end function

    /** Removes data from 'newData' if conditions from schema on 'newData' don't match 'oldData' */
    static stripData(oldData, newData, schema) {

        ///// PARSE KEYS
        for (let schemaKey in schema) {
            let matchedConditions = false;

            // Get Value as Array (list of properties with different 'if' conditions)
            let itemArray = schema[schemaKey];
            if (System.isIterable(itemArray) !== true) itemArray = [ schema[schemaKey] ];

            // Process each item in property array, check if that we satisfy 'if' condition
            for (let i = 0; i < itemArray.length; i++) {
                let item = itemArray[i];

                ///// FORMATTING ONLY
                if (item.type === 'divider') continue;

                ///// PROCESS 'IF'
                if (item.if !== undefined) {
                    let allConditions = true;

                    for (let ifKey in item.if) {
                        let ifArray = Array.isArray(item.if[ifKey]) ? item.if[ifKey] : [];
                        let eachCondition = false;
                        let conditionOne = false, conditionTwo = false;

                        for (let j = 0; j < ifArray.length; j++) {
                            if (oldData[ifKey] === ifArray[j]) conditionOne = true;
                            if (newData[ifKey] === ifArray[j]) conditionTwo = true;
                            if (conditionOne && conditionTwo) {
                                eachCondition = true;
                                break;
                            }
                        }

                        if (eachCondition !== true) {
                            allConditions = false;
                            break;
                        }
                    }

                    if (allConditions !== true) {
                        // DO NOT INCLUDE
                        continue;
                    }
                }

                matchedConditions = true;
                break;
            }

            // Both data sets matched same condition
            if (matchedConditions !== true) {
                delete newData[schemaKey];
            }

        }	// end for

    } // end function

}

/////////////////////////////////////////////////////////////////////////////////////
/////	Exports
/////////////////////////////////////////////////////////////////////////////////////

export { ComponentManager };
