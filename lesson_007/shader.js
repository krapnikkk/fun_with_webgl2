class Shader{
    constructor(gl, vertShader, fragShader) {
        this.program = ShaderUtil.bindProgram(gl, vertShader, fragShader, true);

        if (this.program != null) {
            this.gl = gl;
            gl.useProgram(this.program);
            this.attribLoc = ShaderUtil.getStandardAttribLocations(gl, this.program);
            this.uniformLoc = ShaderUtil.getStandardUniformLocations(gl, this.program);
        }

        //Note :: Extended shaders should deactivate shader when done calling super and setting up custom parts in the constructor.
    }

    //...................................................
    //Methods
    activate() { this.gl.useProgram(this.program); return this; }
    deactivate() { this.gl.useProgram(null); return this; }

    setPerspective(matData) { this.gl.uniformMatrix4fv(this.uniformLoc.perspective, false, matData); return this; }
    setModalMatrix(matData) { this.gl.uniformMatrix4fv(this.uniformLoc.modalMatrix, false, matData); return this; }
    setCameraMatrix(matData) { this.gl.uniformMatrix4fv(this.uniformLoc.cameraMatrix, false, matData); return this; }


    //function helps clean up resources when shader is no longer needed.
    dispose() {
        //unbind the program if its currently active
        if (this.gl.getParameter(this.gl.CURRENT_PROGRAM) === this.program) this.gl.useProgram(null);
        this.gl.deleteProgram(this.program);
    }

    //...................................................
    //RENDER RELATED METHODS

    //Setup custom properties
    preRender() { } //abstract method, extended object may need need to do some things before rendering.

    //Handle rendering a modal
    renderModal(modal) {
        this.setModalMatrix(modal.transform.getViewMatrix())
        this.gl.bindVertexArray(modal.mesh.vao);	//Enable VAO, this will set all the predefined attributes for the shader

        if(modal.mesh.noCulling){
            this.gl.disable(this.gl.CULL_FACE);
        }
        if(modal.mesh.doBlending){
            this.gl.enable(this.gl.BLEND);
        }

        if (modal.mesh.indexCount){
            this.gl.drawElements(modal.mesh.drawMode, modal.mesh.indexCount, gl.UNSIGNED_SHORT, 0);
        }else{
            this.gl.drawArrays(modal.mesh.drawMode, 0, modal.mesh.vertexCount);
        }

        this.gl.bindVertexArray(null);
        if(modal.mesh.noCulling){
            this.gl.enable(this.gl.CULL_FACE);
        }
        if(modal.mesh.doBlending){
            this.gl.disable(this.gl.BLEND);
        }
        return this;
    }
}
class ShaderUtil {
    static createShader(gl, src, type) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);

        //Get Error data if shader failed compiling
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("Error compiling shader : " + src, gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    static createProgram(gl, vShader, fShader, doValidate) {
        //Link shaders together
        var prog = gl.createProgram();
        gl.attachShader(prog, vShader);
        gl.attachShader(prog, fShader);

        gl.bindAttribLocation(prog, ATTR_POSITION_LOC, ATTR_POSITION_NAME);
        gl.bindAttribLocation(prog, ATTR_NORMAL_LOC, ATTR_NORMAL_NAME);
        gl.bindAttribLocation(prog, ATTR_UV_LOC, ATTR_UV_NAME);

        gl.linkProgram(prog);

        //Check if successful
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.error("Error creating shader program.", gl.getProgramInfoLog(prog));
            gl.deleteProgram(prog); return null;
        }

        //Only do this for additional debugging.
        if (doValidate) {
            gl.validateProgram(prog);
            if (!gl.getProgramParameter(prog, gl.VALIDATE_STATUS)) {
                console.error("Error validating program", gl.getProgramInfoLog(prog));
                gl.deleteProgram(prog); return null;
            }
        }

        //Can delete the shaders since the program has been made.
        gl.detachShader(prog, vShader); //TODO, detaching might cause issues on some browsers, Might only need to delete.
        gl.detachShader(prog, fShader);
        gl.deleteShader(fShader);
        gl.deleteShader(vShader);

        return prog;
    }

    static bindProgram(gl, verctex, fragment, doValidate) {
        let vShader = ShaderUtil.createShader(gl, verctex, gl.VERTEX_SHADER),
            fShader = ShaderUtil.createShader(gl, fragment, gl.FRAGMENT_SHADER);
        return ShaderUtil.createProgram(gl, vShader, fShader, doValidate);
    }

    static getStandardAttribLocations(gl, program) {
        return {
            position: gl.getAttribLocation(program, ATTR_POSITION_NAME),
            normal: gl.getAttribLocation(program, ATTR_NORMAL_NAME),
            uv: gl.getAttribLocation(program, ATTR_UV_NAME)
        }
    }

    static getStandardUniformLocations(gl, program) {
        return {
            perspective: gl.getUniformLocation(program, "uPMatrix"),
            modalMatrix: gl.getUniformLocation(program, "uMVMatrix"),
            cameraMatrix: gl.getUniformLocation(program, "uCameraMatrix"),
            mainTexture: gl.getUniformLocation(program, "uMainTex")
        };
    }
}