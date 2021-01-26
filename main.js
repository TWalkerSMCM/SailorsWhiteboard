const stage = new Konva.Stage({
  container: 'container',
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    x: 0.5,
    y: 0.5
  }
});

const layer = new Konva.Layer();
stage.add(layer);

class Boat {
  constructor(options) {
    //this.sail = 
    //this.overlap =
    this.fill = "#FFFFFF";
    this.x = options.x || 250;
    this.y = options.y || 250;
    this.rotation = options.rotation || 0;
    this.boat = this.createBoat();
    //Returns the boat 
    return this.boat;
  }

  //Returns a boat group.
  createBoat() {
    const group = new Konva.Group({
      draggable: true,
      x: this.x,
      y: this.y
    });

    group.add(new Konva.Path({
      name: "boat",
      //x: this.x,
      //y: this.y,
      data: 'M 1.5198489,80.464693 C 1.2570339,79.223475 0.78372589,74.759231 0.48568784,70.710445 -0.76972736,53.655815 0.40585284,38.851923 4.0446629,25.892985 6.8469209,15.913243 11.989955,6.4006451 17.406878,1.1781253 L 18.628857,0 l 1.36573,1.3270447 c 3.292625,3.1993659 7.347152,9.3762373 9.864231,15.0276703 5.51464,12.381672 8.190795,30.345144 7.267126,48.779961 -0.324373,6.473973 -0.961638,13.578921 -1.374992,15.330017 l -0.158197,0.670142 H 18.627244 1.6617329 Z',
      stroke: 'black',
      strokeWidth: 2,
      fill: this.fill,
      //scale: {x:2, y:2},
      offsetX: 19,
      offsetY: 40,
      rotation: this.rotation
    }));
    group.add(new Konva.Path({
      offsetX: 19,
      offsetY: 40,
      name: "luff",
      stroke: "black",
      //scale: {x:2, y:2},
      strokeWidth: 2,
      data: "m 18.059858,30.042588 c 0,0 -8.9396914,9.209776 -1.990686,13.218819 6.949011,4.009043 0.801809,12.294398 0.801809,12.294398 0,0 -4.009045,8.819895 1.870887,12.027129 5.879932,3.207234 -1.632516,10.992005 -1.632516,10.992005"
    }));
    group.add(new Konva.Path({
      offsetX: 19,
      offsetY: 40,
      name: "trim",
      stroke: "black",
      visible: false,
      strokeWidth: 2,
      //scale: {x:2, y:2},
      data: 'm 18.059858,30.042588 c -3.439844,8.39309 -4.703369,17.646408 -3.931917,26.670704 0.691634,7.824583 3.146538,15.474324 7.139149,22.239617'

    }));

    group.on('dblclick', () => {
      if (layer.find(".Transformer").length == 0) {
        const boardTransformer = new KonvaTransformersGroup({
          node: group
        });
        layer.add(boardTransformer.group);
        boardTransformer.draw();
        layer.batchDraw();
      } else {
        layer.find(".Transformer")[0].destroy();
        layer.draw()
      }
    });


    return group;
  }
}

//Returns a start finish line on a layer
function createStartFinish() {
  const group = new Konva.Group()
  const cboat = new Konva.Path({
    data: 'm315.42648,390.737c-1.05656 0 133.14666 -2.06438 132.64666 -2.31438c0.5 0.25 7.37786 -237.48968 -69.95542 -244.35151c-77.33327 -6.86183 -61.63468 246.66589 -62.69124 246.66589z',
    stroke: 'black',
    strokeWidth: 4,
    fill: 'gray',
    draggable: true,
    scaleX: 0.25,
    scaleY: 0.25,
    offsetX: 350,
    offsetY: 300,
  });

  const mark = new Konva.Circle({
    radius: 10,
    fill: 'orange',
    stroke: 'black',
    strokeWidth: 2,
    draggable: true
  })

  const line = new Konva.Line({
    points: [5, 5, 100, 100],
    stroke: 'gray',
    strokeWidth: 2,
    dash: [10, 4]
  });

  function updateLine() {
    line.points([mark.x(), mark.y(), cboat.x(), cboat.y()]);
    group.draw();
  }


  mark.on('dragmove', updateLine);
  cboat.on('dragmove', updateLine);

  group.add(line);
  group.add(mark);
  group.add(cboat);

  return group;

}

