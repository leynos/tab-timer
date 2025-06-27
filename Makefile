# Simple Makefile for tab‑timer — requires POSIX sh, zip, node (for web‑ext)

EXT_NAME  := tab-timer
VERSION   := $(shell jq -r .version manifest.json)
DIST_DIR  := dist
XPI       := $(DIST_DIR)/$(EXT_NAME)-v$(VERSION).xpi
SRC_FILES := manifest.json \
            background.js contentScript.js popup.html popup.js style.css \
            $(shell find icons -type f)

.PHONY: all help build run lint clean

all: help

help:
	@echo "Targets:"
	@echo "  make run    – launch Firefox with extension (web-ext run)"
	@echo "  make lint   – lint the extension (web-ext lint)"
	@echo "  make build  – package XPI in $(DIST_DIR)/"
	@echo "  make clean  – remove build artefacts"

$(DIST_DIR):
	@mkdir -p $@

$(XPI): $(SRC_FILES) | $(DIST_DIR)
	@echo "==> Building $@"
	@zip -qr $@ $(SRC_FILES)

build: $(XPI)

run:
	@web-ext run --source-dir .

lint:
	@web-ext lint --source-dir .

clean:
	@rm -rf $(DIST_DIR)

