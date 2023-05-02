// META
//  Alt/Option  ⌥ ⎇
//  Ctrl        ⌃
//  Cmd         ⌘
//  Shift       ⇧
// KEYS
//  Caps Lock   ⇪
//  Fn
//  Escape      ⎋
//  Delete      ⌦
//  Backspace   ⌫
//  Enter       ↵
//  Space      ' '      &nbsp;
//  Space (EM) ' '      &emsp;
// MATH
//  Amperstand  &       &amp;
//  Degrees     °       &deg;
//  Delta       Δ       &Delta;
//  Dot         •       &sdot;
//  Fuzzy       ~       &sim;
//  Infinity    ∞       &infin;
//  Multiply    ×
//  Not Equal   ≠       &ne;
// SYMBOLS
//  Apple       
//  Copyright   ©       &copy;
//  Double      "       &quot;
//  Heart       ♥       &hearts;
//  Registered  ®       &reg;
//  Search      ⌕
//  Single      '       &apos;
//  Target      ⌖
//  Touch       ⍝
//  Trademark   ™       &trade;

// addSpaces()      Adds spaces between 'CamelCaseWords' -> 'Camel Case Words'
// capitalize()     Capitalizes the first letter of every word in a string
// countDigits()    Counts number of digits in a number
// escapeHTML()     Replaces special characters with html characters
// nameFromUrl()    Returns name from file url

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

    /** Replaces special characters with html characters */
    static escapeHTML(html) {
        if (html == undefined) return html;
        return html
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
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