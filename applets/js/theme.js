function set_darkmode(board) {
    //board.renderer.container.style.backgroundColor = 'black';
        // Change board background color dynamically
        document.getElementById('jxgbox').style.backgroundColor = '#1e1e1e';

        // Change grid and axis colors
        board.defaultAxes.x.setAttribute({ strokeColor: '#bbbbbb' });
        board.defaultAxes.y.setAttribute({ strokeColor: '#bbbbbb' });
        board.renderer.container.style.color = '#ffffff'; // Text color
    
        // Change color of all existing elements
        board.objectsList.forEach(obj => {
            obj.setAttribute({ strokeColor: '#ffffff', fillColor: '#888' });
        });
}

// Toggle between dark and light mode
function toggleDarkMode(board) {
    let isDark = document.body.classList.toggle('dark-mode');
    if (isDark) {
        set_darkmode(board);
    } else {
        location.reload(); // Reload to reset
    }
}