function createTurningMark() {
  const tmark = new Konva.Group({
    x: 50,
    y: 50,
    draggable: true
  });
  tmark.add(new Konva.Circle({
    radius: 10,
    fill: 'orange',
    stroke: 'black',
    strokeWidth: 2,
    draggable: true
  }))

  tmark.add(new Konva.Circle({
    radius: 150,
    stroke: 'black',
    strokeWidth: 2,
    dash: [10, 4]
  }))
  return tmark
}

function addTurningMark(layer) {
  layer.add(createTurningMark());
  layer.draw();
}

//AbstractAnchor Class
class RotateAnchor {
  constructor(options) {
    if (!options.node) {
      throw new Error('Anchor needs an attached element');
    }
    this.reference = options.reference;
    this.node = options.node;
    this.name = 'rotate';
    this.width = 23;
    this.height = 23;
    this.strokeWidth = options.strokeWidth || 2;
    this.strokeColor = options.strokeColor || {
      r: 0,
      g: 0,
      b: 0
    };
    this.fill = options.fill || {
      r: 255,
      g: 255,
      b: 255
    };
    this.cursor = options.cursor || 'crosshair';
    this.defaultCursor = options.defaultCursor || 'default';
    this.mouseMoveListener = null;
    this.mouseUpListener = null;


    return this.initAnchor().then((anchor) => {
      this.anchor = anchor;
      this.addListeners();
      return anchor;
    });
  }

  //Creates the rotation circle.
  initAnchor() {
    return new Promise((resolve) => {
      const position = this.getAnchorPosition();
      const image = new Konva.Arc({
        visible: false,
        strokeWidth: 0,
        fillEnabled: true,
        fill: 'black',
        innerRadius: 80,
        outerRadius: 65,
        angle: 180,
        clockwise: true,
      })
      resolve(image);
    });
  }

  //Adds event listeners for mousedown, drag, mouseenter and mouseleave
  addListeners() {
    this.anchor.on('mousedown touchstart', this.handleMouseDown.bind(this));
    this.anchor.on('dragstart dragmove dragend', (e) => {
      e.cancelBubble = true;
    });
    this.anchor.on('mouseenter', this.setCursor.bind(this));
    this.anchor.on('mouseleave', this.resetCursor.bind(this));
  }

  //Removes all listeners
  removeListeners() {
    this.anchor.off();
  }

