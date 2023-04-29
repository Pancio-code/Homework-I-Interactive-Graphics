"use strict";

//variables for canvas and render
var canvas;
var gl;
var program;

//variables to be use in shader
var cBuffer;
var vBuffer;
var positionLoc;
var nBuffer;
var normalLoc;
var nMatrix, nMatrixLoc;

//variables for point 6
var fragmentPercentage = 1.0;

//variables for the camera
var near = 0.1;
var far = 7.0;
var radius = 4.0;
var theta = radians(-168.0);
var phi = radians(-18.0);
var dr = radians(5.0);
var fovy = 20;
var aspect = 1.0;
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

//rotation variables
var rSpeed = 1;
var rotDir = 1.0;
var theta_rotation = vec3(0, 0, 0);
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var rotationMatrix, rotationMatrixLoc;
var rotFlag = false;

//variables for ligth
var lightDirectionX = 0.0;
var lightDirectionY = -0.5;
var lightDirectionZ = 4.0;
var lightPositionX = 0.0;
var lightPositionY = 0.8;
var lightPositionZ = -6.0;
var lightPosition = vec4(lightPositionX, lightPositionY, lightPositionZ, 1.0);
var lightDirection = vec4(lightDirectionX, lightDirectionY, lightDirectionZ, 0.0);
var lightAmbient = vec4(0.3, 0.3, 0.3, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var lightAttenuation = 0.02;
var lightValue = 4.1;

//variables for materials: COPPER
var materialAmbient = vec4(0.19125, 0.0735, 0.0225, 1.0);
var materialDiffuse = vec4(0.7038, 0.27048, 0.0828, 1.0);
var materialSpecular = vec4(0.256777, 0.137622, 0.086014, 1.0);
var materialShininess = 0.1;

var ambientProduct;
var diffuseProduct;
var specularProduct;
var Lflag = false;

//variables for quantization
var Qflag = false;
var chosenColors = [
    vec4(2.0, 0.0, 0.0, 1.0), //first color
    vec4(0.0, 1.0, 0.0, 1.0), //second color
    vec4(0.0, 0.0, 1.0, 1.0), //third color
    vec4(1.0, 1.0, 0.0, 1.0), //fourth color
    vec4(1.0, 0.0, 1.0, 1.0), //first color
    vec4(0.0, 1.0, 1.0, 1.0), //first color
    vec4(66.0 / 255.0, 41.0 / 255.0, 66.0 / 255.0, 1.0), //first color
    vec4(39.0 / 255.0, 16.0 / 255.0, 80.0 / 255.0, 1.0)  //first color
];

//function to convert hex to vec4
function hexToVec4(hex) {
    var r = parseInt(hex.substr(1, 2), 16) / 255.0;
    var g = parseInt(hex.substr(3, 2), 16) / 255.0;
    var b = parseInt(hex.substr(5, 2), 16) / 255.0;
    var a = 1.0;
    return vec4(r, g, b, a)
}

//variables for the object of the homework
var numPositions = 192;
var positionsArray = [];
var normalsArray = [];

var vertices = [
    //top surface
    vec4(-0.3, 0.0, 0.1, 1.0),
    vec4(0.3, 0.0, 0.1, 1.0),
    vec4(0.3, 0.0, -0.4, 1.0),
    vec4(-0.3, 0.0, -0.4, 1.0),

    //bottom surface
    vec4(-0.3, -0.1, 0.2, 1.0),
    vec4(0.3, -0.1, 0.2, 1.0),
    vec4(0.3, -0.1, -0.4, 1.0),
    vec4(-0.3, -0.1, -0.4, 1.0),

    //top leg points
    vec4(-0.2, -0.1, 0.1, 1.0),
    vec4(0.2, -0.1, 0.1, 1.0),
    vec4(0.2, -0.1, -0.3, 1.0),
    vec4(-0.2, -0.1, -0.3, 1.0),

    // leg 1
    vec4(-0.3, -0.5, 0.2, 1.0),
    vec4(-0.3, -0.5, 0.1, 1.0),
    vec4(-0.2, -0.5, 0.1, 1.0),
    vec4(-0.2, -0.5, 0.2, 1.0),

    // leg 2  
    vec4(0.3, -0.5, 0.2, 1.0),
    vec4(0.3, -0.5, 0.1, 1.0),
    vec4(0.2, -0.5, 0.1, 1.0),
    vec4(0.2, -0.5, 0.2, 1.0),

    // leg 3 
    vec4(-0.3, -0.5, -0.4, 1.0),
    vec4(-0.3, -0.5, -0.3, 1.0),
    vec4(-0.2, -0.5, -0.3, 1.0),
    vec4(-0.2, -0.5, -0.4, 1.0),
    // leg 4
    vec4(0.3, -0.5, -0.4, 1.0),
    vec4(0.3, -0.5, -0.3, 1.0),
    vec4(0.2, -0.5, -0.3, 1.0),
    vec4(0.2, -0.5, -0.4, 1.0),

    //first upper point leg
    vec4(-0.2, -0.1, 0.2, 1.0),
    vec4(0.2, -0.1, 0.2, 1.0),
    vec4(0.2, -0.1, -0.4, 1.0),
    vec4(-0.2, -0.1, -0.4, 1.0),

    //second upper point
    vec4(-0.3, -0.1, 0.1, 1.0),
    vec4(0.3, -0.1, 0.1, 1.0),
    vec4(0.3, -0.1, -0.3, 1.0),
    vec4(-0.3, -0.1, -0.3, 1.0),

    //top chair
    vec4(-0.3, 0.5, 0.2, 1.0),
    vec4(0.3, 0.5, 0.2, 1.0),
    vec4(0.3, 0.5, 0.1, 1.0),
    vec4(-0.3, 0.5, 0.1, 1.0),
];

//function for the listeners of the page 
function setListeners() {

    //listeners for ligth
    document.getElementById("ButtonL").onclick = function (event) {
        Lflag = !Lflag;
        event.target.classList.toggle("active");
    };
    document.getElementById("shininessSlider").onchange = function (event) {
        materialShininess = event.target.value;
    };
    document.getElementById("lightYSlider").onchange = function (event) {
        lightDirectionY = event.target.value;
        lightDirection = vec4(lightDirectionX, lightDirectionY, lightDirectionZ, 0.0);
    };
    document.getElementById("lightXSlider").onchange = function (event) {
        lightDirectionX = event.target.value;
        lightDirection = vec4(lightDirectionX, lightDirectionY, lightDirectionZ, 0.0);
    };
    document.getElementById("lightZSlider").onchange = function (event) {
        lightDirectionZ = event.target.value;
        lightDirection = vec4(lightDirectionX, lightDirectionY, lightDirectionZ, 0.0);
    };
    document.getElementById("lightPositionYSlider").onchange = function (event) {
        lightPositionY = event.target.value;
        lightPosition = vec4(lightPositionX, lightPositionY, lightPositionZ, 1.0);
    };
    document.getElementById("lightPositionXSlider").onchange = function (event) {
        lightPositionX = event.target.value;
        lightPosition = vec4(lightPositionX, lightPositionY, lightPositionZ, 1.0);
    };
    document.getElementById("lightPositionZSlider").onchange = function (event) {
        lightPositionZ = event.target.value;
        lightPosition = vec4(lightPositionX, lightPositionY, lightPositionZ, 1.0);
    };
    document.getElementById("lightOpeningSlider").onchange = function (event) {
        lightValue = event.target.value;
    };
    document.getElementById("lightAttenuationSlider").onchange = function (event) {
        lightAttenuation = event.target.value;
    };

    //listener for shading
    document.getElementById("shadingSlider").onchange = function (event) {
        fragmentPercentage = event.target.value / 100;
    };

    //listeners for rotation
    document.getElementById("rSpeedSlider").onchange = function (event) {
        rSpeed = event.target.value / 10;
    };
    document.getElementById("ButtonX").onclick = function () {
        axis = xAxis;
        document.getElementById("ButtonX").classList.add("active");
        document.getElementById("ButtonY").classList.remove("active");
        document.getElementById("ButtonZ").classList.remove("active");
    };
    document.getElementById("ButtonY").onclick = function () {
        axis = yAxis;
        document.getElementById("ButtonX").classList.remove("active");
        document.getElementById("ButtonY").classList.add("active");
        document.getElementById("ButtonZ").classList.remove("active");
    };
    document.getElementById("ButtonZ").onclick = function () {
        axis = zAxis;
        document.getElementById("ButtonX").classList.remove("active");
        document.getElementById("ButtonY").classList.remove("active");
        document.getElementById("ButtonZ").classList.add("active");
    };
    document.getElementById("ButtonD").onclick = function () {
        rotDir = -rotDir
    };
    document.getElementById("ButtonT").onclick = function (event) {
        rotFlag = !rotFlag;
        event.target.classList.toggle("active");
    };

    //listeners for camera
    document.getElementById("zFarSlider").onchange = function (event) {
        far = event.target.value;
    };
    document.getElementById("zNearSlider").onchange = function (event) {
        near = event.target.value;
    };
    document.getElementById("radiusSlider").onchange = function (event) {
        radius = event.target.value;
    };
    document.getElementById("thetaSlider").onchange = function (event) {
        theta = radians(event.target.value);
    };
    document.getElementById("phiSlider").onchange = function (event) {
        phi = radians(event.target.value);
    };
    document.getElementById("aspectSlider").onchange = function (event) {
        aspect = event.target.value;
    };
    document.getElementById("fovSlider").onchange = function (event) {
        fovy = event.target.value;
    };

    //listeners for quantization
    document.getElementById("ButtonQ").onclick = function (event) {
        Qflag = !Qflag;
        event.target.classList.toggle("active");
    };

    document.getElementById("color0").addEventListener("input", function (event) {
        var hexColorOfPicker = event.target.value;
        var rgbaColor = hexToVec4(hexColorOfPicker);
        chosenColors[0] = rgbaColor;
    })

    document.getElementById("color1").addEventListener("input", function (event) {
        var hexColorOfPicker = event.target.value;
        var rgbaColor = hexToVec4(hexColorOfPicker);
        chosenColors[1] = rgbaColor;
    })

    document.getElementById("color2").addEventListener("input", function (event) {
        var hexColorOfPicker = event.target.value;
        var rgbaColor = hexToVec4(hexColorOfPicker);
        chosenColors[2] = rgbaColor;
    })

    document.getElementById("color3").addEventListener("input", function (event) {
        var hexColorOfPicker = event.target.value;
        var rgbaColor = hexToVec4(hexColorOfPicker);
        chosenColors[3] = rgbaColor;
    })

    document.getElementById("color4").addEventListener("input", function (event) {
        var hexColorOfPicker = event.target.value;
        var rgbaColor = hexToVec4(hexColorOfPicker);
        chosenColors[4] = rgbaColor;
    })

    document.getElementById("color5").addEventListener("input", function (event) {
        var hexColorOfPicker = event.target.value;
        var rgbaColor = hexToVec4(hexColorOfPicker);
        chosenColors[5] = rgbaColor;
    })

    document.getElementById("color6").addEventListener("input", function (event) {
        var hexColorOfPicker = event.target.value;
        var rgbaColor = hexToVec4(hexColorOfPicker);
        chosenColors[6] = rgbaColor;
    })

    document.getElementById("color7").addEventListener("input", function (event) {
        var hexColorOfPicker = event.target.value;
        var rgbaColor = hexToVec4(hexColorOfPicker);
        chosenColors[7] = rgbaColor;
    })
}

//function for compose a quadrilater
function quad(a, b, c, d) {
    //formulas for compute the normal of each face
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    normal = vec3(normal);

    var indices = [a, b, c, a, c, d];
    for (var i = 0; i < indices.length; ++i) {
        positionsArray.push(vertices[indices[i]]);
        normalsArray.push(normal);
    }
}

//function for color the cube
function colorCube() {
    quad(0, 1, 2, 3); // top surface
    quad(0, 32, 33, 1); // back surface
    quad(1, 33, 6, 2); // left surface
    quad(2, 6, 7, 3); // front surface
    quad(3, 7, 32, 0); // right surface
    quad(32, 7, 6, 33); // bottom surface

    quad(4, 32, 13, 12); // leg back left-rigth
    quad(8, 14, 13, 32); // leg back left-front
    quad(28, 15, 14, 8); // leg back left-left
    quad(28, 4, 12, 15); // leg back left-back
    quad(15, 12, 13, 14); // leg back left-bottom

    quad(5, 16, 17, 33); // leg back right-rigth
    quad(9, 33, 17, 18); // leg back right-front
    quad(9, 18, 19, 29); // leg back right-left
    quad(5, 29, 19, 16); // leg back right-back
    quad(16, 19, 18, 17); // leg back right-bottom

    quad(7, 20, 21, 35); // leg front left-rigth
    quad(11, 35, 21, 22); // leg front left-back
    quad(11, 22, 23, 31); // leg front left-left
    quad(31, 23, 20, 7); // leg front left-front
    quad(20, 23, 22, 21); // leg front left-bottom

    quad(6, 34, 25, 24); // leg front right-rigth
    quad(10, 26, 25, 34); // leg front right-back
    quad(10, 26, 27, 30); // leg front right-left
    quad(6, 24, 27, 30); // leg front right-front
    quad(24, 25, 26, 27); // leg front right-bottom

    quad(36, 37, 38, 39); // top chair
    quad(32, 33, 5, 4); // bottom chair
    quad(4, 5, 37, 36); // back chair
    quad(38, 1, 0, 39); // front chair
    quad(39, 32, 4, 36); // left chair
    quad(38, 37, 5, 33); // rigth chair
}

//function to set the configuration of the camera
function setConfigurationOfCamera() {
    eye = vec3(radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta));
    //model view matrix
    modelViewMatrix = lookAt(eye, at, up);
    //projection matrix
    projectionMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
}

