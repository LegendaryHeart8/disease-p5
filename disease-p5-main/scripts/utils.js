// Copy text to clipboard
// From https://stackoverflow.com/a/30810322
function copyToClipboard(text) {
    let textArea = document.createElement('textarea');

    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = '2em';
    textArea.style.height = '2em';

    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = 0;

    // Clean up any borders.
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';

    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = 'transparent';


    textArea.value = text;

    document.body.appendChild(textArea);

    textArea.select();

    try {
        let successful = document.execCommand('copy');
        let msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
    } catch (err) {
        console.log('Unable to copy');
    }

    document.body.removeChild(textArea);
}

// Count occurance of each state
function countStates() {
    let states = Array(TRANSITIONS.length);
	states.fill(0);
    let total = 0;
    for (let i = 0; i < entities.length; i++) {
        states[entities[i].state]++;
        total++;
    }

    return [states, total];
}

function stateTransition(oldState, potentialState, override = -1)
{
	let s = oldState;
	let r = random();
	let transition = false;
	if(override > 0 && r < override)
	{
		transition = true;
	}
	if (r < TRANSITIONS[oldState][potentialState])
	{
		transition = true;
	}
	
	if (transition) {
        s = potentialState;
        if (s > TRANSITIONS.length) s = 0;
    }
	return s;
}
//creates a 2D Array of size x size
function createSquareArray(size, defaultVal = 0) {
  var arr = [];

  for (var i=0;i<size;i++) {
     arr[i] = Array(size);
	 arr[i].fill(defaultVal);
  }

  return arr;
}

// Check if coordinate is inside a circle
function inCircle(x, y, cx, cy, r) {
    return sq(x - cx) + sq(y - cy) < sq(r);
}
