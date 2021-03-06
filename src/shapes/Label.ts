import { Collection } from '../Util';
import { Factory } from '../Factory';
import { Shape } from '../Shape';
import { Group } from '../Group';
import { getNumberValidator } from '../Validators';

import { GetSet } from '../types';

// constants
var ATTR_CHANGE_LIST = [
    'fontFamily',
    'fontSize',
    'fontStyle',
    'padding',
    'lineHeight',
    'text',
    'width'
  ],
  CHANGE_KONVA = 'Change.konva',
  NONE = 'none',
  UP = 'up',
  RIGHT = 'right',
  DOWN = 'down',
  LEFT = 'left',
  // cached variables
  attrChangeListLen = ATTR_CHANGE_LIST.length;

/**
 * Label constructor.&nbsp; Labels are groups that contain a Text and Tag shape
 * @constructor
 * @memberof Konva
 * @param {Object} config
 * @@nodeParams
 * @example
 * // create label
 * var label = new Konva.Label({
 *   x: 100,
 *   y: 100,
 *   draggable: true
 * });
 *
 * // add a tag to the label
 * label.add(new Konva.Tag({
 *   fill: '#bbb',
 *   stroke: '#333',
 *   shadowColor: 'black',
 *   shadowBlur: 10,
 *   shadowOffset: [10, 10],
 *   shadowOpacity: 0.2,
 *   lineJoin: 'round',
 *   pointerDirection: 'up',
 *   pointerWidth: 20,
 *   pointerHeight: 20,
 *   cornerRadius: 5
 * }));
 *
 * // add text to the label
 * label.add(new Konva.Text({
 *   text: 'Hello World!',
 *   fontSize: 50,
 *   lineHeight: 1.2,
 *   padding: 10,
 *   fill: 'green'
 *  }));
 */
export class Label extends Group {
  constructor(config) {
    super(config);
    this.on('add.konva', function(evt) {
      this._addListeners(evt.child);
      this._sync();
    });
  }

  /**
   * get Text shape for the label.  You need to access the Text shape in order to update
   * the text properties
   * @name Konva.Label#getText
   * @method
   * @example
   * label.getText().fill('red')
   */
  getText() {
    return this.find('Text')[0];
  }
  /**
   * get Tag shape for the label.  You need to access the Tag shape in order to update
   * the pointer properties and the corner radius
   * @name Konva.Label#getTag
   * @method
   */
  getTag() {
    return this.find('Tag')[0] as Tag;
  }
  _addListeners(text) {
    var that = this,
      n;
    var func = function() {
      that._sync();
    };

    // update text data for certain attr changes
    for (n = 0; n < attrChangeListLen; n++) {
      text.on(ATTR_CHANGE_LIST[n] + CHANGE_KONVA, func);
    }
  }
  getWidth() {
    return this.getText().width();
  }
  getHeight() {
    return this.getText().height();
  }
  _sync() {
    var text = this.getText(),
      tag = this.getTag(),
      width,
      height,
      pointerDirection,
      pointerWidth,
      x,
      y,
      pointerHeight;

    if (text && tag) {
      width = text.width();
      height = text.height();
      pointerDirection = tag.pointerDirection();
      pointerWidth = tag.pointerWidth();
      pointerHeight = tag.pointerHeight();
      x = 0;
      y = 0;

      switch (pointerDirection) {
        case UP:
          x = width / 2;
          y = -1 * pointerHeight;
          break;
        case RIGHT:
          x = width + pointerWidth;
          y = height / 2;
          break;
        case DOWN:
          x = width / 2;
          y = height + pointerHeight;
          break;
        case LEFT:
          x = -1 * pointerWidth;
          y = height / 2;
          break;
      }

      tag.setAttrs({
        x: -1 * x,
        y: -1 * y,
        width: width,
        height: height
      });

      text.setAttrs({
        x: -1 * x,
        y: -1 * y
      });
    }
  }
}

Label.prototype.className = 'Label';

Collection.mapMethods(Label);

/**
 * Tag constructor.&nbsp; A Tag can be configured
 *  to have a pointer element that points up, right, down, or left
 * @constructor
 * @memberof Konva
 * @param {Object} config
 * @param {String} [config.pointerDirection] can be up, right, down, left, or none; the default
 *  is none.  When a pointer is present, the positioning of the label is relative to the tip of the pointer.
 * @param {Number} [config.pointerWidth]
 * @param {Number} [config.pointerHeight]
 * @param {Number} [config.cornerRadius]
 */
