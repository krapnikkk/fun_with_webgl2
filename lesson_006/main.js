let gl,
    gRLoop,
    gModal = null,
    gShader,
    gCamera,
    gCameraCtrl;
let gGridShader,gGridModal;

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
        }
    `;
const fragmentShader = `#version 300 es
        precision mediump float;
        out vec4 finalColor;
        in vec4 color;
        void main(){
            finalColor = color;
        }
`
const main = () => {
    gl = GLInstance("canvas").fitScreen(0.9, 0.9).clearScreen();

    gCamera = new Camera(gl);
    gCamera.transform.position.set(0,1,3);
    gCameraCtrl = new CameraController(gl,gCamera);
    // gShader = new TestShader(gl, [0.8, 0.8, 0.8, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0]);
    // gShader.activate().setPerspective(gCamera.projectionMatrix).deactivate();

    // gModal = new Modal(Primatives.GridAxis.createMesh(gl,true));

    gGridShader = new GridAxisShader(gl, gCamera.projectionMatrix);
    gGridModal = Primatives.GridAxis.createModal(gl,true);

    gRLoop = new RenderLoop(onRender).start();
}

function onRender(dt) {
    gCamera.updateViewMatrix();
    gl.clearScreen();

    gGridShader.activate().setCameraMatrix(gCamera.viewMatrix).renderModal(gGridModal.preRender());

}

class TestShader extends Shader {
    constructor(gl, colorArr) {
        super(gl, vertexShader, fragmentShader);	//Call the base class constructor which will setup most of what we need

        var uColor = gl.getUniformLocation(this.program, "uColor");
        gl.uniform3fv(uColor, colorArr);

        gl.useProgram(null); //Done setting up shader
    }
}