class GridAxisShader extends Shader {
    constructor(gl, pMatrix) {
        const vertexShader = `#version 300 es
        in vec3 a_position;
        layout(location=4) in float a_color;

        uniform mat4 uPMatrix;
        uniform mat4 uMVMatrix;
        uniform mat4 uCameraMatrix;

        uniform vec3 uColor[4]; // four vec3 with an array
        out vec4 color;
        void main(){
            color = vec4(uColor[int(a_color)],1.0);
            gl_Position = uPMatrix * uCameraMatrix *  uMVMatrix * vec4(a_position,1.0);
        }`;
        const fragmentShader = `#version 300 es
        precision mediump float;
        out vec4 finalColor;
        in vec4 color;
        void main(){
            finalColor = color;
        }`;

        super(gl, vertexShader, fragmentShader);	//Call the base class constructor which will setup most of what we need

        this.setPerspective(pMatrix);

        var uColor = gl.getUniformLocation(this.program, "uColor");
        gl.uniform3fv(uColor, new Float32Array([0.8, 0.8, 0.8, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0]));

        gl.useProgram(null); //Done setting up shader
    }
}