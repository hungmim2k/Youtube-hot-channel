# Tailwind CSS Setup

This document provides instructions on how to set up and use Tailwind CSS in this project.

## Installation

The project has been configured to use Tailwind CSS as a PostCSS plugin. The following dependencies have been added to the project:

- tailwindcss
- postcss
- autoprefixer

To install these dependencies, run:

```bash
npm install
```

## Building CSS

To build the CSS file, run:

```bash
npm run build:css
```

This will process the `src/input.css` file and output the result to `public/output.css`.

## Development

During development, you can watch for changes to the CSS file and rebuild it automatically by running:

```bash
npm run dev:css
```

This will watch for changes to the `src/input.css` file and rebuild the CSS automatically.

## Production

For production, the CSS file is built as part of the build process. This is configured in the `package.json` file with the following script:

```
"build": "npm run build:css && vite build"
```

This ensures that the CSS is built before the application is built.

## Configuration

The Tailwind CSS configuration is in the `tailwind.config.js` file. This file includes the custom theme configuration that was previously in the inline script in `index.html`.

## Usage

The CSS file is included in the `index.html` file with the following line:

```html
<link rel="stylesheet" href="/public/output.css">
```

This replaces the previous CDN script:

```html
<script src="https://cdn.tailwindcss.com"></script>
```

Using Tailwind CSS as a PostCSS plugin instead of the CDN is recommended for production because:

1. It's more reliable (no dependency on external services)
2. It's faster (no need to download the CSS from a CDN)
3. It's more secure (no risk of the CDN being compromised)
4. It allows for better optimization (only the CSS that's actually used is included in the output file)
