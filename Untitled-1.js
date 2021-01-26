//some simple init
const Stage = Konva.Stage;
const Group = Konva.Group;
const Rect = Konva.Rect;
const Layer = Konva.Layer;

const stage = new Stage({
	width: 600,
  height: 600,
  container: document.querySelector('.canvas')
});

const layer = new Layer();
stage.add(layer);

const image = new Rect({
	width: 150,
  height: 150,
  x : 150,
  y : 150,
  fill: '#00FF00'
});

layer.add(image);
image.draw();

//usually I just do this
//import { TopLeftAnchor, TopRightAnchor, BottomLeftAnchor, BottomRightAnchor, RotateAnchor, DeleteAnchor } from './Anchors/index.js';
class AbstractAnchor {
    constructor(options) {
        if (!options.node) {
            throw new Error('Anchor needs an attached element');
        }
        this.reference = options.reference;
        this.node = options.node;
        this.name = options.name || 'top-left';
        this.width = options.width || 12;
        this.height = options.height || 12;
        this.strokeWidth = options.strokeWidth || 2;
        this.strokeColor = options.strokeColor || {
            r : 0,
            g : 0,
            b : 0
        };
        this.fill = options.fill || {
            r : 255,
            g : 255,
            b : 255
        };
        this.cursor = options.cursor || 'default';
        this.defaultCursor = options.defaultCursor || 'default';
        this.mouseMoveListener = null;
        this.mouseUpListener = null;
        return this.initAnchor().then((anchor) => {
            this.anchor = anchor;
            this.setAnchorPosition();
            this.addListeners();
            return anchor;
        });
    }

    initAnchor () {
        return new Promise((resolve) => {
            const position = this.getAnchorPosition();
            const rect = new Rect({
                x : position.x,
                y : position.y,
                width: this.width,
                height: this.height,
                stroke: 'rgb('+this.strokeColor.r+', '+this.strokeColor.g+', '+this.strokeColor.b+')',
                fill: 'rgb('+this.fill.r+', '+this.fill.g+', '+this.fill.b+')',
                strokeWidth: this.strokeWidth,
                name: this.name + ' _anchor',
                dragDistance: 0,
                draggable: false
            });
            resolve(rect);
        });

    }

    addListeners () {
        this.anchor.on('mousedown touchstart', this.handleMouseDown.bind(this));
        this.anchor.on('dragstart dragmove dragend', (e) => { e.cancelBubble = true; });
        this.anchor.on('mouseenter', this.setCursor.bind(this));
        this.anchor.on('mouseleave', this.resetCursor.bind(this));
        this.node.on('customSync', this.updateCoordinates.bind(this));
    }

    removeListeners () {
        this.anchor.off();
    }

    handleMouseDown (e) {
        e.cancelBubble = true;
        this.mouseMoveListener = this.handleMouseMove.bind(this);
        this.mouseUpListener = this.handleMouseUp.bind(this);
        window.addEventListener('mousemove', this.mouseMoveListener);
        window.addEventListener('touchmove', this.mouseMoveListener);
        window.addEventListener('mouseup', this.mouseUpListener, true);
        window.addEventListener('touchend', this.mouseUpListener, true);
    }

    handleMouseMove (e) {
        //TODO do transformations
    }

    handleMouseUp (e) {
        e.preventDefault();
        e.stopPropagation();
        window.removeEventListener('mousemove', this.mouseMoveListener);
        window.removeEventListener('touchmove', this.mouseMoveListener);
        window.removeEventListener('mouseup', this.mouseUpListener, true);
        window.removeEventListener('touchend', this.mouseUpListener, true);
    }

    /*
    * Return string, same as in CSS
    * https://developer.mozilla.org/ru/docs/Web/CSS/cursor
    * */
    getCursor () {
        return this.cursor;
    }

    setCursor () {
        const cursor = this.getCursor();
        const stage = this.anchor.getStage();
        if (stage) {
            stage.content.style.cursor = cursor;
        }
    }

    resetCursor () {
        const stage = this.anchor.getStage();
        if (stage) {
            stage.content.style.cursor = this.defaultCursor;
        }
    }

