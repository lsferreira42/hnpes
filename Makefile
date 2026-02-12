# Makefile for HNPES Browser Extension (Chrome & Firefox)

# Get version from manifest.json
VERSION := $(shell grep -o '"version": "[^"]*"' manifest.json | cut -d'"' -f4)
NAME := hnpes

# --- Chrome ---
.PHONY: build-chrome
build-chrome:
	@echo "Building HNPES v$(VERSION) for Chrome..."
	@mkdir -p ./dist
	@zip -r ./dist/$(NAME)-chrome-v$(VERSION).zip . \
		-x "*.git*" \
		-x "*.DS_Store" \
		-x "dist/*" \
		-x "Makefile" \
		-x "*.md" \
		-x ".*" \
		-x "*.zip" \
		-x "screenshots/*" \
		-x "*__pycache__*" \
		-x "*.log" \
		-x "manifest.firefox.json"
	@echo "✅ Created ./dist/$(NAME)-chrome-v$(VERSION).zip"

# --- Firefox ---
.PHONY: build-firefox
build-firefox:
	@echo "Building HNPES v$(VERSION) for Firefox..."
	@mkdir -p ./dist ./dist/firefox-build
	@tar cf - --exclude=dist --exclude=.git --exclude=manifest.json --exclude=manifest.firefox.json --exclude=Makefile --exclude='*.md' --exclude='.gitignore' --exclude='*.zip' --exclude=screenshots --exclude='*__pycache__*' --exclude='*.log' . | (cd ./dist/firefox-build && tar xf -)
	@cp manifest.firefox.json ./dist/firefox-build/manifest.json
	@cd ./dist/firefox-build && zip -r ../$(NAME)-firefox-v$(VERSION).zip .
	@rm -rf ./dist/firefox-build
	@echo "✅ Created ./dist/$(NAME)-firefox-v$(VERSION).zip"

# Build both (Chrome + Firefox); clean once then build both
.PHONY: build
build: clean build-chrome build-firefox
	@echo "✅ Chrome and Firefox builds ready in ./dist/"

# --- Distribution packages (with READMEs) ---
.PHONY: dist-chrome
dist-chrome:
	@echo "Building HNPES Chrome distribution package v$(VERSION)..."
	@mkdir -p ./dist
	@zip -r ./dist/$(NAME)-chrome-dist-v$(VERSION).zip . \
		-x "*.git*" \
		-x "*.DS_Store" \
		-x "dist/*" \
		-x "Makefile" \
		-x ".*" \
		-x "*.zip" \
		-x "screenshots/*" \
		-x "*__pycache__*" \
		-x "*.log" \
		-x "manifest.firefox.json"
	@echo "✅ Created ./dist/$(NAME)-chrome-dist-v$(VERSION).zip"

.PHONY: dist-firefox
dist-firefox:
	@echo "Building HNPES Firefox distribution package v$(VERSION)..."
	@mkdir -p ./dist ./dist/firefox-build
	@tar cf - --exclude=dist --exclude=.git --exclude=manifest.json --exclude=manifest.firefox.json --exclude=Makefile --exclude='.gitignore' --exclude='*.zip' --exclude=screenshots --exclude='*__pycache__*' --exclude='*.log' . | (cd ./dist/firefox-build && tar xf -)
	@cp manifest.firefox.json ./dist/firefox-build/manifest.json
	@cd ./dist/firefox-build && zip -r ../$(NAME)-firefox-dist-v$(VERSION).zip .
	@rm -rf ./dist/firefox-build
	@echo "✅ Created ./dist/$(NAME)-firefox-dist-v$(VERSION).zip"

.PHONY: dist
dist: clean dist-chrome dist-firefox
	@echo "✅ Chrome and Firefox distribution packages ready in ./dist/"

# --- Clean ---
.PHONY: clean
clean:
	@echo "Cleaning dist directory..."
	@rm -rf ./dist
	@mkdir -p ./dist
	@echo "✅ Cleaned dist directory"

# --- Bump version (updates both manifest.json and manifest.firefox.json) ---
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
	sed -i.bak "s/\"version\": \"$(VERSION)\"/\"version\": \"$$NEW_VERSION\"/" manifest.firefox.json; \
	rm -f manifest.json.bak manifest.firefox.json.bak; \
	echo "✅ Bumped version from $(VERSION) to $$NEW_VERSION"

# --- GitHub release (Chrome; optional: add Firefox zip to release) ---
.PHONY: release
release: build
	@echo "Creating GitHub release v$(VERSION)..."
	@gh release create v$(VERSION) \
		--title "v$(VERSION)" \
		--notes "Release v$(VERSION) - Chrome and Firefox" \
		./dist/$(NAME)-chrome-v$(VERSION).zip \
		./dist/$(NAME)-firefox-v$(VERSION).zip
	@echo "✓ Release v$(VERSION) created successfully"

# --- Help ---
.PHONY: help
help:
	@echo "HNPES – Build targets (Chrome & Firefox)"
	@echo ""
	@echo "  build-chrome   - Create Chrome extension ZIP (Web Store / unpacked)"
	@echo "  build-firefox  - Create Firefox extension ZIP (addons.mozilla.org / unpacked)"
	@echo "  build          - Build both Chrome and Firefox"
	@echo ""
	@echo "  dist-chrome    - Chrome distribution package (includes READMEs)"
	@echo "  dist-firefox   - Firefox distribution package (includes READMEs)"
	@echo "  dist           - Create both distribution packages"
	@echo ""
	@echo "  clean          - Remove dist directory"
	@echo "  bump-version   - Bump version (TYPE=patch|minor|major, default: patch)"
	@echo "  release       - Create GitHub release with Chrome + Firefox zips"
	@echo ""
	@echo "Current version: $(VERSION)"

.DEFAULT_GOAL := help
