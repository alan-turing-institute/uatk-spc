import glfw
import imgui
import numpy as np
import os
import copy

from imgui.integrations.glfw import GlfwRenderer
from OpenGL.GL import *

from ramp.activity import Activity
from ramp.params import Params
from ramp.projections import latlon_to_km
from ramp.shader import load_shader
from ramp.snapshot import Snapshot
from ramp.style import set_styles
from ramp.summary import Summary
from ramp.constants import Constants

default_flags = imgui.WINDOW_NO_RESIZE | imgui.WINDOW_NO_MOVE | imgui.WINDOW_NO_COLLAPSE


class Inspector:
    """User Interface: manager for all user input and rendering for the application."""

    def __init__(self, simulator, snapshot, study_area_folder, nlines, window_name, width, height,
                 # font_path="microsim/opencl/fonts/RobotoMono.ttf"):
                 font_path=os.path.join(Constants.Paths.OPENCL_FONTS.FULL_PATH_ROBOTO)):
        """Create the window, imgui renderer, and all background renderers.

        Args:
            nplaces: Number of places being simulated.
            npeople: Number of people being simulated.
            nlines: Number of connection lines to draw per person (recommend low, must be < nslots).
            window_name: The name to display on the application window.
            width: Initial width of the window in screen coordinates.
            height: Initial height of the window in screen coordinates.
            font_path: Path the the .ttf file to use for text in imgui.
        """
        nplaces = simulator.nplaces
        npeople = simulator.npeople
        device = simulator.device_name()
        platform = simulator.platform_name()

        if not glfw.init():
            raise OSError("Could not initialize window")

        glfw.window_hint(glfw.CONTEXT_VERSION_MAJOR, 3)
        glfw.window_hint(glfw.CONTEXT_VERSION_MINOR, 3)
        glfw.window_hint(glfw.OPENGL_PROFILE, glfw.OPENGL_CORE_PROFILE)
        glfw.window_hint(glfw.OPENGL_FORWARD_COMPAT, glfw.TRUE)

        window = glfw.create_window(width, height, window_name, None, None)
        if not window:
            glfw.terminate()
            raise OSError("Could not initialize window")

        glfw.make_context_current(window)
        imgui.create_context()
        impl = GlfwRenderer(window)

        glfw.set_framebuffer_size_callback(window, self.resize_callback)
        glfw.set_key_callback(window, self.key_callback)

        font = imgui.get_io().fonts.add_font_from_file_ttf(font_path, 56)
        impl.refresh_font_texture()

        # vertices representing corners of the screen
        quad_vertices = np.array([
            -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, -1.0,
        ], dtype=np.float32)

        # Create vertex buffers on the GPU
        quad_vbo = glGenBuffers(1)
        glBindBuffer(GL_ARRAY_BUFFER, quad_vbo)
        glBufferData(GL_ARRAY_BUFFER, 4 * 2 * 6, quad_vertices, GL_STATIC_DRAW)

        locations_vbo = glGenBuffers(1)
        glBindBuffer(GL_ARRAY_BUFFER, locations_vbo)
        glBufferData(GL_ARRAY_BUFFER, 4 * 2 * nplaces, None, GL_STATIC_DRAW)

        hazards_vbo = glGenBuffers(1)
        glBindBuffer(GL_ARRAY_BUFFER, hazards_vbo)
        glBufferData(GL_ARRAY_BUFFER, 4 * nplaces, None, GL_DYNAMIC_DRAW)

        links_ebo = glGenBuffers(1)
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, links_ebo)
        glBufferData(GL_ELEMENT_ARRAY_BUFFER, 4 * 2 * npeople * nlines, None, GL_STATIC_DRAW)

        # Set up the vao for the point shader
        point_vao = glGenVertexArrays(1)
        glBindVertexArray(point_vao)
        glBindBuffer(GL_ARRAY_BUFFER, locations_vbo)
        glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 2*4, None)
        glEnableVertexAttribArray(0)
        glBindBuffer(GL_ARRAY_BUFFER, hazards_vbo)
        glVertexAttribIPointer(1, 1, GL_UNSIGNED_INT, 4, None)
        glEnableVertexAttribArray(1)

        # Set up the vao for the line shader
        line_vao = glGenVertexArrays(1)
        glBindVertexArray(line_vao)
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, links_ebo)
        glBindBuffer(GL_ARRAY_BUFFER, locations_vbo)
        glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 2*4, None)
        glEnableVertexAttribArray(0)
        glBindBuffer(GL_ARRAY_BUFFER, hazards_vbo)
        glVertexAttribIPointer(1, 1, GL_UNSIGNED_INT, 4, None)
        glEnableVertexAttribArray(1)

        # Set up the vao for the quad
        quad_vao = glGenVertexArrays(1)
        glBindVertexArray(quad_vao)
        glBindBuffer(GL_ARRAY_BUFFER, quad_vbo)
        glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 2*4, None)
        glEnableVertexAttribArray(0)

        glBindVertexArray(0)

        # Load and compile shaders
        places_program = load_shader("places")
        grid_program = load_shader("grid")

        # Enable OpenGL features
        glEnable(GL_BLEND)
        glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA)

        # Initialise Camera position
        position = np.array([0.0, 0.0, 0.05], dtype=np.float32)

        # Imgui styling
        style = imgui.get_style()
        set_styles(style)

        # Make a guess on font size
        font_scale = 0.5
        self.update_font_scale(font_scale)

        # Initialise viewport based on framebuffer
        width, height = glfw.get_framebuffer_size(window)
        glViewport(0, 0, width, height)

        self.simulator = simulator
        self.snapshot = snapshot
        self.initial_state_snapshot = copy.deepcopy(snapshot)
        self.params = Params.fromarray(snapshot.buffers.params)
        self.nplaces = nplaces
        self.npeople = npeople
        self.nlines = nlines
        self.width = width
        self.height = height
        self.platform = platform
        self.device = device
        self.window = window
        self.first = True
        self.impl = impl
        self.font = font
        self.font_scale = font_scale

        self.simulation_active = False
        self.do_lockdown = False
        self.point_size = 2.0
        self.show_grid = True
        self.show_points = True
        self.show_lines = False
        self.show_parameters = False
        self.show_saveas = False
        self.spacing = 40.0
        self.move_sensitivity = 10.0
        self.zoom_multiplier = 1.01
        self.position = position
        # self.snapshot_dir = "microsim/opencl/snapshots"
        self.snapshot_dir = os.path.join(study_area_folder,
                                         Constants.Paths.SNAPSHOTS.FOLDER)
        self.snapshots = [f for f in os.listdir(self.snapshot_dir) if f.endswith(".npz")]
        self.current_snapshot = self.snapshots.index(f"{snapshot.name}.npz")
        self.selected_snapshot = self.current_snapshot
        self.saveas_file = self.snapshots[self.current_snapshot]
        self.summary = Summary(snapshot, store_detailed_counts=False)

        self.quad_vbo = quad_vbo
        self.locations_vbo = locations_vbo
        self.hazards_vbo = hazards_vbo
        self.links_ebo = links_ebo
        self.point_vao = point_vao
        self.line_vao = line_vao
        self.quad_vao = quad_vao
        self.places_program = places_program
        self.grid_program = grid_program

        self.upload_hazards(self.snapshot.buffers.place_hazards)
        self.upload_locations(self.snapshot.buffers.place_coords)
        self.upload_links(self.snapshot.buffers.people_place_ids)

    def resize_callback(self, window, width, height):
        """Framebuffer resize callback."""
        self.width = width
        self.height = height
        glViewport(0, 0, width, height)

    def key_callback(self, window, key, scancode, action, mods):
        """Callback for keyboard controls that must fire exactly once."""
        self.impl.keyboard_callback(window, key, scancode, action, mods)
        if imgui.get_io().want_capture_keyboard or not action == glfw.PRESS:
            return

        # Show / hide lines
        elif key == glfw.KEY_L:
            self.show_lines = not self.show_lines

        # Change point size
        elif key == glfw.KEY_1:
            self.point_size = 1.0
        elif key == glfw.KEY_2:
            self.point_size = 2.0
        elif key == glfw.KEY_3:
            self.point_size = 3.0
        elif key == glfw.KEY_4:
            self.point_size = 4.0
        elif key == glfw.KEY_5:
            self.point_size = 5.0
        elif key == glfw.KEY_6:
            self.point_size = 6.0

    def is_pressed(self, key):
        return glfw.get_key(self.window, key) == glfw.PRESS

    def update_camera(self):
        if imgui.get_io().want_capture_keyboard:
            return

        # Move Camera Position
        if self.is_pressed(glfw.KEY_W):
            self.position[1] += self.move_sensitivity * self.position[2]
        if self.is_pressed(glfw.KEY_S):
            self.position[1] -= self.move_sensitivity * self.position[2]
        if self.is_pressed(glfw.KEY_A):
            self.position[0] -= self.move_sensitivity * self.position[2]
        if self.is_pressed(glfw.KEY_D):
            self.position[0] += self.move_sensitivity * self.position[2]

        # Zoom in / out
        if self.is_pressed(glfw.KEY_UP):
            self.position[2] /= self.zoom_multiplier
        if self.is_pressed(glfw.KEY_DOWN):
            self.position[2] *= self.zoom_multiplier

    # TODO: hard-coded lat-lon !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    def upload_locations(self, locations):  #  50.7184, lon=-3.5339
        """Reprojects the lat lons around the provided one and uploads them to OpenGL.

        Args:
            locations: A numpy array of 2 * nplaces float32 lat/lons.
            lat: The latitude to transform the coordinates around.
            lon: The longitude to transform the coordinates around.
        """
        #non_zero = np.count_nonzero(locations)
        #print (non_zero)
        new_arr_no_0 = locations[np.where(locations!=0)]
        print (new_arr_no_0)
        a = np.sort(new_arr_no_0)
        step = np.multiply(0.5, a.size)
        print (step)
        step = step.astype(int)
        b = np.mean(a.reshape(-1, step), axis=1)
        print (b)
        lat = b[1]
        lon = b[0]
        #a = np.average(locations, 1)
        #print (a)
        #a = np.sort(locations)
        #result = np.mean(a.reshape(-1, 421542), axis=1)
        #lon = result[0]
        #lat = result[1]
        
        #lat = np.max(locations)
        #lon = np.min(locations)
        
        glBindBuffer(GL_ARRAY_BUFFER, self.locations_vbo)
        glBufferSubData(GL_ARRAY_BUFFER, 0, 2*4*self.nplaces, latlon_to_km(locations, lat, lon))

    def upload_hazards(self, hazards):
        """Transfers the contents of hazards to the hazards vertex buffer.

        Args:
            hazards: A numpy array of nplaces uint32 hazards.
        """
        glBindBuffer(GL_ARRAY_BUFFER, self.hazards_vbo)
        glBufferSubData(GL_ARRAY_BUFFER, 0, 4*self.nplaces, hazards)

    def upload_links(self, place_ids):
        """Transforms the 1D place_ids buffer into a 1d element buffer and uploads it.

        Args:
            place_ids: A numpy array of npeople*nslots uint32 place IDs.
        """
        place_mat = np.reshape(place_ids, (self.npeople, int(place_ids.size / self.npeople)))
        place_mat = place_mat[:, 0:self.nlines]
        starts = np.repeat(place_mat[:, 0], self.nlines)
        ends = place_mat.flatten()
        links = np.empty(2*self.npeople*self.nlines, dtype=np.uint32)
        links[0::2] = starts
        links[1::2] = ends
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, self.links_ebo)
        glBufferSubData(GL_ELEMENT_ARRAY_BUFFER, 0, 2*4*self.npeople*self.nlines, links)

    def update_font_scale(self, font_scale):
        """Updates the imgui font scale, starts out at 0.5"""
        imgui.get_io().font_global_scale = font_scale

    def draw_grid(self):
        """Draws a full screen quad with a grid in the pixel shader."""
        viewport = np.array([self.width, self.height], dtype=np.float32)  # Viewport size
        position = self.position[0:2]  # Position in km from origin
        scale = self.position[2]  # Scale in km per pixel
        if self.width * scale / self.spacing > 60.0:
            self.spacing *= 2.0
        elif self.width * scale / self.spacing < 30.0:
            self.spacing /= 2.0
        spacing = self.spacing

        glBindVertexArray(self.quad_vao)
        glUseProgram(self.grid_program)
        glUniform2fv(glGetUniformLocation(self.grid_program, "viewport"), 1, viewport)
        glUniform2fv(glGetUniformLocation(self.grid_program, "position"), 1, position)
        glUniform1fv(glGetUniformLocation(self.grid_program, "spacing"), 1, spacing)
        glUniform1fv(glGetUniformLocation(self.grid_program, "scale"), 1, scale)
        glDrawArrays(GL_TRIANGLES, 0, 6)

    def draw_points(self):
        """Draws a point for each location colored by its hazard."""
        viewport = np.array([self.width, self.height], dtype=np.float32) # Viewport size
        position = self.position[0:2] # Position in km from origin
        scale = self.position[2] # Scale in km per pixel

        glBindVertexArray(self.point_vao)
        glUseProgram(self.places_program)
        glUniform2fv(glGetUniformLocation(self.places_program, "viewport"), 1, viewport)
        glUniform2fv(glGetUniformLocation(self.places_program, "position"), 1, position)
        glUniform1fv(glGetUniformLocation(self.places_program, "scale"), 1, scale)
        glUniform1fv(glGetUniformLocation(self.places_program, "alpha"), 1, 1.0)
        glDrawArrays(GL_POINTS, 0, self.nplaces)

    def draw_lines(self):
        """Draws a line between each connected location colored by hazards."""
        viewport = np.array([self.width, self.height], dtype=np.float32) # Viewport size
        position = self.position[0:2] # Position in km from origin
        scale = self.position[2] # Scale in km per pixel

        glBindVertexArray(self.line_vao)
        glUseProgram(self.places_program)
        glUniform2fv(glGetUniformLocation(self.places_program, "viewport"), 1, viewport)
        glUniform2fv(glGetUniformLocation(self.places_program, "position"), 1, position)
        glUniform1fv(glGetUniformLocation(self.places_program, "scale"), 1, scale)
        glUniform1fv(glGetUniformLocation(self.places_program, "alpha"), 1, 0.01)
        glDrawElements(GL_LINES, 2 * self.npeople * self.nlines, GL_UNSIGNED_INT, None)

    def draw_platform_window(self, width, height):
        imgui.set_next_window_size(width / 6, height / 4)
        imgui.set_next_window_position(width*5/6, 0)
       
        imgui.begin("Information", flags=default_flags)
        imgui.text(f"Platform:\n\t{self.platform}")
        imgui.text(f"Device: \n\t{self.device}")
        imgui.text(f"Snapshot:\n\t{self.snapshots[self.current_snapshot]}")
        imgui.text(f"Day:\n\t{self.simulator.time}")
        imgui.end()

    def draw_controls_window(self, width, height):
        imgui.set_next_window_size(width / 6, height / 4)
        imgui.set_next_window_position(width*5/6, height * 1/4)

        imgui.begin("Controls", flags=default_flags)
        imgui.text("WASD to move around")
        imgui.text("Arrow Up/Down to zoom in/out")
        imgui.text("1-6 to change point size")
        if imgui.button("Stop" if self.simulation_active else "Start"):
            self.simulation_active = not self.simulation_active
        if imgui.button("Step"):
            self.update_sim()
        if imgui.button("Rollback"):
            # reset snapshot to the initial state when the inspector was created
            self.snapshot = copy.deepcopy(self.initial_state_snapshot)
            self.simulator.upload_all(self.snapshot.buffers)
            self.simulator.time = self.snapshot.time
        _, self.do_lockdown = imgui.checkbox("Lockdown", self.do_lockdown)
        if imgui.button("Hide Parameters" if self.show_parameters else "Show Parameters"):
            self.show_parameters = not self.show_parameters
        imgui.end()

    def draw_layers_window(self, width, height):
        imgui.set_next_window_size(width / 6, height / 4)
        imgui.set_next_window_position(width*5/6, height * 2/4)
        imgui.begin("Layers", flags=default_flags)
        _, self.show_grid = imgui.checkbox("Show Grid", self.show_grid)
        _, self.show_points = imgui.checkbox("Show Places", self.show_points)
        _, self.show_lines = imgui.checkbox("Show Connections", self.show_lines)
        _, self.point_size = imgui.slider_int("Point Size", self.point_size, min_value=1, max_value=6)
        clicked, self.font_scale = imgui.slider_float("Font Scale", self.font_scale, 0.1, 0.9, "%.1f")
        if clicked:
            self.update_font_scale(self.font_scale)
        imgui.end()

    def draw_snapshots_window(self, width, height):
        imgui.set_next_window_size(width / 6, height / 4)
        imgui.set_next_window_position(width*5/6, height * 3/4)
        imgui.begin("Snapshots", flags=default_flags)
        clicked, self.selected_snapshot = imgui.listbox("", self.selected_snapshot, self.snapshots)
        if imgui.button("Load Selected"):
            self.snapshot = Snapshot.load_full_snapshot(f"snapshots/{self.snapshots[self.selected_snapshot]}")
            self.simulator.upload_all(self.snapshot.buffers)
            self.simulator.time = self.snapshot.time
            self.upload_hazards(self.snapshot.buffers.place_hazards)
            self.upload_locations(self.snapshot.buffers.place_coords)
            self.upload_links(self.snapshot.buffers.people_place_ids)
            self.current_snapshot = self.selected_snapshot
        if imgui.button("Save"):
            self.simulator.download_all(self.snapshot.buffers)
            self.snapshot.time = self.simulator.time
            self.snapshot.save(f"snapshots/{self.snapshots[self.current_snapshot]}")
        if imgui.button("Save As..."):
            self.show_saveas = True
        imgui.end()

    def draw_timeseries_window(self, width, height):
        imgui.set_next_window_size(width / 10, height)
        imgui.set_next_window_position(0, 0)
        imgui.begin("Time Series", flags=default_flags)
        graph_size = [width/11, height / 7.5]
        self.summary.draw_plots(self.simulator.time, graph_size)
        imgui.end()

    def draw_saveas_window(self, width, height):
        imgui.set_next_window_size(width * 2 / 8, height / 8)
        imgui.begin("Save Snapshot As...", flags=imgui.WINDOW_NO_RESIZE)
        _, self.saveas_file = imgui.input_text("Filename", self.saveas_file, 256)
        if imgui.button("Save"):
            self.simulator.download_all(self.snapshot.buffers)
            self.snapshot.time = self.simulator.time
            self.snapshot.save(f"snapshots/{self.saveas_file}")
            self.snapshots = [f for f in os.listdir("snapshots") if f.endswith(".npz")]
            self.current_snapshot = self.snapshots.index(self.saveas_file)
            self.selected_snapshot = self.current_snapshot
            self.show_saveas = False
        imgui.end()

    def draw_parameters_window(self):
        """UI window with sliders for changing parameter values."""
        imgui.begin("Parameter Editor")

        imgui.text("Behaviour Change")

        _, self.params.symptomatic_multiplier = imgui.slider_float(
            "Symptomatic Multiplier", self.params.symptomatic_multiplier, 0.0, 1.0)

        imgui.text("Duration Distributions")

        _, self.params.exposed_scale = imgui.slider_float(
            "Exposed Weibull Scale", self.params.exposed_scale, 1.0, 10.0)
        _, self.params.exposed_shape = imgui.slider_float(
            "Exposed Weibull Shape", self.params.exposed_shape, 0.0, 10.0)
        _, self.params.presymptomatic_scale = imgui.slider_float(
            "Presymptomatic Weibull Scale", self.params.presymptomatic_scale, 0.0, 10.0)
        _, self.params.presymptomatic_shape = imgui.slider_float(
            "Presymptomatic Weibull Shape", self.params.presymptomatic_shape, 0.0, 10.0)
        _, self.params.infection_log_scale = imgui.slider_float(
            "Infection Log-normal Scale", self.params.infection_log_scale, 0.0, 5.0)
        _, self.params.infection_mode = imgui.slider_float(
            "Infection Log-normal Mode", self.params.infection_mode, 0.0, 20.0)

        imgui.text("Activity Hazard Multipliers")

        for i, activity in enumerate(list(Activity)):
            _, self.params.place_hazard_multipliers[i] = imgui.slider_float(
                activity.name, self.params.place_hazard_multipliers[i], 0.0, 1.0, "%.4f")

        imgui.text("Mortality Probabilities by Age")

        _, self.params.mortality_probs[0] = imgui.slider_float(
            "0 to 4", self.params.mortality_probs[0], 0.0, 1.0, "%.7f")
        _, self.params.mortality_probs[1] = imgui.slider_float(
            "5 to 9", self.params.mortality_probs[1], 0.0, 1.0, "%.7f")
        _, self.params.mortality_probs[2] = imgui.slider_float(
            "10 to 14", self.params.mortality_probs[2], 0.0, 1.0, "%.7f")
        _, self.params.mortality_probs[3] = imgui.slider_float(
            "15 to 19", self.params.mortality_probs[3], 0.0, 1.0, "%.7f")
        _, self.params.mortality_probs[4] = imgui.slider_float(
            "20 to 24", self.params.mortality_probs[4], 0.0, 1.0, "%.7f")
        _, self.params.mortality_probs[5] = imgui.slider_float(
            "25 to 29", self.params.mortality_probs[5], 0.0, 1.0, "%.7f")
        _, self.params.mortality_probs[6] = imgui.slider_float(
            "30 to 34", self.params.mortality_probs[6], 0.0, 1.0, "%.7f")
        _, self.params.mortality_probs[7] = imgui.slider_float(
            "35 to 39", self.params.mortality_probs[7], 0.0, 1.0, "%.7f")
        _, self.params.mortality_probs[8] = imgui.slider_float(
            "40 to 44", self.params.mortality_probs[8], 0.0, 1.0, "%.7f")
        _, self.params.mortality_probs[9] = imgui.slider_float(
            "45 to 49", self.params.mortality_probs[9], 0.0, 1.0, "%.7f")
        _, self.params.mortality_probs[10] = imgui.slider_float(
            "50 to 54", self.params.mortality_probs[10], 0.0, 1.0, "%.7f")
        _, self.params.mortality_probs[11] = imgui.slider_float(
            "55 to 59", self.params.mortality_probs[11], 0.0, 1.0, "%.7f")
        _, self.params.mortality_probs[12] = imgui.slider_float(
            "60 to 64", self.params.mortality_probs[12], 0.0, 1.0, "%.7f")
        _, self.params.mortality_probs[13] = imgui.slider_float(
            "65 to 69", self.params.mortality_probs[13], 0.0, 1.0, "%.7f")
        _, self.params.mortality_probs[14] = imgui.slider_float(
            "70 to 74", self.params.mortality_probs[14], 0.0, 1.0, "%.7f")
        _, self.params.mortality_probs[15] = imgui.slider_float(
            "75 to 79", self.params.mortality_probs[15], 0.0, 1.0, "%.7f")
        _, self.params.mortality_probs[16] = imgui.slider_float(
            "80 to 84", self.params.mortality_probs[16], 0.0, 1.0, "%.7f")
        _, self.params.mortality_probs[17] = imgui.slider_float(
            "85 to 89", self.params.mortality_probs[17], 0.0, 1.0, "%.7f")
        _, self.params.mortality_probs[18] = imgui.slider_float(
            "90 and above", self.params.mortality_probs[18], 0.0, 1.0, "%.7f")
    
        if imgui.button("Reset to Defaults"):
            self.params = Params()

        imgui.end()

    def draw_imgui(self):
        """Draws the ImGui overlay."""
        # These must be used, not self.width, self.height which are framebuffer sizes.
        width, height = glfw.get_window_size(self.window)

        self.draw_platform_window(width, height)
        self.draw_controls_window(width, height)
        self.draw_layers_window(width, height)
        self.draw_snapshots_window(width, height)
        self.draw_timeseries_window(width, height)

        if self.show_saveas:
            self.draw_saveas_window(width, height)

        if self.show_parameters:
            self.draw_parameters_window()

    def is_active(self):
        """Cycles a frame and returns whether the window remains open.

        Returns:
           True if the application is still open, otherwise False.
        """
        active = not glfw.window_should_close(self.window)

        if active and not self.first:
            imgui.pop_font()
            imgui.render()
            self.impl.render(imgui.get_draw_data())
            glfw.swap_buffers(self.window)

        if active:
            glfw.poll_events()
            self.impl.process_inputs()
            imgui.new_frame()
            imgui.push_font(self.font)
            self.first = False

        return active

    def draw(self):
        """Renders the UI."""
        self.update_camera()
        if self.show_grid:
            self.draw_grid()
        else:
            glClearColor(0.1, 0.1, 0.1, 1.0)
            glClear(GL_COLOR_BUFFER_BIT)
        if self.show_points:
            glPointSize(self.point_size)
            self.draw_points()
        if self.show_lines:
            self.draw_lines()
        self.draw_imgui()

    def update_sim(self):
        """Run a step of the simulation."""

        # Update the lockdown and upload params
        if self.do_lockdown:
            self.params.set_lockdown_multiplier(self.snapshot.lockdown_multipliers, self.simulator.time)
        else:
            self.params.lockdown_multiplier = 1.0  # NB: Multiplier of 1.0 has no effect
        self.simulator.upload("params", self.params.asarray())

        # Run one timestep of the model
        self.simulator.step()

        # Download hazard data from OpenCL to the host
        self.simulator.download("place_hazards", self.snapshot.buffers.place_hazards)

        # Upload hazard data from the host to OpenGL
        self.upload_hazards(self.snapshot.buffers.place_hazards)

        # Download status data from OpenCL to the host
        self.simulator.download("people_statuses", self.snapshot.buffers.people_statuses)

        # Compute summary statistics for hazards
        self.summary.update(self.simulator.time-1, self.snapshot.buffers.people_statuses)

    def update(self):
        """Update loop for running the simulation and updating/rendering the UI."""

        if self.simulation_active:
            self.update_sim()

        self.draw()
