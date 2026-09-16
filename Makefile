# Simple Makefile for tab‑timer — requires POSIX sh, zip, node (for web‑ext)

EXT_NAME  := tab-timer
VERSION   := $(shell jq -r .version manifest.json)
DIST_DIR  := dist
XPI       := $(DIST_DIR)/$(EXT_NAME)-v$(VERSION).xpi
SRC_FILES := manifest.json \
            background.js contentScript.js popup.html popup.js style.css \
            $(shell find icons -type f)

.PHONY: all help build run lint clean fmt check-fmt markdownlint

MDLINT ?= $(shell command -v markdownlint-cli2 2>/dev/null || printf '%s' "$$HOME/.bun/bin/markdownlint-cli2")
# `make fmt` and `make check-fmt` call mdtablefix directly. `--git` selects the
# Markdown files Git tracks and `--include-untracked` adds the untracked files
# Git does not ignore, so a new document is formatted before it is staged.
# Both modes need mdtablefix 0.6.0 or later; CI pins the version at the
# install-mdtablefix step.
MDTABLEFIX ?= mdtablefix
MDTABLEFIX_SELECT = --git --include-untracked
MDTABLEFIX_RULES = --wrap --renumber --breaks --ellipsis --fences

all: help

fmt:
	$(MDTABLEFIX) --in-place $(MDTABLEFIX_SELECT) $(MDTABLEFIX_RULES)
	$(MDLINT) --fix "**/*.md"

check-fmt:
	$(MDTABLEFIX) --check $(MDTABLEFIX_SELECT) $(MDTABLEFIX_RULES)

markdownlint:
	$(MDLINT) '**/*.md'

help:
	@echo "Targets:"
	@echo "  make run    – launch Firefox with extension (web-ext run)"
	@echo "  make lint   – lint the extension (web-ext lint)"
	@echo "  make build  – package XPI in $(DIST_DIR)/"
	@echo "  make clean  – remove build artefacts"
	@echo "  make fmt    – format Markdown sources"
	@echo "  make check-fmt – verify Markdown formatting"
	@echo "  make markdownlint – lint Markdown sources"

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
