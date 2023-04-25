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
        
		uniform vec2[6] uFaces;
		const float size = 1.0/16.0;

        out highp vec2 texCoord;

        void main(){
            int f = int(a_position.w);
			float u = uFaces[f].x * size + a_uv.x * size;
			float v = uFaces[f].y * size + a_uv.y * size;
            texCoord = vec2(u,v);
            gl_Position = uPMatrix * uCameraMatrix * uMVMatrix *vec4(a_position.xyz,1.0);
        }
    `;
const fragmentShader = `#version 300 es
        precision mediump float;
		uniform sampler2D uAltas;
        in highp vec2 texCoord;
        
        out vec4 outColor;
        void main(){
			outColor = texture(uAltas,texCoord);
        }
    `;

const main = () => {
    gl = GLInstance("canvas").fitScreen(0.9, 0.9).clearScreen();

    gCamera = new Camera(gl);
    gCamera.transform.position.set(0, 1, 3);
    gCameraCtrl = new CameraController(gl, gCamera);

    gGridFloor = new GridFloor(gl);
    Resources.setup(gl, onReady).loadTexture(
        "atlas", "../assets/images/atlas_mindcraft.png"
    ).start();


}

var radius = 1.5, angle = 0, angleInc = 1, yPos = 0, yPosInc = 0.2;
var gCubes = [];
var texMap = [
    [3, 0, 3, 0, 3, 0, 2, 0, 3, 0, 2, 9],			//GrassDirt
    [4, 1, 4, 1, 4, 1, 5, 1, 4, 1, 5, 1],			//Log
    [11, 1, 10, 1, 10, 1, 9, 1, 10, 1, 9, 1],		//Chest
    [7, 7, 6, 7, 6, 7, 6, 7, 6, 7, 6, 6],			//Pumpkin
    [8, 8, 8, 8, 8, 8, 9, 8, 8, 8, 9, 8],			//WaterMelon
    [8, 0, 8, 0, 8, 0, 10, 0, 8, 0, 9, 0]			//TNT
];

function onReady() {
    gShader = new ShaderBuilder(gl, vertexShader, fragmentShader)
        .prepareUniforms("uPMatrix", "mat4", "uMVMatrix", "mat4", "uCameraMatrix", "mat4", "uFaces", "2fv")
        .prepareTextures("uAltas", "atlas")
        .setUniforms(
            "uPMatrix", gCamera.projectionMatrix
        );
    var cubemesh = Primatives.Cube.createMesh(gl, "Cube", 1, 1, 1, 0, 0, 0, false);
    for (var i = 0; i < 6; i++) {
        var model = new Modal(cubemesh).setPosition((i % 3) * 2, 0.6, Math.floor(i / 3) * -2);
        gCubes.push(model);
    }

    gRLoop = new RenderLoop(onRender, 30).start();
}

function onRender(dt) {
    gCamera.updateViewMatrix();
    gl.clearScreen();

    gGridFloor.render(gCamera);

    gShader.preRender("uCameraMatrix", gCamera.viewMatrix);
    for (var i = 0; i < gCubes.length; i++) {
        gShader.setUniforms("uFaces", texMap[i]).renderModel(gCubes[i].preRender());
    }

}