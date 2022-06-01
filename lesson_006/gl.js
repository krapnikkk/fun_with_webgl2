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

    //...................................................
    //Setup GL, Set all the default configurations we need.
    gl.clearColor(1.0, 1.0, 1.0, 1.0);		//Set clear color


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
            gl.vertexAttribPointer(ATTR_UV_LOC, 3, gl.FLOAT, false, 0, 0);
        }

        if (arrIdx) {
            rtn.bufIndex = gl.createBuffer();
            rtn.indexCount = arrIdx.length;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rtn.bufIndex);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(arrIdx), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.mMeshCache[name] = rtn;
        return rtn;
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