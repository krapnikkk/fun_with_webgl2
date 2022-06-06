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
        
        out vec2 texCoord;
        void main(){
            texCoord = a_uv;
            gl_Position = uPMatrix * uCameraMatrix *  uMVMatrix * vec4(a_position,1.0);
        }
    `;
const fragmentShader = `#version 300 es
        precision mediump float;
        out vec4 finalColor;
        in highp vec2 texCoord;
        uniform sampler2D uMainTex;
        void main(){
            finalColor = texture(uMainTex,texCoord);
        }
    `;
const main = () => {
    gl = GLInstance("canvas").fitScreen(0.9, 0.9).clearScreen();

    gCamera = new Camera(gl);
    gCamera.transform.position.set(0, 1, 3);
    gCameraCtrl = new CameraController(gl, gCamera);

    gl.loadTexture("tex001", document.getElementById("img"));

    gGridShader = new GridAxisShader(gl, gCamera.projectionMatrix);
    gGridModal = Primatives.GridAxis.createModal(gl, true);

    gShader = new TestShader(gl, gCamera.projectionMatrix).setTexture(gl.mTextureCache["tex001"]);
    gModal = Primatives.MultiQuad.createModal(gl);
    gModal.setPosition(0, 0.6, 0);

    gRLoop = new RenderLoop(onRender, 30).start();
}

function onRender(dt) {
    gCamera.updateViewMatrix();
    gl.clearScreen();

    gGridShader.activate().setCameraMatrix(gCamera.viewMatrix).renderModal(gGridModal.preRender());

    gShader.activate().preRender().setCameraMatrix(gCamera.viewMatrix)
        .renderModal(gModal.preRender());

}

class TestShader extends Shader {
    constructor(gl, pMatrix) {
        super(gl, vertexShader, fragmentShader);	//Call the base class constructor which will setup most of what we need

        this.setPerspective(pMatrix);

        gl.useProgram(null); //Done setting up shader
    }

    setTexture(texId) {
        this.mainTexture = texId;
        return this;
    }

    preRender() {
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D,this.mainTexture);
        this.gl.uniform1i(this.uniformLoc.mainTexture,0);
        return this;
    }
}