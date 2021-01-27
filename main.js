/**
 * Stage Setup
 */

const stage = new Konva.Stage({
  container: 'container',
  width: 1000,
  height: 500,
  scale: {
    x: 0.5,
    y: 0.5
  }
});
const layer = new Konva.Layer();
stage.add(layer);

/**
 * Shape classes
 */

//Boat class
class Boat{
  constructor(options) {
    this.fill = options.fill || "#FFFFFF";
    this.x = options.x || 250;
    this.y = options.y || 250;
    this.rotation = options.rotation || 0;
    this.boat = this.createBoat();
    this.transformer = null;
    return this.boat;
  }

  createBoat() {
    //We have a overarching group for both the boat group and the transform group to easily destroy both
    const parent = new Konva.Group({
    })

    const boatGroup = new Konva.Group({
      name: 'boat',
      draggable: true,
      x: this.x,
      y: this.y,
    });


    boatGroup.setAttr("force-luff", false);
    boatGroup.add(new Konva.Path({
      name: "boat",
      data: 'M 1.5198489,80.464693 C 1.2570339,79.223475 0.78372589,74.759231 0.48568784,70.710445 -0.76972736,53.655815 0.40585284,38.851923 4.0446629,25.892985 6.8469209,15.913243 11.989955,6.4006451 17.406878,1.1781253 L 18.628857,0 l 1.36573,1.3270447 c 3.292625,3.1993659 7.347152,9.3762373 9.864231,15.0276703 5.51464,12.381672 8.190795,30.345144 7.267126,48.779961 -0.324373,6.473973 -0.961638,13.578921 -1.374992,15.330017 l -0.158197,0.670142 H 18.627244 1.6617329 Z',
      stroke: 'black',
      strokeWidth: 2,
      fill: this.fill,
      offsetX: 19,
      offsetY: 40,
      rotation: this.rotation
    }));
    boatGroup.add(new Konva.Path({
      name: "luff",
      offsetX: 19,
      offsetY: 40,
      stroke: "black",
      strokeWidth: 3,
      data: "m 18.059858,30.042588 c 0,0 -8.9396914,9.209776 -1.990686,13.218819 6.949011,4.009043 0.801809,12.294398 0.801809,12.294398 0,0 -4.009045,8.819895 1.870887,12.027129 5.879932,3.207234 -1.632516,10.992005 -1.632516,10.992005"
    }));
    boatGroup.add(new Konva.Path({
      name: "trim",
      offsetX: 19,
      offsetY: 40,
      stroke: "black",
      visible: false,
      strokeWidth: 3,
      data: 'm 18.059858,30.042588 c -3.439844,8.39309 -4.703369,17.646408 -3.931917,26.670704 0.691634,7.824583 3.146538,15.474324 7.139149,22.239617'
    }));
    boatGroup.add(new Konva.Line({
      name: "overlap",
      points: [17,41,200,41],
      stroke: 'black',
      dash: [2, 2],
      visible: false,
    }))
    parent.add(boatGroup);

    boatGroup.on('dblclick', () => {
      if (this.transformer == null) {
        //If there is no transformer, create one and reference it in the transformer variable, also add it to the parent.
        var boardTransformer = new KonvaTransformersGroup({
          node: boatGroup
        });
        this.transformer = boardTransformer
        parent.add(boardTransformer.group);
      } else {
        //If one exists we remove it and clear its reference, it removes itself from the parent.
        this.transformer.group.destroy();
        this.transformer = null;
        layer.draw();
      }
    });
    
    return parent;
  }
}
//Turning Mark class
class TurningMark{
  constructor(options){
    this.fill = 'orange'
    this.x = options.x || 50;
    this.y = options.y || 50;
    this.mark = this.createMark()
    return this.mark;
  }

  createMark(){
    let group = new Konva.Group({
      name: "mark",
      x: this.x,
      y: this.y,
      draggable: false,
    });
    group.add(new Konva.Circle({
      name: "zone",
      radius: 185,
      stroke: 'black',
      strokeWidth: 2,
      dash: [10, 4],
      draggable: false,
      listening: false,
    }))
    let mark = new Konva.Circle({
      name: "buoy",
      radius: 13,
      fill: 'orange',
      stroke: 'black',
      strokeWidth: 2,
      draggable: true
    });

    //Makes a drag of the central mark, drag the group instead.
    mark.on('dragstart', () => {
      mark.stopDrag();
      group.startDrag();
    });
    
    group.add(mark);

    //Returns the group
    return group
  
  }

}
//AbstractAnchor Class
class RotateAnchor{
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

  //On mousedown we add move and up listeners
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

  //On move we calculate the rotation of the boat and its sails
  handleMouseMove() {
    const stage = this.node.getStage();
    const cursorPosition = stage.getPointerPosition();
    const yDiff = (cursorPosition.y - this.nodeCenter.y);
    const xDiff = (cursorPosition.x - this.nodeCenter.x);
    const angle = Math.atan2(yDiff, xDiff);
    const degrees = (angle * 180 / Math.PI);
    const rotation = this.rotationSnap((degrees + 360 + 90) % 360);
    const relativeSize = this.getRelativeSize();

    //We set the rotation of the boat first.
    this.node.getChildren()[0].rotation(rotation);

    //Adjust overlap for tack
    var overlap = this.node.getChildren()[3];
    overlap.rotation(rotation);
    if(rotation >= 180) overlap.scaleX(-Math.abs(overlap.scaleX()));
    else overlap.scaleX(Math.abs(overlap.scaleX()));
    //We then trim the sails and adjust the "handle"
    this.trimSail(rotation);
    this.centerImage(relativeSize);
    this.node.fire('customSync');
    return false;
  }

