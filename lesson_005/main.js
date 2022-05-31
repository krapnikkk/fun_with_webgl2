let gl,
    gRLoop,
    gModal = null,
    gShader;

const vertexShader = `#version 300 es
        in vec3 a_position;
        layout(location=4) in float a_color;

        uniform mat4 uMVMatrix;
        uniform vec3 uColor[4];
        out vec4 color;
        void main(){
            color = vec4(uColor[int(a_color)],1.0);
            gl_Position = uMVMatrix * vec4(a_position,1.0);
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



    gModal = new Modal(Primatives.GridAxis.createMesh(gl))
        .setScale(0.4, 0.4, 0.4)
        .setRotation(0, 0, 45)
        .setPosition(0.8, 0.8, 0.8);



    gRLoop = new RenderLoop(onRender).start();
}

function onRender(dt) {
    gl.clearScreen();

    var p = gModal.transform.position,				//Just an pointer to transform position, make code smaller 
        angle = Math.atan2(p.y, p.x) + (1 * dt),		//Calc the current angle plus 1 degree per second rotation
        radius = Math.sqrt(p.x * p.x + p.y * p.y),	//Calc the distance from origin.
        scale = Math.max(0.2, Math.abs(Math.sin(angle)) * 1.2);   //Just messing with numbers and seeing what happens :)


    gShader.activate().renderModal(gModal.setScale(scale, scale / 4, 1)
        .setPosition(radius * Math.cos(angle), radius * Math.sin(angle), 0)
        .addRotation(30 * dt, 60 * dt, 15 * dt)
        .preRender().preRender());

}

class TestShader extends Shader {
    constructor(gl, colorArr) {
        super(gl, vertexShader, fragmentShader);	//Call the base class constructor which will setup most of what we need

        var uColor = gl.getUniformLocation(this.program, "uColor");
        gl.uniform3fv(uColor, colorArr);

        gl.useProgram(null); //Done setting up shader
    }
}