  //Same as normal, just adds node center as a parameter
  handleMouseDown(e) {
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

  handleMouseMove() {
    const stage = this.node.getStage();
    const cursorPosition = stage.getPointerPosition();
    const yDiff = (cursorPosition.y - this.nodeCenter.y);
    const xDiff = (cursorPosition.x - this.nodeCenter.x);
    const angle = Math.atan2(yDiff, xDiff);
    const degrees = (angle * 180 / Math.PI);
    const rotation = this.rotationSnap((degrees + 360 + 90) % 360);
    const relativeSize = this.getRelativeSize();

    //Rotation Snapping
    this.node.getChildren()[0].rotation(rotation);
    this.trimSail(rotation);
    this.centerImage(relativeSize);
    this.node.fire('customSync');
    return false;
  }

  //Mouse up just removes the the move and up listener
  handleMouseUp(e) {
    e.preventDefault();
    e.stopPropagation();
    window.removeEventListener('mousemove', this.mouseMoveListener);
    window.removeEventListener('touchmove', this.mouseMoveListener);
    window.removeEventListener('mouseup', this.mouseUpListener, true);
    window.removeEventListener('touchend', this.mouseUpListener, true);
  }

  getCursor() {
    return this.cursor;
  }

  setCursor() {
    const cursor = this.getCursor();
    const stage = this.anchor.getStage();
    if (stage) {
      stage.content.style.cursor = cursor;
    }
  }

  resetCursor() {
    const stage = this.anchor.getStage();
    if (stage) {
      stage.content.style.cursor = this.defaultCursor;
    }
  }

  getAnchorPosition() {
    return {
      x: -(this.width / 2),
      y: -(this.height / 2)
    };
  }


  getScaledRelativeAngledMiddlePoint() {
    const rotation = this.node.rotation();
    const angle = (rotation * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const size = this.node.size();
    const relativeMiddlePoint = {
      x: size.width / 2,
      y: size.height / 2
    };
    const relativeAngledMiddlePoint = {
      x: relativeMiddlePoint.x * cos - relativeMiddlePoint.y * sin,
      y: relativeMiddlePoint.x * sin + relativeMiddlePoint.y * cos
    };
    const scale = this.node.scale();
    return {
      x: relativeAngledMiddlePoint.x * scale.x,
      y: relativeAngledMiddlePoint.y * scale.y
    };
  }

  centerImage(relativeSize) {
    const scaledRelativeAngledMiddlePoint = this.getScaledRelativeAngledMiddlePoint();
    let position = {
      x: relativeSize.width / 2 - scaledRelativeAngledMiddlePoint.x,
      y: relativeSize.height / 2 - scaledRelativeAngledMiddlePoint.y
    };
    this.node.setAbsolutePosition(position);
  }

  getNodeCenter() {
    const test = this.getRelativeSize();
    return {
      x: test.width / 2,
      y: test.height / 2
    };
  }

  getRelativeSize() {
    const position = this.node.getAbsolutePosition();
    const oldMiddlePoint = this.getScaledRelativeAngledMiddlePoint();
    return {
      width: (position.x + oldMiddlePoint.x) * 2,
      height: (position.y + oldMiddlePoint.y) * 2
    };
  }

  trimSail(rotation) {
    const sail = this.node.getChildren()[2];
    const luff = this.node.getChildren()[1];

    //If the boat is head to wind, show the luffing sail and hide the trimmed sail
    if (rotation > 330 || rotation < 30) {
      if (rotation > 330) luff.scaleX(Math.abs(luff.scaleX()));
      else luff.scaleX(-Math.abs(luff.scaleX()));
      sail.hide(); //Hide the trimmed sail
      luff.show(); //Show the luffing sail
    }
    //Otherwise, hide the luffing sail, show the trimmed sail
    else {
      luff.hide();
      sail.show();
      sail.scaleX(-Math.abs(sail.scaleX()));
      if (rotation >= 180) sail.scaleY(-Math.abs(sail.scaleY()));
      else sail.scaleY(Math.abs(sail.scaleY()));
      sail.rotation(rotation * 0.5);
    }
  }

  rotationSnap(rotation) {
    var snapAngles = [45, 90, 160, 315, 270, 200];
    var threshold = 15;
    for (var i = 0; i < snapAngles.length; i++) {
      if (rotation < snapAngles[i] + threshold && rotation > snapAngles[i] - threshold) {
        return snapAngles[i];
      }
    }
    return rotation;
  }
}

class KonvaTransformersGroup {
  constructor(options) {
    this.node = options.node;
    const coordinates = this.node.getAbsolutePosition();
    //console.log("Group created at", coordinates)
    const rotation = this.node.rotation();
    const scale = this.node.scale();

    this.group = new Konva.Group({
      draggable: false,
      width: this.node.width() * scale.x,
      height: this.node.height() * scale.y,
      rotation: rotation
    });
    this.group.addName('Transformer');
    this.group.className = 'Transformer';
    this.strokeColor = options.strokeColor || {
      r: 0,
      g: 0,
      b: 0
    };
    this.strokeWidth = options.strokeWidth || 2;
    this.addAnchors().then(() => {


      this.group.on('mousedown touchstart', () => {
        this.group.draggable(true);
      });
      this.group.on('mouseup touchend', () => {
        this.group.draggable(false);
      });

      this.group.on('destroy', () => {
        this.trigger('destroy');
        this.group.destroy();
      });
      this.node.on('mousemove dragmove transform customSync', this.syncTransformer.bind(this));
      this.draw();
    });
    return this;
  }

  addAnchors() {
    const anchors = [RotateAnchor];
    const promises = [];
    for (let i = 0, length = anchors.length; i < length; i++) {
      let anchor = new anchors[i]({
        node: this.node,
        reference: this
      });
      promises.push(anchor);
    }
    return window.Promise.all(promises).then(values => {
      values.forEach((anchor) => {
        this.group.add(anchor);
        this.syncTransformer();
        anchor.show();
      });
    }, reason => {
      console.error(reason);
    });
  }

  syncTransformer() {
    const node = this.node;
    const updatedNode = this.group;
    const position = node.getAbsolutePosition();
    const scale = node.scale();
    const scaledDimensions = {
      width: node.width() * scale.x,
      height: node.height() * scale.y
    };
    updatedNode.setAbsolutePosition(position);
    updatedNode.rotation(node.getChildren()[0].rotation());
    updatedNode.width(scaledDimensions.width);
    updatedNode.height(scaledDimensions.height);
    this.draw();
  }
  draw() {
    stage.batchDraw();
  }
}


document.getElementById("addMark")
  .addEventListener('click', function () {
    addTurningMark(layer);
  })


layer.add(createStartFinish());
layer.add(createTurningMark());
layer.add(new Boat({}));


layer.draw();