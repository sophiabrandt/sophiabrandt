/* eslint-disable max-classes-per-file */
import MarkdownIt from 'markdown-it';
import { full as emoji } from 'markdown-it-emoji';
import fs from 'fs/promises';
import Parser, { Item } from 'rss-parser';
import {
  BlogFeedException,
  EmptyArrayException,
  ImpossibleException,
  WriteFileException,
} from './util.js';

const BLOG_URL = 'https://www.rockyourcode.com';
const WEBSITE_URL = 'https://www.sophiabrandt.com';
const MASTODON_URL = 'https://hachyderm.io/@sbr';
const LINKEDIN_URL = 'https://www.linkedin.com/in/sophiabrandt';
const DEV_TO_URL = 'https://dev.to/sophiabrandt';
const BLOG_POST_LIMIT = 5;
const BADGE_HEIGHT = '25';

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
    public readonly badgeHeight: string,
  ) {}
}

export class BlogPostsGenerator {
  constructor(
    public readonly config: BlogPostsGeneratorConfig,
    private rssParser: RssParser,
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

  private async generateBlogPosts(): Promise<string> {
    const feedItems = await this.rssParser.parseBlogFeedItems(
      this.config.urls.blogUrl,
    );
    return this.generateLinksFromBlog(feedItems);
  }

  private generateLinksFromBlog(feedItems: Item[]): string {
    if (feedItems.length === 0) throw new EmptyArrayException();

    const links = feedItems
      .slice(0, this.config.blogPostLimit)
      .map(
        ({ link, title, pubDate }) =>
          `<li><a href="${link}">${title}</a> — ${pubDate}</li>`,
      )
      .join('');

    return `<ul>
        ${links}
      </ul>`;
  }

  async generateMdText(): Promise<string> {
    const blogPosts = await this.generateBlogPosts();

    const mastodonBadge = this.generateBadge({
      name: 'mastodon',
      color: '6364FF',
      url: this.config.urls.mastodonUrl,
      logoName: 'mastodon',
    });
    const linkedInBadge = this.generateBadge({
      name: 'linkedin',
      color: '0077B5',
      url: this.config.urls.linkedInUrl,
      logoName: 'linkedin',
    });
    const devToBadge = this.generateBadge({
      name: 'DEV.TO',
      color: '0A0A0A',
      url: this.config.urls.devToUrl,
      logoName: 'dev-dot-to',
    });
    const typeScriptBadge = this.generateBadge({
      name: 'TypeScript',
      color: '007acc',
      url: 'https://github.com/sophiabrandt/sophiabrandt/blob/master/src/index.ts',
      logoName: 'TypeScript',
    });
    const vitestBadge = this.generateBadge({
      name: 'Vitest',
      color: '86b91ad9',
      url: 'https://github.com/sophiabrandt/sophiabrandt/blob/master/src/index.spec.ts',
      logoName: 'Vitest',
    });

    // eslint-disable-next-line no-irregular-whitespace
    const text = `# Hi. :wave:\n\nMy name is Sophia Brandt. I'm a former tax officer turned software developer from Germany.\n\nI currently work at an IT service provider as a full-stack software engineer. I also volunteer as a mentor for the Zero to Mastery Academy, home to over 400k students learning to code.\nWhen I was on parental leave, I started teaching myself to code - and I never looked back. :purple_heart:\n\nI enjoy learning new programming languages, language learning (currently Esperanto & Spanish), reading and writing.\n\n${mastodonBadge} ${linkedInBadge} ${devToBadge}\n\n[:globe_with_meridians: Check out my website](${this.config.urls.websiteUrl})\n\n## Latest Blog Posts\n${blogPosts}\n<a href=${this.config.urls.blogUrl}>:arrow_right: More blog posts</a><hr />\n\nOriginal GitHub script provided by <a href="https://github.com/Mokkapps/mokkapps/blob/master/index.js">Mokkapps</a>.\nRewritten to use TypeScript & Vitest.\n${typeScriptBadge} ${vitestBadge}`;

    return text;
  }
}

const markdownRenderer = new MarkdownRenderer(
  new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
  }).use(emoji),
);

const rssParser = new RssParser(new Parser());

export async function writeToFile(
  filename: string,
  content: string,
): Promise<void> {
  try {
    await fs.writeFile(filename, content);
  } catch (err) {
    throw new WriteFileException(err);
  }
}

async function buildMdFromRssFeed() {
  const blogPostsGeneratorConfig = new BlogPostsGeneratorConfig(
    {
      blogUrl: BLOG_URL,
      mastodonUrl: MASTODON_URL,
      linkedInUrl: LINKEDIN_URL,
      devToUrl: DEV_TO_URL,
      websiteUrl: WEBSITE_URL,
    },
    BLOG_POST_LIMIT,
    BADGE_HEIGHT,
  );

  const blogPostsGenerator = new BlogPostsGenerator(
    blogPostsGeneratorConfig,
    rssParser,
  );
  return blogPostsGenerator.generateMdText();
}

async function main(): Promise<void> {
  const mdText = await buildMdFromRssFeed();
  const rendered = markdownRenderer.renderMarkdown(mdText);
  writeToFile('README.md', rendered);
}

try {
  main();
} catch (err) {
  throw new ImpossibleException(err);
}
