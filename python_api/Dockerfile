FROM python:3.11-slim

# Install dependencies
RUN apt-get update && \
    apt-get install -y \
    curl \
    build-essential \
    git \
    pkg-config \
    libssl-dev \
    libgmp-dev \
    libsqlite3-dev \
    libtool \
    valgrind \
    protobuf-compiler

RUN pip install --upgrade pip

# Install Rust using rustup and set the path
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install maturin
RUN pip install --no-cache-dir maturin
ENV PATH="/root/.local/bin:${PATH}"

# Manually build and install gl-client Python binding and glcli tool.
# The reason being the platform/architecture on which this image is built could not support the prebuilt package.
# It takes time, but it works.
RUN git clone https://github.com/Blockstream/greenlight.git && \
    cd greenlight/libs/gl-client-py && \
    maturin build && \
    cd ../gl-cli && \
    maturin build && \
    pip install /greenlight/target/wheels/gl*.whl

WORKDIR /app

# Install Python application dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]