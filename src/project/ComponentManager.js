import * as THREE from 'three';
import { Maths } from '../utils/Maths.js';
import { Strings } from '../utils/Strings.js';
import { System } from '../utils/System.js';

// REGISTRATION
//  registered()        Returns class definition of a registered type
//  registeredTypes()   Returns an array of all types registered with Component Manager
//  register()          Registers a component type with the internal Component Manager
// DATA
//  includeData()       Checks if a schema item should be included in a component data structure
//  sanitizeData()      Build default data of 'type', remove any properties that should not be included
//  stripData()         Removes data from 'newData' if conditions from schema on 'newData' don't match 'oldData'

/******************** Property Types ********************/
//
//  NOTE: See 'test' component for examples of all property types
//
//  TYPE            DESCRIPTION                     DEFAULT             OPTIONS (DEFAULT)
//
//      -- DATA TYPES --
//  select          Dropdown                        null
//
//  number          Number Box                      0                   min (-inf), max (inf), step (1), unit (''), label, precision (3)
//  int             Whole Number                    0                   min (-inf), max (inf), step (1), unit (''), label
//  angle           Degrees, converted to Radians   0                   min (-inf), max (inf), step (10), unit ('°'), label, precision (3)
//  slider          Number Slider                   0                   min (-inf), max (inf), step ('any'), precision (2)
//
//  variable        Number with +/- Number          [ 0, 0 ]            min[], max[], step[], unit[], precision[]
//  vector          Number Array                    [ 0 ]               size: array length, tint (false) - also min[], max[], step[], unit[], precision[], label[]

//  boolean         Option / Checkbox               false
//  color           Color Selector                  0xffffff
//  string          String / Multiline?             ''                  rows (1)
//
//      -- UUID TYPES --
//  asset           Asset (asset.uuid)              null                class: (all) or (geometry, material, script, shape, texture, prefab)
//
//      -- OBJECT TYPES --
//  object          Data object                     {}
//
//      -- FORMATTING --
//  divider         Inserts horizontal rule         ---                 Used for formatting / layout only
//

/******************** OPTIONS ********************/
//
//  INSPECTOR OPTIONS
//  hide            Hide in Inspector if any of these conditions are met
//  alias           Override a variable name to have custom string shown in Inspector
//  promode         Only Show when 'promode' is enabled
//  rebuild         Change of this property will cause a rebuild of the Inspector ('style' always rebuilds)
//
//  DATA OPTIONS
//  type            Must be provided, data type, see above
//  select          Options for drop down selection box
//  if              Only include property if these conditions are met
//  not             Do not include property if these conditions are met
//  default         Default value of item if none provided
//
//  NUMERICAL OPTIONS (can be array values for numArrays / variable)
//  min             Minimum allowed value
//  max             Maximum allowed value
//  step            Mouse wheel / arrow key step of number when being changed in Inspector. See special step values below
//  precision       Decimal precision of value
//  unit            Display unit of number type ('°', 'px', etc.) in Inspector
//  label           Displays a decoration label for the number, i.e. 'X:' or 'H:'... Using this right aligns the input box!
//
//  SPECIAL STEP VALUES (Number / Int / Angle / Slider)
//  'any'           Applies to Slider only. Totally smooth, slider can be any value
//  'grid'          Align step to current editor 'grid' setting
//
//  VECTOR OPTIONS
//  size            Length of array
//  tint            When true, number boxes are colorered (up to 4 boxes, axis colors)
//
//  STRING OPTIONS
//  rows            If value of > 1, specifies multiline text. Value describes desired default height when displayed.
//
//  ASSET OPTIONS
//  class           If left out, can be any asset in project. Otherwise specifies which asset type to use (geometry, texture, etc.)
//

const _registered = {};

class ComponentManager {

    /******************** TYPES */

    static defaultValue(type) {
        switch (type) {
            case 'select':      return null;
            case 'number':      return 0;
            case 'int':         return 0;
            case 'angle':       return 0;
            case 'slider':      return 0;
            case 'variable':    return [ 0, 0 ];
            case 'vector':      return [ 0 ];
            case 'boolean':     return false;
            case 'color':       return 0xffffff;
            case 'string':      return '';
            case 'asset':       return null;
            case 'object':      return {};
            case 'divider':     return null;
            default:
                console.warn(`ComponentManager.defaultValue(): Unknown property type: '${type}'`);
        }
        return null;
    }

    /******************** REGISTRATION */

