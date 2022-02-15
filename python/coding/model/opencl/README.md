# RAMP OpenCL

This contains the code for the OpenCL implementation of the timestep model. This can run with
high performance on the GPU or CPU.

![User Interface](img/ramp_ui.png)

Although the core model has been implemented in OpenCL C, everything else
including:

- OpenCL device and buffer management
- UI
- Snapshot Save/Load
- Unit Tests

Has been written in python, using python wrappers already available through
`pip`. You shouldn't need an in depth knowledge of OpenCL to read the kernel
code in `ramp/kernels/`, since it is mostly just C. However, you may find the
following external documentation useful when reading this code base:

- [OpenCL
  Spec](https://www.khronos.org/registry/OpenCL/specs/3.0-unified/html/OpenCL_API.html)
- [OpenCL C Kernel Language
  Spec](https://www.khronos.org/registry/OpenCL/specs/3.0-unified/html/OpenCL_C.html)
- [PyOpenCL Docs](https://documen.tician.de/pyopencl/)
- [OpenCL Reference
  Sheet](https://www.khronos.org/files/opencl-1-2-quick-reference-card.pdf)
- [PyImGui
  Docs](https://pyimgui.readthedocs.io/en/latest/reference/imgui.core.html)


## Installation

First, ensure you have [git LFS](https://git-lfs.github.com/) installed, as we
use this for version control of large binary snapshot files. Then simply `git
clone` this repository, or download and unzip it to a location of your choosing.
Note that when using the "Download Zip" option on GitHub, you may need to
separately pull the git LFS files.

To install most dependencies, simply:

``` sh
pip install -r requirements.txt
```

Additional steps, such as installing pyopencl, vary by operating system:

### MacOS

``` sh
pip install pyopencl
```

### Linux
``` sh
pip install pyopencl
```

##### OpenCL drivers
You may need to install OpenCL drivers by following the instructions in this [forum answer](https://askubuntu.com/a/1134762).

##### GLFW
GLFW is a dependency for the UI. As well as installing the pip package (done by installing the requirements.txt) you may also need to run:

``` sh
sudo apt-get install libglfw3
sudo apt-get install libglfw3-dev
```

### Windows

Download the appropriate binary wheel from [this
website](https://www.lfd.uci.edu/~gohlke/pythonlibs/#pyopencl), ensure you
choose the correct one for your python version, OpenCL 1.2 (`cl112`) compiled
for a 64 bit architecture (`win_amd64`).

``` sh
pip install $WHEEL_DOWNLOAD_PATH
```

Ensure you have OpenCL drivers installed. This should ship with your GPU
drivers, or if you do not have a dedicated GPU, you may need to download Intel's
[OpenCL drivers](https://software.intel.com/content/www/us/en/develop/articles/opencl-drivers.html).


## Running

Once dependencies are installed, you can run using the [microsim/main.py](./microsim/main.py) script. 
Please see further instructions in the main project [README](../../README.md#opencl-model) 


#### Run tests with pytest

Ensure pytest is installed, then simply run the pytest command in the top level
directory of the repo to run all the tests:
``` sh
python -m pytest
```


## Repo Layout

All source code is stored in the **ramp/** directory, this includes OpenCL c
kernel code, OpenGL shaders, and the python code for managing the UI and the
simulation.


#### Directories

- **data/** - data for Devon, including Google mobility data, GAM initial cases
  data and MSOA risks.
- **doc/** - Documentation, eg. model design and explanation.
- **fonts/** - font files for the UI.
- **img/** - generated images and screenshots.
- **ramp/** - all source code is stored in this directory.
    - **kernels/** - all OpenCL kernel code.
    - **shaders/** - OpenGL shaders used for UI / visualisation.
    - important python files include:
        - **ui.py** and **headless.py**, which are both entry points for running
          the simulation.
        - **simulator.py** which is the wrapper for OpenCL and passes data to
          and from the OpenCL device.
        - **inspector.py** which contains the bulk of the UI and visualisation code.
- **snapshots/** - snapshots files which contain the initialisation state for
  all the buffers used in the simulation.
- **tests/** - python tests for individual OpenCL kernels.