  //Mouse up just removes the the move and up listeners
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

  //Takes in a rotation and adjusts the sails accordingly
  trimSail(rotation) {
    const sail = this.node.getChildren()[2];
    const luff = this.node.getChildren()[1];

    //If the boat is head to wind, show the luffing sail and hide the trimmed sail
    if (rotation > 330 || rotation < 30) {
      //We reset the rotation and the y scale
      luff.rotation(0);
      luff.scaleY(Math.abs(luff.scaleY()));
      //We set the x scale based on the tack.
      if (rotation > 330) luff.scaleX(Math.abs(luff.scaleX()));
      else luff.scaleX(-Math.abs(luff.scaleX()));
      sail.hide(); 
      luff.show(); 
    }
    //If the boat is on a sailable course, we then decide how to trim the sails
    else{
      //If the boat is being forced, we show the luffing sail
      if(this.node.getAttr('force-luff')){
        luff.show()
        sail.hide()
      }
      //Otherwise we show the trimmed sail
      else{
        luff.hide();
        sail.show();  
      }
      //Flips the sail to be the correct orientation on the x axis
      sail.scaleX(-Math.abs(sail.scaleX()));
      luff.scaleX(-Math.abs(luff.scaleX()));

      //Flips the sail to be flipped correctly to the wind
      if (rotation >= 180){
        sail.scaleY(-Math.abs(sail.scaleY()));
        luff.scaleY(-Math.abs(luff.scaleY()));
      }
      else{
        sail.scaleY(Math.abs(sail.scaleY()));
        luff.scaleY(Math.abs(luff.scaleY()));
      }
      luff.rotation(rotation * 0.5);  
      sail.rotation(rotation * 0.5);
    }
  }

  //Rotation snap gives a 15 degree threshold on either side of the listed angles to allow consistent upwind, reaching and downwind angles.
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
//Transform Group...don't look at me, I'm hideous.
class KonvaTransformersGroup{
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

/**
 * Context Menu Listeners
 **/
let currentShape;
let menuNode;

window.addEventListener('click', () => {
  // hide menu if we click and a menu exists.
  if(menuNode){
    menuNode.style.display = 'none';
  }
});

stage.on('contextmenu', function (e) {
  // prevent default behavior
  e.evt.preventDefault();

  // if we are on empty place of the stage we will do nothing
  if (e.target === stage) {
    return;
  }
  
  //If another menu node is already open, we close it
  if(menuNode){
    menuNode.style.display = 'none';
  }

  //We set the currentShape and that shapes parent.
  currentShape = e.target;
  group = e.target.getParent();
  
  //We set the menu based on the type of shape right clicked.
  switch(group.name()){
    case "mark":
      menuNode = document.getElementById("mark");
      break;
    case "boat":  
      menuNode = document.getElementById("boat");
      break;
    }

  //We show the respective menu
  menuNode.style.display = 'initial';
  var containerRect = stage.container().getBoundingClientRect();
  menuNode.style.top =
    containerRect.top + stage.getPointerPosition().y + 4 + 'px';
  menuNode.style.left =
    containerRect.left + stage.getPointerPosition().x + 4 + 'px';
});


/**
 * Event Listeners
**/

//Add mark
document.getElementById("add-mark").addEventListener('click', function () {
  layer.add(new TurningMark({}));
  layer.draw();
})

//Add Boat
document.getElementById("add-boat").addEventListener('click', function () {
  layer.add(new Boat({}));
  layer.draw();
})

//Delete boat, we delete the super parent so it also deletes a transform shape if it exists
document.getElementById('delete-boat').addEventListener('click', () => {
  currentShape.getParent().getParent().destroy();
  layer.draw();
});

//Delete mark, we delete its parent so as to delete the zone as well.
document.getElementById('delete-mark').addEventListener('click', () => {
  currentShape.getParent().destroy();
  layer.draw();
  });

//Toggle mark zone
document.getElementById('zone-toggle').addEventListener('click', () => {
  var zone = currentShape.getParent().getChildren()[0];
  zone.visible(!zone.visible())
  document.getElementById('zone-toggle').innerText = (zone.visible()? "Hide Zone" : "Show Zone") 
  layer.draw();
});

//Toggle overlap
document.getElementById('overlap-toggle').addEventListener('click', () => {
  var overlap = currentShape.getParent().getChildren()[3];
  overlap.visible(!overlap.visible())
  document.getElementById('overlap-toggle').innerText = (overlap.visible()? "Hide Overlap" : "Show Overlap") 
  layer.draw();
});

  //Toggle sail trim
document.getElementById('sail-toggle').addEventListener('click', () => {
  var group = currentShape.getParent();
  group.setAttr("force-luff", !group.getAttr("force-luff"));
  document.getElementById('sail-toggle').innerText = (group.getAttr("force-luff") ? "Trim" : "Luff");
  //We manually switch the sail's being displayed because the sail drawing code on fires when using the transform rotation
  //There should be a better way to do this.
  rotation = group.getChildren()[0].rotation();
  if (rotation < 330 && rotation > 30) {
    group.getChildren()[2].visible(!group.getAttr("force-luff"));
    group.getChildren()[1].visible(group.getAttr("force-luff"));
    layer.draw();
  }
});

/**
 * Initial Shapes
 */
layer.add(new TurningMark({}));
layer.add(new Boat({fill: '#FF4136'}));
layer.add(new Boat({fill: '#39CCCC'}));

layer.draw();