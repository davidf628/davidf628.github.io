function fullscreen() {
    var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
        (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
        (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
        (document.msFullscreenElement && document.msFullscreenElement !== null);

    var docElm = document.documentElement;
    if (!isInFullScreen) {
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        } else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        } else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        } else if (docElm.msRequestFullscreen) {
            docElm.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

function getXPct(pct) {
    return board.getBoundingBox()[0] + pct * (board.getBoundingBox()[2] - board.getBoundingBox()[0]);
}

function getYPct(pct) {
    return board.getBoundingBox()[1] - pct * (board.getBoundingBox()[1] - board.getBoundingBox()[3]);
}

let zoomPanel = '';
let slider_horiz_zoom = '';
let slider_vert_zoom = '';

function setupZoomPanel(board, args) {

    if(args === undefined) {
        args = {}
    }

    let visible = typeof(args.visible) === "boolean" ? args.visible : true;
    console.log(visible);

    let p1 = board.create('point', [function() { return getXPct(0.6);}, function() { return getYPct(0.75)}], { visible: false });
    let p2 = board.create('point', [function() { return getXPct(0.9);}, function() { return getYPct(0.75)}], { visible: false });
    let p3 = board.create('point', [function() { return getXPct(0.9);}, function() { return getYPct(0.9)}], { visible: false });
    let p4 = board.create('point', [function() { return getXPct(0.6);}, function() { return getYPct(0.9)}], { visible: false });
    
    zoomPanel = board.create('polygon', [p1, p2, p3, p4],
    { 
        hasInnerPoints: false,
        fillColor: '#0000FF',
        borders: {
            fixed: true,
            highlight: false,
            strokeColor: '#0000FF'
        },
    });
    
    slider_horiz_zoom = board.create('slider', [
        [ function() { return getXPct(0.63); }, function() { return getYPct(0.8); }], 
        [ function() { return getXPct(0.83); }, function() { return getYPct(0.8); }], 
        [0.1, 9, 100]]);
    slider_horiz_zoom.on('drag', changeScale);
    
    slider_vert_zoom = board.create('slider', [
        [ function() { return getXPct(0.63); }, function() { return getYPct(0.85); }], 
        [ function() { return getXPct(0.83); }, function() { return getYPct(0.85); }], 
        [0.1, 9, 100]]);
    slider_vert_zoom.on('drag', changeScale);

    zoomPanel_setVisible(visible);

}

changeScale = function() {
    let origin = { x: board.origin.scrCoords[1], y: board.origin.scrCoords[2] };
    let orgpct = { x: origin.x / board.canvasWidth, y: origin.y / board.canvasHeight };
    let width = { x: slider_horiz_zoom.Value(), y: slider_vert_zoom.Value() };

    board.setBoundingBox([ -width.x * orgpct.x, width.y * (orgpct.y), width.x * (1-orgpct.x), -width.y * (1-orgpct.y)], false);
}

function toggle_zoomPanel() {
    let visible = zoomPanel.getAttribute('visible');
    zoomPanel_setVisible(!visible);
} 

function zoomPanel_setVisible(visible) {
    zoomPanel.setAttribute( { visible: visible });
    slider_horiz_zoom.setAttribute( { visible: visible });
    slider_vert_zoom.setAttribute( { visible: visible });
    for(let i of zoomPanel.borders) {
        i.setAttribute( { visible: visible });
    }
}
