let gl,
    gRLoop,
    gModal,
    gShader,
    gCamera,
    gCameraCtrl,
    gGridFloor,
    mDebug,
    mDebugLine;
let gGridModal, gSkymap;
const vertexShader = `#version 300 es
        in vec4 a_position;
        in vec3 a_normal;
        in vec2 a_uv;

        uniform mat4 uPMatrix;
        uniform mat4 uMVMatrix;
        uniform mat4 uCameraMatrix;
        

        out highp vec2 texCoord;

        void main(){
            texCoord = a_uv;
            gl_Position = uPMatrix * uCameraMatrix * uMVMatrix *vec4(a_position.xyz,1.0);
        }
    `;
const fragmentShader = `#version 300 es
        precision mediump float;
        in highp vec2 texCoord;
        uniform sampler2D uTexture;

        out vec4 outColor;
        void main(){
            outColor = texture(uTexture,texCoord*1.5);
        }
    `;

const main = () => {
    gl = GLInstance("canvas").fitScreen(0.9, 0.9).clearScreen();

    gCamera = new Camera(gl);
    gCamera.transform.position.set(0, 1, 3);
    gCameraCtrl = new CameraController(gl, gCamera);

    // gl.loadTexture("tex001", document.getElementById("img"));
    Resources.setup(gl, onReady).loadTexture("tex001", "../assets/images/UV_Grid_Lrg.jpg").start();

    // gShader = new TestShader(gl, gCamera.projectionMatrix).setTexture(gl.mTextureCache["tex001"]);


}

var radius = 1.5, angle = 0, angleInc = 1, yPos = 0, yPosInc = 0.2;

function onReady() {
    gShader = new ShaderBuilder(gl, vertexShader,fragmentShader)
        .prepareUniforms("uPMatrix","mat4","uMVMatrix","mat4","uCameraMatrix","mat4")
        .prepareTextures("uTexture","tex001")
        .setUniforms("uPMatrix", gCamera.projectionMatrix);
    gModal = Primatives.Cube.createModal(gl, "Cube", true);
    gModal.setPosition(0, 0.6, 0)

    // gSkymap = new Skymap(gl)
    //     .setDayTexByDom("cube01_right", "cube01_left", "cube01_top", "cube01_bottom", "cube01_back", "cube01_front")
    //     .setNightTexByDom("cube02_right", "cube02_left", "cube02_top", "cube02_bottom", "cube02_back", "cube02_front")
    //     .setTime(0.7)
    //     .finalize();

    gGridFloor = new GridFloor(gl);

    // mDebug = new VertexDebugger(gl, 10)
    //     .addColor("#ff0000")
    //     .addPoint(0, 0, 0, 0)
    //     .finalize();

    gRLoop = new RenderLoop(onRender, 30).start();
}

function onRender(dt) {
    gCamera.updateViewMatrix();
    gl.clearScreen();

    gGridFloor.render(gCamera);

    gShader.preRender("uCameraMatrix", gCamera.viewMatrix)
        .renderModel(gModal.preRender(),false);

}