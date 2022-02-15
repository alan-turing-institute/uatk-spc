#version 330
#extension GL_ARB_separate_shader_objects : enable

uniform vec2 viewport; // Viewport size in pixels
uniform vec2 position; // Position of the camera in km from the origin
uniform float spacing; // Spacing between grid lines in km
uniform float scale; // km per pixel at the current zoom level

layout(location = 0) in vec3 out_position;

layout(location = 0) out vec4 frag_color;

const float major_spacing = 10.0; // Minor lines per major line
const vec4 color_background = vec4(0.1, 0.1, 0.1, 1.0);
const vec4 color_major_line = vec4(0.35, 0.35, 0.0, 1.0);
const vec4 color_line = vec4(0.3, 0.3, 0.3, 1.0);

void main() {
  // Compute the distance from the world origin in pixels of this fragment.
  vec2 pixels_from_origin = position / scale + (gl_FragCoord.xy - viewport / 2.0);
  // Compute the number of pixels per minor grid cell from the spacing.
  float spacing_pixels = spacing / scale;
  // Check if the pixel coordinates evenly divide the spacing, drawing the appropriate color.
  if (int(mod(pixels_from_origin.x, spacing_pixels * major_spacing)) == 0 ||
      int(mod(pixels_from_origin.y, spacing_pixels * major_spacing)) == 0) {
    frag_color = color_major_line;
  } else if (int(mod(pixels_from_origin.x, spacing_pixels)) == 0 ||
             int(mod(pixels_from_origin.y, spacing_pixels)) == 0) {
    frag_color = color_line;
  } else {
    frag_color = color_background;
  }
}
