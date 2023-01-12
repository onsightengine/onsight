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
//  ComponentManager Functions
//      Registration
//          registered          Returns class definition of a registered type
//          registeredTypes     Returns an array of all types registered with Component Manager
//          register            Registers a component type with the internal Component Manager
//      Data
//          includeData         Checks if a schema item should be included in a component data structure
//          sanitizeData        Build default data of 'type', remove any properties that should not be included
//          stripData           Removes data from 'newData' if conditions from schema on 'newData' don't match 'oldData'
//
/////////////////////////////////////////////////////////////////////////////////////
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
//  ////////// BELOW: STILL NEED TO IMPLEMENT //////////
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
/////////////////////////////////////////////////////////////////////////////////////
//
//  DATA OPTIONS
//  ------------
//  type            Must be provided, data type, see above
//  select          Options for drop down selection box
//  if              Only include property if these conditions are met
//  not             Do not include property if these conditions are met
//  default         Default value of item if none provided
//
//  INSPECTOR OPTIONS
//  --------------
//  hide            Hide in Inspector if any of these conditions are met
//  alias           Override a variable name to have custom string shown in Inspector
//  promode         Only Show when 'promode' is enabled
//  rebuild         Change of this property will cause a rebuild of the Inspector ('style' always rebuilds)
//
//  NUMERICAL OPTIONS
//  -----------------
//  min             Minimum allowed value
//  max             Maximum allowed value
//  precision       Decimal precision of value
//  unit            Display unit of number type ('°', 'px', etc.) in Inspector
//  step            Mouse wheel / arrow key step of number when being changed in Inspector. See special step values below
//
//  SPECIAL STEP VALUES (Number / Int / Angle / Slider)
//  -------------------
//  'any'           Applies to Slider only. Totally smooth, slider can be any value
//  'grid'          Align step to current editor 'grid' setting
//
/////////////////////////////////////////////////////////////////////////////////////

import * as THREE from 'three';

import { MathUtils } from '../math/MathUtils.js';
import { Strings } from '../sys/Strings.js';
import { System } from '../sys/System.js';

const _registered = {};

class ComponentManager {

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Registration
    ////////////////////

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

    /** Registers a component type with the internal Component Manager */
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
                const property = prop[i];

                if (property.type === undefined) {
                    console.warn(`ComponentManager.register(): All schema properties require a 'type' value`);
                } else if (property.type === 'divider') {
                    // NOTHING: Type is for formatting only!
                    continue;
                }

                if (property.default === undefined) {
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
                        // --------- TODO: Below Needs Incorporate Inspector ---------
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
                            property.default = null;
                    }
                }

                if (property.proMode !== undefined) {
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

                // Data
                this.data = {};
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

    /////////////////////////////////////////////////////////////////////////////////////
    /////   Data
    ////////////////////

    /** Checks if a schema item should be included in a component data structure, optionally check a second data structure */
    static includeData(item, data1, data2 = undefined) {

        // Check all 'if' keys, ex: bevelSize: { type: 'number', if: { style: [ 'shape' ], bevelEnabled: [ true ] } } }
        for (let key in item.if) {
            let conditions = item.if[key];
            if (System.isIterable(conditions) !== true) conditions = [ conditions ];

            let check1 = false, check2 = false;
            for (let j = 0; j < conditions.length; j++) {
                check1 = check1 || (data1[key] === conditions[j]);
                check2 = check2 || (data2 === undefined) ? true : (data2[key] === conditions[j]);
            }

            if (! check1 || ! check2) return false;
        }

        // Check all 'not' keys, EXAMPLE: height: { type: 'number', not: { style: [ 'shape' ] } },
        for (let key in item.not) {
            let conditions = item.not[key];
            if (System.isIterable(conditions) !== true) conditions = [ conditions ];

            let check1 = false, check2 = false;
            for (let j = 0; j < conditions.length; j++) {
                check1 = check1 || (data1[key] === conditions[j]);
                check2 = check2 || (data2 === undefined) ? false : (data2[key] === conditions[j]);
            }

            if (check1 || check2) return false;
        }

        return true;
    }

    /** Build default data of 'type', remove any properties that should not be included */
    static sanitizeData(type, data) {

        const ComponentClass = ComponentManager.registered(type);
        const schema = (ComponentClass && ComponentClass.config) ? ComponentClass.config.schema : {};

        ///// PARSE KEYS
        for (let schemaKey in schema) {

            // Get Value as Array (which is a list of properties with different 'if' conditions)
            let itemArray = schema[schemaKey];
            if (System.isIterable(itemArray) !== true) itemArray = [ schema[schemaKey] ];

            // Process each item in property array, include first item that is allowed (matches 'if', 'not', etc.)
            let itemToInclude = undefined;
            for (let i = 0; i < itemArray.length; i++) {
                let item = itemArray[i];

                ///// FORMATTING ONLY
                if (item.type === 'divider') continue;

                ///// PROCESS 'IF' / 'NOT'
                if (! ComponentManager.includeData(item, data)) continue;

                itemToInclude = item;
                break;
            }

            // Make sure we have the property
            if (itemToInclude !== undefined) {
                if (data[schemaKey] === undefined) {
                    data[schemaKey] = itemToInclude.default;
                }

                if (MathUtils.isNumber(data[schemaKey])) {
                    const min = itemToInclude['min'] ?? -Infinity;
                    const max = itemToInclude['max'] ??  Infinity;
                    if (data[schemaKey] < min) data[schemaKey] = min;
                    if (data[schemaKey] > max) data[schemaKey] = max;
                }

            // Make sure we don't have the property
            } else {
                delete data[schemaKey];
            }

        } // next schemaKey

    } // end santitizeData

    /** Removes properties from 'newData' if conditions from schema on 'newData' don't match 'oldData' */
    static stripData(type, oldData, newData) {

        const ComponentClass = ComponentManager.registered(type);
        const schema = (ComponentClass && ComponentClass.config) ? ComponentClass.config.schema : {};

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

                ///// PROCESS 'IF' / 'NOT'
                if (! ComponentManager.includeData(item, oldData, newData)) continue;

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

export { ComponentManager };
