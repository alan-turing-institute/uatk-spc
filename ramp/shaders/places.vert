#version 330
#extension GL_ARB_separate_shader_objects : enable

uniform vec2 viewport; // Viewport size in pixels
uniform vec2 position; // Camera position in km from world origin
uniform float scale; // Scale in km per pixel

layout(location = 0) in vec2 in_position; // Position in km from world origin
layout(location = 1) in uint in_hazard; // Fixed point hazard

layout(location = 0) out vec3 out_color;

void main() {
  gl_Position = vec4(2.0 * (in_position - position) / scale / viewport, 0.0, 1.0);
  out_color = (int(in_hazard) == 0) ? vec3(1.0, 1.0, 1.0) : vec3(1.0, 0.0, 0.0);
}