    /** Returns class definition of a registered type */
    static registered(type = '') {
        const ComponentClass = _registered[type];
        if (!ComponentClass) console.warn(`ComponentManager.registered: Component '${type}' not registered'`);
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
        if (!System.isObject(ComponentClass.config)) ComponentClass.config = {};
        if (!System.isObject(ComponentClass.config.schema)) ComponentClass.config.schema = {};

        // Ensure Default Values for Properties
        const schema = ComponentClass.config.schema;
        for (const key in schema) {
            const prop = Array.isArray(schema[key]) ? schema[key] : [ schema[key] ];

            for (let i = 0, l = prop.length; i < l; i++) {
                const property = prop[i];

                if (property.type === undefined) {
                    console.warn(`ComponentManager.register(): All schema properties require a 'type' value`);
                } else if (property.type === 'divider') {
                    // NOTHING: 'divider' type is for formatting only!
                    continue;
                }

                if (property.default === undefined) {
                    property.default = ComponentManager.defaultValue(property.type);
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
                this.type = type;

                // Properties
                this.attached = true;
                this.expanded = true;
                this.tag = '';

                // Owner
                this.entity = null;

                // Data
                this.data = {};
            }

            init(data) {
                this.dispose();
                if (typeof super.init === 'function') super.init(data);
            }

            dispose() {
                if (typeof super.dispose === 'function') super.dispose();
                if (this.backend && typeof this.backend.dispose === 'function') this.backend.dispose();
                this.backend = undefined;
            }

            attach() {
                this.attached = true;
                if (typeof super.attach === 'function') super.attach();
            }

            detach() {
                this.attached = false;
                if (typeof super.detach === 'function') super.detach();
            }

            update(data) {
                const newData = this.data ?? {};
                Object.assign(newData, data);
                ComponentManager.sanitizeData(this.type, newData);
                this.detach();
                this.init(newData);
                this.attach();
            }

            three() {
                if (typeof super.three === 'function') return super.three();
                return undefined;
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
                    isComponent:    true,
                    attached:       this.attached,
                    expanded:       this.expanded,
                    tag:            this.tag,
                    type:           this.type,
                };
                return data;
            }

            toJSON() {
                let data;
                if (this.data && this.data.style) {
                    data = this.defaultData('style', this.data.style);
                } else {
                    data = this.defaultData();
                }

                // Copy existing 'data' properties
                for (let key in data) {
                    if (this.data[key] !== undefined) {

                        // Make sure to save 'texture' as UUID only
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

        // Register Component
        _registered[type] = Component;
    }

    /******************** DATA */

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

            if (!check1 || !check2) return false;
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
        if (!data || typeof data !== 'object') data = {};

        const ComponentClass = ComponentManager.registered(type);
        if (!ComponentClass || !ComponentClass.config || !ComponentClass.config.schema) return;
        const schema = ComponentClass.config.schema;
        if (!System.isObject(schema)) return;

        // PARSE KEYS
        for (let schemaKey in schema) {

            // Get Value as Array (which is a list of properties with different 'if' conditions)
            let itemArray = schema[schemaKey];
            if (System.isIterable(itemArray) !== true) itemArray = [ schema[schemaKey] ];

            // Process each item in property array, include first item that is allowed (matches 'if', 'not', etc.)
            let itemToInclude = undefined;
            for (let i = 0; i < itemArray.length; i++) {
                let item = itemArray[i];

                // FORMATTING ONLY
                if (item.type === 'divider') continue;

                // PROCESS 'IF' / 'NOT'
                if (!ComponentManager.includeData(item, data)) continue;

                itemToInclude = item;
                break;
            }

            // Make sure we have the property
            if (itemToInclude !== undefined) {
                if (data[schemaKey] === undefined) {
                    data[schemaKey] = itemToInclude.default;
                }

                if (Maths.isNumber(data[schemaKey])) {
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

    }

    /** Removes properties from 'newData' if conditions from schema on 'newData' don't match 'oldData' */
    static stripData(type, oldData, newData) {

        const ComponentClass = ComponentManager.registered(type);
        if (!ComponentClass || !ComponentClass.config || !ComponentClass.config.schema) return;
        const schema = ComponentClass.config.schema;
        if (!System.isObject(schema)) return;

        // PARSE KEYS
        for (let schemaKey in schema) {
            let matchedConditions = false;

            // Get Value as Array (list of properties with different 'if' conditions)
            let itemArray = schema[schemaKey];
            if (System.isIterable(itemArray) !== true) itemArray = [ schema[schemaKey] ];

            // Process each item in property array, check if that we satisfy 'if' condition
            for (let i = 0; i < itemArray.length; i++) {
                let item = itemArray[i];

                // FORMATTING ONLY
                if (item.type === 'divider') continue;

                // PROCESS 'IF' / 'NOT'
                if (!ComponentManager.includeData(item, oldData, newData)) continue;

                matchedConditions = true;
                break;
            }

            // Both data sets matched same condition
            if (matchedConditions !== true) {
                delete newData[schemaKey];
            }

        }

    }

}

export { ComponentManager };
