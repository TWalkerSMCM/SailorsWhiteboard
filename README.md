# Sailor's Whiteboard  
### Live at: https://twalkersmcm.github.io/SailorsWhiteboard/

An HTML5 canvas based sailing whiteboard to aid zoom chalktalks and remote sailing discussion. Uses [Konva](https://konvajs.org/) as a 2d canvas library.        
### How to use effectively 
  The site is currently live and has all basic functionality but is missing features like an about page and a tutorial explaining how the whiteboard is properly used. Currently you can add boatsand marks from the button bar. Boat color is decided by the color selector in the bottom of the button bar. The "Share" button exports and downloads the whiteboard as a png. At the top of the button bar there are 4 cursor modes, the pointer mode to click and drag, a pen tool and a delete tool. When in pen mode you cannot interact with the boats/marks. The "X" button clears the stage of all pen and holding shift and clicking the X button clears the page entirely. Both marks and boats have right click context menu's that allow you to do things like show and hide the the 2 boat length zone on marks, luff/trim your sails, show overlaps and delete the object. To control the boats orientation you have two options, by clicking and dragging the boat while holding shift, the boat will turn to the direction of your drag, snapped to a generalized angle, currently it snaps to 45, 90 and 160 degrees on both tacks. To get finer control of the angle you can press Control and click a boat and it will show a rotation arc, by clicking and dragging the arc you can finetune the angle of your boat. Control clicking the boat again hides this arc. 


### TODO:  
- ✓ Object context menus
- ✓ Sidebar w/ color selector
- ✓ Shift+drag boat direction
- ✓ Sequential boat numbers 
- ✓ Export canvas to image
- ✓ Pen and delete tools

- Siteheader \+ about and tutorial pages
- Text tool 
- Settings menu: zone size, background color, numbering style, overlap side, boat vector(for multi-hulls/catamarans)
- Serialize/save drawings for future editing
- Consistent Z index 
- Color based boat numbers, eg both a Red 1 and Green 1.
- Laylines on marks (need a way to differentiate between upwind and downwind marks)
- Ladder rungs (either between the laylines on marks or just on the course), possibly allow for the changing of breeze direction to better show effect of shifts. 
- Animation creator: would have a way to add "steps" effectively instances of the canvas and when exported combine the instances into a gif. Could just use stop motion esque animation or take advantage on Konva tweens. 
