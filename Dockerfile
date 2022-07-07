# Latest as of 07/07/2022
FROM jupyter/base-notebook:807999a41207

# Rust stack
USER root
RUN apt-get update \
 && apt-get install -y curl cmake sqlite3 libclang-dev \
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
#RUN cd $HOME/spc \
# && apt-get install -y pkg-config libssl-dev libproj15 \
# && cargo build --release
USER $NB_UID
ENV PYTHONPATH="$PYTHONPATH:$HOME/spc/python"

