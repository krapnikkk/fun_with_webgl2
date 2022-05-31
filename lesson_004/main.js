let gl,
    gRLoop,
    gModal = null,
    gPointSize = 0,
    gPSizeStep = 3,
    gAngle = 0,
    gAngleStep = (Math.PI / 180.0) * 90;

const vertexShader = `#version 300 es
        in vec3 a_position;
        uniform mediump float uPointSize;
        uniform float uAngle;
        void main(){
            gl_PointSize = uPointSize;
            // gl_Position = vec4(a_position,1.0);
            gl_Position = vec4(
                cos(uAngle)*0.8+a_position.x,
                sin(uAngle)*0.8+a_position.y,
                a_position.z,
                1.0
            );
        }
    `;
const fragmentShader = `#version 300 es
        precision mediump float;
        out vec4 finalColor;
        uniform float uPointSize;
        void main(){
            float c = (40.0 - uPointSize)/20.0;
            finalColor = vec4(c,c,c,1.0);
        }
`
const main = () => {
    gl = GLInstance("canvas").setSize(500, 500).clearScreen();

    gShader = new TestShader(gl);

    //Set Up Data Buffers
    var mesh = gl.createMeshVAO("dots", null, [0, 0, 0, 0.1, 0.1, 0, 0.1, -0.1, 0, -0.1, -0.1, 0, -0.1, 0.1, 0]);
    mesh.drawMode = gl.POINTS; //Most often the draw mode will be triangles, but in this instance we need Points

    //There is many instances when we want a single mesh object shared between many 
    //modals, for example trees. One mesh with many transforms technically.
    gModal = new Modal(mesh);



    gRLoop = new RenderLoop(onRender).start();
}

function onRender(dt) {
    gl.clearScreen();
    gShader.activate().set(
        (Math.sin((gPointSize += gPSizeStep * dt)) * 10.0) + 30.0,
        (gAngle += gAngleStep * dt)
    ).renderModal(gModal);

}

class TestShader extends Shader {
    constructor(gl) {
        super(gl, vertexShader, fragmentShader);	//Call the base class constructor which will setup most of what we need

        //Our shader uses custom uniforms, this is the time to get its location for future use.
        this.uniformLoc.uPointSize = gl.getUniformLocation(this.program, "uPointSize");
        this.uniformLoc.uAngle = gl.getUniformLocation(this.program, "uAngle");

        gl.useProgram(null); //Done setting up shader
    }

    //Simple function that passes in Angle and Pointsize uniform data to the shader program.
    set(size, angle) {
        this.gl.uniform1f(this.uniformLoc.uPointSize, size);
        this.gl.uniform1f(this.uniformLoc.uAngle, angle);
        return this;
    }
}