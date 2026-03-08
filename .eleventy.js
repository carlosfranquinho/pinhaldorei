module.exports = function(eleventyConfig) {
  // Assets passthrough — usar assets da raiz (já versionados no git)
  eleventyConfig.addPassthroughCopy({ "wp-content": "wp-content" });
  eleventyConfig.addPassthroughCopy({ "wp-includes": "wp-includes" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/sitemap.xml": "sitemap.xml" });
  eleventyConfig.addPassthroughCopy({ "src/404.html": "404.html" });

  // Collections for section child listing
  eleventyConfig.addCollection("lugares", col =>
    col.getFilteredByGlob("src/lugares-recantos/**/*.html")
       .filter(p => !p.inputPath.endsWith("lugares-recantos/index.html")));

  eleventyConfig.addCollection("historias", col =>
    col.getFilteredByGlob("src/historias-personagens/**/*.html")
       .filter(p => !p.inputPath.endsWith("historias-personagens/index.html")));

  eleventyConfig.addCollection("fauna", col =>
    col.getFilteredByGlob("src/fauna-flora-do-pinhal-do-rei/**/*.html")
       .filter(p => !p.inputPath.endsWith("fauna-flora-do-pinhal-do-rei/index.html")));

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
