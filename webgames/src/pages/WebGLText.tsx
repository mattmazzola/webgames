import React, { useEffect, useRef, useState } from "react";

export const PASSWORD_WebGLText = "WEBGLSHAPES2024";

// Vertex shader source
const vertexShaderSource = `#version 300 es
precision highp float;
layout (location=0) in vec4 position;
layout (location=1) in vec3 color;

out vec3 vColor;

void main() {
    vColor = color;
    gl_Position = position;
}`;

// Fragment shader source
const fragmentShaderSource = `#version 300 es
precision highp float;
in vec3 vColor;
out vec4 fragColor;

void main() {
    fragColor = vec4(vColor, 1.0);
}`;

const WebGLText: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [userInput, setUserInput] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const targetText = "TRIANGLE";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get WebGL2 context
    const gl = canvas.getContext("webgl2");
    if (!gl) {
      alert("WebGL2 not supported");
      return;
    }

    // Create shader program
    const createShader = (source: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = createShader(
      fragmentShaderSource,
      gl.FRAGMENT_SHADER
    );
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    // Create vertex array object
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Set up position buffer
    const positions = new Float32Array([
      0.0,
      0.5,
      0.0, // top
      -0.5,
      -0.5,
      0.0, // bottom left
      0.5,
      -0.5,
      0.0, // bottom right
    ]);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    // Set up color buffer
    const colors = new Float32Array([
      1.0,
      0.0,
      0.0, // red
      0.0,
      1.0,
      0.0, // green
      0.0,
      0.0,
      1.0, // blue
    ]);
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(1);

    // Set up rendering
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.useProgram(program);

    // Animation loop
    let rotation = 0;
    const animate = () => {
      rotation += 0.01;
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Update positions with rotation
      const rotatedPositions = positions.map((value, index) => {
        if (index % 3 === 0) {
          return (
            value * Math.cos(rotation) -
            positions[index + 1] * Math.sin(rotation)
          );
        } else if (index % 3 === 1) {
          return (
            positions[index - 1] * Math.sin(rotation) +
            value * Math.cos(rotation)
          );
        }
        return value;
      });

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(rotatedPositions),
        gl.STATIC_DRAW
      );

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      gl.deleteProgram(program);
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(colorBuffer);
      gl.deleteVertexArray(vao);
    };
  }, []);

  // Check if input matches target
  useEffect(() => {
    if (userInput.toUpperCase() === targetText) {
      setIsCorrect(true);
    }
  }, [userInput]);

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <h1>WebGL Challenge</h1>
      <p>
        Type the word that describes the rotating shape to reveal the password!
      </p>

      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          aspectRatio: "4/3",
          margin: "20px auto",
        }}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "black",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        />
      </div>

      <div style={{ width: "100%", maxWidth: "400px" }}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="What shape do you see?"
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "18px",
            borderRadius: "4px",
            border: "2px solid #ccc",
            marginBottom: "20px",
          }}
        />

        {isCorrect && (
          <div
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              padding: "20px",
              borderRadius: "8px",
              marginTop: "20px",
            }}
          >
            <div>Congratulations! You've identified the shape!</div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                marginTop: "10px",
              }}
            >
              Password: {PASSWORD_WebGLText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebGLText;
