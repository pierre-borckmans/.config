Phoenix.set ({
  daemon: false,
  openAtLogin: true
});

function mod(n, m) {
  return ((n % m) + m) % m;
}

function alert ( text, icon, duration = 1000 ) {

  const frame = Window.focused().screen().visibleFrame();
  
  var modal = Modal.build ({
    origin ( mFrame ) {
      return {
        x: frame.x+frame.width/2-mFrame.width/2,
        y: frame.y+frame.height/2-mFrame.height/2
      };
    },
    weight: 24,
    duration: duration/1000,
    animationDuration: .3,
    appearance: 'dark',
    text,
    icon
  });
  
  modal.show ();
  return modal;

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
  alert(screensStr+'\nNext screen');
});

Key.on('left', ['alt', 'cmd'], function() {
[nb, prev, next] = shiftNScreens(-1);
  var screensStr = "⎚".repeat(nb).setCharAt(next,'⎙');
  alert(screensStr+'\nPrevious screen');
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
  setTimeout(()=>alert(desktopsStr+'\nNext desktop'), 450);
});

Key.on('left', ['ctrl', 'cmd'], function() {
  var [nb, prev, next] = shiftNDesktops(-1);
  var desktopsStr = '□'.repeat(nb).setCharAt(next,'▣');
  setTimeout(()=>alert(desktopsStr+'\nPrevious desktop'), 450);
});

let windowsFrames = {};
let lastFraction;
function maximize(fraction = 1.0) {
  var window = Window.focused();
  var currentScreen = window.screen();
  var currentScreenFrame = currentScreen.flippedVisibleFrame();

  var key = window.hash();

  if (!windowsFrames[key] || (lastFraction && lastFraction != fraction)) {
    if (!lastFraction || lastFraction == fraction) windowsFrames[key] = window.frame();
    var newFrame = {
      x: currentScreenFrame.x + (currentScreenFrame.width*(1-fraction)/2),
      y: currentScreenFrame.y + (currentScreenFrame.height*(1-fraction)/2),
      width: currentScreenFrame.width*fraction,
      height: currentScreenFrame.height*fraction
    }
  
    Window.focused().setFrame(newFrame);
    lastFraction = fraction;
    return true;
  } else {
    Window.focused().setFrame(windowsFrames[key]);
    windowsFrames[key] = null;
    lastFraction = fraction;
    return false;
  }


}

Key.on('return', [ 'ctrl', 'alt', 'cmd'], function() {
  var result = maximize();
  if (result) {
    alert('▣\n100%');
  } else {
    alert('⇲\nRestore')
  }
});

Key.on('return', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  var result = maximize(.85);
  if (result) {
    alert('▣\n85%');
  } else {
    alert('⇲\nRestore')
  }
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

Key.on('space', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  var window = Window.focused();
  window.setFullScreen ( !window.isFullScreen () );

  var str = window.isFullScreen() ? '『 』\nFull screen' : '『 』\nExit full screen';
  
  setTimeout(()=>alert(str), 550);
});

function split(x,y,w,h, win=null) {
  var window = win || Window.focused();
  var currentScreen = window.screen();
  var currentScreenFrame = currentScreen.flippedVisibleFrame();

  var newFrame = {
    x: currentScreenFrame.x+currentScreenFrame.width*x,
    y: currentScreenFrame.y+currentScreenFrame.height*y,
    width: currentScreenFrame.width*w,
    height: currentScreenFrame.height*h
  }

  window.setFrame(newFrame)
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
  var splitsStr = '▣□\n□□\n4ths';
  alert(splitsStr);
});
Key.on('2', [ 'ctrl', 'alt', 'cmd'], function() {
  split(0.5,0,0.5,0.5);
  var splitsStr = '□▣\n□□\n4ths';
  alert(splitsStr);
});
Key.on('3', [ 'ctrl', 'alt', 'cmd'], function() {
  split(0,0.5,0.5,0.5);
  var splitsStr = '□□\n▣□\n4ths';
  alert(splitsStr);
});
Key.on('4', [ 'ctrl', 'alt', 'cmd'], function() {
  split(0.5,0.5,0.5,0.5);
  var splitsStr = '□□\n□▣\n4ths';
  alert(splitsStr);
});

Key.on('1', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  split(0,0,1/3,1/2);
  var splitsStr = '▣□□\n□□□\n6ths';
  alert(splitsStr);
});
Key.on('2', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  split(1/3,0,1/3,1/2);
  var splitsStr = '□▣□\n□□□\n6ths';
  alert(splitsStr);
});
Key.on('3', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  split(2/3,0,1/3,1/2);
  var splitsStr = '□□▣\n□□□\n6ths';
  alert(splitsStr);
});
Key.on('4', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  split(0,1/2,1/3,1/2);
  var splitsStr = '□□□\n▣□□\n6ths';
  alert(splitsStr);
});
Key.on('5', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  split(1/3,1/2,1/3,1/2);
  var splitsStr = '□□□\n□▣□\n6ths';
  alert(splitsStr);
});
Key.on('6', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  split(2/3,1/2,1/3,1/2);
  var splitsStr = '□□□\n□□▣\n6ths';
  alert(splitsStr);
});


