let gl,
    gRLoop,
    gModal,
    gModal2,
    gShader,
    gCamera,
    gCameraCtrl;
let gGridShader, gGridModal,gSkymap,gSkyMapShader;
const vertexShader = `#version 300 es
        in vec4 a_position;
        in vec3 a_normal;
        in vec2 a_uv;

        uniform mat4 uPMatrix;
        uniform mat4 uMVMatrix;
        uniform mat4 uCameraMatrix;
        

        out vec2 texCoord;
        void main(){
            texCoord = a_uv;
            gl_Position = uPMatrix * uCameraMatrix *  uMVMatrix * vec4(a_position.xyz, 1.0);
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
const skyVertexShader = `#version 300 es
        in vec4 a_position;
        in vec2 a_uv;

        uniform mat4 uPMatrix;
        uniform mat4 uMVMatrix;
        uniform mat4 uCameraMatrix;

        out vec3 texCoord;
        void main(){
            texCoord = a_position.xyz;
            gl_Position = uPMatrix * uCameraMatrix *  uMVMatrix * vec4(a_position.xyz, 1.0);
        }
    `;
const skyFragmentShader = `#version 300 es
        precision mediump float;

       

        in highp vec3 texCoord;

        uniform float uTime;
        uniform samplerCube uDayTex;
        uniform samplerCube uNightTex;

         out vec4 finalColor;
        void main(){
            finalColor = mix(texture(uDayTex,texCoord),texture(uNightTex,texCoord),abs(sin(uTime*0.0005)));
        }
    `;
const objText = `
# Blender v2.76 (sub 0) OBJ File: 'cube.blend'
# www.blender.org
mtllib cube.mtl
o Cube
v 1.000000 -1.000000 -1.000000
v 1.000000 -1.000000 1.000000
v -1.000000 -1.000000 1.000000
v -1.000000 -1.000000 -1.000000
v 1.000000 1.000000 -0.999999
v 0.999999 1.000000 1.000001
v -1.000000 1.000000 1.000000
v -1.000000 1.000000 -1.000000
vt 1.000000 1.000000
vt 0.000000 1.000000
vt 0.000000 0.000000
vt 1.000000 0.000000
vn 0.000000 -1.000000 0.000000
vn 0.000000 1.000000 0.000000
vn 1.000000 0.000000 0.000000
vn -0.000000 0.000000 1.000000
vn -1.000000 -0.000000 -0.000000
vn 0.000000 0.000000 -1.000000
usemtl Material
s off
f 2/1/1 3/2/1 4/3/1
f 8/2/2 7/3/2 6/4/2
f 5/1/3 6/2/3 2/3/3
f 6/1/4 7/2/4 3/3/4
f 3/4/5 7/1/5 8/2/5
f 1/3/6 4/4/6 8/1/6
f 1/4/1 2/1/1 4/3/1
f 5/1/2 8/2/2 6/4/2
f 1/4/3 5/1/3 2/3/3
f 2/4/4 6/1/4 3/3/4
f 4/3/5 3/4/5 8/2/5
f 5/2/6 1/3/6 8/1/6`;
const main = () => {
    gl = GLInstance("canvas").fitScreen(0.9, 0.9).clearScreen();

    gCamera = new Camera(gl);
    gCamera.transform.position.set(0, 1, 3);
    gCameraCtrl = new CameraController(gl, gCamera);

    gl.loadTexture("tex001", document.getElementById("img"));

    gl.loadCubeMap("skybox01",[
        document.getElementById("cube01_right"), document.getElementById("cube01_left"),
        document.getElementById("cube01_top"), document.getElementById("cube01_bottom"),
        document.getElementById("cube01_back"), document.getElementById("cube01_front")
    ])

    gl.loadCubeMap("skybox02", [
        document.getElementById("cube02_right"), document.getElementById("cube02_left"),
        document.getElementById("cube02_top"), document.getElementById("cube02_bottom"),
        document.getElementById("cube02_back"), document.getElementById("cube02_front")
    ]);

    gGridShader = new GridAxisShader(gl, gCamera.projectionMatrix);
    gGridModal = Primatives.GridAxis.createModal(gl, false);

    gShader = new TestShader(gl, gCamera.projectionMatrix).setTexture(gl.mTextureCache["tex001"]);

    gModal = new Modal(ObjLoader.textToMesh("objCube", objText, true))
    gModal.setPosition(0, 0.6, 0).setScale(0.5, 0.5, 0.5);

    gSkymap = new Modal(Primatives.Cube.createMesh(gl, "Skymap", 10, 10, 10, 0, 0, 0));
    gSkyMapShader = new SkymapShader(gl, gCamera.projectionMatrix
        , gl.mTextureCache["skybox01"]
        , gl.mTextureCache["skybox02"]
    );

    gRLoop = new RenderLoop(onRender, 30).start();
}

function onRender(dt) {
    gCamera.updateViewMatrix();
    gl.clearScreen();

    gSkyMapShader.activate().preRender()
        .setCameraMatrix(gCamera.getTranslatelessMatrix())
        .setTime(performance.now())
        .renderModal(gSkymap);

    gGridShader.activate()
        .setCameraMatrix(gCamera.viewMatrix)
        .renderModal(gGridModal.preRender());

    gShader.activate().preRender()
        .setCameraMatrix(gCamera.viewMatrix)
        .renderModal(gModal.preRender());

}

class TestShader extends Shader {
    constructor(gl, pMatrix) {
        super(gl, vertexShader, fragmentShader);	//Call the base class constructor which will setup most of what we need

        this.setPerspective(pMatrix);
        this.mainTexture = -1;

        gl.useProgram(null); //Done setting up shader
    }

    setTexture(texId) {
        this.mainTexture = texId;
        return this;
    }

    setTime(t) {
        this.gl.uniform1f(this.uniformLoc.time, t); return this;
    }

    preRender() {
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.mainTexture);
        this.gl.uniform1i(this.uniformLoc.mainTexture, 0);
        return this;
    }
}

class SkymapShader extends Shader {
    constructor(gl, pMatrix, dayTex, nightTex) {
        super(gl, skyVertexShader, skyFragmentShader);

        //Custom Uniforms
        this.uniformLoc.time = gl.getUniformLocation(this.program, "uTime");
        this.uniformLoc.dayTex = gl.getUniformLocation(this.program, "uDayTex");
        this.uniformLoc.nightTex = gl.getUniformLocation(this.program, "uNightTex");

        //Standrd Uniforms
        this.setPerspective(pMatrix);
        this.texDay = dayTex;
        this.texNight = nightTex;
        gl.useProgram(null); //Done setting up shader
    }

    setTime(t) { this.gl.uniform1f(this.uniformLoc.time, t); return this; }

    //Override
    preRender() {
        //Setup Texture
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.texDay);
        this.gl.uniform1i(this.uniformLoc.dayTex, 0);

        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.texNight);
        this.gl.uniform1i(this.uniformLoc.nightTex, 1);
        return this;
    }
}