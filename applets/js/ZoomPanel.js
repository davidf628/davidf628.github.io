class ZoomPanel {

    constructor(board, args) {

        if(args === undefined) {
            args = {}
        }

        this.board = board;

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


        this.p1 = board.create('point', [function() { return getXPct(board, xstart);}, function() { return getYPct(board, ystart)}], { visible: false });
        this.p2 = board.create('point', [function() { return getXPct(board, xend);}, function() { return getYPct(board, ystart)}], { visible: false });
        this.p3 = board.create('point', [function() { return getXPct(board, xend);}, function() { return getYPct(board, yend)}], { visible: false });
        this.p4 = board.create('point', [function() { return getXPct(board, xstart);}, function() { return getYPct(board, yend)}], { visible: false });

        this.zoomPanel = board.create('polygon', [this.p1, this.p2, this.p3, this.p4], {
            hasInnerPoints: false,
            fillColor: '#0000FF',
            borders: {
                fixed: true,
                highlight: false,
                strokeColor: '#0000FF'
            },
        });

        this.slider_horiz_zoom = board.create('slider', [
            [ function() { return getXPct(board, xstart + 0.03); }, function() { return getYPct(board, ystart + 0.05); }],
            [ function() { return getXPct(board, xend - 0.07); }, function() { return getYPct(board, ystart + 0.05); }],
            [xmin, xinit, xmax]]);

        this.slider_vert_zoom = board.create('slider', [
            [ function() { return getXPct(board, xstart + 0.03); }, function() { return getYPct(board, ystart + 0.1); }],
            [ function() { return getXPct(board, xend - 0.07); }, function() { return getYPct(board, ystart + 0.1); }],
            [ymin, yinit, ymax]]);

        this.slider_horiz_zoom.on('drag', () => { this.changeScale() } );
        this.slider_vert_zoom.on('drag', () => { this.changeScale() } );

        this.setVisible(visible);
    }

    changeScale() {
        let origin = { x: this.board.origin.scrCoords[1], y: this.board.origin.scrCoords[2] };
        let orgpct = { x: origin.x / this.board.canvasWidth, y: origin.y / this.board.canvasHeight };
        let width = { x: this.slider_horiz_zoom.Value(), y: this.slider_vert_zoom.Value() };

        this.board.setBoundingBox([ -width.x * orgpct.x, width.y * (orgpct.y), width.x * (1-orgpct.x), -width.y * (1-orgpct.y)], false);
    }

    toggleVisible() {
        let visible = this.zoomPanel.getAttribute('visible');
        this.setVisible(!visible);
    }

    setVisible(visible) {
        this.zoomPanel.setAttribute( { visible: visible });
        this.slider_horiz_zoom.setAttribute( { visible: visible });
        this.slider_vert_zoom.setAttribute( { visible: visible });
        for(let i of this.zoomPanel.borders) {
            i.setAttribute( { visible: visible });
        }
    }

}

function getXPct(board, pct) {
    return board.getBoundingBox()[0] + pct * (board.getBoundingBox()[2] - board.getBoundingBox()[0]);
}

function getYPct(board, pct) {
    return board.getBoundingBox()[1] - pct * (board.getBoundingBox()[1] - board.getBoundingBox()[3]);
}
