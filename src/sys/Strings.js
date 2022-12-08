/** /////////////////////////////////////////////////////////////////////////////////
//
// @description Onsight Engine
// @about       Powerful, easy-to-use JavaScript video game and application creation engine.
// @author      Stephens Nunnally <@stevinz>
// @license     MIT - Copyright (c) 2021-2022 Stephens Nunnally and Scidian Studios
// @source      https://github.com/scidian/onsight-engine
//
///////////////////////////////////////////////////////////////////////////////////*/
//
//  String Functions
//      addSpaces           Adds spaces between 'CamelCaseWords' -> 'Camel Case Words'
//      capitalize          Capitalizes the first letter of every word in a string
//      countDigits         Counts number of digits in a number
//      nameFromUrl         Returns name from file url
//
/////////////////////////////////////////////////////////////////////////////////////

class Strings {

    /** Adds spaces between 'CamelCaseWords' -> 'Camel Case Words' */
    static addSpaces(string) {
        return String(string).replace(/([A-Z])/g, ' $1').trim();
    }

    /** Capitalizes the first letter of every word in a string */
    static capitalize(string) {
        const words = String(string).split(' ');
        for (let i = 0; i < words.length; i++) {
            words[i] = words[i][0].toUpperCase() + words[i].substring(1);
        }
        return words.join(' ');
    }

    /** Counts number of digits in a number */
    static countDigits(number) {
        return parseFloat(number).toString().length;
    }

    /** Returns name from file url */
    static nameFromUrl(url, capitalize = true) {
        let imageName = new String(url.replace(/^.*[\\\/]/, ''));       // Filename only
        imageName = imageName.replace(/\.[^/.]+$/, "");                 // Remove extension
        if (capitalize) imageName = Strings.capitalize(imageName);
        return imageName;
    }

}

export { Strings };
