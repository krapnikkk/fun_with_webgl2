let gl,
    gVertCnt = 0,
    uPointSizeLoc = -1,
    uAngle = 0,
    gRLoop,
    gShader = null,
    gModal = null;
const vertexShader = `#version 300 es
        in vec3 a_position;
        uniform float uPointSize;
        uniform float uAngle;
        void main(){
            gl_PointSize = uPointSize;
            // gl_Position = vec4(a_position,1.0);
            gl_Position = vec4(
                cos(uAngle)*0.8+a_position.x,
                sin(uAngle)*0.8+a_position.y,
                a_position.z,
                1.0
            );
        }
    `;
const fragmentShader = `#version 300 es
        precision mediump float;
        out vec4 finalColor;
        void main(){
            finalColor = vec4(0.0,0.0,0.0,1.0);
        }
`
const main = () => {
    gl = GLInstance("canvas").setSize(500, 500).clearScreen();
    let program = ShaderUtil.bindProgram(gl, vertexShader, fragmentShader, true);
    gl.useProgram(program);
    let aPositionLoc = gl.getAttribLocation(program, "a_position"),
        uPointSizeLoc = gl.getUniformLocation(program, "uPointSize"),
        uAngleLoc = gl.getUniformLocation(program, "uAngle");
    gl.useProgram(null);

    let arrVerts = new Float32Array([0, 0, 0, 0.5, 0.5, 0]),
        bufVerts = gl.createArrayBuffer();
    gVertCnt = arrVerts.length / 3;

    gl.useProgram(program);
    gl.uniform1f(uPointSizeLoc, 50.0);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufVerts);
    gl.enableVertexAttribArray(aPositionLoc);
    gl.vertexAttribPointer(aPositionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.drawArrays(gl.POINTS, 0, gVertCnt);
    var gPointSize = 0,
        gPSizeStep = 3,
        gAngle = 0,
        gAngleStep = (Math.PI / 180.0) * 90;	//90 degrees in Radians

    function onRender(dt) {
        gPointSize += gPSizeStep * dt;
        var size = (Math.sin(gPointSize) * 10.0) + 30.0;
        gl.uniform1f(uPointSizeLoc, size);						//Store data to the shader's uniform variable uPointSize

        gAngle += gAngleStep * dt;								//Update the angle at the rate of AngleStep Per Second
        gl.uniform1f(uAngleLoc, gAngle);							//Pass new angle value to the shader.

        gl.clearScreen();
        gl.drawArrays(gl.POINTS, 0, gVertCnt);					//Draw the points
    }

    gRLoop = new RenderLoop(onRender).start();
}