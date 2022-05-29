let gl;
const vertexShader = `#version 300 es
        in vec3 a_position;
        uniform float uPointSize;
        void main(){
            gl_PointSize = uPointSize;
            gl_Position = vec4(a_position,1.0);
        }
`;
const fragmentShader = `#version 300 es
        precision mediump float;
        out vec4 finalColor;
        void main(){
            finalColor = vec4(0.0,0.0,0.0,1.0);
        }
`;
const main = () => {
    gl = GLInstance("canvas").setSize(500, 500).clearScreen();
    let vShader = ShaderUtil.createShader(gl, vertexShader, gl.VERTEX_SHADER),
        fShader = ShaderUtil.createShader(gl, fragmentShader, gl.FRAGMENT_SHADER),
        program = ShaderUtil.createProgram(gl, vShader, fShader, true);
    gl.useProgram(program);
    let aPositionLoc = gl.getAttribLocation(program, "a_position"),
        uPointSizeLoc = gl.getUniformLocation(program, "uPointSize");
    gl.useProgram(null);

    let arrVerts = new Float32Array([0,0,0,0.5,0.5,0]),
        bufVerts = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, bufVerts);
    gl.bufferData(gl.ARRAY_BUFFER, arrVerts, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER,null);

    gl.useProgram(program);
    gl.uniform1f(uPointSizeLoc,50.0);

    gl.bindBuffer(gl.ARRAY_BUFFER,bufVerts);
    gl.enableVertexAttribArray(aPositionLoc);
    gl.vertexAttribPointer(aPositionLoc,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,null);

    gl.drawArrays(gl.POINTS,0,2);


}