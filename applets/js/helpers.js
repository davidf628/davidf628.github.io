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
    let xmin = args.xmin ? args.xmin : 0.1;
    let xmax = args.xmax ? args.xmax : 100;
    let xinit = args.xinit ? args.xinit : 9;
    let ymin = args.ymin ? args.ymin : 0.1;
    let ymax = args.ymax ? args.ymax : 100;
    let yinit = args.yinit ? args.yinit : 9;

    let xstart = args.xstart ? args.xstart : 0.6;
    let xend = args.xend ? args.xend : xstart + 0.3;
    let ystart = args.ystart ? args.ystart : 0.75;
    let yend = args.yend ? args.yend : ystart + 0.15;


    let p1 = board.create('point', [function() { return getXPct(xstart);}, function() { return getYPct(ystart)}], { visible: false });
    let p2 = board.create('point', [function() { return getXPct(xend);}, function() { return getYPct(ystart)}], { visible: false });
    let p3 = board.create('point', [function() { return getXPct(xend);}, function() { return getYPct(yend)}], { visible: false });
    let p4 = board.create('point', [function() { return getXPct(xstart);}, function() { return getYPct(yend)}], { visible: false });
    
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
        [ function() { return getXPct(xstart + 0.03); }, function() { return getYPct(ystart + 0.05); }], 
        [ function() { return getXPct(xend - 0.07); }, function() { return getYPct(ystart + 0.05); }], 
        [xmin, xinit, xmax]]);
    slider_horiz_zoom.on('drag', changeScale);
    
    slider_vert_zoom = board.create('slider', [
        [ function() { return getXPct(xstart + 0.03); }, function() { return getYPct(ystart + 0.1); }], 
        [ function() { return getXPct(xend - 0.07); }, function() { return getYPct(ystart + 0.1); }], 
        [ymin, yinit, ymax]]);
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
