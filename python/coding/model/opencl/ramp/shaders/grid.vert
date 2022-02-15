#version 330
#extension GL_ARB_separate_shader_objects : enable

layout(location = 0) in vec2 in_position;

void main() {
  gl_Position = vec4(in_position, 1.0, 1.0);
}
