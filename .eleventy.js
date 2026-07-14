const MarkdownIt = require("markdown-it");

const markdownItAnchor = require("markdown-it-anchor");
const { DateTime } = require("luxon");
module.exports = function(eleventyConfig){


// Configure markdown parsing options to match professional agency templates
const markdownLibrary = MarkdownIt({
 html: true,      // Ensures inline HTML elements pass through cleanly
  breaks: true,    // Turns double returns into paragraphs automatically
  linkify: true    // Auto-converts text URLs into clickable links
}).use(markdownItAnchor, {
  permalink: markdownItAnchor.permalink.headerLink() // Automatically generates heading-anchors!
});

// Force Eleventy to use this library for all markdown files and template blocks

eleventyConfig.setLibrary("md", markdownLibrary);
eleventyConfig.addFilter("markdown", (content) => markdownLibrary.render(content || ""));
    eleventyConfig.addPassthroughCopy('./src/css/styles.css')
    eleventyConfig.addPassthroughCopy('./src/assets')
      eleventyConfig.addPassthroughCopy('./src/admin');
 eleventyConfig.addFilter("postDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
  });

  
  // Add this inside your .eleventy.js configuration function
eleventyConfig.addCollection("locations", function(collectionApi) {
  // Pulls all markdown files directly from your src/locations/ directory
  return collectionApi.getFilteredByGlob("src/locations/*.md");
});

// ADD THIS BLOCK FOR YOUR SERVICES
  eleventyConfig.addCollection("services", function(collectionApi) {
    // Pulls all markdown files directly from your src/services/ directory
    return collectionApi.getFilteredByGlob("src/services/*.md");
  });
    // Minify HTML output (conservative: collapse indentation whitespace but keep
    // inline spacing, strip HTML comments; inline JS/CSS left untouched to be safe).
    eleventyConfig.addTransform("htmlmin", async function(content){
        if ((this.page.outputPath || "").endsWith(".html")) {
            try {
                const { minify } = await import("html-minifier-terser");
                return await minify(content, {
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    removeComments: true,
                    keepClosingSlash: true,
                });
            } catch (e) {
                console.warn(`[htmlmin] skipped ${this.page.inputPath}: ${e.message}`);
                return content;
            }
        }
        return content;
    });

    return{
        dir:{
            input:"src",
            output:"public",
            includes: "_includes"
            
        }
    }
}