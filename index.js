const md = require("markdown-it")({
  html: true, // Enable HTML tags in source
  breaks: true, // Convert '\n' in paragraphs into <br>
  linkify: true, // Autoconvert URL-like text to links
});
const emoji = require("markdown-it-emoji");
const fs = require("fs");
const Parser = require("rss-parser");

const parser = new Parser();

const blogUrl = "https://www.rockyourcode.com";
const websiteUrl = "https://www.sophiabrandt.com";
const mastodonUrl = "https://hachyderm.io/@sbr";
const linkedInUrl = "https://www.linkedin.com/in/sophiabrandt";
const devToUrl = "https://dev.to/sophiabrandt";
const blogPostLimit = 5;
const badgeHeight = "25";

md.use(emoji);
(async () => {
  let blogPosts = "";
  try {
    blogPosts = await loadBlogPosts();
  } catch (e) {
    console.error(`Failed to load blog posts from ${blogUrl}`, e);
  }

  const mastodonBadge = `[<img src="https://img.shields.io/badge/mastodon-6364FF.svg?&style=for-the-badge&logo=mastodon&logoColor=white" height=${badgeHeight}>](${mastodonUrl})`;
  const linkedInBadge = `[<img src="https://img.shields.io/badge/linkedin-%230077B5.svg?&style=for-the-badge&logo=linkedin&logoColor=white" height=${badgeHeight}>](${linkedInUrl})`;
  const devToBadge = `[<img src="https://img.shields.io/badge/DEV.TO-%230A0A0A.svg?&style=for-the-badge&logo=dev-dot-to&logoColor=white" height=${badgeHeight}>](${devToUrl})`;

  const text = `# Hi. :wave:\n\nI'm Sophia Brandt. I'm a former tax officer turned software developer from Germany.\n\nI currently work at an IT service provider. I also volunteer as a mentor for the Zero to Mastery Academy, home to over 300k students learning to code.\nWhen I was on parental leave, I started teaching myself to code - and I never looked back. :purple_heart:\n\n\I enjoy learning new programming languages, language learning (currently Esperanto), reading and writing.\n\n${mastodonBadge} ${linkedInBadge} ${devToBadge}\n\n[:globe_with_meridians: Check out my website](${websiteUrl})\n\n# Latest Blog Posts\n${blogPosts}\n<small>Original GitHub script provided by <a href="https://github.com/Mokkapps">Mokkapps</a>.</small>`;

  const result = md.render(text);

  fs.writeFile("README.md", result, function (err) {
    if (err) return console.log(err);
    console.log(`${result} > README.md`);
  });
})();

async function loadBlogPosts() {
  const feed = await parser.parseURL(`${blogUrl}/index.xml`);

  let links = "";

  feed.items.slice(0, blogPostLimit).forEach((item) => {
    links += `<li><a href=${item.link}>${item.title}</a> — ${item.pubDate}</li>`;
  });

  return `
  <ul>
    ${links}
  </ul>\n
  [:arrow_right: More blog posts](${blogUrl})
  `;
}
