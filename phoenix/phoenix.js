Phoenix.set ({
  daemon: false,
  openAtLogin: true
});

function mod(n, m) {
  return ((n % m) + m) % m;
}

function alert ( text, icon, duration = 1 ) {

  const frame = Window.focused().screen().visibleFrame();
  
  var modal = Modal.build ({
    origin ( mFrame ) {
      return {
        x: frame.x+frame.width/2-mFrame.width/2,
        y: frame.y+frame.height/2-mFrame.height/2
      };
    },
    weight: 24,
    duration: 1,
    animationDuration: .3,
    appearance: 'dark',
    text,
    icon
  });
  
  modal.show ();

}

function shiftNScreens(increment = 1) {
  var screens = Screen.all();
  
  var window = Window.focused();
  var windowFrame = window.frame();
  var currentScreen = window.screen();
  var currentScreenFrame = currentScreen.flippedVisibleFrame();

  var currentScreenIndex = screens.indexOf(currentScreen);
  var newScreenIndex = mod((currentScreenIndex + increment), screens.length);  
  var newScreen = screens[newScreenIndex];

  var widthRatio = windowFrame.width / currentScreenFrame.width;
  var heightRatio = windowFrame.height / currentScreenFrame.height;

  var leftPct = (windowFrame.x - currentScreenFrame.x) / currentScreenFrame.width;
  var topPct = (windowFrame.y - currentScreenFrame.y) / currentScreenFrame.height;

  var newScreenLeft = newScreen.flippedVisibleFrame().x;
  var newScreenTop = newScreen.flippedVisibleFrame().y;
  var newScreenWidth = newScreen.flippedVisibleFrame().width;
  var newScreenHeight = newScreen.flippedVisibleFrame().height;

  var newFrame = {
    x: newScreenLeft + leftPct * newScreenWidth,
    y: newScreenTop + topPct * newScreenHeight,
    width: widthRatio * newScreen.flippedVisibleFrame().width,
    height: heightRatio * newScreen.flippedVisibleFrame().height
  }

  Window.focused().setFrame(newFrame);
  return [screens.length, currentScreenIndex, newScreenIndex];
}

Key.on('right', ['alt', 'cmd'], function() {
  [nb, prev, next] = shiftNScreens(1);
  var screensStr = "⎚".repeat(nb).setCharAt(next,'⎙');
  alert('Next screen\n'+screensStr);
});

Key.on('left', ['alt', 'cmd'], function() {
[nb, prev, next] = shiftNScreens(-1);
  var screensStr = "⎚".repeat(nb).setCharAt(next,'⎙');
  alert('Previous screen\n'+screensStr);
});

function shiftNDesktops(increment = 1) {
  var window = Window.focused();
  var currentScreen = window.screen();
  
  var spaces = currentScreen.spaces();
  var currentSpace = currentScreen.currentSpace();
  var currentSpaceIndex = _.map(spaces, s => s.hash()).indexOf(currentSpace.hash())
  var newSpaceIndex = mod(currentSpaceIndex + increment, spaces.length);

  currentSpace.removeWindows([window]);
  spaces[newSpaceIndex].addWindows([window]);
  window.focus();  
  return [spaces.length, currentSpaceIndex, newSpaceIndex];
}

String.prototype.setCharAt = function(index,chr) {
	if(index > this.length-1) return str;
	return this.substr(0,index) + chr + this.substr(index+1);
}

Key.on('right', ['ctrl', 'cmd'], function() {
  var [nb, prev, next] = shiftNDesktops(1);
  var desktopsStr = '□'.repeat(nb).setCharAt(next,'▣');
  setTimeout(()=>alert('Next desktop\n'+desktopsStr), 350);
});

Key.on('left', ['ctrl', 'cmd'], function() {
  var [nb, prev, next] = shiftNDesktops(-1);
  var desktopsStr = '□'.repeat(nb).setCharAt(next,'▣');
  setTimeout(()=>alert('Previous desktop\n'+desktopsStr), 350);
});

function maximize(fraction = 1.0) {
  var window = Window.focused();
  var currentScreen = window.screen();
  var currentScreenFrame = currentScreen.flippedVisibleFrame();

  var newFrame = {
    x: currentScreenFrame.x + (currentScreenFrame.width*(1-fraction)/2),
    y: currentScreenFrame.y + (currentScreenFrame.height*(1-fraction)/2),
    width: currentScreenFrame.width*fraction,
    height: currentScreenFrame.height*fraction
  }

  Window.focused().setFrame(newFrame)
}

Key.on('return', [ 'ctrl', 'alt', 'cmd'], function() {
  maximize();
  alert('▣\n100%');
});

Key.on('return', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  maximize(.85);
  alert('▣\n85%');
});

