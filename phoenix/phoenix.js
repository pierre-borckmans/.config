Phoenix.set ({
  daemon: true,
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
  
  debugger;
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

  Window.focused().setFrame(newFrame)
}

Key.on('right', ['alt', 'cmd'], function() {
  shiftNScreens(1);
  alert('Next screen', App.get ( 'Phoenix' ).icon ())
});

Key.on('left', ['alt', 'cmd'], function() {
  shiftNScreens(-1);
  alert('Previous screen', App.get ( 'Phoenix' ).icon ())
});

var previousWinframe = {};

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
  alert('Maximize '+fraction*100+'%', App.get ( 'Phoenix' ).icon ())
}

Key.on('return', [ 'ctrl', 'alt', 'cmd'], function() {
  maximize();
});

Key.on('return', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  maximize(.85);
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
  alert('Grow', App.get ( 'Phoenix' ).icon ())
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
  alert('Shrink', App.get ( 'Phoenix' ).icon ())
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
  alert('Center', App.get ( 'Phoenix' ).icon ())
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
});
Key.on('right', [ 'ctrl', 'alt', 'cmd'], function() {
  split(0.5,0,0.5,1);
});
Key.on('up', [ 'ctrl', 'alt', 'cmd'], function() {
  split(0,0,1,0.5);
});
Key.on('down', [ 'ctrl', 'alt', 'cmd'], function() {
  split(0,0.5,1,0.5);
});

Key.on('1', [ 'ctrl', 'alt', 'cmd'], function() {
  split(0,0,0.5,0.5);
});
Key.on('2', [ 'ctrl', 'alt', 'cmd'], function() {
  split(0.5,0,0.5,0.5);
});
Key.on('3', [ 'ctrl', 'alt', 'cmd'], function() {
  split(0,0.5,0.5,0.5);
});
Key.on('4', [ 'ctrl', 'alt', 'cmd'], function() {
  split(0.5,0.5,0.5,0.5);
});

Key.on('1', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  split(0,0,1/3,1/2);
});
Key.on('2', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  split(1/3,0,1/3,1/2);
});
Key.on('3', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  split(2/3,0,1/3,1/2);
});
Key.on('4', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  split(0,1/2,1/3,1/2);
});
Key.on('5', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  split(1/3,1/2,1/3,1/2);
});
Key.on('6', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  split(2/3,1/2,1/3,1/2);
});

//var icon = Icon.getFromFile("/Users/pierre.borckmans/Desktop/test.png")
//var iconResized = Icon.setWidthAndHeight(icon,160,160);
alert ( 'Configuration reloaded', App.get ( 'Phoenix' ).icon () );
