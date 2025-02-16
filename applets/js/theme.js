function set_darkmode(board) {

        // Change board background color dynamically
        board.renderer.container.style.backgroundColor = '#2e2e2b';

        // Change grid and axis colors
        board.defaultAxes.x.setAttribute({ 
            strokeColor: '#ffffff',
            highlightStrokeColor: '#ffffff',
        });
        board.defaultAxes.y.setAttribute({ 
            strokeColor: '#ffffff',
            highlightStrokeColor: '#ffffff',
        });
        board.defaultAxes.x.defaultTicks.setAttribute({
            strokeColor: '#ffffff',
            highlightStrokeColor: '#ffffff',
            label: {
                strokeColor: '#ffffff',
                highlightStrokeColor: '#ffffff',
            }
        });
        board.defaultAxes.y.defaultTicks.setAttribute({
            strokeColor: '#ffffff',
            highlightStrokeColor: '#ffffff',
            label: {
                strokeColor: '#ffffff',
                highlightStrokeColor: '#ffffff',
            }
        });
        // Change color of all existing elements
     /*   board.objectsList.forEach(obj => {
            obj.setAttribute({ strokeColor: '#ffffff', fillColor: '#888' });
        });*/
}

function set_lightmode(board) {

    // Change board background color dynamically
    board.renderer.container.style.backgroundColor = '#ffffff';

    // Change grid and axis colors
    board.defaultAxes.x.setAttribute({ 
        strokeColor: '#666666',
        highlightStrokeColor: '#888888',
    });
    board.defaultAxes.y.setAttribute({ 
        strokeColor: '#666666',
        highlightStrokeColor: '#888888',
    });
    board.defaultAxes.x.defaultTicks.setAttribute({
        strokeColor: '#666666',
        highlightStrokeColor: '#888888',
        label: {
            strokeColor: '#666666',
            highlightStrokeColor: '#888888',
        }
    });
    board.defaultAxes.y.defaultTicks.setAttribute({
        strokeColor: '#666666',
        highlightStrokeColor: '#888888',
        label: {
            strokeColor: '#666666',
            highlightStrokeColor: '#888888',
        }
    });
    // Change color of all existing elements
   /* board.objectsList.forEach(obj => {
        obj.setAttribute({ strokeColor: '#ffffff', fillColor: '#888' });
    });*/
}

// Toggle between dark and light mode
function toggleDarkMode(board) {
    let isDark = document.body.classList.toggle('dark-mode');
    if (isDark) {
        set_darkmode(board);
    } else {
        set_lightmode(board); 
    }
}

function setTheme(board, theme) {

    // Change board background color dynamically
    board.renderer.container.style.backgroundColor = theme.board.backgroundColor;

    // Change grid and axis colors
    board.defaultAxes.x.setAttribute({ 
        strokeColor: theme.xaxis.strokeColor,
        highlightStrokeColor: theme.xaxis.highlightStrokeColor,
    });
    board.defaultAxes.y.setAttribute({ 
        strokeColor: theme.yaxis.strokeColor,
        highlightStrokeColor: theme.yaxis.highlightStrokeColor,
    });
    board.defaultAxes.x.defaultTicks.setAttribute({
        strokeColor: theme.xaxis.strokeColor,
        highlightStrokeColor: theme.xaxis.highlightStrokeColor,
        label: {
            strokeColor: theme.xaxis.label.strokeColor,
            highlightStrokeColor: theme.xaxis.label.highlightStrokeColor,
        }
    });
    board.defaultAxes.y.defaultTicks.setAttribute({
        strokeColor: theme.yaxis.strokeColor,
        highlightStrokeColor: theme.yaxis.highlightStrokeColor,
        label: {
            strokeColor: theme.yaxis.label.strokeColor,
            highlightStrokeColor: theme.yaxis.label.highlightStrokeColor,
        }
    });
    // Change color of all existing elements
   /* board.objectsList.forEach(obj => {
        obj.setAttribute({ strokeColor: '#ffffff', fillColor: '#888' });
    });*/
}

function getCurrentTheme(board) {

    theme = {
        board: {
            backgroundColor: board.renderer.container.style.backgroundColor,
        },
        xaxis: {
            strokeColor: board.defaultAxes.x.getAttribute('strokeColor'),
            highlightStrokeColor: board.defaultAxes.x.getAttribute('highlightStrokeColor'),
            ticks: {
                strokeColor: board.defaultAxes.x.defaultTicks.getAttribute('strokeColor'),
                highlightStrokeColor: board.defaultAxes.x.defaultTicks.getAttribute('highlightStrokeColor'),
                label: {
                    strokeColor: board.defaultAxes.x.defaultTicks.getAttribute('label').strokecolor,
                    highlightStrokeColor: board.defaultAxes.x.defaultTicks.getAttribute('label').highlightstrokecolor,
                }
            }
        },
        yaxis: {
            strokeColor: board.defaultAxes.y.getAttribute('strokeColor'),
            highlightStrokeColor: board.defaultAxes.y.getAttribute('highlightStrokeColor'),
            ticks: {
                strokeColor: board.defaultAxes.y.defaultTicks.getAttribute('strokeColor'),
                highlightStrokeColor: board.defaultAxes.y.defaultTicks.getAttribute('highlightStrokeColor'),
                label: {
                    strokeColor: board.defaultAxes.y.defaultTicks.getAttribute('label').strokecolor,
                    highlightStrokeColor: board.defaultAxes.y.defaultTicks.getAttribute('label').highlightstrokecolor,
                }
            }
        }
    }

    return theme;

}