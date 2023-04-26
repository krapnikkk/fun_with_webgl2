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
            texCoord = vec2(a_uv.x,a_uv.y*0.5);
            gl_Position = uPMatrix * uCameraMatrix * uMVMatrix *vec4(a_position.xyz,1.0);
        }
    `;
const fragmentShader = `#version 300 es
        precision mediump float;
		uniform sampler2D uTex;
        in highp vec2 texCoord;
        
        out vec4 outColor;
        void main(){
			outColor = texture(uTex,texCoord);
        }
    `;

const main = () => {
    gl = GLInstance("canvas").fitScreen(0.9, 0.9).clearScreen();

    gCamera = new Camera(gl);
    gCamera.transform.position.set(0, 1, 3);
    gCameraCtrl = new CameraController(gl, gCamera);

    gGridFloor = new GridFloor(gl);
    
    document.querySelector("#play").addEventListener("click",(e)=>{
        Resources.setup(gl, onReady).loadVideoTexture(
            "vid", "../assets/video/flower.mp4"
        ).start();
    })

}


function onReady() {
    gShader = new ShaderBuilder(gl, vertexShader, fragmentShader)
        .prepareUniforms("uPMatrix", "mat4", "uMVMatrix", "mat4", "uCameraMatrix", "mat4")
        .prepareTextures("uTex", "vid")
        .setUniforms(
            "uPMatrix", gCamera.projectionMatrix
        );
    gModel = Primatives.Cube.createModal(gl, "Cube", true)
        .setPosition(0, 0.6, 0);

    gRLoop = new RenderLoop(onRender, 30).start();
}

function onRender(dt) {
    gCamera.updateViewMatrix();
    gl.clearScreen();

    gGridFloor.render(gCamera);

    gl.updateTexture("vid", Resources.Videos["vid"], false, true);

    //................................
    //Draw Out models
    gShader.preRender("uCameraMatrix", gCamera.viewMatrix)
        .renderModel(gModel.preRender(), false);

}