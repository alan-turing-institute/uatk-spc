def set_styles(style):
    """Applies the styling for the imgui UI."""
    style.window_rounding = 0
    style.child_rounding = 0
    style.frame_rounding = 0
    style.scrollbar_rounding = 0
    style.grab_rounding = 0
    style.window_padding = [14, 14]
    style.window_border_size = 0
    style.window_title_align = [0.03, 0.5]
    style.frame_padding = [5, 2]
    style.item_spacing = [10, 10]

    colors = style.colors
    colors[2] = [0.102, 0.102, 0.102, 1.0]  # Window BG
    colors[7] = [0.202, 0.202, 0.202, 1.0]  # Frame BG
    colors[8] = [0.102, 0.102, 0.102, 1.0]  # Frame BG Hover
    colors[9] = [0.102, 0.102, 0.102, 1.0]  # Frame BG Active
    colors[10] = [0.05, 0.05, 0.05, 1.0]  # Title Bar
    colors[11] = [0.05, 0.05, 0.05, 1.0]  # Title Bar Active
    colors[18] = [1.0, 0.231, 0.211, 1.0]  # Start Accent
    colors[19] = [1.0, 0.231, 0.211, 1.0]  # Start Accent
    colors[20] = [1.0, 0.231, 0.211, 1.0]  # Start Accent
    colors[21] = [1.0, 0.231, 0.211, 1.0]  # Button
    colors[22] = [1.0 * 0.6, 0.231 * 0.6, 0.211 * 0.6, 1.0]  # Button Hover
    colors[23] = [1.0, 0.231, 0.211, 1.0]  # Start Accent
    colors[24] = [1.0, 0.231, 0.211, 1.0]  # Start Accent
    colors[25] = [1.0, 0.231, 0.211, 1.0]  # Start Accent
    colors[26] = [1.0, 0.231, 0.211, 1.0]  # Start Accent
