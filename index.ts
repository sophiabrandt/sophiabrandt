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

class MarkdownRenderer {
  private md: MarkdownIt;

  constructor() {
    this.md = new MarkdownIt({
      html: true,
      breaks: true,
      linkify: true,
    });
    this.md.use(emoji);
  }

  renderMarkdown(text: string): string {
    return this.md.render(text);
  }
}

class RssParser {
  private parser: Parser;

  constructor() {
    this.parser = new Parser();
  }

  async parseBlogFeedItems(blogUrl: string): Promise<Item[]> {
    try {
      const { items } = await this.parser.parseURL(`${blogUrl}/index.xml`);
      return items;
    } catch (err) {
      throw new BlogFeedException(err);
    }
  }
}

class BlogPostGenerator {
  constructor(
    private blogUrl: string,
    private mastodonUrl: string,
    private linkedInUrl: string,
    private devToUrl: string,
    private websiteUrl: string,
    private blogPostLimit: number,
    private badgeHeight: string
  ) {}

  private generateBadge(
    name: string,
    color: string,
    url: string,
    logoName: string = name
  ): string {
    return `[<img src="https://img.shields.io/badge/${name}-${color}.svg?&style=for-the-badge&logo=${logoName}&logoColor=white" height=${this.badgeHeight}>](${url})`;
  }

  async generateBlogPosts(rssParser: RssParser): Promise<string> {
    const feedItems = await rssParser.parseBlogFeedItems(this.blogUrl);
    return this.generateLinksFromBlog(feedItems);
  }

  private generateLinksFromBlog(feedItems: Item[]): string {
    if (feedItems.length === 0) throw new EmptyArrayException();

    const links = feedItems
      .slice(0, this.blogPostLimit)
      .map(
        ({ link, title, pubDate }) =>
          `<li><a href="${link}">${title}</a> — ${pubDate}</li>`
      )
      .join("");

    return `<ul>
        ${links}
      </ul>`;
  }

  generateText(blogPosts: string): string {
    const mastodonBadge = this.generateBadge(
      "mastodon",
      "6364FF",
      this.mastodonUrl
    );
    const linkedInBadge = this.generateBadge(
      "linkedin",
      "0077B5",
      this.linkedInUrl
    );
    const devToBadge = this.generateBadge(
      "DEV.TO",
      "0A0A0A",
      this.devToUrl,
      "dev-dot-to"
    );
    const typeScriptBadge = this.generateBadge(
      "TypeScript",
      "007acc",
      "https://typescriptlang.org",
      "TypeScript"
    );

    const text = `# Hi. :wave:\n\nMy name is Sophia Brandt. I'm a former tax officer turned software developer from Germany.\n\nI currently work at an IT consultancy. I also volunteer as a mentor for the Zero to Mastery Academy, home to over 400k students learning to code.\nWhen I was on parental leave, I started teaching myself to code - and I never looked back. :purple_heart:\n\n\I enjoy learning new programming languages, language learning (currently Esperanto & Spanish), reading and writing.\n\n${mastodonBadge} ${linkedInBadge} ${devToBadge}\n\n[:globe_with_meridians: Check out my website](${this.websiteUrl})\n\n## Latest Blog Posts\n${blogPosts}\n<a href=${this.blogUrl}>:arrow_right: More blog posts</a><hr />\n\nOriginal GitHub script provided by <a href="https://github.com/Mokkapps">Mokkapps</a>.\nBut now rewritten in TypeScript.\n${typeScriptBadge}`;

    return text;
  }
}

const markdownRenderer = new MarkdownRenderer();
const rssParser = new RssParser();

const blogUrl = "https://www.rockyourcode.com";
const websiteUrl = "https://www.sophiabrandt.com";
const mastodonUrl = "https://hachyderm.io/@sbr";
const linkedInUrl = "https://www.linkedin.com/in/sophiabrandt";
const devToUrl = "https://dev.to/sophiabrandt";
const blogPostLimit = 5;
const badgeHeight = "25";

async function writeToFile(filename: string, content: string): Promise<void> {
  try {
    await fs.writeFile(filename, content);
    console.log(`${content} > ${filename}`);
  } catch (err) {
    throw new WriteFileException(err);
  }
}

async function main(): Promise<void> {
  const blogPostGenerator = new BlogPostGenerator(
    blogUrl,
    mastodonUrl,
    linkedInUrl,
    devToUrl,
    websiteUrl,
    blogPostLimit,
    badgeHeight
  );
  const blogPosts = await blogPostGenerator.generateBlogPosts(rssParser);
  const text = blogPostGenerator.generateText(blogPosts);
  const renderedMarkdown = markdownRenderer.renderMarkdown(text);
  await writeToFile("README.md", renderedMarkdown);
}

try {
  main();
} catch (err) {
  throw new ImpossibleException(err);
}