    getAnchorPosition () {
        return {
            x : -(this.width / 2),
            y : -(this.height / 2)
        };
    }

    setAnchorPosition () {
        //TODO set anchor position
    }
    updateCoordinates () {
        this.anchor.position(this.getAnchorPosition());
    }

}

class TopLeftAnchor extends  AbstractAnchor {
    constructor(options) {
        options.name = options.name || 'top-left';
        options.cursor = 'nw-resize';
        return super(options);
    }
    getAnchorPosition () {
        return {
            x : -(this.width / 2),
            y : -(this.height / 2)
        };
    }
    handleMouseMove () {
        const stage = this.node.getStage();
        const cursorPosition = stage.getPointerPosition().y;
        const scale = this.node.scale();
        const width = this.node.width();
        const nodePos = this.node.getAbsolutePosition();
        const anchorPos = nodePos.y;
        const relativePosition = cursorPosition - anchorPos;
        const scaleDiff = (relativePosition * scale.x) / width;
        scale.x -= scaleDiff;
        scale.y -= scaleDiff;
        nodePos.x += width * scaleDiff;
        nodePos.y += width * scaleDiff;
        this.node.setAbsolutePosition(nodePos);
        this.node.scale(scale);
        this.node.fire('customSync');
        return false;
    }
}

class RotateAnchor extends  AbstractAnchor {
    constructor(options) {
        options.height = 23;
        options.width = 23;
        options.name = 'rotate';
        options.cursor = 'crosshair';
        return super(options);
    }
    getAnchorPosition () {
        const reference = this.reference.group;
        return {
            x : (reference.width() / 2) - (this.width / 2),
            y : -(this.height * 2)
        };
    }
    handleMouseDown (e) {
        /*fixme same as in abstract*/
        this.nodeCenter = this.getNodeCenter();
        e.cancelBubble = true;
        this.mouseMoveListener = this.handleMouseMove.bind(this);
        this.mouseUpListener = this.handleMouseUp.bind(this);
        window.addEventListener('mousemove', this.mouseMoveListener);
        window.addEventListener('touchmove', this.mouseMoveListener);
        window.addEventListener('mouseup', this.mouseUpListener, true);
        window.addEventListener('touchend', this.mouseUpListener, true);
    }
    getNodeCenter () {
        const test = this.getRelativeSize();
        return {
            x : test.width / 2,
            y : test.height / 2
        };
    }
    handleMouseMove () {
        const stage = this.node.getStage();
        const cursorPosition = stage.getPointerPosition();
        const yDiff = (cursorPosition.y - this.nodeCenter.y);
        const xDiff = (cursorPosition.x - this.nodeCenter.x);
        const angle = Math.atan2(yDiff, xDiff);
        const degrees = (angle * 180 / Math.PI);
        const rotation = (degrees + 360 + 90) % 360;
        const relativeSize = this.getRelativeSize();
        this.node.rotation(rotation);
        this.centerImage(relativeSize);
        this.node.fire('customSync');
        return false;
    }
    initAnchor () {
        return new Promise((resolve) => {
			const position = this.getAnchorPosition();
			const image = new Rect({
				fill: '#FF0000',
				x : position.x,
				y : position.y,
				width: 23,
				height: 23
			})
			resolve(image);
        });
    }
    /*same as in ImageModel*/
    getScaledRelativeAngledMiddlePoint () {
        const rotation = this.node.rotation();
        const angle = (rotation * Math.PI) / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const size = this.node.size();
        const relativeMiddlePoint = {
            x : size.width / 2,
            y : size.height / 2
        };
        const relativeAngledMiddlePoint = {
            x : relativeMiddlePoint.x * cos - relativeMiddlePoint.y * sin,
            y : relativeMiddlePoint.x * sin + relativeMiddlePoint.y * cos
        };
        const scale = this.node.scale();
        return {
            x : relativeAngledMiddlePoint.x * scale.x,
            y : relativeAngledMiddlePoint.y * scale.y
        };
    }
    centerImage (relativeSize) {
        const scaledRelativeAngledMiddlePoint = this.getScaledRelativeAngledMiddlePoint();
        let position = {
            x : relativeSize.width / 2 - scaledRelativeAngledMiddlePoint.x,
            y : relativeSize.height / 2 - scaledRelativeAngledMiddlePoint.y
        };
        this.node.setAbsolutePosition(position);
    }

