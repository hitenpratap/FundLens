.PHONY: install dev build preview lint clean

install:
	bun install

dev:
	bun run dev

build:
	bun run build

preview:
	bun run preview

lint:
	bun run lint

clean:
	rm -rf dist