var nbOfWindowsToArrange = 4;
var arrangeVertically = false;
function arrange() {
  var window = Window.focused();
  var currentScreen = window.screen();

  var spaces = currentScreen.spaces();
  var currentSpace = currentScreen.currentSpace();

  var windows = _.slice(currentSpace.windows().filter(w=>w.title()!='' && w.title()!='Window'),0,nbOfWindowsToArrange);
  var n = 2*Math.ceil(windows.length/2);
  //alert(_.map(windows, w => w.title()))
  _.each(windows, (w,i) => {
    if (arrangeVertically) {
      split(1/(n/2) * (Math.floor(i/2)), 1/2 * (i % 2), 1/(n/2), 1/2, w);
      w.focus();
    } else {
      split(1/2 * (i % 2), 1/(n/2) * (Math.floor(i/2)), 1/2, 1/(n/2), w);
      w.focus();
    }
  });
}
Key.on('tab', [ 'ctrl', 'alt', 'cmd'], function() {
  alert(arrangeGridStr()+'\nArrange\n'+(arrangeVertically?'(vertical)':'(horizontal)'));
  arrange();
});
Key.on('tab', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  arrangeVertically = !arrangeVertically;
  alert(arrangeGridStr()+'\nNew arrange grid\n'+(arrangeVertically?'(vertical)':'(horizontal)'));
});
function arrangeGridStr() {
  var str = arrangeVertically 
    ? ('□'.repeat(Math.ceil(nbOfWindowsToArrange/2)) + ('\n'+ '□'.repeat(Math.floor(nbOfWindowsToArrange/2))+'⬚'.repeat(nbOfWindowsToArrange % 2)))
    : (('□□\n').repeat(Math.floor(nbOfWindowsToArrange/2)-1)+'□□'+('\n□⬚'.repeat(nbOfWindowsToArrange % 2)));
  return str;
}
Key.on('-', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  nbOfWindowsToArrange = Math.max(nbOfWindowsToArrange-1, 2);
  alert(arrangeGridStr()+'\nNew arrange grid\n'+(arrangeVertically?'(vertical)':'(horizontal)'));
});
Key.on('=', [ 'shift', 'ctrl', 'alt', 'cmd'], function() {
  nbOfWindowsToArrange = Math.min(nbOfWindowsToArrange+1, 12);
  alert(arrangeGridStr()+'\nNew arrange grid\n'+(arrangeVertically?'(vertical)':'(horizontal)'));
});



let lastQuitTimestamp;
let quitModal;
const QUIT_BLACKLIST = ['Finder'];
function quit() {
  const timestamp = Date.now ();

  const delay = 1500;

  const app = App.focused ();
  if ( !app || _.includes ( QUIT_BLACKLIST, app.name () ) ) return;

  if ( lastQuitTimestamp && timestamp - lastQuitTimestamp <= delay ) {

    quitModal.close()
    alert('Quitting', App.focused().icon(), 250)
    app.terminate ();

    lastQuitTimestamp = 0;
    quitModal = null;
  } else {
    
    lastQuitTimestamp = timestamp;
    quitModal = alert('Press ⌘Q again to quit', App.focused().icon(), delay)
  }
}

Key.on( 'q', ['cmd'], function() {
  quit();
});
function appLaunch(appFileName, appName) {
  App.launch(appFileName);
  
  setTimeout(()=>{
    var icon = App.get(appName).icon()
    App.get(appName).focus()
    alert(appFileName, icon)
  }, 600);
}

Key.on('j',['ctrl','alt','cmd'], function() {
  appLaunch('IntelliJ IDEA CE', 'IntelliJ IDEA')
});

Key.on('i',['ctrl','alt','cmd'], function() {
  appLaunch('iTerm', 'iTerm2');
});

Key.on('c',['ctrl','alt','cmd'], function() {
  appLaunch('Chrome', 'Google Chrome');
});

Key.on('v',['ctrl','alt','cmd'], function() {
  appLaunch('Visual Studio Code', 'Code');
});

Key.on('s',['ctrl','alt','cmd'], function() {
  appLaunch('Slack', 'Slack');
});

Key.on('t',['ctrl','alt','cmd'], function() {
  appLaunch('Tower', 'Tower');
});

Key.on('f',['ctrl','alt','cmd'], function() {
  appLaunch('Finder', 'Finder');
});

Key.on('n',['ctrl','alt','cmd'], function() {
  appLaunch('Notes', 'Notes');
});

Key.on('e',['ctrl','alt','cmd'], function() {
  appLaunch('Evernote', 'Evernote');
});

//var icon = Icon.getFromFile("/Users/pierre.borckmans/Desktop/test.png")
//var iconResized = Icon.setWidthAndHeight(icon,160,160);
alert ( 'Configuration reloaded', App.get ( 'Phoenix' ).icon () );
