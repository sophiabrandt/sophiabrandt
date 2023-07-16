import MarkdownIt from "markdown-it";
import emoji from "markdown-it-emoji";
import fs from "fs/promises";
import Parser, { Item } from "rss-parser";
import {
  BlogFeedException,
  EmptyArrayException,
  ImpossibleException,
  WriteFileException,
} from "./util";

const md = new MarkdownIt({
  html: true, // Enable HTML tags in source
  breaks: true, // Convert '\n' in paragraphs into <br>
  linkify: true, // Autoconvert URL-like text to links
});
md.use(emoji);

const parser = new Parser();

const blogUrl = "https://www.rockyourcode.com";
const websiteUrl = "https://www.sophiabrandt.com";
const mastodonUrl = "https://hachyderm.io/@sbr";
const linkedInUrl = "https://www.linkedin.com/in/sophiabrandt";
const devToUrl = "https://dev.to/sophiabrandt";
const blogPostLimit = 5;
const badgeHeight = "25";

async function main(): Promise<void> {
  const blogPosts = await generateBlogPosts();

  const text = generateText(blogPosts);

  const renderedMarkdown = md.render(text);

  await writeToFile("README.md", renderedMarkdown);
}

async function parseBlogFeedItems(): Promise<Item[]> {
  try {
    const { items } = await parser.parseURL(`${blogUrl}/index.xml`);
    return items;
  } catch (err) {
    throw new BlogFeedException(err);
  }
}

function generateLinksFromBlog(feedItems: Item[]): string {
  if (feedItems.length === 0) throw new EmptyArrayException();

  const links = feedItems
    .slice(0, blogPostLimit)
    .map(
      ({ link, title, pubDate }) =>
        `<li><a href="${link}">${title}</a> — ${pubDate}</li>`
    )
    .join("");

  return `
  <ul>
    ${links}
  </ul>\n
  [:arrow_right: More blog posts](${blogUrl})
  `;
}

async function generateBlogPosts(): Promise<string> {
  const feedItems = await parseBlogFeedItems();
  return generateLinksFromBlog(feedItems);
}

function generateText(blogPosts: string): string {
  const mastodonBadge = `[<img src="https://img.shields.io/badge/mastodon-6364FF.svg?&style=for-the-badge&logo=mastodon&logoColor=white" height=${badgeHeight}>](${mastodonUrl})`;
  const linkedInBadge = `[<img src="https://img.shields.io/badge/linkedin-%230077B5.svg?&style=for-the-badge&logo=linkedin&logoColor=white" height=${badgeHeight}>](${linkedInUrl})`;
  const devToBadge = `[<img src="https://img.shields.io/badge/DEV.TO-%230A0A0A.svg?&style=for-the-badge&logo=dev-dot-to&logoColor=white" height=${badgeHeight}>](${devToUrl})`;

  const text = `# Hi. :wave:\n\nI'm Sophia Brandt. I'm a former tax officer turned software developer from Germany.\n\nI currently work at an IT service provider. I also volunteer as a mentor for the Zero to Mastery Academy, home to over 300k students learning to code.\nWhen I was on parental leave, I started teaching myself to code - and I never looked back. :purple_heart:\n\n\I enjoy learning new programming languages, language learning (currently Esperanto), reading and writing.\n\n${mastodonBadge} ${linkedInBadge} ${devToBadge}\n\n[:globe_with_meridians: Check out my website](${websiteUrl})\n\n# Latest Blog Posts\n${blogPosts}\n<small>Original GitHub script provided by <a href="https://github.com/Mokkapps">Mokkapps</a>.</small>`;

  return text;
}

async function writeToFile(filename: string, content: string): Promise<void> {
  try {
    await fs.writeFile(filename, content);
    console.log(`${content} > ${filename}`);
  } catch (err) {
    throw new WriteFileException(err);
  }
}

try {
  main();
} catch (err) {
  throw new ImpossibleException();
}
