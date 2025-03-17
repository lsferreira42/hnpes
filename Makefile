# Makefile for HNPES Chrome Extension packaging

# Get version from manifest.json
VERSION := $(shell grep -o '"version": "[^"]*"' manifest.json | cut -d'"' -f4)
NAME := hnpes

# Main build target
.PHONY: build
build: clean
	@echo "Building HNPES v$(VERSION)..."
	@mkdir -p ./dist
	@zip -r ./dist/$(NAME)-v$(VERSION).zip . \
		-x "*.git*" \
		-x "*.DS_Store" \
		-x "dist/*" \
		-x "Makefile" \
		-x "*.md" \
		-x ".*" \
		-x "*.zip" \
		-x "screenshots/*" \
		-x "*__pycache__*" \
		-x "*.log"
	@echo "✅ Created ./dist/$(NAME)-v$(VERSION).zip"

# Create a distribution package with README files included
.PHONY: dist
dist: clean
	@echo "Building HNPES distribution package v$(VERSION)..."
	@mkdir -p ./dist
	@zip -r ./dist/$(NAME)-dist-v$(VERSION).zip . \
		-x "*.git*" \
		-x "*.DS_Store" \
		-x "dist/*" \
		-x "Makefile" \
		-x ".*" \
		-x "*.zip" \
		-x "screenshots/*" \
		-x "*__pycache__*" \
		-x "*.log"
	@echo "✅ Created ./dist/$(NAME)-dist-v$(VERSION).zip"

# Clean dist directory
.PHONY: clean
clean:
	@echo "Cleaning dist directory..."
	@rm -rf ./dist
	@mkdir -p ./dist
	@echo "✅ Cleaned dist directory"

# Bump version (usage: make bump-version TYPE=patch|minor|major)
# Default is patch if TYPE is not specified
.PHONY: bump-version
bump-version:
	@VERSION_PARTS=($(subst ., ,$(VERSION))); \
	MAJOR=$${VERSION_PARTS[0]}; \
	MINOR=$${VERSION_PARTS[1]}; \
	PATCH=$${VERSION_PARTS[2]}; \
	TYPE="$(TYPE)"; \
	if [ -z "$$TYPE" ]; then TYPE="patch"; fi; \
	if [ "$$TYPE" = "major" ]; then \
		MAJOR=$$((MAJOR + 1)); \
		MINOR=0; \
		PATCH=0; \
	elif [ "$$TYPE" = "minor" ]; then \
		MINOR=$$((MINOR + 1)); \
		PATCH=0; \
	else \
		PATCH=$$((PATCH + 1)); \
	fi; \
	NEW_VERSION="$$MAJOR.$$MINOR.$$PATCH"; \
	sed -i.bak "s/\"version\": \"$(VERSION)\"/\"version\": \"$$NEW_VERSION\"/" manifest.json; \
	rm manifest.json.bak; \
	echo "✅ Bumped version from $(VERSION) to $$NEW_VERSION"

# Show help
.PHONY: help
help:
	@echo "HNPES Makefile Commands:"
	@echo ""
	@echo "  make build       - Build a ZIP file for Chrome Web Store (excludes documentation)"
	@echo "  make dist        - Create a distribution package (includes READMEs)"
	@echo "  make clean       - Clean the dist directory"
	@echo "  make bump-version TYPE=patch|minor|major - Bump extension version"
	@echo "                    (default is patch if TYPE is not specified)"
	@echo "  make help        - Show this help message"
	@echo ""
	@echo "Current version: $(VERSION)"

# Default target
.DEFAULT_GOAL := help 