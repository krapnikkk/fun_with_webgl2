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
		uniform mat3 uNormMatrix;
        uniform vec3 uCamPos;
        

        out highp vec2 texCoord;
        out vec3 vPos;
        out vec3 vNorm;
        out vec3 vCamPos;

        void main(){
            vec4 pos = uMVMatrix * vec4(a_position.xyz,1.0);
            vPos = pos.xyz;
            vNorm = uNormMatrix * a_normal;
            texCoord = a_uv;
            vCamPos = (inverse(uCameraMatrix)*vec4(uCamPos,1.0)).xyz;
            gl_Position = uPMatrix * uCameraMatrix *  pos;
        }
    `;
const fragmentShader = `#version 300 es
        precision mediump float;
        in highp vec2 texCoord;
        in vec3 vNorm;
        in vec3 vPos;
        in vec3 vCamPos;

        uniform vec3 uLightPos;
        uniform sampler2D uMainTex;

        out vec4 outColor;
        void main(){
            vec4 cBase = vec4(1.0,0.5,0.5,1.0);
            vec3 cLight = vec3(1.0,1.0,1.0);

            // ambient light
            float ambientStrength = 0.15;
            vec3 cAmbient = ambientStrength * cLight;

            // diffuse
            vec3 lightDir = normalize(uLightPos - vPos);
            float diffAngle = max(dot(vNorm,lightDir),0.0);

            float diffuseStrength = 0.3;
            vec3 cDiffuse = diffAngle * cLight * diffuseStrength;

            // specular
            float specularStrength = 0.15;
            float specularShininess = 256.0;
            vec3 camDir = normalize(vCamPos - vPos);
            vec3 reflectDir = reflect(-lightDir,vNorm);

            float spec = pow(max(dot(reflectDir,camDir),0.0),specularShininess);
            vec3 cSpecular = specularStrength * spec * cLight;

            vec3 finalColor = (cAmbient + cDiffuse + cSpecular)  * cBase.rgb;
            outColor = vec4(finalColor,1.0);
        }
    `;

const main = () => {
    gl = GLInstance("canvas").fitScreen(0.9, 0.9).clearScreen();

    gCamera = new Camera(gl);
    gCamera.transform.position.set(0, 1, 3);
    gCameraCtrl = new CameraController(gl, gCamera);

    gl.loadTexture("tex001", document.getElementById("img"));

    gShader = new TestShader(gl, gCamera.projectionMatrix).setTexture(gl.mTextureCache["tex001"]);

    gModal = Primatives.Cube.createModal(gl, "Cube", true);
    gModal.setPosition(0, 0, 0)

    gSkymap = new Skymap(gl)
        .setDayTexByDom("cube01_right", "cube01_left", "cube01_top", "cube01_bottom", "cube01_back", "cube01_front")
        .setNightTexByDom("cube02_right", "cube02_left", "cube02_top", "cube02_bottom", "cube02_back", "cube02_front")
        .setTime(0.7)
        .finalize();

    gGridFloor = new GridFloor(gl);

    mDebug = new VertexDebugger(gl, 10)
        .addColor("#ff0000")
        .addPoint(0, 0, 0, 0)
        .finalize();

    gRLoop = new RenderLoop(onRender, 30).start();
}

var radius = 1.5, angle = 0, angleInc = 1, yPos = 0, yPosInc = 0.2;

function onRender(dt) {
    gCamera.updateViewMatrix();
    gl.clearScreen();

    gSkymap.render(gCamera);
    gGridFloor.render(gCamera);

    angle += angleInc * dt;
    yPos += yPosInc * dt;

    var x = radius * Math.cos(angle),
        z = radius * Math.sin(angle),
        y = MathUtil.Map(Math.sin(yPos), -1, 1, 0.1, 2);
    mDebug.transform.position.set(x, y, z);

    gShader.activate().preRender()
        .setCameraMatrix(gCamera.viewMatrix)
        .setCameraPos(gCamera)
        .setLightPos(mDebug)
        .renderModal(gModal.preRender());
        
    mDebug.render(gCamera);


}

class TestShader extends Shader {
    constructor(gl, pMatrix) {
        super(gl, vertexShader, fragmentShader);	//Call the base class constructor which will setup most of what we need

        //custom uniforms
        this.uniformLoc.lightpos = gl.getUniformLocation(this.program, "uLightPos");
        this.uniformLoc.campos = gl.getUniformLocation(this.program, "uCamPos");
        this.uniformLoc.matNorm = gl.getUniformLocation(this.program, "uNormMatrix");

        //Standrd Uniforms
        this.setPerspective(pMatrix);
        this.mainTexture = -1; //Store Our Texture ID
        gl.useProgram(null); //Done setting up shader
    }
    setTexture(texID) {
        this.mainTexture = texID;
        return this;
    }
    setLightPos(obj) {
        this.gl.uniform3fv(this.uniformLoc.lightpos, new Float32Array(obj.transform.position.getArray()));
        return this;
    }

    setCameraPos(obj) {
        this.gl.uniform3fv(this.uniformLoc.campos, new Float32Array(obj.transform.position.getArray()));
        return this;
    }

    //Override
    preRender() {
        //Setup Texture
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.mainTexture);
        this.gl.uniform1i(this.uniformLoc.mainTexture, 0); //Our predefined uniformLoc.mainTexture is uMainTex, Prev Lessons we made ShaderUtil.getStandardUniformLocations() function in Shaders.js to get its location.

        return this;
    }

    renderModal(modal) {
        this.gl.uniformMatrix3fv(this.uniformLoc.matNorm, false, modal.transform.getNormalMatrix());
        super.renderModal(modal);
        return this;
    }
}