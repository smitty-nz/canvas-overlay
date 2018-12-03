const THREE = require( 'three' );

module.exports = class Canvas2dOverlay {
    /**
     * @param {THREE.WebGLRenderer} renderer 
     */
    constructor( renderer ){
        if( !renderer ){ 
            throw new Error( 'Canvas2dOverlay constructor requires a valid three.js renderer object' );
        }

        this.__width      = renderer.getSize().width;
        this.__height     = renderer.getSize().height;

        this.renderer   = renderer;
        this.camera     = new THREE.OrthographicCamera( this.left, this.right, this.top, this.bottom, 0, 50 );
        this.scene      = new THREE.Scene();
        this.canvas     = document.createElement( 'canvas' );
        this.context    = this.canvas.getContext( '2d' );

        this.texture    = new THREE.Texture( this.canvas );
        this.texture.generateMipmaps    = false;
        this.texture.wrapS              = THREE.ClampToEdgeWrapping
        this.texture.wrapT              = THREE.ClampToEdgeWrapping;
        this.texture.minFilter          = THREE.LinearFilter;
        
        this.material   = new THREE.MeshBasicMaterial( { map : this.texture, transparent : true } );
        this.geometry   = new THREE.PlaneGeometry( 1, 1 );
        this.plane      = new THREE.Mesh( this.geometry, this.material );
        this.scene.add( this.plane );

        this.setSize( this.width, this.height );
    }
    get width()     { return this.__width; }
    get height()    { return this.__height; }
    get left()      { return this.width / -2; }
    get right()     { return this.width / 2; }
    get top()       { return this.height / 2; }
    get bottom()    { return this.height / -2; }

    /**
     * Sets the width and the height of the overlay
     * for most uses, use the three js renderer width and height
     * this will destroy the canvas context, so you will need to reset
     * any parameters used for drawing
     * @param {Number} width 
     * @param {Number} height 
     */
    setSize( width, height ){
        this.__width = width;
        this.__height = height;

        let left    = this.left;
        let right   = this.right;
        let top     = this.top;
        let bottom  = this.bottom;

        this.plane.scale.set( width, height, 1 );
        
        this.canvas.width   = width;
        this.canvas.height  = height;
        
        this.camera.left    = left;
        this.camera.right   = right;
        this.camera.top     = top;
        this.camera.bottom  = bottom;
        this.camera.updateProjectionMatrix();
    }

    /**
     * Calls getSize using the dimensions of the 
     * internal renderer used to create the overlay 
     * @param {THREE.WebGLRenderer} renderer 
     */
    updateSize(){
        this.setSize( this.renderer.getSize().width, this.renderer.getSize().height );
    }

    /**
     * @callback RenderCallback
     * @param {CanvasRenderingContext2D} context
     */
    
    /**
     * Allows the caller access to the context
     * @param {RenderCallback} callback 
     */
    use( callback, updateTexture = true ){
        callback( this.context );
        this.texture.needsUpdate = updateTexture;
    }
    /**
     * clear the context and update the texture
     * call this before you draw
     */
    clear(){
        this.context.clearRect( 0, 0, this.width, this.height );
    }
    /**
     * outputs to screen
     * dont call this if you're using postprocessing
     */
    render(){
        this.renderer.autoClearColor = false;
        this.renderer.render( this.scene, this.camera );   
    }
}

