let gl,
    gRLoop,
    gModal = null,
    gShader;

const vertexShader = `#version 300 es
        in vec3 a_position;
        layout(location=4) in float a_color;

        uniform vec3 uColor[4];
        out vec4 color;
        void main(){
            color = vec4(uColor[int(a_color)],1.0);
            gl_Position = vec4(a_position,1.0);
        }
    `;
const fragmentShader = `#version 300 es
        precision mediump float;
        out vec4 finalColor;
        in vec4 color;
        void main(){
            finalColor = color;
        }
`
const main = () => {
    gl = GLInstance("canvas").setSize(500, 500).clearScreen();

    gShader = new TestShader(gl, [0.8, 0.8, 0.8, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0]);

    var mesh = gl.createMeshVAO("lines", null, [0, 1, 0, 0, -1, 0, -1, 0, 0, 1, 0, 0]);
    mesh.drawMode = gl.LINES;

    gModal = new Modal(Primatives.GridAxis.createMesh(gl));



    gRLoop = new RenderLoop(onRender).start();
}

function onRender(dt) {
    gl.clearScreen();
    gShader.activate().renderModal(gModal);

}

class TestShader extends Shader {
    constructor(gl,colorArr) {
        super(gl, vertexShader, fragmentShader);	//Call the base class constructor which will setup most of what we need

        var uColor = gl.getUniformLocation(this.program,"uColor");
        gl.uniform3fv(uColor,colorArr);

        gl.useProgram(null); //Done setting up shader
    }
}