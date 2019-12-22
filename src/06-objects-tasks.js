/* ************************************************************************************************
 *                                                                                                *
 * Plese read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectagle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
  this.getArea = function n() {
    return this.width * this.height;
  };
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  const values = Object.values(obj);
  return new proto.constructor(...values);
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurences
 *
 * All types of selectors can be combined using the combinators ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string repsentation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */


function Selector() {
  return {
    str: '',
    last: null,
    unicCall: { id: 0, pseudoElement: 0, element: 0 },
    orderRule: ['element', 'id', 'class', 'attr', 'pseudoClass', 'pseudoElement'],

    checkCall(fName) {
      this.unicCall[fName] += 1;
      if (this.unicCall[fName] > 1) {
        throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
      }
    },

    checkOrder(fName) {
      const isOrdered = this.orderRule.indexOf(this.last) <= this.orderRule.indexOf(fName);
      this.last = fName;
      if (!isOrdered) {
        throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
      }
    },

    callMeth(v, fName, addBefore, addAfter) {
      this.checkCall(fName);
      this.checkOrder(fName);
      this.str += addBefore || '';
      this.str += v;
      this.str += addAfter || '';
      return this;
    },


    element(v) {
      return this.callMeth(v, 'element');
    },

    id(v) {
      return this.callMeth(v, 'id', '#');
    },

    class(v) {
      return this.callMeth(v, 'class', '.');
    },

    attr(v) {
      return this.callMeth(v, 'attr', '[', ']');
    },

    pseudoClass(v) {
      return this.callMeth(v, 'pseudoClass', ':');
    },

    pseudoElement(v) {
      return this.callMeth(v, 'pseudoElement', '::');
    },

    stringify() {
      const res = this.str;
      this.str = '';
      this.last = null;
      this.prototype.selectors = [];
      return res;
    },

  };
}


const cssSelectorBuilder = {
  selectors: [],
  splitters: [],

  setNewSelector(v, f) {
    const n = new Selector();
    n[f](v);
    this.selectors.push(n);
    n.prototype = this;
    return n;
  },

  element(v) {
    return this.setNewSelector(v, 'element');
  },

  id(v) {
    return this.setNewSelector(v, 'id');
  },

  class(v) {
    return this.setNewSelector(v, 'class');
  },

  attr(v) {
    return this.setNewSelector(v, 'attr');
  },

  pseudoClass(v) {
    return this.setNewSelector(v, 'pseudoClass');
  },

  pseudoElement(v) {
    return this.setNewSelector(v, 'pseudoElement');
  },

  combine(a, b) {
    this.splitters.unshift(b);
    return this;
  },

  stringify() {
    const res = this.selectors.map((sel, i) => {
      let r = sel.stringify();
      if (this.splitters[i]) r += ` ${this.splitters[i]} `;
      return r;
    }).reduce((a, b) => (a + b));

    this.selectors = [];
    this.splitters = [];
    return res;
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
