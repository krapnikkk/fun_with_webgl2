let gl,
    gRLoop,
    gModal,
    gShader,
    gCamera,
    gCameraCtrl,
    gGridFloor,
    mDebug,
    mDebugLine;
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
        uniform sampler2D uMask_A;
		uniform sampler2D uMask_B;
        uniform vec3[2] uColors;
        in highp vec2 texCoord;
        
        out vec4 outColor;
        void main(){
            vec4 mask_a = texture(uMask_A,texCoord*4.0) * 0.15;
			vec4 mask_b = texture(uMask_B,texCoord*2.0);
			float c = min(mask_a.r + mask_b.r,1.0);

			outColor = vec4( mix(uColors[0],uColors[1], c), 1.0);
        }
    `;

const main = () => {
    gl = GLInstance("canvas").fitScreen(0.9, 0.9).clearScreen();

    gCamera = new Camera(gl);
    gCamera.transform.position.set(0, 1, 3);
    gCameraCtrl = new CameraController(gl, gCamera);

    gGridFloor = new GridFloor(gl);
    Resources.setup(gl, onReady).loadTexture(
        "mask_a", "../assets/images/mask_square.png",
        "mask_b", "../assets/images/mask_cornercircles.png"
    ).start();


}

var radius = 1.5, angle = 0, angleInc = 1, yPos = 0, yPosInc = 0.2;

function onReady() {
    gShader = new ShaderBuilder(gl, vertexShader, fragmentShader)
        .prepareUniforms("uPMatrix", "mat4", "uMVMatrix", "mat4", "uCameraMatrix", "mat4", "uColors", "3fv")
        .prepareTextures("uMask_A", "mask_a", "uMask_B", "mask_b")
        .setUniforms(
            "uPMatrix", gCamera.projectionMatrix,
            "uColors", GLUtil.rgbArray("880000", "ff9999")
        );
    gModal = Primatives.Cube.createModal(gl, "Cube", true);
    gModal.setPosition(0, 0.6, 0)

    gRLoop = new RenderLoop(onRender, 30).start();
}

function onRender(dt) {
    gCamera.updateViewMatrix();
    gl.clearScreen();

    gGridFloor.render(gCamera);

    gShader.preRender("uCameraMatrix", gCamera.viewMatrix)
        .renderModel(gModal.preRender(), false);

}