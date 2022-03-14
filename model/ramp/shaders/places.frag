#version 330
#extension GL_ARB_separate_shader_objects : enable

uniform float alpha; // Alpha to draw with

layout(location = 0) in vec3 out_color;

layout(location = 0) out vec4 frag_color;

void main() {
    frag_color = vec4(out_color, alpha);
}