    getRelativeSize () {
        const position = this.node.getAbsolutePosition();
        const oldMiddlePoint = this.getScaledRelativeAngledMiddlePoint();
        return {
            width: (position.x + oldMiddlePoint.x) * 2,
            height: (position.y + oldMiddlePoint.y) * 2
        };
    }
}

class KonvaTransformersGroup {
    constructor (options) {
        this.node = options.node;
        const coordinates = this.node.getAbsolutePosition();
        const rotation = this.node.rotation();
        const scale = this.node.scale();
        this.group = new Group({
            draggable : false, /*toggleable*/
            x : coordinates.x,
            y : coordinates.y,
            width: this.node.width() * scale.x,
            height: this.node.height() * scale.y,
            rotation : rotation
        });
        this.group.addName('Transformer');
        this.group.className = 'Transformer';
        this.strokeColor = options.strokeColor || {
            r : 0,
            g : 0,
            b : 0
        };
        this.strokeWidth = options.strokeWidth || 2;
        this.boundingRect = null;
        this.addBoundingRect();
        this.addAnchors().then(() => {

            //TODO add group and / or image to the group?
            //TODO draw rectangle on the edge of the image
            //TODO add anchor points
            //TODO shape name === Transformer
            //TODO return Konva group
            //TODO support options.enabledAnchors ??
            this.group.on('mousedown touchstart', () => {
                this.group.draggable(true);
            });
            this.group.on('mouseup touchend', () => {
                this.group.draggable(false);
            });
            this.group.on('mousemove dragmove transform', this.syncTransformedImage.bind(this));
            this.group.on('destroy', () => {
                this.trigger('destroy');
                this.group.destroy();
            });
            this.node.on('mousemove dragmove transform customSync', this.syncTransformer.bind(this));
            this.draw();
        });
        return this;
    }
    addBoundingRect () {
        const rect = new Rect({
            x : 0,
            y : 0,
            width: this.group.width(),
            height: this.group.height(),
            stroke: 'rgb('+this.strokeColor.r+','+this.strokeColor.g+','+this.strokeColor.b+')',
            strokeWidth : this.strokeWidth,
            dash: [4,4]
        });
        this.boundingRect = rect;
        this.group.add(this.boundingRect);
    }
    addAnchors () {
        //TODO allow to configure the anchors
        const anchors = [TopLeftAnchor, RotateAnchor];
        const promises = [];
        for (let i = 0, length = anchors.length; i < length; i++) {
            let anchor = new anchors[i]({
                node : this.node,
                reference : this
            });
            promises.push(anchor);
        }
        return window.Promise.all(promises).then(values => {
            values.forEach((anchor) => {
                this.group.add(anchor);
            });
        }, reason => { console.error(reason); });
    }
    syncTransformedImage () {
        if( this.group.draggable() ){

            const node = this.group;
            const updatedNode = this.node;
            const position = node.getAbsolutePosition();
            updatedNode.setAbsolutePosition(position);
            updatedNode.rotation(node.rotation());
            updatedNode.fire('customSync');
        }
    }
    syncTransformer () { //may not do anything? Check programmatic transform
        const node = this.node;
        const updatedNode = this.group;
        const position = node.getAbsolutePosition();
        const scale = node.scale();
        const scaledDimensions = {
            width : node.width() * scale.x,
            height : node.height() * scale.y
        };
        updatedNode.setAbsolutePosition(position);
        updatedNode.rotation(node.rotation());
        updatedNode.width(scaledDimensions.width);
        updatedNode.height(scaledDimensions.height);
        this.boundingRect.width(scaledDimensions.width);
        this.boundingRect.height(scaledDimensions.height);
        this.draw();
    }
    draw () {
        stage.batchDraw(); //simplification
    }
}

image.on('click tap', () => {
	const boardTransformer = new KonvaTransformersGroup({
  	node: image
  });
  layer.add(boardTransformer.group);
  boardTransformer.draw();
});