Key.on('=', [ 'ctrl', 'alt', 'cmd'], function() {
  var gap = 30;
  var window = Window.focused();
  var windowFrame = window.frame();
  var currentScreen = window.screen();
  var currentScreenFrame = currentScreen.flippedVisibleFrame();

  var newFrame = {
    x: Math.max(currentScreenFrame.x,windowFrame.x-gap),
    y: Math.max(currentScreenFrame.y,windowFrame.y-gap),
    width: Math.min(currentScreenFrame.width,windowFrame.width+2*gap),
    height: Math.min(currentScreenFrame.height,windowFrame.height+2*gap)
  }

  Window.focused().setFrame(newFrame)
  alert('⇧\nGrow');
});

Key.on('-', [ 'ctrl', 'alt', 'cmd'], function() {
  var gap = 30;
  var window = Window.focused();
  var windowFrame = window.frame();
  var currentScreen = window.screen();
  var currentScreenFrame = currentScreen.flippedVisibleFrame();

  var newFrame = {
    x: windowFrame.x+gap,
    y: windowFrame.y+gap,
    width: Math.max(300,windowFrame.width-2*gap),
    height: Math.max(300,windowFrame.height-2*gap)
  }

  Window.focused().setFrame(newFrame)
  center();
  alert('⇩\nShrink');
});

function center() {
  var window = Window.focused();
  var windowFrame = window.frame();
  var currentScreen = window.screen();
  var currentScreenFrame = currentScreen.flippedVisibleFrame();

  var newTopLeft = {
    x: currentScreenFrame.x + currentScreenFrame.width/2 - windowFrame.width/2,
    y: currentScreenFrame.y + currentScreenFrame.height/2 - windowFrame.height/2
  }

  Window.focused().setTopLeft(newTopLeft)
}

Key.on('space', [ 'ctrl', 'alt', 'cmd'], function() {
  center();
  alert('╳\nCenter');
});

function split(x,y,w,h) {
  var window = Window.focused();
  var currentScreen = window.screen();
  var currentScreenFrame = currentScreen.flippedVisibleFrame();

  var newFrame = {
    x: currentScreenFrame.x+currentScreenFrame.width*x,
    y: currentScreenFrame.y+currentScreenFrame.height*y,
    width: currentScreenFrame.width*w,
    height: currentScreenFrame.height*h
  }

  Window.focused().setFrame(newFrame)
}


Key.on('left', [ 'ctrl', 'alt', 'cmd'], function() {
  split(0,0,0.5,1);
  alert('◧\nLeft half');
});
Key.on('right', [ 'ctrl', 'alt', 'cmd'], function() {
  split(0.5,0,0.5,1);
  alert('◨\nRight half');
});
Key.on('up', [ 'ctrl', 'alt', 'cmd'], function() {
  split(0,0,1,0.5);
  alert('⬒\nTop half');
});
Key.on('down', [ 'ctrl', 'alt', 'cmd'], function() {
  split(0,0.5,1,0.5);
  alert('⬓\nBottom half'); 
});

Key.on('1', [ 'ctrl', 'alt', 'cmd'], function() {
  split(0,0,0.5,0.5);
  var splitsStr = '▣□\n□□';
  alert(splitsStr);
});
Key.on('2', [ 'ctrl', 'alt', 'cmd'], function() {
  split(0.5,0,0.5,0.5);
  var splitsStr = '□▣\n□□';
  alert(splitsStr);
});
Key.on('3', [ 'ctrl', 'alt', 'cmd'], function() {
  split(0,0.5,0.5,0.5);
  var splitsStr = '□□\n▣□';
  alert(splitsStr);
});
Key.on('4', [ 'ctrl', 'alt', 'cmd'], function() {
  split(0.5,0.5,0.5,0.5);
  var splitsStr = '□□\n□▣';
  alert(splitsStr);
});

Key.on('1', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  split(0,0,1/3,1/2);
  var splitsStr = '▣□□\n□□□';
  alert(splitsStr);
});
Key.on('2', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  split(1/3,0,1/3,1/2);
  var splitsStr = '□▣□\n□□□';
  alert(splitsStr);
});
Key.on('3', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  split(2/3,0,1/3,1/2);
  var splitsStr = '□□▣\n□□□';
  alert(splitsStr);
});
Key.on('4', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  split(0,1/2,1/3,1/2);
  var splitsStr = '□□□\n▣□□';
  alert(splitsStr);
});
Key.on('5', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  split(1/3,1/2,1/3,1/2);
  var splitsStr = '□□□\n□▣□';
  alert(splitsStr);
});
Key.on('6', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  split(2/3,1/2,1/3,1/2);
  var splitsStr = '□□□\n□□▣';
  alert(splitsStr);
});


//var icon = Icon.getFromFile("/Users/pierre.borckmans/Desktop/test.png")
//var iconResized = Icon.setWidthAndHeight(icon,160,160);
alert ( 'Configuration reloaded', App.get ( 'Phoenix' ).icon () );
