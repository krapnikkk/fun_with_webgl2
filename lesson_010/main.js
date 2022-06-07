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

        uniform vec3 uColor[6];
		uniform float uTime;

        vec3 warp(vec3 p){
			// return p + 0.2 * abs(cos(uTime*0.002)) * a_normal;
			//return p + 0.5 * abs(cos(uTime*0.003 + p.y)) * a_normal;
			return p + 0.5 * abs(cos(uTime*0.003 + p.y*2.0 + p.x*2.0 + p.z)) * a_normal;
		}
        
        out lowp vec4 color;
        out vec2 texCoord;
        void main(){
            texCoord = a_uv;
            
            color = vec4(uColor[ int(a_position.w) ],1.0);

            gl_Position = uPMatrix * uCameraMatrix *  uMVMatrix * vec4(warp(a_position.xyz), 1.0);
        }
    `;
const fragmentShader = `#version 300 es
        precision mediump float;

        out vec4 finalColor;

        in vec4 color;
        in highp vec2 texCoord;
        uniform sampler2D uMainTex;
        void main(){
            // finalColor = texture(uMainTex,texCoord);
            finalColor = mix(color,texture(uMainTex,texCoord),0.8f);
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

    gModal = Primatives.Cube.createModal(gl);
    gModal.setPosition(0, 0.6, 0);

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
        .setTime(performance.now())
        .renderModal(gModal.preRender());

}

class TestShader extends Shader {
    constructor(gl, pMatrix) {
        super(gl, vertexShader, fragmentShader);	//Call the base class constructor which will setup most of what we need

        this.uniformLoc.time = gl.getUniformLocation(this.program, "uTime");
        var uColor = gl.getUniformLocation(this.program, "uColor");
        gl.uniform3fv(uColor, new Float32Array(GLUtil.rgbArray("#FF0000", "00FF00", "0000FF", "909090", "C0C0C0", "404040")));

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