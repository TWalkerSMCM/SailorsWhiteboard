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
  