//function for rotation
function setConfigurationOfRotation() {
    //rSpeed for increment/decrement speed of rotation and rotDir for change direction
    //axis for change between X, Y, Z axis
    if (rotFlag) theta_rotation[axis] += rSpeed * rotDir;

    rotationMatrix = mat4();

    rotationMatrix = mult(rotationMatrix, rotate(theta_rotation[xAxis], vec3(1, 0, 0)));
    rotationMatrix = mult(rotationMatrix, rotate(theta_rotation[yAxis], vec3(0, 1, 0)));
    rotationMatrix = mult(rotationMatrix, rotate(theta_rotation[zAxis], vec3(0, 0, 1)));

    //translate origin of rotation from the origin
    rotationMatrix = mult(rotationMatrix, translate(0.46, 0.46, 0.46));
    rotationMatrix = mult(translate(-0.46, -0.46, -0.46), rotationMatrix)

    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(rotationMatrix));
}

//function for ligth
function setConfigurationOfLight() {
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    nMatrix = normalMatrix(modelViewMatrix, true);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "uShininess"), materialShininess);
    gl.uniform1f(gl.getUniformLocation(program, "IsLightOn"), Lflag);
    gl.uniform1f(gl.getUniformLocation(program, "uLightAngle"), Math.cos(radians(lightValue)));
    gl.uniform4fv(gl.getUniformLocation(program, "uLightDirection"), flatten(lightDirection));
    gl.uniform1f(gl.getUniformLocation(program, "uLightAttenuation"), lightAttenuation);
    gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix));
}

