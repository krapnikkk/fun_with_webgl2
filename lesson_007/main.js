let gl,
    gRLoop,
    gModal,
    gModal2,
    gShader,
    gCamera,
    gCameraCtrl;
let gGridShader, gGridModal;

const vertexShader = `#version 300 es
        in vec3 a_position;
        in vec2 a_uv;

        uniform mat4 uPMatrix;
        uniform mat4 uMVMatrix;
        uniform mat4 uCameraMatrix;
        
        out vec2 uv;
        void main(){
            uv = a_uv;
            gl_Position = uPMatrix * uCameraMatrix *  uMVMatrix * vec4(a_position,1.0);
        }
    `;
const fragmentShader = `#version 300 es
        precision mediump float;
        out vec4 finalColor;
        in vec2 uv;
        void main(){
            //Square Border
            float c = (uv.x <= 0.1 || uv.x>=0.9||uv.y<=0.1||uv.y>=0.9)?0.0:1.0;
            finalColor = vec4(c,c,c,1.0-c);

            //Circle
			/*
			vec2 delta = uv - vec2(0.5,0.5); //delta position from center;
			float dist = 0.5 - sqrt(delta.x*delta.x + delta.y*delta.y);
			float border = 0.01;
			float a = 0.0;
			if(dist > border) a = 1.0;
			else if(dist > 0.0) a = dist / border;
			finalColor = vec4(0.0,0.0,0.0,a);
			*/
        }
    `;
const main = () => {
    gl = GLInstance("canvas").fitScreen(0.9, 0.9).clearScreen();

    gCamera = new Camera(gl);
    gCamera.transform.position.set(0, 1, 3);
    gCameraCtrl = new CameraController(gl, gCamera);

    gGridShader = new GridAxisShader(gl, gCamera.projectionMatrix);
    gGridModal = Primatives.GridAxis.createModal(gl, true);

    gShader = new TestShader(gl, gCamera.projectionMatrix);
    gModal = Primatives.MultiQuad.createModal(gl);
    // gModal = Primatives.Quad.createModal(gl);
    // gModal.setPosition(0, 1, 0).setScale(0.2, 0.2, 0.2);
    // gModal2 = new Modal(gl.mMeshCache["Quad"]);

    gRLoop = new RenderLoop(onRender).start();
}

function onRender(dt) {
    gCamera.updateViewMatrix();
    gl.clearScreen();

    gGridShader.activate().setCameraMatrix(gCamera.viewMatrix).renderModal(gGridModal.preRender());

    gShader.activate().setCameraMatrix(gCamera.viewMatrix)
        .renderModal(gModal.preRender())
        // .renderModal(gModal2.preRender());

}

class TestShader extends Shader {
    constructor(gl, pMatrix) {
        super(gl, vertexShader, fragmentShader);	//Call the base class constructor which will setup most of what we need

        this.setPerspective(pMatrix);

        gl.useProgram(null); //Done setting up shader
    }
}