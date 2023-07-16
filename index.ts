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

const blogUrl = "https://www.rockyourcode.com";
const websiteUrl = "https://www.sophiabrandt.com";
const mastodonUrl = "https://hachyderm.io/@sbr";
const linkedInUrl = "https://www.linkedin.com/in/sophiabrandt";
const devToUrl = "https://dev.to/sophiabrandt";
const blogPostLimit = 5;
const badgeHeight = "25";

export class MarkdownRenderer {
  constructor(private md: MarkdownIt) {}

  renderMarkdown(text: string): string {
    return this.md.render(text);
  }
}

export class RssParser {
  constructor(private parser: Parser) {}

  async parseBlogFeedItems(blogUrl: string): Promise<Item[]> {
    try {
      const { items } = await this.parser.parseURL(`${blogUrl}/index.xml`);
      return items;
    } catch (err) {
      throw new BlogFeedException(err);
    }
  }
}

interface URLs {
  blogUrl: string;
  mastodonUrl: string;
  linkedInUrl: string;
  devToUrl: string;
  websiteUrl: string;
}

export class BlogPostsGeneratorConfig {
  constructor(
    public readonly urls: URLs,
    public readonly blogPostLimit: number,
    public readonly badgeHeight: string
  ) {}
}

export class BlogPostsGenerator {
  constructor(
    private rssParser: RssParser,
    public readonly config: BlogPostsGeneratorConfig
  ) {}

  private generateBadge({
    name,
    color,
    url,
    logoName,
  }: {
    name: string;
    color: string;
    url: string;
    logoName: string;
  }): string {
    return `[<img src="https://img.shields.io/badge/${name}-${color}.svg?&style=for-the-badge&logo=${logoName}&logoColor=white" height=${this.config.badgeHeight}>](${url})`;
  }

  async generateBlogPosts(): Promise<string> {
    const feedItems = await this.rssParser.parseBlogFeedItems(
      this.config.urls.blogUrl
    );
    return this.generateLinksFromBlog(feedItems);
  }

  private generateLinksFromBlog(feedItems: Item[]): string {
    if (feedItems.length === 0) throw new EmptyArrayException();

    const links = feedItems
      .slice(0, this.config.blogPostLimit)
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
    const mastodonBadge = this.generateBadge({
      name: "mastodon",
      color: "6364FF",
      url: this.config.urls.mastodonUrl,
      logoName: "mastodon",
    });
    const linkedInBadge = this.generateBadge({
      name: "linkedin",
      color: "0077B5",
      url: this.config.urls.linkedInUrl,
      logoName: "linkedin",
    });
    const devToBadge = this.generateBadge({
      name: "DEV.TO",
      color: "0A0A0A",
      url: this.config.urls.devToUrl,
      logoName: "dev-dot-to",
    });
    const typeScriptBadge = this.generateBadge({
      name: "TypeScript",
      color: "007acc",
      url: "https://typescriptlang.org",
      logoName: "TypeScript",
    });

    const text = `# Hi. :wave:\n\nMy name is Sophia Brandt. I'm a former tax officer turned software developer from Germany.\n\nI currently work at an IT consultancy. I also volunteer as a mentor for the Zero to Mastery Academy, home to over 400k students learning to code.\nWhen I was on parental leave, I started teaching myself to code - and I never looked back. :purple_heart:\n\n\I enjoy learning new programming languages, language learning (currently Esperanto & Spanish), reading and writing.\n\n${mastodonBadge} ${linkedInBadge} ${devToBadge}\n\n[:globe_with_meridians: Check out my website](${this.config.urls.websiteUrl})\n\n## Latest Blog Posts\n${blogPosts}\n<a href=${this.config.urls.blogUrl}>:arrow_right: More blog posts</a><hr />\n\nOriginal GitHub script provided by <a href="https://github.com/Mokkapps">Mokkapps</a>.\nBut now rewritten in TypeScript.\n${typeScriptBadge}`;

    return text;
  }
}

const markdownRenderer = new MarkdownRenderer(
  new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
  }).use(emoji)
);

const rssParser = new RssParser(new Parser());

export async function writeToFile(
  filename: string,
  content: string
): Promise<void> {
  try {
    await fs.writeFile(filename, content);
  } catch (err) {
    throw new WriteFileException(err);
  }
}

async function buildTextFromRssFeed() {
  const blogPostGeneratorConfig = new BlogPostsGeneratorConfig(
    {
      blogUrl,
      mastodonUrl,
      linkedInUrl,
      devToUrl,
      websiteUrl,
    },
    blogPostLimit,
    badgeHeight
  );

  const blogPostsGenerator = new BlogPostsGenerator(
    rssParser,
    blogPostGeneratorConfig
  );
  const blogPosts = await blogPostsGenerator.generateBlogPosts();
  return blogPostsGenerator.generateText(blogPosts);
}

async function main(): Promise<void> {
  const rawText = await buildTextFromRssFeed();
  const rendered = markdownRenderer.renderMarkdown(rawText);
  await writeToFile("README.md", rendered);
}

try {
  main();
} catch (err) {
  throw new ImpossibleException(err);
}