export class Tag extends Shape {
  _sceneFunc(context) {
    var width = this.width(),
      height = this.height(),
      pointerDirection = this.pointerDirection(),
      pointerWidth = this.pointerWidth(),
      pointerHeight = this.pointerHeight(),
      cornerRadius = Math.min(this.cornerRadius(), width / 2, height / 2);

    context.beginPath();
    if (!cornerRadius) {
      context.moveTo(0, 0);
    } else {
      context.moveTo(cornerRadius, 0);
    }

    if (pointerDirection === UP) {
      context.lineTo((width - pointerWidth) / 2, 0);
      context.lineTo(width / 2, -1 * pointerHeight);
      context.lineTo((width + pointerWidth) / 2, 0);
    }

    if (!cornerRadius) {
      context.lineTo(width, 0);
    } else {
      context.lineTo(width - cornerRadius, 0);
      context.arc(
        width - cornerRadius,
        cornerRadius,
        cornerRadius,
        (Math.PI * 3) / 2,
        0,
        false
      );
    }

    if (pointerDirection === RIGHT) {
      context.lineTo(width, (height - pointerHeight) / 2);
      context.lineTo(width + pointerWidth, height / 2);
      context.lineTo(width, (height + pointerHeight) / 2);
    }

    if (!cornerRadius) {
      context.lineTo(width, height);
    } else {
      context.lineTo(width, height - cornerRadius);
      context.arc(
        width - cornerRadius,
        height - cornerRadius,
        cornerRadius,
        0,
        Math.PI / 2,
        false
      );
    }

    if (pointerDirection === DOWN) {
      context.lineTo((width + pointerWidth) / 2, height);
      context.lineTo(width / 2, height + pointerHeight);
      context.lineTo((width - pointerWidth) / 2, height);
    }

    if (!cornerRadius) {
      context.lineTo(0, height);
    } else {
      context.lineTo(cornerRadius, height);
      context.arc(
        cornerRadius,
        height - cornerRadius,
        cornerRadius,
        Math.PI / 2,
        Math.PI,
        false
      );
    }

    if (pointerDirection === LEFT) {
      context.lineTo(0, (height + pointerHeight) / 2);
      context.lineTo(-1 * pointerWidth, height / 2);
      context.lineTo(0, (height - pointerHeight) / 2);
    }

    if (cornerRadius) {
      context.lineTo(0, cornerRadius);
      context.arc(
        cornerRadius,
        cornerRadius,
        cornerRadius,
        Math.PI,
        (Math.PI * 3) / 2,
        false
      );
    }

    context.closePath();
    context.fillStrokeShape(this);
  }
  getSelfRect() {
    var x = 0,
      y = 0,
      pointerWidth = this.pointerWidth(),
      pointerHeight = this.pointerHeight(),
      direction = this.pointerDirection(),
      width = this.width(),
      height = this.height();

    if (direction === UP) {
      y -= pointerHeight;
      height += pointerHeight;
    } else if (direction === DOWN) {
      height += pointerHeight;
    } else if (direction === LEFT) {
      // ARGH!!! I have no idea why should I used magic 1.5!!!!!!!!!
      x -= pointerWidth * 1.5;
      width += pointerWidth;
    } else if (direction === RIGHT) {
      width += pointerWidth * 1.5;
    }
    return {
      x: x,
      y: y,
      width: width,
      height: height
    };
  }

  pointerDirection: GetSet<'left' | 'top' | 'right' | 'bottom', this>;
  pointerWidth: GetSet<number, this>;
  pointerHeight: GetSet<number, this>;
  cornerRadius: GetSet<number, this>;
}

Tag.prototype.className = 'Tag';

/**
 * get/set pointer direction
 * @name Konva.Tag#pointerDirection
 * @method
 * @param {String} pointerDirection can be up, right, down, left, or none.  The default is none.
 * @returns {String}
 * @example
 * tag.pointerDirection('right');
 */
Factory.addGetterSetter(Tag, 'pointerDirection', NONE);

/**
 * get/set pointer width
 * @name Konva.Tag#pointerWidth
 * @method
 * @param {Number} pointerWidth
 * @returns {Number}
 * @example
 * tag.pointerWidth(20);
 */
Factory.addGetterSetter(Tag, 'pointerWidth', 0, getNumberValidator());

/**
 * get/set pointer height
 * @method
 * @name Konva.Tag#pointerHeight
 * @param {Number} pointerHeight
 * @returns {Number}
 * @example
 * tag.pointerHeight(20);
 */

Factory.addGetterSetter(Tag, 'pointerHeight', 0, getNumberValidator());

/**
 * get/set cornerRadius
 * @name Konva.Tag#cornerRadius
 * @method
 * @param {Number} cornerRadius
 * @returns {Number}
 * @example
 * tag.cornerRadius(20);
 */

Factory.addGetterSetter(Tag, 'cornerRadius', 0, getNumberValidator());

Collection.mapMethods(Tag);
