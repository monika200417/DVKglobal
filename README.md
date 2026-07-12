# DVK Global Static Website

Static website clone for DVK Global built with plain HTML, CSS and JavaScript.

## Pages

- `index.html` - Home page with hero carousel
- `about.html` - About DVK Global
- `services.html` - Service overview
- `testimonials.html` - Testimonials page with client-side preview form
- `contact.html` - Contact form, clickable contact icons and location map

## Structure

```text
assets/
  images/        Local logo and industrial images
css/
  styles.css     Shared responsive styling
js/
  main.js        Menu, carousel, forms and testimonial preview
tools/
  extract-assets.ps1
```

## Run Locally

Open `index.html` directly in a browser, or serve the folder with any static server.

```powershell
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deploy

Upload the folder contents to any static host. No backend or build step is required.
