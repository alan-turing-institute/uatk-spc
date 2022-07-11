# Latest as of 07/07/2022
FROM jupyter/base-notebook:807999a41207

# Rust stack
USER root
RUN apt-get update \
 && apt-get install -y \
         curl \
         cmake \
         sqlite3 \
         libclang-dev \
         pkg-config \
         libssl-dev \
         g++ \
         build-essential \
         libsqlite3-dev \
 && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs > install.sh \
 && sh install.sh -y \
 && rm install.sh
ENV PATH="$HOME/.cargo/bin:${PATH}"

# Python stack
USER $NB_UID
RUN mamba install --yes --quiet \
    'click' \
    'pandas' \
    'plotly' \
    'protobuf'

# SPC install
USER root
RUN mkdir $HOME/spc
ADD . $HOME/spc/
RUN cd $HOME/spc && cargo build --release

# Quarto/jupytext
RUN wget https://github.com/quarto-dev/quarto-cli/releases/download/v0.9.655/quarto-0.9.655-linux-amd64.deb \
 && dpkg -i quarto-0.9.655-linux-amd64.deb \
 && rm quarto-0.9.655-linux-amd64.deb
RUN fix-permissions $HOME/spc/python/demos/
USER $NB_UID
RUN mamba install --yes --quiet jupytext

ENV PYTHONPATH="$PYTHONPATH:$HOME/spc/python"