//function to set percentage of fragment shader in the result
function setPercentageOfFragmentShader() {
    gl.uniform1f(gl.getUniformLocation(program, "uPercentageFragment"), fragmentPercentage);
}

//function to set all configurations 
function setLocations() {
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);


    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
    rotationMatrixLoc = gl.getUniformLocation(program, "uRotationMatrix");
    nMatrixLoc = gl.getUniformLocation(program, "uNormalMatrix");
}

//function to send color of user to shaders
function setConfigurationOfQuantization() {
    gl.uniform1f(gl.getUniformLocation(program, "uIsQuantizationOn"), Qflag);
    gl.uniform4fv(gl.getUniformLocation(program, "uChosenColors"), flatten(chosenColors));
}

//drawing all the polygons from the vertices for compose the object
function drawingPolygons() {
    resiveCanvas(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
}

//function for not obtain pixeled image when render it
function resiveCanvas(cnv) {
    //obtain size of canvas from the browser
    var canvasDisplayWidth = cnv.clientWidth;
    var canvasDisplayHeight = cnv.clientHeight;

    // Check if the canvas is not the same size.
    var isNeededChange = cnv.width !== canvasDisplayWidth ||
        cnv.height !== canvasDisplayHeight;

    if (isNeededChange) {
        //resize the canvas
        cnv.width = canvasDisplayWidth;
        cnv.height = canvasDisplayHeight;
    }

    return isNeededChange;
}

//Initial function at load of page
function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.width, canvas.height);

    aspect = canvas.width / canvas.height;

    gl.clearColor(0.6, 0.6, 0.6, 1.0);

    gl.enable(gl.DEPTH_TEST);

    aspect = canvas.width / canvas.height;

    //  Load shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    colorCube();
    setLocations();
    setListeners();

    render();
}


var render = function () {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //set all configurations
    setConfigurationOfCamera();
    setConfigurationOfRotation();
    setConfigurationOfLight();
    setConfigurationOfQuantization();
    setPercentageOfFragmentShader();

    //draw the chair
    drawingPolygons();
    requestAnimationFrame(render);
}


window.onload = init;
