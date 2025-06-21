# My Personal Website

This is the source code for my personal website and blog, built with [Quarto](https://quarto.org/).

## Table of Contents

- [How to Add a New Post](#how-to-add-a-new-post)
- [Running the Website Locally](#running-the-website-locally)
- [Deployment Process Explained](#deployment-process-explained)
- [Customization Guide](#customization-guide)

---

### How to Add a New Post

Adding a new blog post is straightforward. Follow these steps:

1.  **Create a New Folder**: Navigate to the `posts/` directory. Create a new folder for your post. The recommended naming convention is `YYYY-MM-DD-your-post-title` to keep content organized.

    ```bash
    # Example
    mkdir posts/2024-07-25-my-new-post
    ```

2.  **Create an `index.qmd` File**: Inside your new post folder, create a file named `index.qmd`. This file will contain your post's content.

3.  **Add Post Metadata (Front Matter)**: At the very top of your `index.qmd` file, you need to add YAML "front matter" to describe your post. This is essential for Quarto to render it correctly.

    ```yaml
    ---
    title: "My Awesome New Post"
    author: "Murali K"
    date: "2024-07-25"
    categories: [Tech, Ruby, Tutorial]
    image: "thumbnail.jpg" # Optional: add a thumbnail image in the same folder
    ---
    ```

4.  **Write Your Content**: Below the `---` separator, you can write your post content using Markdown. You can also include code blocks, images, and other elements.

---

### Running the Website Locally

To preview your changes (including new posts) before deploying, you can run a local development server.

1.  Open your terminal in the project's root directory.
2.  Run the following command:

    ```bash
    quarto preview
    ```

This will start a local server and open the site in your browser. The server will automatically watch for file changes and refresh the page, so you can see your edits live.

---

### Deployment Process Explained

Deployment is fully automated using **GitHub Actions**. You don't need to build the site manually or manage deployment branches.

**How It Works:**

1.  **Trigger**: The process starts automatically whenever you push a new commit to the `master` branch.
2.  **GitHub Action Workflow**: The workflow defined in `.github/workflows/publish.yml` runs. It performs the following steps on a remote server:
    - **Checks out code**: It downloads the latest version of your code from the `master` branch.
    - **Sets up Quarto**: It installs the Quarto software.
    - **Renders Site**: It runs `quarto render`, which builds the entire website and places the final HTML, CSS, and other assets into a directory named `_site`.
    - **Publishes to `gh-pages`**: It takes the contents of the `_site` directory and pushes them to a special branch named `gh-pages`. This branch will only contain the final, built version of your site.
3.  **GitHub Pages Serves the Site**: Your repository's GitHub Pages settings are configured to "Deploy from a branch" and point to the `gh-pages` branch. GitHub automatically serves the files from this branch to your public URL.

In short: **Just `git push` to `master`, and your site will be live in a minute or two.**

---

### Customization Guide

Most common customizations are done in the `_quarto.yml` file.

#### 1. Changing Themes

You can change the `light` and `dark` themes for the website. The site is currently configured to default to the dark theme for new visitors.

Find this section in `_quarto.yml`:
```yaml
format:
  html:
    theme:
      light: cosmo
      dark: darkly
```
You can replace `cosmo` and `darkly` with any other valid [Bootswatch theme names](https://quarto.org/docs/output-formats/html-themes.html#bootswatch-themes).

#### 2. Modifying the Navigation Bar

You can add or remove items from the top navbar by editing the `website.navbar.right` section in `_quarto.yml`.

```yaml
website:
  title: "Murali K | Engineer"
  navbar:
    right:
      - about.qmd
      - icon: github
        href: https://github.com/iamurali
      - text: "New Link" # Example new link
        href: "https://example.com"
```

#### 3. Custom CSS

If you want to add your own custom styles, you can add CSS rules to the `styles.css` file in the root directory. These styles will be applied across the entire website. 