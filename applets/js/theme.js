
// Toggle between dark and light mode
function toggleDarkMode(board) {
    let isDark = document.body.classList.toggle('dark-mode');
    if (isDark) {
        setTheme(board, darkmode_theme);
    } else {
        setTheme(board, lightmode_theme); 
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
            strokeColor: theme.xaxis.ticks.label.strokeColor,
            highlightStrokeColor: theme.xaxis.ticks.label.highlightStrokeColor,
        }
    });
    board.defaultAxes.y.defaultTicks.setAttribute({
        strokeColor: theme.yaxis.strokeColor,
        highlightStrokeColor: theme.yaxis.highlightStrokeColor,
        label: {
            strokeColor: theme.yaxis.ticks.label.strokeColor,
            highlightStrokeColor: theme.yaxis.ticks.label.highlightStrokeColor,
        }
    });
    // Change color of all points
    board.objectsList.forEach(obj => {
        if (obj.elType == 'point') {
            obj.setAttribute(theme.point);
        }
    });
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

darkmode_theme = {
    board: {
        backgroundColor: '#2e2e2b',
    },
    xaxis: {
        strokeColor: '#ffffff',
        highlightStrokeColor: '#ffffff',
        ticks: {
            strokeColor: '#ffffff',
            highlightStrokeColor: '#ffffff',
            label: {
                strokeColor: '#ffffff',
                highlightStrokeColor: '#ffffff',
            }
        }
    },
    yaxis: {
        strokeColor: '#ffffff',
        highlightStrokeColor: '#ffffff',
        ticks: {
            strokeColor: '#ffffff',
            highlightStrokeColor: '#ffffff',
            label: {
                strokeColor: '#ffffff',
                highlightStrokeColor: '#ffffff',
            }
        }
    },
    point: {
        face: "o",
        size: 4,
        fillColor: "#2a45f5",
        highlightFillColor: "#42f5ec",
        strokeColor: "#2a45f5",
        highlightStrokeColor: "#42f5ec",
        label: {
            strokeColor: 'white',
            highlightStrokeColor: 'white',
            fontSize: 16
        }
    },
    
}

function initTheme(board) {
    lightmode_theme = getCurrentTheme(board);
    point = {
        face: "o",
        size: 4,
        fillColor: "#d55e00",
        highlightFillColor: "#c3d9ff",
        strokeColor: "#d55e00",
        highlightStrokeColor: "#c3d9ff",
        label: {
            strokeColor: 'black',
            highlightStrokeColor: 'black',
            fontSize: 16
        }
    };
    lightmode_theme.point = point;
}