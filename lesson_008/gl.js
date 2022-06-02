const ATTR_POSITION_NAME = "a_position";
const ATTR_POSITION_LOC = 0;
const ATTR_NORMAL_NAME = "a_normal";
const ATTR_NORMAL_LOC = 1;
const ATTR_UV_NAME = "a_uv";
const ATTR_UV_LOC = 2;
function GLInstance(canvasID) {
    var canvas = document.getElementById(canvasID),
        gl = canvas.getContext("webgl2");

    if (!gl) { console.error("WebGL context is not available."); return null; }

    gl.mMeshCache = [];
    gl.mTextureCache = [];

    //...................................................
    //Setup GL, Set all the default configurations we need.
    gl.cullFace(gl.BACK);								//Back is also default
    gl.frontFace(gl.CCW);								//Dont really need to set it, its ccw by default.
    gl.enable(gl.DEPTH_TEST);							//Shouldn't use this, use something else to add depth detection
    gl.enable(gl.CULL_FACE);							//Cull back face, so only show triangles that are created clockwise
    gl.depthFunc(gl.LEQUAL);							//Near things obscure far things
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);	//Setup default alpha blending
    gl.clearColor(1.0, 1.0, 1.0, 1.0);	//Set clear color


    //...................................................
    //Methods	
    gl.clearScreen = function () { this.clear(this.COLOR_BUFFER_BIT | this.DEPTH_BUFFER_BIT); return this; }


    //create and fill our array buffer
    gl.createArrayBuffer = function (floatArr, isStatic) {
        if (isStatic === undefined) isStatic = true;
        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, floatArr, isStatic ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return buf;
    }

    // turns arrays into GL buffers
    gl.createMeshVAO = function (name, arrIdx, arrVert, arrNor, arrUV) {
        var rtn = { drawMode: gl.TRIANGLES };

        rtn.vao = gl.createVertexArray();
        gl.bindVertexArray(rtn.vao);

        if (arrVert) {
            rtn.bufVetices = gl.createBuffer();
            rtn.vertexComponentLen = 3;
            rtn.vertexCount = arrVert.length / rtn.vertexComponentLen;

            gl.bindBuffer(gl.ARRAY_BUFFER, rtn.bufVetices);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrVert), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(ATTR_POSITION_LOC);
            gl.vertexAttribPointer(ATTR_POSITION_LOC, 3, gl.FLOAT, false, 0, 0);
        }

        if (arrNor) {
            rtn.bufNormals = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, rtn.bufNormals);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrNor), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(ATTR_NORMAL_LOC);
            gl.vertexAttribPointer(ATTR_NORMAL_LOC, 3, gl.FLOAT, false, 0, 0);
        }

        if (arrUV) {
            rtn.bufUV = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, rtn.bufUV);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrUV), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(ATTR_UV_LOC);
            gl.vertexAttribPointer(ATTR_UV_LOC, 2, gl.FLOAT, false, 0, 0);
        }

        if (arrIdx) {
            rtn.bufIndex = gl.createBuffer();
            rtn.indexCount = arrIdx.length;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rtn.bufIndex);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(arrIdx), gl.STATIC_DRAW);
            // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        if (arrIdx) {
            this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, null);
        }

        gl.mMeshCache[name] = rtn;
        return rtn;
    }

    gl.loadTexture = function (name, img, doYFlip) {
        var tex = gl.createTexture();
        if (doYFlip) {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        }
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.bindTexture(gl.TEXTURE_2D,null);
        gl.mTextureCache[name] = tex;
        if (doYFlip) {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        }
        return tex;
    }

    //...................................................
    //Setters - Getters

    //Set the size of the canvas html element and the rendering view port
    gl.setSize = function (w, h) {
        //set the size of the canvas, on chrome we need to set it 3 ways to make it work perfectly.
        this.canvas.style.width = w + "px";
        this.canvas.style.height = h + "px";
        this.canvas.width = w;
        this.canvas.height = h;

        //when updating the canvas size, must reset the viewport of the canvas 
        //else the resolution webgl renders at will not change
        this.viewport(0, 0, w, h);
        return this;
    }

    gl.fitScreen = function (wp, hp) {
        return this.setSize(window.innerWidth * (wp || 1), window.innerHeight * (hp || 1));
    }

    return gl;
}