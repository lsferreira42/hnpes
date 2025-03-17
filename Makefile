# Makefile for HNPES Chrome Extension packaging

# Get version from manifest.json
VERSION := $(shell grep -o '"version": "[^"]*"' manifest.json | cut -d'"' -f4)
NAME := hnpes

# Create GitHub release with built extension
.PHONY: release
release: build
	@echo "Creating GitHub release v$(VERSION)..."
	@mv ./dist/hnpes-v$(VERSION).zip ./dist/hnpes-v$(VERSION).crx
	@gh release create v$(VERSION) \
		--title "v$(VERSION)" \
		--notes "Release v$(VERSION)" \
		./dist/hnpes-v$(VERSION).crx
	@echo "✓ Release v$(VERSION) created successfully"


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
	@echo "Available commands:"
	@echo ""
	@echo "  build         - Create extension ZIP file for Chrome Web Store submission"
	@echo "  dist         - Create distribution package including README files"
	@echo "  clean        - Remove dist directory"
	@echo "  bump-version - Bump version number (TYPE=patch|minor|major)"
	@echo "                  (default is patch if TYPE is not specified)"
	@echo "  release      - Create GitHub release with built extension"
	@echo ""
	@echo "Current version: $(VERSION)"

# Default target
.DEFAULT_GOAL := help 